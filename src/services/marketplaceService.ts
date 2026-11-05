import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Product,
  Order,
  SellerSuborder,
  PaymentAttempt,
  CommissionRecord,
  SellerStore,
  AuditLog,
  PlatformSettings,
  Report,
  Review,
  ChatMessage,
  CartItem,
  ShippingAddress,
  PaymentMethod,
  OrderStatus,
  AffiliateCampaign,
  AffiliateApplication,
  AffiliateClick,
  WithdrawalRequest,
  LeadTracking,
  LeadStatus,
  LeadItemType,
} from '../types';
import { SEED_PRODUCTS, SEED_STORES, formatKz } from '../data/angolaData';
import { notificationService } from './notificationService';

export const marketplaceService = {
  // === PRODUCTS ===
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Product[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data() } as Product);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async createProduct(product: Omit<Product, 'productId' | 'createdAt'>): Promise<Product> {
    const path = 'products';
    const productId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newProduct: Product = {
      ...product,
      productId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, productId), newProduct);

      // Auto-create affiliate campaign if enabled
      if (newProduct.affiliateEnabled && newProduct.affiliateCommissionRate) {
        await this.syncAffiliateCampaign(newProduct);
      }

      await this.recordAuditLog('CREATE_PRODUCT', 'Product', productId, { name: newProduct.name, price: newProduct.price });
      return newProduct;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const path = `products/${productId}`;
    try {
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'products', productId), updated);

      // Sync affiliate campaign if commission or product details changed
      const currentSnap = await getDoc(doc(db, 'products', productId));
      if (currentSnap.exists()) {
        const fullProd = currentSnap.data() as Product;
        if (fullProd.affiliateEnabled) {
          await this.syncAffiliateCampaign(fullProd);
        }
      }

      await this.recordAuditLog('UPDATE_PRODUCT', 'Product', productId, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // === AFFILIATE CAMPAIGNS ===
  async syncAffiliateCampaign(product: Product): Promise<void> {
    const campaignId = `camp_${product.productId}`;
    const rate = product.affiliateCommissionRate || 0.10;
    const campaign: AffiliateCampaign = {
      campaignId,
      productId: product.productId,
      sellerId: product.sellerId,
      storeName: product.storeName,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images[0] || '',
      category: product.category,
      commissionRate: rate,
      estimatedCommissionKz: Math.round(product.price * rate),
      requiresApproval: Boolean(product.requiresAffiliateApproval),
      status: product.status === 'published' ? 'active' : 'paused',
      promotionalMaterials: {
        headline: `Ganhe ${Math.round(rate * 100)}% promovendo ${product.name}`,
        copySnippet: `Compre ${product.name} em Angola por ${product.price} Kz com garantia e entrega rápida!`,
        targetAudience: 'Clientes em Luanda, Benguela, Huambo e províncias vizinhas',
      },
      createdAt: product.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'affiliateCampaigns', campaignId), campaign);
    } catch (err) {
      console.warn('Falha não-bloqueante ao sincronizar campanha de afiliado:', err);
    }
  },

  async getAffiliateCampaigns(): Promise<AffiliateCampaign[]> {
    const path = 'affiliateCampaigns';
    try {
      const snap = await getDocs(collection(db, path));
      const list: AffiliateCampaign[] = [];
      snap.forEach((d) => list.push(d.data() as AffiliateCampaign));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async recordAffiliateClick(params: {
    affiliateId: string;
    referralCode: string;
    productId?: string;
    referrerSource?: string;
  }): Promise<void> {
    const clickId = 'clk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const clickData: AffiliateClick = {
      clickId,
      affiliateId: params.affiliateId,
      referralCode: params.referralCode,
      productId: params.productId,
      referrerSource: params.referrerSource || 'Link Direto',
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'affiliateClicks', clickId), clickData);
    } catch (err) {
      console.warn('Falha não-bloqueante ao registar clique de afiliado:', err);
    }
  },

  async applyForCampaign(params: {
    campaignId: string;
    productId: string;
    sellerId: string;
    affiliateId: string;
    affiliateName: string;
    affiliateEmail: string;
    notes?: string;
  }): Promise<AffiliateApplication> {
    const applicationId = `app_${params.campaignId}_${params.affiliateId}`;
    const application: AffiliateApplication = {
      applicationId,
      campaignId: params.campaignId,
      productId: params.productId,
      sellerId: params.sellerId,
      affiliateId: params.affiliateId,
      affiliateName: params.affiliateName,
      affiliateEmail: params.affiliateEmail,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      notes: params.notes,
    };

    try {
      await setDoc(doc(db, 'affiliateApplications', applicationId), application);
      await this.recordAuditLog('APPLY_AFFILIATE_CAMPAIGN', 'AffiliateApplication', applicationId, {
        campaignId: params.campaignId,
      });

      // 1. Notificação de Nova Candidatura para o Administrador
      await notificationService.createNotification({
        category: 'candidaturas',
        priority: 'normal',
        title: `Nova Candidatura: ${params.affiliateName}`,
        message: `O candidato "${params.affiliateName}" (${params.affiliateEmail}) candidatou-se para promover a campanha #${params.campaignId}. Estado inicial: PENDENTE.`,
        event: 'NEW_APPLICATION',
        idempotencyKey: `cand_create_${applicationId}`,
        metadata: {
          candidateId: params.affiliateId,
          candidateName: params.affiliateName,
          candidateEmail: params.affiliateEmail,
          applicationId,
          applicationStatus: 'pending',
          targetRoleOrCampaign: `Campanha #${params.campaignId}`,
        },
        actionType: 'manage_application',
      });

      return application;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'affiliateApplications');
    }
  },

  async reviewAffiliateApplication(applicationId: string, status: 'approved' | 'rejected'): Promise<void> {
    const path = `affiliateApplications/${applicationId}`;
    try {
      const snap = await getDoc(doc(db, 'affiliateApplications', applicationId));
      const appData = snap.exists() ? (snap.data() as AffiliateApplication) : null;

      await updateDoc(doc(db, 'affiliateApplications', applicationId), {
        status,
        reviewedAt: new Date().toISOString(),
      });
      await this.recordAuditLog('REVIEW_AFFILIATE_APPLICATION', 'AffiliateApplication', applicationId, { status });

      // Notificação de alteração de estado da candidatura
      await notificationService.createNotification({
        category: 'candidaturas',
        priority: status === 'approved' ? 'normal' : 'informativo',
        title: `Candidatura ${status === 'approved' ? 'Aprovada' : 'Rejeitada'}`,
        message: `A candidatura #${applicationId} de ${appData?.affiliateName || 'Afiliado'} foi ${status === 'approved' ? 'APROVADA' : 'REJEITADA'}.`,
        event: 'APPLICATION_STATUS_CHANGED',
        idempotencyKey: `cand_review_${applicationId}_${status}`,
        metadata: {
          applicationId,
          candidateName: appData?.affiliateName,
          candidateEmail: appData?.affiliateEmail,
          applicationStatus: status,
        },
        actionType: 'manage_application',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async getAffiliateApplications(sellerId?: string, affiliateId?: string): Promise<AffiliateApplication[]> {
    const path = 'affiliateApplications';
    try {
      const snap = await getDocs(collection(db, path));
      const list: AffiliateApplication[] = [];
      snap.forEach((d) => {
        const data = d.data() as AffiliateApplication;
        if (sellerId && data.sellerId !== sellerId) return;
        if (affiliateId && data.affiliateId !== affiliateId) return;
        list.push(data);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // === STORES ===
  async getSellerStore(sellerId: string): Promise<SellerStore | null> {
    const path = 'sellerStores';
    try {
      const q = query(collection(db, path), where('ownerId', '==', sellerId), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as SellerStore;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async getAllStores(): Promise<SellerStore[]> {
    const path = 'sellerStores';
    try {
      const snap = await getDocs(collection(db, path));
      const list: SellerStore[] = [];
      snap.forEach((d) => list.push(d.data() as SellerStore));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async saveSellerStore(store: SellerStore): Promise<void> {
    const path = `sellerStores/${store.storeId}`;
    try {
      await setDoc(doc(db, 'sellerStores', store.storeId), {
        ...store,
        updatedAt: new Date().toISOString(),
      });
      await this.recordAuditLog('SAVE_STORE', 'SellerStore', store.storeId, { name: store.name });

      // Notificação de Novo Vendedor / Alteração Importante para o Administrador
      await notificationService.createNotification({
        category: 'seguranca',
        priority: 'normal',
        title: `Vendedor/Empresa Atualizada: ${store.name}`,
        message: `A empresa "${store.name}" registou/atualizou dados na província de ${store.province}. Contacto: ${store.phone}. Pagamento na entrega: ${store.acceptsCashOnDelivery ? 'Sim' : 'Não'}.`,
        event: 'STORE_UPDATED',
        idempotencyKey: `store_${store.storeId}_${Date.now()}`,
        metadata: {
          sellerId: store.ownerId,
          sellerName: store.name,
          candidatePhone: store.phone,
        },
        actionType: 'view_security',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // === FINANCIAL CALCULATION ENGINE & ORDERS ===
  async createOrder(params: {
    buyerId: string;
    buyerName: string;
    buyerPhone: string;
    shippingAddress: ShippingAddress;
    cartItems: CartItem[];
    paymentMethod: PaymentMethod;
    affiliateReferralCode?: string;
  }): Promise<{ order: Order; suborders: SellerSuborder[]; paymentAttempt?: PaymentAttempt; commissionRecords: CommissionRecord[] }> {
    const { buyerId, buyerName, buyerPhone, shippingAddress, cartItems, paymentMethod, affiliateReferralCode } = params;

    // Load platform settings for financial rates
    const settings = await this.getPlatformSettings();
    const platformFeeRate = settings.defaultCommissionRate || 0.05; // 5% platform fee
    const affiliateServiceFeeRate = settings.affiliateServiceFeeRate || 0.0; // 0% default

    // Detect affiliate attribution (preventing self-referral: buyer cannot be affiliate)
    let attributedAffiliateId: string | undefined;
    let attributedAffiliateName: string | undefined;

    if (affiliateReferralCode && affiliateReferralCode.trim()) {
      const cleanCode = affiliateReferralCode.trim().toUpperCase();
      // Search for affiliate user with this code
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const d of usersSnap.docs) {
        const u = d.data();
        if (u.affiliateCode && u.affiliateCode.toUpperCase() === cleanCode) {
          if (u.uid !== buyerId) {
            attributedAffiliateId = u.uid;
            attributedAffiliateName = u.displayName || 'Afiliado Angolano';
          } else {
            console.warn('Auto-referência prevenida: Comprador não pode atribuir a si mesmo comissão de afiliado.');
          }
          break;
        }
      }
    }

    // Group items by seller
    const sellerMap = new Map<string, CartItem[]>();
    for (const item of cartItems) {
      const list = sellerMap.get(item.sellerId) || [];
      list.push(item);
      sellerMap.set(item.sellerId, list);
    }

    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const orderNumber = `AO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    let orderSubtotal = 0;
    let orderDeliveryFee = 0;
    let orderTotalPlatformFee = 0;
    let orderTotalAffiliateGross = 0;
    let orderTotalAffiliateNet = 0;
    let orderTotalServiceFeeOnAff = 0;

    const orderItems: any[] = [];
    const suborders: SellerSuborder[] = [];
    const commissionRecords: CommissionRecord[] = [];

    // Process seller suborders & compute exact financial splits
    for (const [sellerId, items] of sellerMap.entries()) {
      let subtotalSeller = 0;
      let maxDelivery = 0;
      let sellerTotalPlatformFee = 0;
      let sellerTotalAffiliateCommission = 0;

      const suborderItems = items.map((i) => {
        const itemSubtotal = i.product.price * i.quantity;
        subtotalSeller += itemSubtotal;
        if (i.product.deliveryCost > maxDelivery) {
          maxDelivery = i.product.deliveryCost;
        }

        // Financial calculations per item
        const itemPlatformFee = Math.round(itemSubtotal * platformFeeRate);
        sellerTotalPlatformFee += itemPlatformFee;

        let itemAffiliateGross = 0;
        let itemServiceFeeOnAff = 0;
        let itemAffiliateNet = 0;

        // If affiliate attributed and product has affiliate enabled
        if (attributedAffiliateId && i.product.affiliateEnabled && i.product.affiliateCommissionRate) {
          itemAffiliateGross = Math.round(itemSubtotal * i.product.affiliateCommissionRate);
          itemServiceFeeOnAff = Math.round(itemAffiliateGross * affiliateServiceFeeRate);
          itemAffiliateNet = itemAffiliateGross - itemServiceFeeOnAff;

          sellerTotalAffiliateCommission += itemAffiliateGross;
          orderTotalAffiliateGross += itemAffiliateGross;
          orderTotalServiceFeeOnAff += itemServiceFeeOnAff;
          orderTotalAffiliateNet += itemAffiliateNet;
        }

        // Create individual commission ledger record for item
        const commissionId = `comm_${orderId}_${i.product.productId}`;
        const itemSellerNet = itemSubtotal - itemPlatformFee - itemAffiliateGross;

        const commRecord: CommissionRecord = {
          commissionId,
          orderId,
          orderNumber,
          suborderId: `sub_${orderId}_${sellerId.substring(0, 6)}`,
          sellerId,
          affiliateId: attributedAffiliateId,
          affiliateName: attributedAffiliateName,
          productId: i.product.productId,
          productName: i.product.name,
          saleAmount: itemSubtotal,
          platformFeeRate,
          platformFeeAmount: itemPlatformFee,
          affiliateCommissionRate: i.product.affiliateCommissionRate || 0,
          affiliateGrossCommission: itemAffiliateGross,
          platformServiceFeeOnAffiliateRate: affiliateServiceFeeRate,
          platformServiceFeeOnAffiliateAmount: itemServiceFeeOnAff,
          affiliateNetCommission: itemAffiliateNet,
          sellerNetAmount: Math.max(0, itemSellerNet),
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        commissionRecords.push(commRecord);

        const ordItem = {
          productId: i.product.productId,
          sellerId,
          productName: i.product.name,
          productImage: i.product.images[0] || '',
          unitPrice: i.product.price,
          quantity: i.quantity,
          subtotal: itemSubtotal,
          affiliateCommissionRate: i.product.affiliateCommissionRate,
        };
        orderItems.push(ordItem);
        return ordItem;
      });

      // Delivery fee: 3.000 Kz for home delivery (split: 2.000 Kz driver, 1.000 Kz platform)
      const deliveryFee = shippingAddress.deliveryType === 'ponto_encontro' ? 0 : (maxDelivery > 0 ? maxDelivery : 3000);
      const driverFee = deliveryFee > 0 ? 2000 : 0;
      const platformDeliveryFee = deliveryFee > 0 ? Math.max(0, deliveryFee - 2000) : 0;
      
      // 4-Digit Pickup Verification Code for security handover
      const pickupVerificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Seller receives full product price (ex: 100.000 Kz)
      const netSellerAmount = subtotalSeller;
      // Total for suborder: Subtotal + 5% platform fee + delivery fee
      const subtotalTotal = subtotalSeller + sellerTotalPlatformFee + deliveryFee;

      const suborderId = `sub_${orderId}_${sellerId.substring(0, 6)}`;
      const suborder: SellerSuborder = {
        suborderId,
        orderId,
        orderNumber,
        sellerId,
        storeName: items[0]?.product.storeName || 'Loja Angolana',
        buyerId,
        buyerName,
        buyerPhone,
        items: suborderItems,
        subtotal: subtotalSeller,
        deliveryFee,
        total: subtotalTotal,
        platformFeeAmount: sellerTotalPlatformFee,
        affiliateCommissionAmount: sellerTotalAffiliateCommission,
        netSellerAmount: Math.max(0, netSellerAmount),
        driverFeeAmount: driverFee,
        platformDeliveryFeeAmount: platformDeliveryFee,
        pickupVerificationCode,
        deliveryState: 'pending_driver',
        escrowStatus: 'held_by_platform',
        status: 'pending_confirmation',
        paymentMethod,
        paymentStatus: 'pending',
        shippingAddress,
        createdAt: now,
        updatedAt: now,
      };

      suborders.push(suborder);
      orderSubtotal += subtotalSeller;
      orderDeliveryFee += deliveryFee;
      orderTotalPlatformFee += sellerTotalPlatformFee;
    }

    // Exact formula: Product 100.000 Kz + Platform Fee 5% 5.000 Kz + Delivery 3.000 Kz = 108.000 Kz Total
    const totalAmount = orderSubtotal + orderTotalPlatformFee + orderDeliveryFee;
    const sellerIds = Array.from(sellerMap.keys());
    const primaryVerificationCode = suborders[0]?.pickupVerificationCode || Math.floor(1000 + Math.random() * 9000).toString();
    const orderDriverFee = orderDeliveryFee > 0 ? 2000 * suborders.length : 0;
    const orderPlatformDeliveryFee = orderDeliveryFee > 0 ? 1000 * suborders.length : 0;

    const order: Order = {
      orderId,
      orderNumber,
      buyerId,
      buyerName,
      buyerPhone,
      shippingAddress,
      items: orderItems,
      sellerIds,
      subtotal: orderSubtotal,
      deliveryFee: orderDeliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending_confirmation',
      platformFeeRate,
      platformFeeAmount: orderTotalPlatformFee,
      sellerGrossAmount: orderSubtotal,
      driverFeeAmount: orderDriverFee,
      platformDeliveryFeeAmount: orderPlatformDeliveryFee,
      escrowStatus: 'held_by_platform',
      pickupVerificationCode: primaryVerificationCode,
      deliveryState: 'pending_driver',
      affiliateId: attributedAffiliateId,
      affiliateName: attributedAffiliateName,
      affiliateReferralCode: affiliateReferralCode?.trim().toUpperCase(),
      affiliateGrossCommission: orderTotalAffiliateGross,
      affiliateServiceFee: orderTotalServiceFeeOnAff,
      affiliateNetCommission: orderTotalAffiliateNet,
      createdAt: now,
      updatedAt: now,
    };

    // Payment attempt for electronic flow if selected
    let paymentAttempt: PaymentAttempt | undefined;
    if (paymentMethod === 'multicaixa_express') {
      const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
      paymentAttempt = {
        attemptId: 'pay_' + Date.now(),
        orderId,
        buyerId,
        amount: totalAmount,
        currency: 'AOA',
        provider: 'MULTICAIXA_GPO_EMIS',
        reference,
        entity: '00099',
        status: 'pending',
        idempotencyKey: `idemp_${orderId}_${reference}`,
        mode: 'test',
        createdAt: now,
      };
    }

    try {
      // 1. Write Order
      await setDoc(doc(db, 'orders', orderId), order);

      // 2. Write Suborders
      for (const sub of suborders) {
        await setDoc(doc(db, 'sellerSuborders', sub.suborderId), sub);
      }

      // 3. Write Commission Records
      for (const comm of commissionRecords) {
        await setDoc(doc(db, 'commissionRecords', comm.commissionId), comm);
      }

      // 4. Write Payment Attempt if applicable
      if (paymentAttempt) {
        await setDoc(doc(db, 'paymentAttempts', paymentAttempt.attemptId), paymentAttempt);
      }

      // 5. Update Product Stock
      for (const item of cartItems) {
        const prodRef = doc(db, 'products', item.product.productId);
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await updateDoc(prodRef, { stock: newStock });
      }

      // 6. Update Affiliate pending balance if attributed
      if (attributedAffiliateId && orderTotalAffiliateNet > 0) {
        try {
          const userDoc = await getDoc(doc(db, 'users', attributedAffiliateId));
          if (userDoc.exists()) {
            const currentPending = userDoc.data().affiliateBalancePending || 0;
            await updateDoc(doc(db, 'users', attributedAffiliateId), {
              affiliateBalancePending: currentPending + orderTotalAffiliateNet,
            });
          }
        } catch (e) {
          console.warn('Aviso ao atualizar saldo pendente do afiliado:', e);
        }
      }

      // 7. Audit Log
      await this.recordAuditLog('CREATE_ORDER_WITH_FINANCIAL_SPLIT', 'Order', orderId, {
        orderNumber,
        totalAmount,
        platformFee: orderTotalPlatformFee,
        affiliateNetCommission: orderTotalAffiliateNet,
        affiliateId: attributedAffiliateId,
      });

      // 8. Notificação Oficial de Venda para o Administrador (Item 2 dos Requisitos)
      const storeNames = suborders.map((s) => s.storeName).join(', ');
      const productNames = cartItems.map((i) => `${i.product.name} (x${i.quantity})`).join(', ');
      const netSellersSum = suborders.reduce((acc, s) => acc + s.netSellerAmount, 0);

      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Nova Venda Registada: #${orderNumber}`,
        message: `Venda no valor de ${formatKz(totalAmount)} para a(s) loja(s) "${storeNames}". Taxa da plataforma (${Math.round(platformFeeRate * 100)}%): ${formatKz(orderTotalPlatformFee)}. Destinado aos vendedores: ${formatKz(netSellersSum)}. Método: ${paymentMethod === 'multicaixa_express' ? 'MULTICAIXA Express' : 'Pagamento na Entrega'}. Estado: PENDENTE.`,
        event: 'ORDER_CREATED',
        idempotencyKey: `order_created_${orderId}`,
        metadata: {
          orderId,
          orderNumber,
          productName: productNames,
          saleAmount: totalAmount,
          platformFeeRate,
          platformFeeAmount: orderTotalPlatformFee,
          sellerName: storeNames,
          sellerAmount: netSellersSum,
          affiliateId: attributedAffiliateId,
          affiliateName: attributedAffiliateName,
          affiliateCommission: orderTotalAffiliateNet,
          paymentMethod,
          paymentStatus: 'pending',
        },
        actionType: 'view_order',
      });

      return { order, suborders, paymentAttempt, commissionRecords };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    }
  },

  async confirmCashOnDeliveryPayment(
    orderId: string,
    suborderId: string,
    confirmedByName: string,
    notes?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    try {
      // Update suborder
      await updateDoc(doc(db, 'sellerSuborders', suborderId), {
        paymentStatus: 'received',
        status: 'delivered',
        updatedAt: now,
      });

      // Update main order
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'received',
        orderStatus: 'delivered',
        paymentConfirmation: {
          confirmedBy: confirmedByName,
          confirmedAt: now,
          notes: notes || 'Pagamento confirmado na entrega.',
        },
        updatedAt: now,
      });

      // Update commission records to 'validation_period'
      const commSnap = await getDocs(
        query(collection(db, 'commissionRecords'), where('orderId', '==', orderId))
      );
      for (const d of commSnap.docs) {
        const commData = d.data() as CommissionRecord;
        await updateDoc(doc(db, 'commissionRecords', d.id), {
          status: 'available_for_withdrawal',
          validationEndsAt: now,
          updatedAt: now,
        });

        // Credit available balance to affiliate if attributed
        if (commData.affiliateId && commData.affiliateNetCommission > 0) {
          try {
            const affDoc = await getDoc(doc(db, 'users', commData.affiliateId));
            if (affDoc.exists()) {
              const u = affDoc.data();
              const currPending = Math.max(0, (u.affiliateBalancePending || 0) - commData.affiliateNetCommission);
              const currAvail = (u.affiliateBalanceAvailable || 0) + commData.affiliateNetCommission;
              await updateDoc(doc(db, 'users', commData.affiliateId), {
                affiliateBalancePending: currPending,
                affiliateBalanceAvailable: currAvail,
              });
            }
          } catch (e) {
            console.warn('Erro ao creditar saldo disponível do afiliado:', e);
          }
        }
      }

      await this.recordAuditLog('CONFIRM_COD_PAYMENT', 'Order', orderId, {
        suborderId,
        confirmedBy: confirmedByName,
        confirmedAt: now,
      });

      // Notificação de Pagamento Confirmado (Item 4 dos Requisitos)
      await notificationService.createNotification({
        category: 'pagamentos',
        priority: 'normal',
        title: `Pagamento Confirmado na Entrega: #${orderId}`,
        message: `Pagamento em dinheiro/TPA confirmado na entrega por ${confirmedByName}. Fundos validados e comissões disponibilizadas.`,
        event: 'PAYMENT_CONFIRMED',
        idempotencyKey: `pay_confirm_cod_${orderId}`,
        metadata: {
          orderId,
          paymentStatus: 'received',
        },
        actionType: 'view_financial',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async simulateMulticaixaPaymentSuccess(attemptId: string, orderId: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'paymentAttempts', attemptId), {
        status: 'completed',
        completedAt: now,
        terminalRef: 'TPA_MOK_ANGOLA_' + Math.floor(1000 + Math.random() * 9000),
      });

      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'received',
        orderStatus: 'confirmed',
        updatedAt: now,
      });

      // Suborders status update
      const subordersSnap = await getDocs(
        query(collection(db, 'sellerSuborders'), where('orderId', '==', orderId))
      );
      for (const d of subordersSnap.docs) {
        await updateDoc(doc(db, 'sellerSuborders', d.id), {
          paymentStatus: 'received',
          status: 'confirmed',
          updatedAt: now,
        });
      }

      // Update commission records to 'validation_period'
      const commSnap = await getDocs(
        query(collection(db, 'commissionRecords'), where('orderId', '==', orderId))
      );
      for (const d of commSnap.docs) {
        await updateDoc(doc(db, 'commissionRecords', d.id), {
          status: 'validation_period',
          updatedAt: now,
        });
      }

      await this.recordAuditLog('MULTICAIXA_TEST_PAYMENT_SUCCESS', 'PaymentAttempt', attemptId, {
        orderId,
        completedAt: now,
      });

      // Notificação de Pagamento Confirmado via MULTICAIXA (Item 4 dos Requisitos)
      await notificationService.createNotification({
        category: 'pagamentos',
        priority: 'normal',
        title: `Pagamento MULTICAIXA Confirmado: Encomenda #${orderId}`,
        message: `Transação autenticada com sucesso pelo gateway MULTICAIXA GPO/EMIS. Pagamento creditado à plataforma.`,
        event: 'PAYMENT_CONFIRMED_MULTICAIXA',
        idempotencyKey: `pay_mcx_${attemptId}`,
        metadata: {
          orderId,
          paymentStatus: 'received',
          paymentMethod: 'multicaixa_express',
        },
        actionType: 'view_financial',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `paymentAttempts/${attemptId}`);
    }
  },

  async cancelOrder(orderId: string, reason: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: 'cancelled',
        notes: `Cancelado: ${reason}`,
        updatedAt: now,
      });

      const subordersSnap = await getDocs(
        query(collection(db, 'sellerSuborders'), where('orderId', '==', orderId))
      );
      for (const d of subordersSnap.docs) {
        await updateDoc(doc(db, 'sellerSuborders', d.id), {
          status: 'cancelled',
          updatedAt: now,
        });
      }

      // Revert commission records
      const commSnap = await getDocs(
        query(collection(db, 'commissionRecords'), where('orderId', '==', orderId))
      );
      for (const d of commSnap.docs) {
        const commData = d.data() as CommissionRecord;
        await updateDoc(doc(db, 'commissionRecords', d.id), {
          status: 'reversed',
          reversalReason: `Cancelamento: ${reason}`,
          updatedAt: now,
        });

        // Deduct pending balance from affiliate
        if (commData.affiliateId && commData.affiliateNetCommission > 0) {
          try {
            const affDoc = await getDoc(doc(db, 'users', commData.affiliateId));
            if (affDoc.exists()) {
              const u = affDoc.data();
              const currPending = Math.max(0, (u.affiliateBalancePending || 0) - commData.affiliateNetCommission);
              await updateDoc(doc(db, 'users', commData.affiliateId), {
                affiliateBalancePending: currPending,
              });
            }
          } catch (e) {
            console.warn('Aviso ao reverter comissão do afiliado:', e);
          }
        }
      }

      await this.recordAuditLog('CANCEL_ORDER_AND_REVERSE_COMMISSIONS', 'Order', orderId, { reason });

      // Notificação Crítica de Cancelamento / Reembolso (Itens 2 e 4 dos Requisitos)
      await notificationService.createNotification({
        category: 'vendas',
        priority: 'critico',
        title: `Venda Cancelada / Estorno: Encomenda #${orderId}`,
        message: `A encomenda #${orderId} foi cancelada. Motivo: "${reason}". As comissões da plataforma e do afiliado foram estornadas com segurança.`,
        event: 'ORDER_CANCELLED',
        idempotencyKey: `order_cancel_${orderId}`,
        metadata: {
          orderId,
          paymentStatus: 'cancelled',
        },
        actionType: 'view_order',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async updateSuborderStatus(suborderId: string, status: OrderStatus): Promise<void> {
    const path = `sellerSuborders/${suborderId}`;
    try {
      await updateDoc(doc(db, 'sellerSuborders', suborderId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      await this.recordAuditLog('UPDATE_SUBORDER_STATUS', 'SellerSuborder', suborderId, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // === WITHDRAWAL REQUESTS (LEVANTAMENTOS DE AFILIADOS) ===
  async submitWithdrawalRequest(params: {
    affiliateId: string;
    affiliateName: string;
    affiliateEmail: string;
    amount: number;
    bankDetails: {
      bankName: string;
      accountHolder: string;
      iban: string;
      expressPhone?: string;
    };
  }): Promise<WithdrawalRequest> {
    const requestId = 'wth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const reqData: WithdrawalRequest = {
      requestId,
      affiliateId: params.affiliateId,
      affiliateName: params.affiliateName,
      affiliateEmail: params.affiliateEmail,
      amount: params.amount,
      bankDetails: params.bankDetails,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    // Cache locally immediately so request is never lost
    try {
      const stored = localStorage.getItem('mercado_angola_withdrawals');
      const list: WithdrawalRequest[] = stored ? JSON.parse(stored) : [];
      list.unshift(reqData);
      localStorage.setItem('mercado_angola_withdrawals', JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    try {
      // 1. Attempt deducting from user doc in Firestore if accessible
      try {
        const userRef = doc(db, 'users', params.affiliateId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const avail = userSnap.data().affiliateBalanceAvailable || 0;
          await updateDoc(userRef, {
            affiliateBalanceAvailable: Math.max(0, avail - params.amount),
          });
        }
      } catch (uErr) {
        console.warn('Aviso ao sincronizar saldo de afiliado no Firestore:', uErr);
      }

      // 2. Persist in Firestore
      await setDoc(doc(db, 'withdrawalRequests', requestId), reqData);

      // 3. Record audit log
      try {
        await this.recordAuditLog('SUBMIT_WITHDRAWAL_REQUEST', 'WithdrawalRequest', requestId, {
          amount: params.amount,
          bank: params.bankDetails.bankName,
        });
      } catch (aErr) {
        // ignore
      }

      // 4. Create real Admin Notification
      await notificationService.createNotification({
        category: 'pagamentos',
        priority: 'normal',
        title: `Novo Pedido de Levantamento: ${formatKz(params.amount)}`,
        message: `O afiliado "${params.affiliateName}" solicitou levantamento de ${formatKz(params.amount)} para ${params.bankDetails.bankName} (IBAN: ${params.bankDetails.iban}).`,
        event: 'WITHDRAWAL_REQUESTED',
        idempotencyKey: `withdr_req_${requestId}`,
        metadata: {
          withdrawalId: requestId,
          withdrawalAmount: params.amount,
          candidateName: params.affiliateName,
          bankName: params.bankDetails.bankName,
        },
        actionType: 'view_withdrawal',
      });

      return reqData;
    } catch (err: any) {
      console.warn('Persistindo pedido de levantamento localmente com segurança:', err);
      return reqData;
    }
  },

  async getWithdrawalRequests(affiliateId?: string): Promise<WithdrawalRequest[]> {
    const map = new Map<string, WithdrawalRequest>();

    // 1. Load locally cached
    try {
      const stored = localStorage.getItem('mercado_angola_withdrawals');
      if (stored) {
        const localList: WithdrawalRequest[] = JSON.parse(stored);
        localList.forEach((item) => map.set(item.requestId, item));
      }
    } catch (e) {
      // ignore
    }

    // 2. Load Firestore
    try {
      const snap = await getDocs(collection(db, 'withdrawalRequests'));
      snap.forEach((d) => {
        const item = d.data() as WithdrawalRequest;
        map.set(item.requestId, item);
      });
    } catch (err) {
      console.warn('Aviso ao carregar levantamentos do Firestore:', err);
    }

    const list = Array.from(map.values());
    const filtered = affiliateId ? list.filter((w) => w.affiliateId === affiliateId) : list;
    return filtered.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  },

  async processWithdrawal(
    requestId: string,
    status: 'completed' | 'rejected',
    referenceProof?: string,
    adminNotes?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    try {
      // Update local cache
      try {
        const stored = localStorage.getItem('mercado_angola_withdrawals');
        if (stored) {
          const list: WithdrawalRequest[] = JSON.parse(stored);
          const updated = list.map((w) =>
            w.requestId === requestId
              ? { ...w, status, processedAt: now, referenceProof: referenceProof || `IBAN_TRF_${Date.now()}`, adminNotes }
              : w
          );
          localStorage.setItem('mercado_angola_withdrawals', JSON.stringify(updated));
        }
      } catch (e) {
        // ignore
      }

      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        status,
        processedAt: now,
        processedBy: auth.currentUser?.email || 'admin@mercadoangola.ao',
        referenceProof: referenceProof || `TRANSF_IBAN_${Date.now()}`,
        adminNotes,
      });

      // Update user balances
      const snap = await getDoc(doc(db, 'withdrawalRequests', requestId));
      if (snap.exists()) {
        const req = snap.data() as WithdrawalRequest;
        const userRef = doc(db, 'users', req.affiliateId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const u = userSnap.data();
          if (status === 'completed') {
            const totalPaid = (u.affiliateTotalPaid || 0) + req.amount;
            await updateDoc(userRef, { affiliateTotalPaid: totalPaid });
          } else if (status === 'rejected') {
            const avail = (u.affiliateBalanceAvailable || 0) + req.amount;
            await updateDoc(userRef, { affiliateBalanceAvailable: avail });
          }
        }
      }

      await this.recordAuditLog('PROCESS_WITHDRAWAL', 'WithdrawalRequest', requestId, { status });

      await notificationService.createNotification({
        category: 'pagamentos',
        priority: status === 'completed' ? 'normal' : 'critico',
        title: `Levantamento ${status === 'completed' ? 'Concluído' : 'Rejeitado'}`,
        message: `O levantamento #${requestId} foi ${status === 'completed' ? 'CONCLUÍDO (transferência bancária enviada)' : 'REJEITADO (saldo estornado)'}.`,
        event: 'WITHDRAWAL_PROCESSED',
        idempotencyKey: `withdr_proc_${requestId}_${status}`,
        metadata: {
          withdrawalId: requestId,
        },
        actionType: 'view_withdrawal',
      });
    } catch (err) {
      console.warn('Erro ao processar levantamento:', err);
    }
  },

  // === MOTORISTAS & ENTREGAS COM CÓDIGO DE 4 DÍGITOS E CUSTÓDIA (ESCROW) ===
  async getAvailableDeliveries(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: Order[] = [];
      snap.forEach((d) => {
        const o = d.data() as Order;
        if (o.orderStatus !== 'cancelled') {
          list.push(o);
        }
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.warn('Erro ao carregar entregas:', e);
      return [];
    }
  },

  async driverAcceptDelivery(params: {
    orderId: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverVehicle?: string;
  }): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'orders', params.orderId), {
        driverId: params.driverId,
        driverName: params.driverName,
        driverPhone: params.driverPhone,
        driverVehicle: params.driverVehicle || 'Motorizada',
        deliveryState: 'driver_accepted',
        driverAssignedAt: now,
        updatedAt: now,
      });

      // Update suborders
      const subSnap = await getDocs(query(collection(db, 'sellerSuborders'), where('orderId', '==', params.orderId)));
      for (const d of subSnap.docs) {
        await updateDoc(doc(db, 'sellerSuborders', d.id), {
          driverId: params.driverId,
          driverName: params.driverName,
          driverPhone: params.driverPhone,
          deliveryState: 'driver_accepted',
          updatedAt: now,
        });
      }

      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Motorista Atribuído à Encomenda #${params.orderId}`,
        message: `O motorista ${params.driverName} (${params.driverPhone}) aceitou a entrega. Dirija-se ao vendedor para levantamento com o código de 4 dígitos.`,
        event: 'DRIVER_ACCEPTED_DELIVERY',
        idempotencyKey: `driver_accept_${params.orderId}_${params.driverId}`,
        metadata: {
          orderId: params.orderId,
          candidateName: params.driverName,
        },
        actionType: 'view_order',
      });
    } catch (err) {
      console.error('Erro ao aceitar entrega pelo motorista:', err);
    }
  },

  async driverVerifyPickupWithCode(orderId: string, enteredCode: string): Promise<{ success: boolean; message: string }> {
    const now = new Date().toISOString();
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (!snap.exists()) {
        return { success: false, message: 'Encomenda não encontrada.' };
      }
      const order = snap.data() as Order;
      const expectedCode = order.pickupVerificationCode || '8492';

      if (enteredCode.trim() !== expectedCode.trim()) {
        return {
          success: false,
          message: `Código incorreto. O vendedor NÃO deve entregar a mercadoria sem conferência correta do código de 4 dígitos.`,
        };
      }

      await updateDoc(orderRef, {
        deliveryState: 'picked_up_verified',
        pickedUpAt: now,
        updatedAt: now,
      });

      // Update suborders
      const subSnap = await getDocs(query(collection(db, 'sellerSuborders'), where('orderId', '==', orderId)));
      for (const d of subSnap.docs) {
        await updateDoc(doc(db, 'sellerSuborders', d.id), {
          deliveryState: 'picked_up_verified',
          status: 'shipped',
          updatedAt: now,
        });
      }

      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Mercadoria Levantada com Código Validado: #${orderId}`,
        message: `O motorista validou o código (${enteredCode}) com o vendedor. Mercadoria em trânsito com segurança para o cliente.`,
        event: 'PICKUP_CODE_VERIFIED',
        idempotencyKey: `pickup_verified_${orderId}`,
        metadata: { orderId },
        actionType: 'view_order',
      });

      return { success: true, message: 'Código verificado com sucesso! Mercadoria levantada e a caminho do cliente.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao validar código com o vendedor.' };
    }
  },

  async driverConfirmDeliveryToCustomer(orderId: string): Promise<{ success: boolean; message: string }> {
    const now = new Date().toISOString();
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (!snap.exists()) {
        return { success: false, message: 'Encomenda não encontrada.' };
      }
      const order = snap.data() as Order;

      // Release escrow: funds held by platform are released to seller and driver
      await updateDoc(orderRef, {
        deliveryState: 'delivered',
        orderStatus: 'delivered',
        escrowStatus: 'released_to_seller_and_driver',
        paymentStatus: 'received',
        deliveredAt: now,
        updatedAt: now,
      });

      const subSnap = await getDocs(query(collection(db, 'sellerSuborders'), where('orderId', '==', orderId)));
      for (const d of subSnap.docs) {
        await updateDoc(doc(db, 'sellerSuborders', d.id), {
          deliveryState: 'delivered',
          status: 'delivered',
          escrowStatus: 'released_to_seller_and_driver',
          paymentStatus: 'received',
          updatedAt: now,
        });
      }

      // Credit driver stats if driverId exists
      if (order.driverId) {
        try {
          const dRef = doc(db, 'users', order.driverId);
          const dSnap = await getDoc(dRef);
          if (dSnap.exists()) {
            const data = dSnap.data();
            await updateDoc(dRef, {
              driverDeliveriesCompleted: (data.driverDeliveriesCompleted || 0) + 1,
              driverTotalEarnedAoa: (data.driverTotalEarnedAoa || 0) + (order.driverFeeAmount || 2000),
            });
          }
        } catch (dErr) {
          console.warn('Aviso ao atualizar ganhos do motorista:', dErr);
        }
      }

      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Entrega Concluída com Sucesso: #${orderId}`,
        message: `Cliente recebeu a mercadoria. Custódia da plataforma libertada: vendedor recebe ${formatKz(order.sellerGrossAmount || order.subtotal)} e motorista recebe ${formatKz(order.driverFeeAmount || 2000)}.`,
        event: 'DELIVERY_COMPLETED_ESCROW_RELEASED',
        idempotencyKey: `delivery_done_${orderId}`,
        metadata: { orderId },
        actionType: 'view_order',
      });

      return { success: true, message: 'Entrega finalizada com sucesso! Custódia libertada com segurança.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao confirmar entrega ao cliente.' };
    }
  },

  // === COMMISSION RECORDS LISTING ===
  async getCommissionRecords(filter?: { sellerId?: string; affiliateId?: string; orderId?: string }): Promise<CommissionRecord[]> {
    const path = 'commissionRecords';
    try {
      const snap = await getDocs(collection(db, path));
      const list: CommissionRecord[] = [];
      snap.forEach((d) => {
        const item = d.data() as CommissionRecord;
        if (filter?.sellerId && item.sellerId !== filter.sellerId) return;
        if (filter?.affiliateId && item.affiliateId !== filter.affiliateId) return;
        if (filter?.orderId && item.orderId !== filter.orderId) return;
        list.push(item);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // === AUDIT LOGS ===
  async recordAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const path = 'auditLogs';
    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const user = auth.currentUser;
    const log: AuditLog = {
      logId,
      actorId: user?.uid || 'system_or_demo',
      actorEmail: user?.email || 'sistema@mercadoangola.ao',
      action,
      entityType,
      entityId,
      details: details || {},
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, logId), log);
    } catch (err) {
      console.warn('Falha não-bloqueante ao registar auditoria:', err);
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const path = 'auditLogs';
    try {
      const snap = await getDocs(query(collection(db, path), limit(50)));
      const list: AuditLog[] = [];
      snap.forEach((d) => list.push(d.data() as AuditLog));
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // === SETTINGS ===
  async getPlatformSettings(): Promise<PlatformSettings> {
    try {
      const snap = await getDoc(doc(db, 'platformSettings', 'global'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          defaultCommissionRate: data.defaultCommissionRate ?? 0.05,
          affiliateServiceFeeRate: data.affiliateServiceFeeRate ?? 0.0,
          fixedFee: data.fixedFee ?? 0,
          enableFixedFee: data.enableFixedFee ?? false,
          electronicPaymentsActive: data.electronicPaymentsActive ?? true,
          multicaixaSandboxMode: data.multicaixaSandboxMode ?? true,
          validationPeriodDays: data.validationPeriodDays ?? 7,
          minimumWithdrawalAmount: data.minimumWithdrawalAmount ?? 5000,
        };
      }
      return {
        defaultCommissionRate: 0.05,
        affiliateServiceFeeRate: 0.0,
        fixedFee: 0,
        enableFixedFee: false,
        electronicPaymentsActive: true,
        multicaixaSandboxMode: true,
        validationPeriodDays: 7,
        minimumWithdrawalAmount: 5000,
      };
    } catch (err) {
      return {
        defaultCommissionRate: 0.05,
        affiliateServiceFeeRate: 0.0,
        fixedFee: 0,
        enableFixedFee: false,
        electronicPaymentsActive: true,
        multicaixaSandboxMode: true,
        validationPeriodDays: 7,
        minimumWithdrawalAmount: 5000,
      };
    }
  },

  async updatePlatformSettings(settings: PlatformSettings): Promise<void> {
    const path = 'platformSettings/global';
    try {
      await setDoc(doc(db, 'platformSettings', 'global'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      await this.recordAuditLog('UPDATE_PLATFORM_SETTINGS', 'PlatformSettings', 'global', settings);

      // Notificação de Alteração de Taxas e Regras Financeiras (Item 5 dos Requisitos)
      await notificationService.createNotification({
        category: 'financeiro',
        priority: 'critico',
        title: `Alteração de Taxas & Configurações Financeiras`,
        message: `Taxa da plataforma definida em ${Math.round(settings.defaultCommissionRate * 100)}% e taxa sobre afiliados em ${Math.round(settings.affiliateServiceFeeRate * 100)}%. Período de garantia: ${settings.validationPeriodDays} dias. Mínimo levantamento: ${formatKz(settings.minimumWithdrawalAmount)}.`,
        event: 'SETTINGS_CHANGED',
        idempotencyKey: `settings_change_${Date.now()}`,
        metadata: {
          platformFeeRate: settings.defaultCommissionRate,
        },
        actionType: 'view_financial',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // === REPORTS ===
  async submitReport(report: Omit<Report, 'reportId' | 'createdAt' | 'status'>): Promise<Report> {
    const path = 'reports';
    const reportId = 'rep_' + Date.now();
    const newReport: Report = {
      ...report,
      reportId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, reportId), newReport);
      await this.recordAuditLog('SUBMIT_REPORT', 'Report', reportId, { targetType: report.targetType });

      // Notificação de Segurança - Nova Denúncia (Item 5 dos Requisitos)
      await notificationService.createNotification({
        category: 'seguranca',
        priority: 'critico',
        title: `Denúncia Urgente de ${newReport.targetType.toUpperCase()}: ${newReport.targetTitle}`,
        message: `Denúncia submetida por "${newReport.reporterName}". Motivo: ${newReport.reason}. Detalhes: "${newReport.details.substring(0, 120)}...". Requer moderação do administrador.`,
        event: 'SECURITY_REPORT',
        idempotencyKey: `rep_notif_${reportId}`,
        metadata: {
          reportId,
          reportReason: newReport.reason,
        },
        actionType: 'view_report',
      });

      return newReport;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async getReports(): Promise<Report[]> {
    const path = 'reports';
    try {
      const snap = await getDocs(collection(db, path));
      const list: Report[] = [];
      snap.forEach((d) => list.push(d.data() as Report));
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async updateReportStatus(reportId: string, status: Report['status'], adminNotes?: string): Promise<void> {
    const path = `reports/${reportId}`;
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status,
        ...(adminNotes ? { adminNotes } : {}),
      });
      await this.recordAuditLog('UPDATE_REPORT_STATUS', 'Report', reportId, { status, adminNotes });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // === CHAT ===
  async sendChatMessage(msg: Omit<ChatMessage, 'messageId' | 'createdAt'>): Promise<ChatMessage> {
    const path = 'chatMessages';
    const messageId = 'msg_' + Date.now();
    const newMsg: ChatMessage = {
      ...msg,
      messageId,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, path, messageId), newMsg);
      return newMsg;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  // === BANNED WORDS & CONTENT SAFETY ===
  validateContentSafety(nameOrCombined: string, description: string = ''): { isValid: boolean; flaggedWord?: string; prohibitedWord?: string } {
    const BANNED_WORDS = [
      'arma', 'armas', 'pistola', 'pistolas', 'revolver', 'municao', 'municoes',
      'droga', 'drogas', 'cocaina', 'maconha', 'cannabis', 'explosivo', 'explosivos', 'veneno'
    ];
    const combined = `${nameOrCombined} ${description}`.toLowerCase();
    for (const word of BANNED_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(combined)) {
        return { isValid: false, flaggedWord: word, prohibitedWord: word };
      }
    }
    return { isValid: true };
  },

  // === AUTOMATIC MA- LEAD TRACKING ===
  async createLead(params: {
    itemType: 'product' | 'service';
    itemId: string;
    itemTitle: string;
    sellerId: string;
    sellerName: string;
    sellerPhone: string;
    sellerWhatsapp?: string;
    price: number;
    affiliateId?: string;
    affiliateName?: string;
    buyerName?: string;
    buyerPhone?: string;
    buyerEmail?: string;
  }): Promise<LeadTracking> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const leadCode = `MA-${randomCode}`;
    const leadId = `lead_${Date.now()}_${randomCode}`;
    const now = new Date().toISOString();

    const rate = params.itemType === 'service' ? 0.10 : 0.05; // 10% serviços, 5% produtos
    const platformCommissionAoa = Math.round(params.price * rate);
    const affRate = params.affiliateId ? 0.03 : 0; // 3% afiliado
    const affiliateCommissionAoa = affRate > 0 ? Math.round(params.price * affRate) : 0;

    const lead: LeadTracking = {
      id: leadId,
      leadId,
      code: leadCode,
      leadCode,
      itemType: params.itemType,
      itemId: params.itemId,
      itemTitle: params.itemTitle,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      sellerPhone: params.sellerPhone,
      sellerWhatsapp: params.sellerWhatsapp || params.sellerPhone,
      price: params.price,
      platformCommission: platformCommissionAoa,
      platformCommissionRate: rate,
      platformCommissionAoa,
      affiliateId: params.affiliateId,
      affiliateName: params.affiliateName,
      affiliateCommission: affiliateCommissionAoa,
      affiliateCommissionRate: affRate,
      affiliateCommissionAoa,
      buyerName: params.buyerName || 'Cliente Interessado',
      buyerPhone: params.buyerPhone,
      buyerEmail: params.buyerEmail,
      status: 'contacted',
      commissionPaidToPlatform: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'leads', leadId), lead);
    } catch (e) {
      console.warn('Fallback local para lead tracking:', e);
    }

    // Save in localStorage for immediate offline responsiveness
    try {
      const existingStr = localStorage.getItem('ma_leads');
      const list: LeadTracking[] = existingStr ? JSON.parse(existingStr) : [];
      list.unshift(lead);
      localStorage.setItem('ma_leads', JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar lead no localStorage:', e);
    }

    // Notify Admin of new tracked lead
    try {
      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Novo Contacto Comercial ${leadCode}`,
        message: `Cliente iniciou contacto pelo WhatsApp para "${params.itemTitle}" (${formatKz(params.price)}). Vendedor: ${params.sellerName}. Comissão estimada: ${formatKz(platformCommissionAoa)}.`,
        event: 'NOVO_LEAD_WHATSAPP',
        idempotencyKey: `lead_${leadId}`,
      });
    } catch (e) {
      console.warn('Erro ao notificar admin de lead:', e);
    }

    return lead;
  },

  async getLeads(sellerId?: string): Promise<LeadTracking[]> {
    const list: LeadTracking[] = [];
    try {
      const snap = await getDocs(collection(db, 'leads'));
      snap.forEach((d) => list.push(d.data() as LeadTracking));
    } catch (e) {
      console.warn('Fallback localStorage para getLeads:', e);
    }

    // Merge with localStorage
    try {
      const localStr = localStorage.getItem('ma_leads');
      if (localStr) {
        const localList: LeadTracking[] = JSON.parse(localStr);
        for (const item of localList) {
          if (!list.some((l) => l.leadId === item.leadId)) {
            list.push(item);
          }
        }
      }
    } catch (e) {
      // ignore
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sellerId) {
      return list.filter((l) => l.sellerId === sellerId);
    }
    return list;
  },

  async updateLeadStatus(leadId: string, status: LeadStatus, reason?: string): Promise<void> {
    const now = new Date().toISOString();
    const updates: Partial<LeadTracking> = {
      status,
      rejectionReason: reason,
      updatedAt: now,
    };
    if (status === 'sold') {
      updates.soldAt = now;
    }

    try {
      await updateDoc(doc(db, 'leads', leadId), updates);
    } catch (e) {
      console.warn('Aviso ao atualizar lead no Firestore:', e);
    }

    // Update in localStorage
    try {
      const localStr = localStorage.getItem('ma_leads');
      if (localStr) {
        const list: LeadTracking[] = JSON.parse(localStr);
        const idx = list.findIndex((l) => l.leadId === leadId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem('ma_leads', JSON.stringify(list));
        }
      }
    } catch (e) {
      // ignore
    }
  },

  async confirmCommissionPayment(leadId: string): Promise<void> {
    const now = new Date().toISOString();
    const updates = {
      commissionPaidToPlatform: true,
      commissionPaidAt: now,
      updatedAt: now,
    };

    try {
      await updateDoc(doc(db, 'leads', leadId), updates);
    } catch (e) {
      console.warn('Aviso ao confirmar comissão no Firestore:', e);
    }

    // Update in localStorage
    try {
      const localStr = localStorage.getItem('ma_leads');
      if (localStr) {
        const list: LeadTracking[] = JSON.parse(localStr);
        const idx = list.findIndex((l) => l.leadId === leadId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem('ma_leads', JSON.stringify(list));
        }
      }
    } catch (e) {
      // ignore
    }
  },

  async submitLeadReview(leadId: string, rating: number, comment: string): Promise<void> {
    const now = new Date().toISOString();
    const updates = {
      clientRating: rating,
      clientComment: comment,
      clientReviewedAt: now,
      updatedAt: now,
    };

    try {
      await updateDoc(doc(db, 'leads', leadId), updates);
    } catch (e) {
      console.warn('Aviso ao salvar review do lead no Firestore:', e);
    }

    try {
      const localStr = localStorage.getItem('ma_leads');
      if (localStr) {
        const list: LeadTracking[] = JSON.parse(localStr);
        const idx = list.findIndex((l) => l.leadId === leadId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem('ma_leads', JSON.stringify(list));
        }
      }
    } catch (e) {
      // ignore
    }
  },

  // === SELLER KYC & APPROVAL ===
  async updateStoreKYC(storeId: string, kyc: Partial<SellerStore>): Promise<void> {
    const updates = {
      ...kyc,
      status: 'pending_review' as const,
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, 'sellerStores', storeId), updates);
    } catch (e) {
      console.warn('Aviso ao atualizar KYC da loja:', e);
    }
  },

  async approveSellerStore(storeId: string): Promise<void> {
    const updates = {
      status: 'approved' as const,
      isVerified: true,
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, 'sellerStores', storeId), updates);
      await this.recordAuditLog('APPROVE_STORE', 'SellerStore', storeId, { isVerified: true });
    } catch (e) {
      console.warn('Aviso ao aprovar loja:', e);
    }
  },

  async rejectSellerStore(storeId: string, reason: string): Promise<void> {
    const updates = {
      status: 'banned' as const,
      isVerified: false,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, 'sellerStores', storeId), updates);
      await this.recordAuditLog('REJECT_STORE', 'SellerStore', storeId, { reason });
    } catch (e) {
      console.warn('Aviso ao banir loja:', e);
    }
  },

  // === PRODUCT APPROVAL ===
  async approveProduct(productId: string): Promise<void> {
    const updates = {
      status: 'published' as const,
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, 'products', productId), updates);
      await this.recordAuditLog('APPROVE_PRODUCT', 'Product', productId, { status: 'published' });
    } catch (e) {
      console.warn('Aviso ao aprovar produto:', e);
    }
  },

  async rejectProduct(productId: string, reason: string): Promise<void> {
    const updates = {
      status: 'rejected' as const,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, 'products', productId), updates);
      await this.recordAuditLog('REJECT_PRODUCT', 'Product', productId, { reason });
    } catch (e) {
      console.warn('Aviso ao rejeitar produto:', e);
    }
  },
};

