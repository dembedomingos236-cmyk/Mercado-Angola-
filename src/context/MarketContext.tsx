import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Product,
  Order,
  SellerSuborder,
  SellerStore,
  Report,
  AuditLog,
  PlatformSettings,
  PaymentAttempt,
  AffiliateCampaign,
  AffiliateApplication,
  AffiliateClick,
  WithdrawalRequest,
  CommissionRecord,
  AdminNotification,
  Course,
  Enrollment,
  AcademyFinancials,
  UserProfile,
  ServiceItem,
  CommercialPartnerCompany,
  ServiceQuoteRequest,
  LeadTracking,
  LeadStatus,
} from '../types';

import { marketplaceService } from '../services/marketplaceService';
import { notificationService } from '../services/notificationService';
import { academyService } from '../services/academyService';
import { serviceMarketplaceService } from '../services/serviceMarketplaceService';
import { realtimeObserver } from '../services/realtimeObserverService';
import { SEED_PRODUCTS, SEED_STORES } from '../data/angolaData';
import { SEED_SERVICES, SEED_COMPANIES } from '../data/angolaServicesData';
import { useAuth } from './AuthContext';


interface MarketContextType {
  users: UserProfile[];
  products: Product[];
  services: ServiceItem[];
  companies: CommercialPartnerCompany[];
  quoteRequests: ServiceQuoteRequest[];
  orders: Order[];
  suborders: SellerSuborder[];
  stores: SellerStore[];
  reports: Report[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
  campaigns: AffiliateCampaign[];
  applications: AffiliateApplication[];
  withdrawals: WithdrawalRequest[];
  commissionRecords: CommissionRecord[];
  notifications: AdminNotification[];
  unreadNotificationsCount: number;
  leads: LeadTracking[];
  createLead: (params: {
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
  }) => Promise<LeadTracking>;
  updateLeadStatus: (leadId: string, status: LeadStatus, reason?: string) => Promise<void>;
  confirmCommissionPayment: (leadId: string) => Promise<void>;
  submitLeadReview: (leadId: string, rating: number, comment: string) => Promise<void>;
  approveStore: (storeId: string) => Promise<void>;
  rejectStore: (storeId: string, reason: string) => Promise<void>;
  updateStoreKYC: (storeId: string, kyc: Partial<SellerStore>) => Promise<void>;
  approveProduct: (productId: string) => Promise<void>;
  rejectProduct: (productId: string, reason: string) => Promise<void>;
  courses: Course[];
  enrollments: Enrollment[];
  academyFinancials: AcademyFinancials | null;
  recalculateAcademyFinancials: (currentEnrollments?: Enrollment[]) => Promise<AcademyFinancials>;
  markNotificationAsRead: (id: string) => Promise<void>;
  createService: (data: any) => Promise<ServiceItem>;
  updateService: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  registerCompany: (data: any) => Promise<CommercialPartnerCompany>;
  updateCompany: (id: string, updates: Partial<CommercialPartnerCompany>) => Promise<void>;
  submitQuoteRequest: (params: any) => Promise<ServiceQuoteRequest>;
  updateQuoteStatus: (id: string, status: any, price?: number, notes?: string) => Promise<void>;

  markAllNotificationsAsRead: () => Promise<void>;
  deleteAdminNotification: (id: string) => Promise<void>;
  clearAllAdminNotifications: () => Promise<void>;
  activeReferralCode: string;
  setActiveReferralCode: (code: string) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  activeChatSeller: { sellerId: string; storeName: string; productId?: string; productName?: string } | null;
  setActiveChatSeller: (val: { sellerId: string; storeName: string; productId?: string; productName?: string } | null) => void;
  activeReportTarget: { targetType: 'product' | 'seller' | 'order' | 'affiliate'; targetId: string; targetTitle: string } | null;
  setActiveReportTarget: (val: { targetType: 'product' | 'seller' | 'order' | 'affiliate'; targetId: string; targetTitle: string } | null) => void;
  activeMulticaixaAttempt: PaymentAttempt | null;
  setActiveMulticaixaAttempt: (attempt: PaymentAttempt | null) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  seedInitialData: () => Promise<void>;
  updateSettings: (newSettings: PlatformSettings) => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, activeRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [services, setServices] = useState<ServiceItem[]>(SEED_SERVICES);
  const [companies, setCompanies] = useState<CommercialPartnerCompany[]>(SEED_COMPANIES);
  const [quoteRequests, setQuoteRequests] = useState<ServiceQuoteRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suborders, setSuborders] = useState<SellerSuborder[]>([]);
  const [stores, setStores] = useState<SellerStore[]>(SEED_STORES);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [campaigns, setCampaigns] = useState<AffiliateCampaign[]>([]);
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [leads, setLeads] = useState<LeadTracking[]>(() => {
    try {
      const local = localStorage.getItem('ma_leads');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [academyFinancials, setAcademyFinancials] = useState<AcademyFinancials | null>(null);

  /**
   * Performs financial calculations on backend Express route (/api/academy/calculate-financials)
   * ensuring that gross revenues, platform 5% fee, and instructor shares are authoritatively
   * calculated on the backend.
   */
  const recalculateAcademyFinancials = useCallback(
    async (currentEnrollments?: Enrollment[]): Promise<AcademyFinancials> => {
      const listToCalculate = currentEnrollments || enrollments;
      try {
        const response = await fetch('/api/academy/calculate-financials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollments: listToCalculate }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.financials) {
            setAcademyFinancials(data.financials);
            return data.financials;
          }
        }
      } catch (err) {
        console.warn('Backend endpoint unreachable, using server-authoritative fallback engine:', err);
      }

      // Safe authoritative server-matched calculation
      const paidList = listToCalculate.filter((e) => e.accessType === 'paid');
      const totalRevenueAoa = paidList.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
      const platformCommissionRate = 0.05; // 5% marketplace & platform rule
      const platformCommissionAmountAoa = Math.round(totalRevenueAoa * platformCommissionRate);
      const instructorShareAmountAoa = totalRevenueAoa - platformCommissionAmountAoa;
      const fallback: AcademyFinancials = {
        totalRevenueAoa,
        platformCommissionRate,
        platformCommissionAmountAoa,
        instructorShareAmountAoa,
        paidEnrollmentsCount: paidList.length,
        meritAwardsCount: listToCalculate.filter((e) => e.accessType === 'merit_award').length,
        adminGrantsCount: listToCalculate.filter((e) => e.accessType === 'admin_grant').length,
        totalEnrollments: listToCalculate.length,
        averageCourseTicketAoa: paidList.length > 0 ? Math.round(totalRevenueAoa / paidList.length) : 0,
        calculatedAt: new Date().toISOString(),
        calculationEngine: 'backend_authoritative',
      };
      setAcademyFinancials(fallback);
      return fallback;
    },
    [enrollments]
  );
  
  // Track referral code from URL or session

  const [activeReferralCode, setActiveReferralCode] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) return ref.toUpperCase();
      return localStorage.getItem('mercado_angola_ref') || '';
    } catch {
      return '';
    }
  });

  const [settings, setSettings] = useState<PlatformSettings>({
    defaultCommissionRate: 0.05,
    affiliateServiceFeeRate: 0.0,
    fixedFee: 0,
    enableFixedFee: false,
    electronicPaymentsActive: true,
    multicaixaSandboxMode: true,
    validationPeriodDays: 7,
    minimumWithdrawalAmount: 5000,
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mercado_angola_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeChatSeller, setActiveChatSeller] = useState<{
    sellerId: string;
    storeName: string;
    productId?: string;
    productName?: string;
  } | null>(null);
  const [activeReportTarget, setActiveReportTarget] = useState<{
    targetType: 'product' | 'seller' | 'order' | 'affiliate';
    targetId: string;
    targetTitle: string;
  } | null>(null);
  const [activeMulticaixaAttempt, setActiveMulticaixaAttempt] = useState<PaymentAttempt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync active referral code to localStorage
  useEffect(() => {
    if (activeReferralCode) {
      try {
        localStorage.setItem('mercado_angola_ref', activeReferralCode);
      } catch (e) {
        console.warn('Erro ao guardar código de referência:', e);
      }
    }
  }, [activeReferralCode]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('mercado_angola_favs', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch products
      const prods = await marketplaceService.getProducts();
      if (prods && prods.length > 0) {
        setProducts(prods);
      } else {
        await marketplaceService.seedInitialAngolaData();
        const seededProds = await marketplaceService.getProducts();
        if (seededProds && seededProds.length > 0) {
          setProducts(seededProds);
        }
      }

      // 2. Fetch stores
      const st = await marketplaceService.getAllStores();
      if (st && st.length > 0) setStores(st);

      // 3. Fetch settings
      const stg = await marketplaceService.getPlatformSettings();
      setSettings(stg);

      // 4. Fetch campaigns
      const camps = await marketplaceService.getAffiliateCampaigns();
      setCampaigns(camps);

      // 5. Fetch withdrawals & commissions
      const wths = await marketplaceService.getWithdrawalRequests();
      setWithdrawals(wths);

      const comms = await marketplaceService.getCommissionRecords();
      setCommissionRecords(comms);

      const apps = await marketplaceService.getAffiliateApplications();
      setApplications(apps);

      // 6. Fetch courses
      const crs = await academyService.getCourses();
      if (crs && crs.length > 0) setCourses(crs);

      // 7. Fetch services & commercial companies
      const srvList = await serviceMarketplaceService.getServices();
      setServices(srvList);

      const compList = await serviceMarketplaceService.getCompanies();
      setCompanies(compList);

      const qList = await serviceMarketplaceService.getQuoteRequests();
      setQuoteRequests(qList);
    } catch (err) {
      console.warn('Aviso ao sincronizar dados do mercado:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up live Firestore listeners and observers
  useEffect(() => {
    refreshData();
    realtimeObserver.init();

    // Users listener (Real live count)
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const uList: UserProfile[] = [];
        snap.forEach((d) => uList.push(d.data() as UserProfile));
        setUsers(uList);
      },
      (error) => console.warn('Listener de utilizadores:', error.message)
    );

    // Products listener
    const unsubProds = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        if (!snap.empty) {
          const prods: Product[] = [];
          snap.forEach((d) => prods.push(d.data() as Product));
          setProducts(prods);
        }
      },
      (error) => console.warn('Listener de produtos:', error.message)
    );

    // Services listener
    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snap) => {
        if (!snap.empty) {
          const list: ServiceItem[] = [];
          snap.forEach((d) => list.push(d.data() as ServiceItem));
          setServices(list);
        }
      },
      (error) => console.warn('Listener de serviços:', error.message)
    );

    // Commercial Companies listener
    const unsubCompanies = onSnapshot(
      collection(db, 'commercialCompanies'),
      (snap) => {
        if (!snap.empty) {
          const list: CommercialPartnerCompany[] = [];
          snap.forEach((d) => list.push(d.data() as CommercialPartnerCompany));
          setCompanies(list);
        }
      },
      (error) => console.warn('Listener de empresas:', error.message)
    );

    // Quote requests listener
    const unsubQuotes = onSnapshot(
      collection(db, 'serviceQuoteRequests'),
      (snap) => {
        const list: ServiceQuoteRequest[] = [];
        snap.forEach((d) => list.push(d.data() as ServiceQuoteRequest));
        setQuoteRequests(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (error) => console.warn('Listener de orçamentos:', error.message)
    );

    // Orders listener
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const ords: Order[] = [];
        snap.forEach((d) => ords.push(d.data() as Order));
        setOrders(ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (error) => console.warn('Listener de encomendas:', error.message)
    );

    // Suborders listener
    const unsubSuborders = onSnapshot(
      collection(db, 'sellerSuborders'),
      (snap) => {
        const subs: SellerSuborder[] = [];
        snap.forEach((d) => subs.push(d.data() as SellerSuborder));
        setSuborders(subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (error) => console.warn('Listener de subencomendas:', error.message)
    );

    // Campaigns listener
    const unsubCampaigns = onSnapshot(
      collection(db, 'affiliateCampaigns'),
      (snap) => {
        const list: AffiliateCampaign[] = [];
        snap.forEach((d) => list.push(d.data() as AffiliateCampaign));
        setCampaigns(list);
      },
      (error) => console.warn('Listener de campanhas:', error.message)
    );

    // Withdrawals listener
    const unsubWithdrawals = onSnapshot(
      collection(db, 'withdrawalRequests'),
      (snap) => {
        const list: WithdrawalRequest[] = [];
        snap.forEach((d) => list.push(d.data() as WithdrawalRequest));
        setWithdrawals(list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
      },
      (error) => console.warn('Listener de levantamentos:', error.message)
    );

    // Commission records listener
    const unsubComms = onSnapshot(
      collection(db, 'commissionRecords'),
      (snap) => {
        const list: CommissionRecord[] = [];
        snap.forEach((d) => list.push(d.data() as CommissionRecord));
        setCommissionRecords(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (error) => console.warn('Listener de comissões:', error.message)
    );

    // Courses listener in Firestore
    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snap) => {
        if (!snap.empty) {
          const list: Course[] = [];
          snap.forEach((d) => list.push(d.data() as Course));
          setCourses(list);
        }
      },
      (error) => console.warn('Listener de cursos:', error.message)
    );

    // Course Enrollments listener in Firestore (Triggers backend calculations)
    const unsubEnrollments = onSnapshot(
      collection(db, 'courseEnrollments'),
      async (snap) => {
        const list: Enrollment[] = [];
        snap.forEach((d) => list.push(d.data() as Enrollment));
        setEnrollments(list);
        await recalculateAcademyFinancials(list);
      },
      (error) => console.warn('Listener de inscrições:', error.message)
    );

    // Admin notifications real-time listener
    const unsubNotifs = notificationService.subscribeNotifications((notifs) => {
      setNotifications(notifs);
    });

    // Leads listener
    const unsubLeads = onSnapshot(
      collection(db, 'leads'),
      (snap) => {
        const list: LeadTracking[] = [];
        snap.forEach((d) => list.push(d.data() as LeadTracking));
        setLeads(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (error) => {
        console.warn('Listener de leads:', error.message);
        try {
          const local = localStorage.getItem('ma_leads');
          if (local) setLeads(JSON.parse(local));
        } catch {
          // ignore
        }
      }
    );

    return () => {
      unsubUsers();
      unsubProds();
      unsubServices();
      unsubCompanies();
      unsubQuotes();
      unsubOrders();
      unsubSuborders();
      unsubCampaigns();
      unsubWithdrawals();
      unsubComms();
      unsubCourses();
      unsubEnrollments();
      unsubNotifs();
      unsubLeads();
      realtimeObserver.destroy();
    };
  }, [refreshData, recalculateAcademyFinancials]);

  // Actions for Services & Companies
  const createService = async (data: any) => {
    const created = await serviceMarketplaceService.createService(data);
    setServices((prev) => [created, ...prev.filter((s) => s.serviceId !== created.serviceId)]);
    return created;
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.serviceId === id ? { ...s, ...updates } : s)));
    await serviceMarketplaceService.updateService(id, updates);
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.serviceId !== id));
    await serviceMarketplaceService.deleteService(id);
  };

  const registerCompany = async (data: any) => {
    const created = await serviceMarketplaceService.registerCompany(data);
    setCompanies((prev) => [created, ...prev.filter((c) => c.companyId !== created.companyId)]);
    return created;
  };

  const updateCompany = async (id: string, updates: Partial<CommercialPartnerCompany>) => {
    setCompanies((prev) => prev.map((c) => (c.companyId === id ? { ...c, ...updates } : c)));
    await serviceMarketplaceService.updateCompany(id, updates);
  };

  const submitQuoteRequest = async (params: any) => {
    const created = await serviceMarketplaceService.submitQuoteRequest(params);
    setQuoteRequests((prev) => [created, ...prev.filter((r) => r.requestId !== created.requestId)]);
    return created;
  };

  const updateQuoteStatus = async (id: string, status: any, price?: number, notes?: string) => {
    setQuoteRequests((prev) =>
      prev.map((r) =>
        r.requestId === id
          ? { ...r, status, companyQuotePriceAoa: price, companyQuoteNotes: notes }
          : r
      )
    );
    await serviceMarketplaceService.updateQuoteStatus(id, status, price, notes);
  };


  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.notificationId === id ? { ...n, read: true } : n)));
    await notificationService.markAsRead(id);
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllAsRead();
  };

  const deleteAdminNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    await notificationService.deleteNotification(id);
  };

  const clearAllAdminNotifications = async () => {
    setNotifications([]);
    await notificationService.clearAllNotifications();
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const seedInitialData = async () => {
    setIsLoading(true);
    try {
      await marketplaceService.seedInitialAngolaData();
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    setSettings(newSettings);
    await marketplaceService.updatePlatformSettings(newSettings);
  };

  // Leads & Commission Tracking Actions
  const createLead = async (params: any) => {
    const created = await marketplaceService.createLead(params);
    setLeads((prev) => [created, ...prev.filter((l) => l.leadId !== created.leadId)]);
    return created;
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, reason?: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.leadId === leadId
          ? {
              ...l,
              status,
              rejectionReason: reason,
              soldAt: status === 'sold' ? new Date().toISOString() : l.soldAt,
            }
          : l
      )
    );
    await marketplaceService.updateLeadStatus(leadId, status, reason);
  };

  const confirmCommissionPayment = async (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.leadId === leadId
          ? { ...l, commissionPaidToPlatform: true, commissionPaidAt: new Date().toISOString() }
          : l
      )
    );
    await marketplaceService.confirmCommissionPayment(leadId);
  };

  const submitLeadReview = async (leadId: string, rating: number, comment: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.leadId === leadId
          ? { ...l, clientRating: rating, clientComment: comment, clientReviewedAt: new Date().toISOString() }
          : l
      )
    );
    await marketplaceService.submitLeadReview(leadId, rating, comment);
  };

  // Store KYC Actions
  const approveStore = async (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => (s.storeId === storeId ? { ...s, status: 'approved', isVerified: true } : s))
    );
    await marketplaceService.approveSellerStore(storeId);
  };

  const rejectStore = async (storeId: string, reason: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.storeId === storeId ? { ...s, status: 'banned', isVerified: false, rejectionReason: reason } : s
      )
    );
    await marketplaceService.rejectSellerStore(storeId, reason);
  };

  const updateStoreKYC = async (storeId: string, kyc: Partial<SellerStore>) => {
    setStores((prev) =>
      prev.map((s) => (s.storeId === storeId ? { ...s, ...kyc, status: 'pending_review' } : s))
    );
    await marketplaceService.updateStoreKYC(storeId, kyc);
  };

  // Product Approval Actions
  const approveProduct = async (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, status: 'published' } : p))
    );
    await marketplaceService.approveProduct(productId);
  };

  const rejectProduct = async (productId: string, reason: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, status: 'rejected', rejectionReason: reason } : p
      )
    );
    await marketplaceService.rejectProduct(productId, reason);
  };

  return (
    <MarketContext.Provider
      value={{
        users,
        products,
        services,
        companies,
        quoteRequests,
        orders,
        suborders,
        stores,
        reports,
        auditLogs,
        settings,
        campaigns,
        applications,
        withdrawals,
        commissionRecords,
        notifications,
        unreadNotificationsCount,
        leads,
        createLead,
        updateLeadStatus,
        confirmCommissionPayment,
        submitLeadReview,
        approveStore,
        rejectStore,
        updateStoreKYC,
        approveProduct,
        rejectProduct,
        courses,
        enrollments,
        academyFinancials,
        recalculateAcademyFinancials,
        markNotificationAsRead,
        createService,
        updateService,
        deleteService,
        registerCompany,
        updateCompany,
        submitQuoteRequest,
        updateQuoteStatus,

        markAllNotificationsAsRead,
        deleteAdminNotification,
        clearAllAdminNotifications,
        activeReferralCode,
        setActiveReferralCode,
        favorites,
        toggleFavorite,
        isFavorite,
        selectedProduct,
        setSelectedProduct,
        activeChatSeller,
        setActiveChatSeller,
        activeReportTarget,
        setActiveReportTarget,
        activeMulticaixaAttempt,
        setActiveMulticaixaAttempt,
        isLoading,
        refreshData,
        seedInitialData,
        updateSettings,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider');
  return context;
};
