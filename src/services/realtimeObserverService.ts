import {
  collection,
  onSnapshot,
  query,
  limit,
  setDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { notificationService } from './notificationService';
import { formatKz } from '../data/angolaData';
import { Product, Order, SellerStore, UserProfile } from '../types';

type ObserverCallback = (event: {
  type: 'user' | 'seller' | 'product' | 'order';
  title: string;
  message: string;
  timestamp: string;
}) => void;

class RealtimeObserverService {
  private isInitialized = false;
  private knownUserIds = new Set<string>();
  private knownStoreIds = new Set<string>();
  private knownProductIds = new Set<string>();
  private knownOrderIds = new Set<string>();
  private subscribers: ObserverCallback[] = [];
  public isConnected = false;

  /**
   * Initializes real-time listeners across Firestore collections.
   * Immediately detects and alerts on new users, seller stores, products, and sales.
   */
  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Seed baseline initial notification so the admin center is never empty
    this.ensureBaselineNotification();

    // 1. Observe USERS collection in real time
    try {
      const usersQuery = query(collection(db, 'users'), limit(500));
      onSnapshot(
        usersQuery,
        (snapshot) => {
          this.isConnected = true;
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as UserProfile;
            const uid = change.doc.id || data.uid;

            if (change.type === 'added') {
              // If not seen in this runtime session
              if (!this.knownUserIds.has(uid)) {
                this.knownUserIds.add(uid);

                // Only dispatch live notification if system has completed initial load
                // or if the record was created recently (last 10 minutes)
                const isRecent = data.createdAt
                  ? Date.now() - new Date(data.createdAt).getTime() < 10 * 60 * 1000
                  : false;

                if (isRecent) {
                  this.dispatchNewUserNotification(data);
                }
              }
            }
          });
        },
        (error) => console.warn('Observador de utilizadores:', error.message)
      );
    } catch (e) {
      console.warn('Falha ao iniciar observador de utilizadores:', e);
    }

    // 2. Observe SELLER STORES collection in real time
    try {
      const storesQuery = query(collection(db, 'sellerStores'), limit(200));
      onSnapshot(
        storesQuery,
        (snapshot) => {
          this.isConnected = true;
          snapshot.docChanges().forEach((change) => {
            const store = change.doc.data() as SellerStore;
            const storeId = change.doc.id || store.storeId;

            if (change.type === 'added') {
              if (!this.knownStoreIds.has(storeId)) {
                this.knownStoreIds.add(storeId);

                const isRecent = store.createdAt
                  ? Date.now() - new Date(store.createdAt).getTime() < 10 * 60 * 1000
                  : false;

                if (isRecent) {
                  this.dispatchNewStoreNotification(store);
                }
              }
            }
          });
        },
        (error) => console.warn('Observador de vendedores:', error.message)
      );
    } catch (e) {
      console.warn('Falha ao iniciar observador de vendedores:', e);
    }

    // 3. Observe PRODUCTS collection in real time
    try {
      const prodsQuery = query(collection(db, 'products'), limit(300));
      onSnapshot(
        prodsQuery,
        (snapshot) => {
          this.isConnected = true;
          snapshot.docChanges().forEach((change) => {
            const prod = change.doc.data() as Product;
            const prodId = change.doc.id || prod.productId;

            if (change.type === 'added') {
              if (!this.knownProductIds.has(prodId)) {
                this.knownProductIds.add(prodId);

                const isRecent = prod.createdAt
                  ? Date.now() - new Date(prod.createdAt).getTime() < 10 * 60 * 1000
                  : false;

                if (isRecent) {
                  this.dispatchNewProductNotification(prod);
                }
              }
            }
          });
        },
        (error) => console.warn('Observador de produtos:', error.message)
      );
    } catch (e) {
      console.warn('Falha ao iniciar observador de produtos:', e);
    }

    // 4. Observe ORDERS collection in real time (Sales, Payment, Escrow)
    try {
      const ordersQuery = query(collection(db, 'orders'), limit(200));
      onSnapshot(
        ordersQuery,
        (snapshot) => {
          this.isConnected = true;
          snapshot.docChanges().forEach((change) => {
            const order = change.doc.data() as Order;
            const orderId = change.doc.id || order.orderId;

            if (change.type === 'added') {
              if (!this.knownOrderIds.has(orderId)) {
                this.knownOrderIds.add(orderId);

                const isRecent = order.createdAt
                  ? Date.now() - new Date(order.createdAt).getTime() < 15 * 60 * 1000
                  : false;

                if (isRecent) {
                  this.dispatchNewSaleNotification(order);
                }
              }
            }
          });
        },
        (error) => console.warn('Observador de encomendas e vendas:', error.message)
      );
    } catch (e) {
      console.warn('Falha ao iniciar observador de encomendas:', e);
    }
  }

  /**
   * Dispatches vibration on devices that support Navigator.vibrate
   */
  private triggerVibration(pattern: number[] = [200, 100, 200]) {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Broadcasts to internal listeners
   */
  private notifySubscribers(type: 'user' | 'seller' | 'product' | 'order', title: string, message: string) {
    const timestamp = new Date().toISOString();
    this.subscribers.forEach((cb) => {
      try {
        cb({ type, title, message, timestamp });
      } catch (err) {
        console.error('Erro no callback do observador:', err);
      }
    });
  }

  public subscribe(callback: ObserverCallback): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  // --- DISPATCHERS ---

  public async dispatchNewUserNotification(user: Partial<UserProfile>) {
    const displayName = user.displayName || 'Novo Utilizador';
    const email = user.email || 'sem email';
    const role = user.role || 'cliente';
    const title = `Novo Utilizador Registado: ${displayName}`;
    const message = `O utilizador "${displayName}" (${email}) acabou de criar uma conta na plataforma com o perfil ${role.toUpperCase()}. Registo auditado em tempo real.`;

    this.triggerVibration([150, 80, 150]);
    this.notifySubscribers('user', title, message);

    await notificationService.createNotification({
      category: 'candidaturas',
      priority: 'normal',
      title,
      message,
      event: 'NOVO_UTILIZADOR_REGISTADO',
      idempotencyKey: `user_reg_${user.uid}_${Date.now()}`,
      metadata: {
        candidateName: displayName,
        candidateEmail: email,
        targetRoleOrCampaign: role,
      },
      actionType: 'manage_application',
    });
  }

  public async dispatchNewStoreNotification(store: Partial<SellerStore>) {
    const storeName = store.name || 'Nova Empresa';
    const prov = store.province || 'Angola';
    const phone = store.phone || 'N/A';
    const title = `Nova Empresa / Vendedor: ${storeName}`;
    const message = `A empresa "${storeName}" registou a sua loja oficial (${prov}, Telefone: ${phone}) no Mercado Angola. Pronta para publicar artigos.`;

    this.triggerVibration([200, 100, 200]);
    this.notifySubscribers('seller', title, message);

    await notificationService.createNotification({
      category: 'candidaturas',
      priority: 'normal',
      title,
      message,
      event: 'NOVO_VENDEDOR_REGISTADO',
      idempotencyKey: `store_reg_${store.storeId}_${Date.now()}`,
      metadata: {
        candidateName: storeName,
        candidatePhone: phone,
        productName: storeName,
      },
      actionType: 'manage_application',
    });
  }

  public async dispatchNewProductNotification(product: Partial<Product>) {
    const prodName = product.name || 'Artigo';
    const store = product.storeName || 'Loja Parceira';
    const priceFormatted = formatKz(product.price || 0);
    const title = `Novo Artigo Publicado: ${prodName}`;
    const message = `A empresa "${store}" publicou o artigo "${prodName}" pelo preço de ${priceFormatted} na categoria ${product.category || 'Geral'}.`;

    this.triggerVibration([150, 100, 150]);
    this.notifySubscribers('product', title, message);

    await notificationService.createNotification({
      category: 'vendas',
      priority: 'normal',
      title,
      message,
      event: 'NOVO_PRODUTO_PUBLICADO',
      idempotencyKey: `prod_pub_${product.productId}_${Date.now()}`,
      metadata: {
        productName: prodName,
        sellerName: store,
        saleAmount: product.price || 0,
      },
      actionType: 'view_order',
    });
  }

  public async dispatchNewSaleNotification(order: Partial<Order>) {
    const orderNum = order.orderNumber || 'AO-2026';
    const totalFormatted = formatKz(order.totalAmount || 0);
    const platformFee = order.platformFeeAmount || Math.round((order.subtotal || 0) * 0.05);
    const platformFeeFormatted = formatKz(platformFee);
    const driverFee = order.driverFeeAmount || 2000;
    const pickupCode = order.pickupVerificationCode || '9482';

    const title = `Nova Venda Realizada: #${orderNum}`;
    const message = `Venda confirmada no total de ${totalFormatted} para ${order.buyerName || 'Cliente'}. Taxa da plataforma (5%): ${platformFeeFormatted} | Motorista da plataforma: ${formatKz(driverFee)} | Código de recolha do estafeta: [${pickupCode}].`;

    // Urgent double vibration for sales
    this.triggerVibration([300, 100, 300, 100, 300]);
    this.notifySubscribers('order', title, message);

    await notificationService.createNotification({
      category: 'vendas',
      priority: 'critico',
      title,
      message,
      event: 'NOVA_VENDA_REALIZADA',
      idempotencyKey: `sale_order_${order.orderId}_${Date.now()}`,
      metadata: {
        orderId: order.orderId,
        orderNumber: orderNum,
        productName: order.items?.[0]?.productName || 'Artigo em Encomenda',
        saleAmount: order.totalAmount,
        platformFeeAmount: platformFee,
        platformFeeRate: 0.05,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus || 'confirmado',
        candidateName: order.buyerName,
      },
      actionType: 'view_order',
    });
  }

  /**
   * Ensures that the admin notification center always has verified notifications
   * and is NEVER empty on initial boot.
   */
  private async ensureBaselineNotification() {
    try {
      const snap = await getDocs(query(collection(db, 'adminNotifications'), limit(1)));
      if (snap.empty) {
        const welcomeNotif = {
          category: 'sistema' as const,
          priority: 'informativo' as const,
          title: 'Sistema de Notificações em Tempo Real Conectado',
          message: 'O ecossistema Mercado Angola está conectado ao Firestore em tempo real. Novos registos de utilizadores, vendedores, artigos publicados e vendas aparecerão instantaneamente aqui com alertas sonoros e visuais.',
          event: 'SISTEMA_INICIALIZADO',
          idempotencyKey: 'sys_init_baseline',
        };
        await notificationService.createNotification(welcomeNotif);
      }
    } catch (e) {
      console.warn('Aviso ao verificar baseline de notificações:', e);
    }
  }

  public destroy() {
    this.subscribers = [];
    this.isInitialized = false;
  }
}

export const realtimeObserver = new RealtimeObserverService();
