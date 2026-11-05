import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  ServiceItem,
  CommercialPartnerCompany,
  ServiceQuoteRequest,
  ServiceReview,
} from '../types/services';
import { SEED_COMPANIES, SEED_SERVICES } from '../data/angolaServicesData';
import { notificationService } from './notificationService';
import { formatKz } from '../data/angolaData';

class ServiceMarketplaceService {
  // === 1. SERVIÇOS ===
  async getServices(): Promise<ServiceItem[]> {
    const map = new Map<string, ServiceItem>();

    // 1. Initial seed defaults
    SEED_SERVICES.forEach((s) => map.set(s.serviceId, s));

    // 2. Local storage overrides/custom items
    try {
      const stored = localStorage.getItem('mercado_angola_services');
      if (stored) {
        const localList: ServiceItem[] = JSON.parse(stored);
        localList.forEach((s) => map.set(s.serviceId, s));
      }
    } catch (e) {
      // ignore
    }

    // 3. Firestore cloud collection
    try {
      const snap = await getDocs(collection(db, 'services'));
      snap.forEach((d) => {
        const item = d.data() as ServiceItem;
        map.set(item.serviceId, item);
      });
    } catch (e) {
      console.warn('Aviso ao sincronizar serviços do Firestore:', e);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createService(serviceData: Omit<ServiceItem, 'serviceId' | 'createdAt' | 'rating' | 'reviewCount' | 'viewsCount' | 'totalRequestsCount'>): Promise<ServiceItem> {
    const serviceId = 'srv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newService: ServiceItem = {
      ...serviceData,
      serviceId,
      rating: 5.0,
      reviewCount: 1,
      viewsCount: 1,
      totalRequestsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Local persistence
    try {
      const stored = localStorage.getItem('mercado_angola_services');
      const list: ServiceItem[] = stored ? JSON.parse(stored) : [...SEED_SERVICES];
      list.unshift(newService);
      localStorage.setItem('mercado_angola_services', JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    // 2. Firestore persistence
    try {
      await setDoc(doc(db, 'services', serviceId), newService);
    } catch (e) {
      console.warn('Aviso ao guardar serviço no Firestore:', e);
    }

    // 3. Real Admin Notification
    try {
      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Novo Serviço Publicado: ${newService.title}`,
        message: `A empresa "${newService.companyName}" publicou um novo serviço comercial na categoria "${newService.category}". Estado: ${newService.status.toUpperCase()}.`,
        event: 'SERVICE_PUBLISHED',
        idempotencyKey: `srv_pub_${serviceId}`,
        metadata: {
          productName: newService.title,
          sellerName: newService.companyName,
        },
        actionType: 'view_order',
      });
    } catch (e) {
      // ignore
    }

    return newService;
  }

  async updateService(serviceId: string, updates: Partial<ServiceItem>): Promise<void> {
    const now = new Date().toISOString();

    // Local
    try {
      const stored = localStorage.getItem('mercado_angola_services');
      if (stored) {
        const list: ServiceItem[] = JSON.parse(stored);
        const updated = list.map((s) => (s.serviceId === serviceId ? { ...s, ...updates, updatedAt: now } : s));
        localStorage.setItem('mercado_angola_services', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }

    // Firestore
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        ...updates,
        updatedAt: now,
      });
    } catch (e) {
      console.warn('Aviso ao atualizar serviço no Firestore:', e);
    }
  }

  async deleteService(serviceId: string): Promise<void> {
    try {
      const stored = localStorage.getItem('mercado_angola_services');
      if (stored) {
        const list: ServiceItem[] = JSON.parse(stored);
        const filtered = list.filter((s) => s.serviceId !== serviceId);
        localStorage.setItem('mercado_angola_services', JSON.stringify(filtered));
      }
    } catch (e) {
      // ignore
    }

    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (e) {
      console.warn('Aviso ao eliminar serviço no Firestore:', e);
    }
  }

  // === 2. EMPRESAS PARCEIRAS COMERCIAIS ===
  async getCompanies(): Promise<CommercialPartnerCompany[]> {
    const map = new Map<string, CommercialPartnerCompany>();

    SEED_COMPANIES.forEach((c) => map.set(c.companyId, c));

    try {
      const stored = localStorage.getItem('mercado_angola_companies');
      if (stored) {
        const localList: CommercialPartnerCompany[] = JSON.parse(stored);
        localList.forEach((c) => map.set(c.companyId, c));
      }
    } catch (e) {
      // ignore
    }

    try {
      const snap = await getDocs(collection(db, 'commercialCompanies'));
      snap.forEach((d) => {
        const c = d.data() as CommercialPartnerCompany;
        map.set(c.companyId, c);
      });
    } catch (e) {
      console.warn('Aviso ao sincronizar empresas:', e);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async registerCompany(companyData: Omit<CommercialPartnerCompany, 'companyId' | 'createdAt' | 'rating' | 'reviewCount' | 'viewsCount' | 'contactsReceivedCount'>): Promise<CommercialPartnerCompany> {
    const companyId = 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newCompany: CommercialPartnerCompany = {
      ...companyData,
      companyId,
      rating: 5.0,
      reviewCount: 1,
      viewsCount: 1,
      contactsReceivedCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Local
    try {
      const stored = localStorage.getItem('mercado_angola_companies');
      const list: CommercialPartnerCompany[] = stored ? JSON.parse(stored) : [...SEED_COMPANIES];
      list.unshift(newCompany);
      localStorage.setItem('mercado_angola_companies', JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    // Firestore
    try {
      await setDoc(doc(db, 'commercialCompanies', companyId), newCompany);
    } catch (e) {
      console.warn('Aviso ao guardar empresa no Firestore:', e);
    }

    // Notification
    try {
      await notificationService.createNotification({
        category: 'utilizadores',
        priority: 'normal',
        title: `Nova Empresa Comercial Registada: ${newCompany.name}`,
        message: `A empresa "${newCompany.name}" (${newCompany.category}) registou a sua conta comercial. NIF: ${newCompany.nif || 'Em validação'}. Localização: ${newCompany.province}/${newCompany.municipality}.`,
        event: 'COMPANY_REGISTERED',
        idempotencyKey: `comp_reg_${companyId}`,
        metadata: {
          candidateName: newCompany.name,
          candidateEmail: newCompany.email,
        },
        actionType: 'view_order',
      });
    } catch (e) {
      // ignore
    }

    return newCompany;
  }

  async updateCompany(companyId: string, updates: Partial<CommercialPartnerCompany>): Promise<void> {
    const now = new Date().toISOString();

    try {
      const stored = localStorage.getItem('mercado_angola_companies');
      if (stored) {
        const list: CommercialPartnerCompany[] = JSON.parse(stored);
        const updated = list.map((c) => (c.companyId === companyId ? { ...c, ...updates, updatedAt: now } : c));
        localStorage.setItem('mercado_angola_companies', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }

    try {
      await updateDoc(doc(db, 'commercialCompanies', companyId), {
        ...updates,
        updatedAt: now,
      });
    } catch (e) {
      console.warn('Aviso ao atualizar empresa no Firestore:', e);
    }
  }

  // === 3. PEDIDOS DE SERVIÇO E ORÇAMENTO ("SOLICITAR SERVIÇO" & "PEDIR ORÇAMENTO") ===
  async submitQuoteRequest(params: {
    serviceId: string;
    serviceTitle: string;
    serviceCategory: any;
    companyId: string;
    companyName: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    province: string;
    municipality: string;
    addressOrDetails: string;
    serviceDateNeeded?: string;
    urgencyLevel?: 'normal' | 'urgente' | 'planeada';
    details: string;
    budgetProposedAoa?: number;
  }): Promise<ServiceQuoteRequest> {
    const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const reqData: ServiceQuoteRequest = {
      requestId,
      ...params,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // 1. Local
    try {
      const stored = localStorage.getItem('mercado_angola_quote_requests');
      const list: ServiceQuoteRequest[] = stored ? JSON.parse(stored) : [];
      list.unshift(reqData);
      localStorage.setItem('mercado_angola_quote_requests', JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    // 2. Firestore
    try {
      await setDoc(doc(db, 'serviceQuoteRequests', requestId), reqData);
    } catch (e) {
      console.warn('Aviso ao persistir pedido de orçamento no Firestore:', e);
    }

    // 3. Admin Notification
    try {
      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Novo Pedido de Serviço/Orçamento: ${params.serviceTitle}`,
        message: `Cliente ${params.clientName} (${params.clientPhone}) solicitou orçamento para "${params.serviceTitle}" à empresa "${params.companyName}". Município: ${params.municipality}.`,
        event: 'SERVICE_QUOTE_REQUESTED',
        idempotencyKey: `quote_req_${requestId}`,
        metadata: {
          productName: params.serviceTitle,
          candidateName: params.clientName,
          sellerName: params.companyName,
          saleAmount: params.budgetProposedAoa || 0,
        },
        actionType: 'view_order',
      });
    } catch (e) {
      // ignore
    }

    return reqData;
  }

  async getQuoteRequests(filter?: { companyId?: string; clientId?: string }): Promise<ServiceQuoteRequest[]> {
    const map = new Map<string, ServiceQuoteRequest>();

    // Local
    try {
      const stored = localStorage.getItem('mercado_angola_quote_requests');
      if (stored) {
        const localList: ServiceQuoteRequest[] = JSON.parse(stored);
        localList.forEach((r) => map.set(r.requestId, r));
      }
    } catch (e) {
      // ignore
    }

    // Firestore
    try {
      const snap = await getDocs(collection(db, 'serviceQuoteRequests'));
      snap.forEach((d) => {
        const r = d.data() as ServiceQuoteRequest;
        map.set(r.requestId, r);
      });
    } catch (e) {
      console.warn('Aviso ao carregar pedidos de serviço:', e);
    }

    let list = Array.from(map.values());
    if (filter?.companyId) {
      list = list.filter((r) => r.companyId === filter.companyId);
    }
    if (filter?.clientId) {
      list = list.filter((r) => r.clientId === filter.clientId);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateQuoteStatus(
    requestId: string,
    status: ServiceQuoteRequest['status'],
    companyQuotePriceAoa?: number,
    companyQuoteNotes?: string
  ): Promise<void> {
    const now = new Date().toISOString();

    try {
      const stored = localStorage.getItem('mercado_angola_quote_requests');
      if (stored) {
        const list: ServiceQuoteRequest[] = JSON.parse(stored);
        const updated = list.map((r) =>
          r.requestId === requestId
            ? { ...r, status, companyQuotePriceAoa, companyQuoteNotes, updatedAt: now }
            : r
        );
        localStorage.setItem('mercado_angola_quote_requests', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }

    try {
      await updateDoc(doc(db, 'serviceQuoteRequests', requestId), {
        status,
        ...(companyQuotePriceAoa !== undefined && { companyQuotePriceAoa }),
        ...(companyQuoteNotes !== undefined && { companyQuoteNotes }),
        updatedAt: now,
      });
    } catch (e) {
      console.warn('Aviso ao atualizar pedido no Firestore:', e);
    }
  }

  // === 4. AVALIAÇÕES DE CLIENTES ===
  async addReview(review: Omit<ServiceReview, 'reviewId' | 'createdAt'>): Promise<ServiceReview> {
    const reviewId = 'rev_' + Date.now();
    const newRev: ServiceReview = {
      ...review,
      reviewId,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('mercado_angola_reviews');
      const list: ServiceReview[] = stored ? JSON.parse(stored) : [];
      list.unshift(newRev);
      localStorage.setItem('mercado_angola_reviews', JSON.stringify(list));
    } catch (e) {
      // ignore
    }

    try {
      await setDoc(doc(db, 'serviceReviews', reviewId), newRev);
    } catch (e) {
      // ignore
    }

    return newRev;
  }

  async getReviews(targetId?: string): Promise<ServiceReview[]> {
    const map = new Map<string, ServiceReview>();

    // Baseline reviews
    const defaultReviews: ServiceReview[] = [
      {
        reviewId: 'rev_1',
        targetType: 'service',
        targetId: 'srv_limpeza_sofas_carpetes',
        targetTitle: 'Lavagem & Higienização de Sofás',
        authorId: 'user_1',
        authorName: 'Teresa Gonçalves',
        authorLocation: 'Talatona, Luanda',
        rating: 5,
        comment: 'Excelente serviço! A equipa da CleanMaster chegou na hora combinada, o sofá de camurça ficou como novo e o cheiro a limpo durou dias. Recomendo muito!',
        verifiedCustomer: true,
        createdAt: '2025-01-20T14:00:00Z',
      },
      {
        reviewId: 'rev_2',
        targetType: 'service',
        targetId: 'srv_instalacao_ar_condicionado',
        targetTitle: 'Instalação de Ar Condicionado',
        authorId: 'user_2',
        authorName: 'Eng. Manuel Costa',
        authorLocation: 'Kilamba, Luanda',
        rating: 5,
        comment: 'Técnicos muito competentes da VoltAngola. Montaram dois aparelhos split de 18.000 BTUs no meu escritório sem sujar as paredes. Preço justo em kwanzas.',
        verifiedCustomer: true,
        createdAt: '2025-01-22T16:30:00Z',
      },
    ];

    defaultReviews.forEach((r) => map.set(r.reviewId, r));

    try {
      const stored = localStorage.getItem('mercado_angola_reviews');
      if (stored) {
        const list: ServiceReview[] = JSON.parse(stored);
        list.forEach((r) => map.set(r.reviewId, r));
      }
    } catch (e) {
      // ignore
    }

    const list = Array.from(map.values());
    if (targetId) {
      return list.filter((r) => r.targetId === targetId);
    }
    return list;
  }
}

export const serviceMarketplaceService = new ServiceMarketplaceService();
