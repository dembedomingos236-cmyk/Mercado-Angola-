import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  FileText,
  RefreshCw,
  Database,
  Lock,
  DollarSign,
  Download,
  Share2,
  Calendar,
  Check,
  Building2,
  Banknote,
  Send,
  Sparkles,
  UserCheck,
  BadgeCheck,
  Upload,
  Plus,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../data/angolaData';
import { marketplaceService } from '../services/marketplaceService';
import { AuditLog, PlatformSettings, Product, Report, WithdrawalRequest, ProductCategory } from '../types';
import { AdminNotificationsCenter } from './AdminNotificationsCenter';
import { AdminAcademyManager } from './AdminAcademyManager';
import { AdminContactsManager } from './AdminContactsManager';
import { NotificationChannelsSettings } from './NotificationChannelsSettings';
import { AdminNotificationTester } from './AdminNotificationTester';
import { Bell, GraduationCap, MessageSquare, Radio, FlaskConical } from 'lucide-react';


export const AdminDashboard: React.FC = () => {
  const { profile, user, isAdmin, openLoginModal } = useAuth();
  const {
    users,
    products,
    services,
    companies,
    quoteRequests,
    orders,
    suborders,
    stores,
    reports,
    settings,
    updateSettings,
    refreshData,
    seedInitialData,
    withdrawals,
    commissionRecords,
    unreadNotificationsCount,
    updateService,
    updateCompany,
    leads,
    approveStore,
    rejectStore,
    confirmCommissionPayment,
    approveProduct,
    rejectProduct,
  } = useMarket();

  // STRICT ACCESS CONTROL: Non-admins are blocked from viewing platform financials & admin tools
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4 shadow-sm border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Acesso Exclusivo ao Administrador Principal
        </h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Esta área contém métricas financeiras globais, relatórios confidenciais de comissões, auditoria e gestão da plataforma Mercado Angola. O acesso é estritamente restrito à conta oficial do administrador (<strong className="text-slate-900">dembedomingos236@gmail.com</strong>).
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.href = '#home'}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Voltar à Navegação Pública
          </button>
          <button
            onClick={() => openLoginModal('admin')}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Iniciar Sessão com Conta de Administrador
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    | 'financial'
    | 'kyc_sellers'
    | 'commission_leads'
    | 'notifications'
    | 'services_companies'
    | 'academy'
    | 'contacts'
    | 'withdrawals'
    | 'products'
    | 'reports'
    | 'settings'
    | 'channels'
    | 'tester'
    | 'audit'
  >('financial');

  // KYC Seller states
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'banned'>('all');
  const [rejectingStoreId, setRejectingStoreId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [viewingDocImage, setViewingDocImage] = useState<string | null>(null);

  // Leads & Commissions states
  const [leadsFilter, setLeadsFilter] = useState<'all' | 'sold' | 'commission_paid' | 'contacted'>('all');

  // Product addition states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(25000);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Telemóveis e Eletrónica');
  const [newProdStoreId, setNewProdStoreId] = useState<string>(stores[0]?.storeId || '');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [prodSafetyWarning, setProdSafetyWarning] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');

  // Product rejection state
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [prodRejectReasonInput, setProdRejectReasonInput] = useState('');
  const [productTabFilter, setProductTabFilter] = useState<'all' | 'pending_approval' | 'published' | 'suspended'>('all');

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Settings inputs
  const [platformFeePercent, setPlatformFeePercent] = useState(settings.defaultCommissionRate * 100);
  const [affiliateServiceFeePercent, setAffiliateServiceFeePercent] = useState(settings.affiliateServiceFeeRate * 100);
  const [validationDays, setValidationDays] = useState(settings.validationPeriodDays || 7);
  const [minWithdrawal, setMinWithdrawal] = useState(settings.minimumWithdrawalAmount || 5000);
  const [sandboxMode, setSandboxMode] = useState(settings.multicaixaSandboxMode);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Withdrawal processing modal
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);
  const [transferProofRef, setTransferProofRef] = useState('');
  const [adminPayoutNotes, setAdminPayoutNotes] = useState('');

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await marketplaceService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.warn('Erro ao carregar auditoria:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Date filtering logic
  const nowTime = Date.now();
  const filterByDate = (dateStr: string) => {
    if (dateFilter === 'all') return true;
    const diffDays = (nowTime - new Date(dateStr).getTime()) / (1000 * 3600 * 24);
    if (dateFilter === 'today') return diffDays <= 1;
    if (dateFilter === 'week') return diffDays <= 7;
    if (dateFilter === 'month') return diffDays <= 30;
    return true;
  };

  const filteredOrders = orders.filter((o) => filterByDate(o.createdAt));
  const filteredCommissions = commissionRecords.filter((c) => filterByDate(c.createdAt));

  // FINANCIAL ENGINE CALCULATIONS (Section 6)
  // 1. Total Sales Volume (Gross volume of merchandise)
  const totalSalesVolume = filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // 2. Platform 5% Gross Revenue
  const platformGrossRevenue = filteredCommissions
    .filter((c) => c.status !== 'reversed')
    .reduce((sum, c) => sum + c.platformFeeAmount, 0);

  // 3. Platform Service Fee on Affiliate Commissions (e.g. 0% or configured)
  const platformServiceFeeOnAffiliates = filteredCommissions
    .filter((c) => c.status !== 'reversed')
    .reduce((sum, c) => sum + (c.platformServiceFeeOnAffiliateAmount || 0), 0);

  // 4. Advertising & Featured Revenue (estimated based on featured items)
  const advertisingRevenue = products.filter((p) => p.featured).length * 10000;

  // 5. Refunds & Reversals
  const totalReversals = filteredCommissions
    .filter((c) => c.status === 'reversed')
    .reduce((sum, c) => sum + c.platformFeeAmount, 0);

  // 6. Operational Server & Gateway Costs (standard baseline)
  const estimatedOperationalCosts = Math.round(totalSalesVolume * 0.005); // 0.5% infrastructure costs

  // 7. Platform NET Estimated Profit
  const platformNetProfit =
    platformGrossRevenue + platformServiceFeeOnAffiliates + advertisingRevenue - totalReversals - estimatedOperationalCosts;

  // 8. Accounts Payable to Sellers (Gross product sales - platform fee - affiliate commission)
  const totalPayableToSellers = filteredCommissions
    .filter((c) => c.status !== 'reversed')
    .reduce((sum, c) => sum + c.sellerNetAmount, 0);

  // 9. Accounts Payable to Affiliates (Pending + Available)
  const totalPendingAffiliateCommissions = filteredCommissions
    .filter((c) => c.status === 'pending' || c.status === 'validation_period')
    .reduce((sum, c) => sum + c.affiliateNetCommission, 0);

  const totalAvailableAffiliateCommissions = filteredCommissions
    .filter((c) => c.status === 'available_for_withdrawal')
    .reduce((sum, c) => sum + c.affiliateNetCommission, 0);

  // Actions
  const handleSetProductStatus = async (productId: string, status: Product['status']) => {
    try {
      await marketplaceService.updateProduct(productId, { status });
      await refreshData();
    } catch (err) {
      console.error('Falha ao atualizar estado do produto:', err);
    }
  };

  const handleApproveSeller = async (storeId: string) => {
    try {
      await approveStore(storeId);
    } catch (err) {
      console.error('Erro ao aprovar vendedor:', err);
    }
  };

  const handleRejectSeller = async (storeId: string) => {
    if (!rejectionReasonInput.trim()) return;
    try {
      await rejectStore(storeId, rejectionReasonInput.trim());
      setRejectingStoreId(null);
      setRejectionReasonInput('');
    } catch (err) {
      console.error('Erro ao rejeitar vendedor:', err);
    }
  };

  const handleApproveProductAction = async (productId: string) => {
    try {
      await approveProduct(productId);
    } catch (err) {
      console.error('Erro ao aprovar produto:', err);
    }
  };

  const handleRejectProductAction = async (productId: string) => {
    if (!prodRejectReasonInput.trim()) return;
    try {
      await rejectProduct(productId, prodRejectReasonInput.trim());
      setRejectingProductId(null);
      setProdRejectReasonInput('');
    } catch (err) {
      console.error('Erro ao rejeitar produto:', err);
    }
  };

  const handleConfirmLeadPayment = async (leadId: string) => {
    try {
      await confirmCommissionPayment(leadId);
    } catch (err) {
      console.error('Erro ao confirmar comissão de lead:', err);
    }
  };

  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const availableSlots = 5 - newProdImages.length;
    const filesToRead = files.slice(0, availableSlots);

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewProdImages((prev) => (prev.length < 5 ? [...prev, reader.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setNewProdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateRealProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdSafetyWarning(null);

    // Validate banned words / content safety
    const combinedContent = `${newProdName} ${newProdDesc}`;
    const safetyCheck = marketplaceService.validateContentSafety(combinedContent);
    if (!safetyCheck.isValid) {
      setProdSafetyWarning(`Artigo bloqueado por violação de regras da República de Angola: termo proibido detectado "${safetyCheck.prohibitedWord}".`);
      return;
    }

    if (newProdImages.length === 0) {
      setProdSafetyWarning('Por favor, carrega pelo menos uma fotografia real do artigo.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const targetStore = stores.find((s) => s.storeId === newProdStoreId) || stores[0];
      await marketplaceService.createProduct({
        sellerId: targetStore?.ownerId || 'admin',
        storeName: targetStore?.name || 'Mercado Angola Oficial',
        name: newProdName.trim(),
        description: newProdDesc.trim(),
        price: Number(newProdPrice),
        category: newProdCategory,
        condition: 'novo',
        stock: Number(newProdStock),
        images: newProdImages,
        location: `${targetStore?.province || 'Luanda'}, ${targetStore?.municipality || 'Talatona'}`,
        acceptsCashOnDelivery: true,
        deliveryCost: 2000,
        featured: false,
        affiliateEnabled: true,
        affiliateCommissionRate: 0.05,
        rating: 5,
        reviewCount: 1,
        status: 'published',
        isReal: true,
      });

      await refreshData();
      setProductSuccessMsg('Produto real adicionado com sucesso e publicado no catálogo!');
      setTimeout(() => setProductSuccessMsg(''), 4000);
      setIsAddProductOpen(false);
      setNewProdName('');
      setNewProdDesc('');
      setNewProdImages([]);
      setNewProdPrice(25000);
      setNewProdStock(10);
    } catch (err) {
      console.error('Falha ao adicionar produto:', err);
      setProdSafetyWarning('Ocorreu um erro ao guardar o produto.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: Report['status']) => {
    try {
      await marketplaceService.updateReportStatus(reportId, status, 'Decisão administrativa registada.');
      await refreshData();
    } catch (err) {
      console.error('Falha ao resolver denúncia:', err);
    }
  };

  const handleProcessWithdrawal = async (status: 'completed' | 'rejected') => {
    if (!processingWithdrawalId) return;
    try {
      await marketplaceService.processWithdrawal(
        processingWithdrawalId,
        status,
        transferProofRef || `EMIS_IBAN_${Date.now()}`,
        adminPayoutNotes
      );
      setProcessingWithdrawalId(null);
      setTransferProofRef('');
      setAdminPayoutNotes('');
      await refreshData();
    } catch (err) {
      console.error('Erro ao processar levantamento:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlatformSettings = {
      defaultCommissionRate: Number(platformFeePercent) / 100,
      affiliateServiceFeeRate: Number(affiliateServiceFeePercent) / 100,
      fixedFee: 0,
      enableFixedFee: false,
      electronicPaymentsActive: true,
      multicaixaSandboxMode: sandboxMode,
      validationPeriodDays: Number(validationDays),
      minimumWithdrawalAmount: Number(minWithdrawal),
      updatedBy: profile?.email || 'admin@mercadoangola.ao',
    };
    await updateSettings(updated);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Data', 'Encomenda', 'Artigo', 'Valor Venda (Kz)', 'Taxa Plataforma 5% (Kz)', 'Comissao Afiliado (Kz)', 'Liquido Empresa (Kz)', 'Estado'],
      ...commissionRecords.map((c) => [
        new Date(c.createdAt).toLocaleDateString('pt-AO'),
        c.orderNumber,
        c.productName,
        c.saleAmount,
        c.platformFeeAmount,
        c.affiliateNetCommission,
        c.sellerNetAmount,
        c.status,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mercado_angola_financeiro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerSeed = async () => {
    setIsSeeding(true);
    try {
      await seedInitialData();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-red-600/30 text-red-300 border border-red-500/40 px-3 py-0.5 rounded-full text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Painel do Proprietário & Administrador Geral</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Controlo Financeiro & Gestão da Plataforma
          </h1>

          <p className="text-xs sm:text-sm text-slate-400">
            Supervisão de vendas, receita líquida da plataforma (5%), comissões de afiliados e pagamentos a empresas.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Relatório CSV</span>
          </button>

          <button
            onClick={handleTriggerSeed}
            disabled={isSeeding}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'A restaurar...' : 'Repor Catálogo'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Platform Live Counts Bar (Requirement 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Utilizadores</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Tempo Real"></span>
          </div>
          <span className="text-2xl font-black text-slate-900 block">{Math.max(1, users.length)}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Tempo Real Ativo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lojas & Empresas</span>
            <Store className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{stores.length}</span>
          <span className="text-[10px] text-slate-400">Lojas comerciais</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Produtos</span>
            <Package className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{products.length}</span>
          <span className="text-[10px] text-slate-400">Artigos no catálogo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Serviços Angola</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{services.length}</span>
          <span className="text-[10px] text-purple-600 font-semibold">Ativos e verificados</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Levantamentos</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{withdrawals.length}</span>
          <span className="text-[10px] text-amber-600 font-semibold">
            {withdrawals.filter((w) => w.status === 'pending').length} pendentes
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Denúncias</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">{reports.length}</span>
          <span className="text-[10px] text-slate-400">
            {reports.filter((r) => r.status === 'pending').length} pendentes
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('financial')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'financial' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Painel Financeiro</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc_sellers')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'kyc_sellers' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Aprovar Vendedores</span>
          {stores.filter((s) => s.status === 'pending_review' || (!s.isVerified && s.status !== 'banned')).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              {stores.filter((s) => s.status === 'pending_review' || (!s.isVerified && s.status !== 'banned')).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('commission_leads')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'commission_leads' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Comissões a Receber</span>
          {leads.filter((l) => l.status === 'sold').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white animate-pulse">
              {leads.filter((l) => l.status === 'sold').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'notifications' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-red-600" />
          <span>Notificações em Tempo Real</span>
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('services_companies')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'services_companies' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Serviços & Empresas ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('academy')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'academy' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-red-600" />
          <span>Academia & Mérito</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'contacts' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>Mensagens de Contacto</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'withdrawals' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Levantamentos ({withdrawals.filter((w) => w.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'products' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Produtos ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'reports' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Denúncias ({reports.filter((r) => r.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'settings' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Taxas Comerciais (5%)
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'channels' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-600" />
          <span>Canais de Alerta</span>
        </button>

        <button
          onClick={() => setActiveTab('tester')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'tester' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
          <span>Laboratório de Testes</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'audit' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Auditoria
        </button>
      </div>


      {/* TAB 1: FINANCIAL OVERVIEW */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Time range picker */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Período:</span>
              </span>
              {(['all', 'today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDateFilter(period)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    dateFilter === period
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {period === 'all'
                    ? 'Todo o Histórico'
                    : period === 'today'
                    ? 'Hoje'
                    : period === 'week'
                    ? 'Últimos 7 dias'
                    : 'Últimos 30 dias'}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Cálculos em Kwanzas (AOA) recalculados no servidor
            </span>
          </div>

          {/* Primary Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Volume total de vendas (MERCADORIA) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block mb-1">
                Volume Total de Vendas (GMV)
              </span>
              <span className="text-2xl font-black text-slate-900 block truncate">
                {formatKz(totalSalesVolume)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Valor total transacionado (pertence às empresas)
              </span>
            </div>

            {/* 2. Receita Bruta da Plataforma (5%) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block mb-1">
                Taxa da Plataforma (5%)
              </span>
              <span className="text-2xl font-black text-amber-600 block truncate">
                {formatKz(platformGrossRevenue)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Receita bruta de intermediação
              </span>
            </div>

            {/* 3. Taxa de Serviço sobre Afiliados */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block mb-1">
                Taxa s/ Afiliados ({Math.round(settings.affiliateServiceFeeRate * 100)}%)
              </span>
              <span className="text-2xl font-black text-blue-600 block truncate">
                {formatKz(platformServiceFeeOnAffiliates)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Receita adicional opcional de serviço
              </span>
            </div>

            {/* 4. Lucro Líquido Estimado do Proprietário */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-2xl p-5 shadow-md">
              <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-1">
                Lucro Líquido do Proprietário
              </span>
              <span className="text-2xl font-black text-emerald-400 block truncate">
                {formatKz(platformNetProfit)}
              </span>
              <span className="text-[11px] text-slate-300 block mt-1">
                Receita líquida após custos e reembolsos
              </span>
            </div>
          </div>

          {/* Accounts Payable / Segregação de Fundos (Section 6) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Segregação Financeira de Fundos (Valores Devidos a Terceiros)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Montante Devido às Empresas Vendedoras:</span>
                <span className="text-xl font-black text-slate-900 block">
                  {formatKz(totalPayableToSellers)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Deduzida taxa de 5% e comissões de afiliação
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Comissões de Afiliados (Em Validação):</span>
                <span className="text-xl font-black text-amber-600 block">
                  {formatKz(totalPendingAffiliateCommissions)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Retidas durante prazo de devolução ({settings.validationPeriodDays || 7} dias)
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Comissões Disponíveis p/ Levantamento:</span>
                <span className="text-xl font-black text-emerald-700 block">
                  {formatKz(totalAvailableAffiliateCommissions)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Aguardando solicitação de transferência bancária
                </span>
              </div>
            </div>
          </div>

          {/* Recent Financial Transactions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-3">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Transações Comerciais Auditadas</h3>
              <span className="text-xs text-slate-500">{filteredCommissions.length} registos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Encomenda</th>
                    <th className="p-3">Artigo</th>
                    <th className="p-3">Venda Bruta</th>
                    <th className="p-3">Taxa Plataforma (5%)</th>
                    <th className="p-3">Comissão Afiliado</th>
                    <th className="p-3">Líquido Empresa</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCommissions.map((comm) => (
                    <tr key={comm.commissionId} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">
                        {new Date(comm.createdAt).toLocaleDateString('pt-AO')}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{comm.orderNumber}</td>
                      <td className="p-3 font-semibold text-slate-800">{comm.productName}</td>
                      <td className="p-3 font-black text-slate-950">{formatKz(comm.saleAmount)}</td>
                      <td className="p-3 font-bold text-amber-700">{formatKz(comm.platformFeeAmount)}</td>
                      <td className="p-3 text-blue-700 font-medium">
                        {comm.affiliateNetCommission > 0 ? formatKz(comm.affiliateNetCommission) : 'Sem Afiliado'}
                      </td>
                      <td className="p-3 font-bold text-emerald-800">{formatKz(comm.sellerNetAmount)}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            comm.status === 'available_for_withdrawal' || comm.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comm.status === 'reversed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {comm.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: KYC SELLER APPROVALS (Section 5A) */}
      {activeTab === 'kyc_sellers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Total de Vendedores</span>
              <span className="text-2xl font-black text-slate-900">{stores.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Lojas registadas</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase block mb-1">Pendentes de Validação</span>
              <span className="text-2xl font-black text-amber-900">
                {stores.filter((s) => s.status === 'pending_review' || (!s.isVerified && s.status !== 'banned')).length}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">Exigem revisão de KYC</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Lojas Verificadas</span>
              <span className="text-2xl font-black text-emerald-900">
                {stores.filter((s) => s.isVerified).length}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Selo verde ativo</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-red-700 uppercase block mb-1">Banidas / Rejeitadas</span>
              <span className="text-2xl font-black text-red-900">
                {stores.filter((s) => s.status === 'banned').length}
              </span>
              <span className="text-[10px] text-red-700 font-semibold block mt-0.5">Sem autorização</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Verificação de Vendedores (KYC) & Segurança</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revisão obrigatória de NIF/BI, IBAN, fotos do documento e comprovativo de morada antes da publicação de artigos.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['all', 'pending', 'approved', 'banned'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setKycFilter(filter)}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                      kycFilter === filter ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'all' ? 'Todos' : filter === 'pending' ? 'Pendentes' : filter === 'approved' ? 'Verificados' : 'Banidos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller List */}
            <div className="space-y-4 pt-2">
              {stores
                .filter((s) => {
                  if (kycFilter === 'pending') return s.status === 'pending_review' || (!s.isVerified && s.status !== 'banned');
                  if (kycFilter === 'approved') return s.isVerified;
                  if (kycFilter === 'banned') return s.status === 'banned';
                  return true;
                })
                .map((s) => (
                  <div
                    key={s.storeId}
                    className="p-5 border border-slate-200 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=120&q=80'}
                          alt={s.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                            {s.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> LOJA VERIFICADA
                              </span>
                            ) : s.status === 'banned' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                <XCircle className="w-3 h-3 text-red-600" /> BANIDA / REJEITADA
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                ⏳ PENDENTE DE APROVAÇÃO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {s.province}, {s.municipality} • WhatsApp: <strong className="text-slate-800">{s.whatsapp || s.phone || 'Não indicado'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!s.isVerified && (
                          <button
                            onClick={() => handleApproveSeller(s.storeId)}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprovar Vendedor</span>
                          </button>
                        )}
                        {s.status !== 'banned' && (
                          <button
                            onClick={() => {
                              setRejectingStoreId(s.storeId);
                              setRejectionReasonInput('');
                            }}
                            className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>Rejeitar / Banir</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* KYC Document Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">NIF ou BI</span>
                        <span className="font-mono font-bold text-slate-900 block">{s.nifOrBi || 'Pendente de envio'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">IBAN para Pagamento</span>
                        <span className="font-mono font-bold text-slate-900 block truncate" title={s.iban}>
                          {s.iban || 'Pendente de envio'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Foto do BI / Identificação</span>
                        {s.biDocumentUrl ? (
                          <button
                            onClick={() => setViewingDocImage(s.biDocumentUrl!)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Visualizar Documento BI</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Sem documento anexado</span>
                        )}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Comprovativo de Morada / Loja</span>
                        {s.storeProofUrl ? (
                          <button
                            onClick={() => setViewingDocImage(s.storeProofUrl!)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Visualizar Foto da Loja</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Sem comprovativo anexado</span>
                        )}
                      </div>
                    </div>

                    {s.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 text-xs">
                        <strong>Motivo de Rejeição/Suspensão:</strong> {s.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: COMMISSIONS & LEADS MA-XXXX (Section 4 & 5) */}
      {activeTab === 'commission_leads' && (
        <div className="space-y-6">
          {/* Financial summary of leads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-500 text-slate-950 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
                Comissões a Receber (Vendas MA- Concretizadas)
              </span>
              <span className="text-3xl font-black block mt-1">
                {formatKz(
                  leads
                    .filter((l) => l.status === 'sold')
                    .reduce((sum, l) => sum + (l.platformCommission || 0), 0)
                )}
              </span>
              <span className="text-xs font-semibold block mt-1">
                {leads.filter((l) => l.status === 'sold').length} vendas concluídas aguardando liquidação pelos vendedores
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Comissões Já Liquidadas
              </span>
              <span className="text-3xl font-black text-emerald-600 block mt-1">
                {formatKz(
                  leads
                    .filter((l) => l.status === 'commission_paid')
                    .reduce((sum, l) => sum + (l.platformCommission || 0), 0)
                )}
              </span>
              <span className="text-xs text-slate-400 block mt-1">Confirmadas na conta bancária do Mercado Angola</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total de Negociações Rastreadas
              </span>
              <span className="text-3xl font-black text-slate-900 block mt-1">{leads.length}</span>
              <span className="text-xs text-slate-400 block mt-1">Códigos únicos MA-XXXX gerados</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Sistema de Rastreio Automático MA-XXXX (Classificados Protegidos):</strong>
              Quando um cliente clica no WhatsApp de um produto ou serviço, um código permanente no formato <code className="bg-emerald-200/70 px-1.5 py-0.5 rounded font-mono font-bold">MA-XXXX</code> é registado.
              A comissão da plataforma é de 5% sobre produtos e 10% sobre serviços. O vendedor marca o negócio como VENDIDO no seu painel e transfere a comissão devida ao Mercado Angola por Multicaixa/IBAN.
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Registo Geral de Códigos MA- & Dívidas de Vendedores</span>
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
                {(['all', 'sold', 'commission_paid', 'contacted', 'not_sold'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLeadsFilter(filter)}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      leadsFilter === filter ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'all'
                      ? 'Todos'
                      : filter === 'sold'
                      ? `Vendido (${leads.filter((l) => l.status === 'sold').length})`
                      : filter === 'commission_paid'
                      ? 'Comissão Liquidada'
                      : filter === 'contacted'
                      ? 'Em Negociação'
                      : 'Não Vendido'}
                  </button>
                ))}
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Nenhum lead com código MA- registado até ao momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Código MA-</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Artigo / Serviço</th>
                      <th className="p-3">Loja / Vendedor</th>
                      <th className="p-3">Comprador</th>
                      <th className="p-3">Valor da Venda</th>
                      <th className="p-3">Taxa Mercado Angola</th>
                      <th className="p-3">Afiliado (3%)</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads
                      .filter((l) => {
                        if (leadsFilter === 'all') return true;
                        return l.status === leadsFilter;
                      })
                      .map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-black text-slate-900">
                            <span className="bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">{lead.code}</span>
                          </td>
                          <td className="p-3 text-slate-500 whitespace-nowrap">
                            {new Date(lead.createdAt).toLocaleDateString('pt-AO')}
                          </td>
                          <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">{lead.itemType}</span>
                            {lead.itemTitle}
                          </td>
                          <td className="p-3 text-slate-700">{lead.sellerName}</td>
                          <td className="p-3 text-slate-700">
                            <div>{lead.buyerName || 'Cliente WhatsApp'}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{lead.buyerPhone || ''}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{formatKz(lead.price)}</td>
                          <td className="p-3 font-bold text-amber-600">{formatKz(lead.platformCommission)}</td>
                          <td className="p-3 text-slate-600 font-semibold">{formatKz(lead.affiliateCommission || 0)}</td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                lead.status === 'commission_paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lead.status === 'sold'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                  : lead.status === 'not_sold'
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {lead.status === 'commission_paid'
                                ? 'Liquidada ✓'
                                : lead.status === 'sold'
                                ? 'Vendido (A Cobrar)'
                                : lead.status === 'not_sold'
                                ? 'Não Vendido'
                                : 'Em Contacto'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {lead.status === 'sold' && (
                              <button
                                onClick={() => handleConfirmLeadPayment(lead.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] cursor-pointer transition-colors shadow-xs"
                              >
                                Confirmar Pagamento
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal for KYC Seller */}
      {rejectingStoreId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Rejeitar ou Suspender Vendedor</span>
            </h3>
            <p className="text-xs text-slate-600">
              Indique o motivo pelo qual o registo foi rejeitado (ex: NIF incorreto, documentos ilegíveis, suspeita de fraude).
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Ex: A foto do Bilhete de Identidade está desfocada ou o NIF não coincide com o titular."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingStoreId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRejectSeller(rejectingStoreId)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Image Zoom Modal */}
      {viewingDocImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-900 text-sm">Visualização de Documento Comprovativo</h4>
              <button
                onClick={() => setViewingDocImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-2">
              <img src={viewingDocImage} alt="Documento" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WITHDRAWAL REQUESTS */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Pedidos de Levantamento de Afiliados (Angola)</h3>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum pedido de levantamento registado.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((req) => (
                <div
                  key={req.requestId}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-wrap justify-between items-center gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{formatKz(req.amount)}</span>
                      <span className="font-semibold text-slate-700">— {req.affiliateName}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p className="text-slate-500 text-[11px]">
                      Banco: <strong>{req.bankDetails.bankName}</strong> • Titular: <strong>{req.bankDetails.accountHolder}</strong> • IBAN: <span className="font-mono font-bold text-slate-900">{req.bankDetails.iban}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => {
                          setProcessingWithdrawalId(req.requestId);
                          setTransferProofRef(`TRANSF_EMIS_${Math.floor(100000 + Math.random() * 900000)}`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                      >
                        Processar Pagamento
                      </button>
                    )}

                    {req.status === 'completed' && req.referenceProof && (
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                        Comprovativo: {req.referenceProof}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SERVICES AND PARTNER COMPANIES MODERATION (Requirement 4 & 7) */}
      {activeTab === 'services_companies' && (
        <div className="space-y-6">
          {/* Section A: Services in Angola */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Serviços em Angola (Moderação & Destaques)</h3>
                <p className="text-xs text-slate-500">Aprovar, destacar ou suspender serviços comerciais prestados na plataforma.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                {services.length} serviços registados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Serviço</th>
                    <th className="p-3">Empresa Prestadora</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ações Administrativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((srv) => (
                    <tr key={srv.serviceId} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={srv.images[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&q=80'}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover border"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-xs">{srv.title}</span>
                          <span className="text-[10px] text-slate-400">{srv.whatsappNumber}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{srv.companyName}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">{srv.category}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {srv.pricingType === 'quote' ? 'Sob Orçamento' : formatKz(srv.priceAoa)}
                      </td>
                      <td className="p-3 text-slate-600">{srv.province}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            srv.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : srv.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {srv.status === 'active' ? 'Ativo' : srv.status === 'pending_approval' ? 'Pendente' : 'Suspenso'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {srv.status !== 'active' ? (
                          <button
                            onClick={() => updateService(srv.serviceId, { status: 'active' })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
                          >
                            Aprovar
                          </button>
                        ) : (
                          <button
                            onClick={() => updateService(srv.serviceId, { status: 'suspended' })}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          onClick={() => updateService(srv.serviceId, { featured: !srv.featured })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                            srv.featured
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {srv.featured ? 'Em Destaque' : 'Destacar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Commercial Partner Companies */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Empresas Parceiras Cadastradas</h3>
                <p className="text-xs text-slate-500">Gestão de parceiros comerciais e concessão do selo "Empresa Verificada".</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {companies.length} empresas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">NIF</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Verificação</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((comp) => (
                    <tr key={comp.companyId} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={comp.logo}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{comp.name}</span>
                          <span className="text-[10px] text-slate-400">{comp.phone}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">{comp.category}</td>
                      <td className="p-3 font-mono text-slate-600">{comp.nif || 'Em validação'}</td>
                      <td className="p-3 text-slate-600">{comp.province}, {comp.municipality}</td>
                      <td className="p-3">
                        {comp.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Verificada
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Pendente</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => updateCompany(comp.companyId, { isVerified: !comp.isVerified })}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                            comp.isVerified
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {comp.isVerified ? 'Remover Selo' : 'Conceder Selo Verificada'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* TAB 3: PRODUCTS & REAL ADD PRODUCT FORM (Section 2 & 5C) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Action Header & Add Product Button */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-red-600" />
                <span>Gestão & Moderação de Produtos Reais</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Validação de fotos reais, preços em Kwanzas (Kz), stock e filtro contra armas/drogas.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddProductOpen ? 'Fechar Formulário' : 'Adicionar Produto Real'}</span>
              </button>
            </div>
          </div>

          {/* Product Success Alert */}
          {productSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{productSuccessMsg}</span>
            </div>
          )}

          {/* Form: Add Real Product */}
          {isAddProductOpen && (
            <form
              onSubmit={handleCreateRealProduct}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in"
            >
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Novo Produto Oficial (Dados Reais)</span>
                </div>
                <h4 className="text-lg font-black text-slate-900">Formulário de Cadastro de Produto Real</h4>
                <p className="text-xs text-slate-500">
                  Preencha todos os campos obrigatórios. É verificado automaticamente o filtro contra produtos ilegais.
                </p>
              </div>

              {prodSafetyWarning && (
                <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Aviso de Segurança & Conformidade Legal:</strong>
                    <span>{prodSafetyWarning}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Product Name */}
                <div className="lg:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Nome do Produto Real <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ex: iPhone 13 128GB Midnight - Selado na Caixa com Fatura"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
                  />
                </div>

                {/* Seller Store */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Loja / Vendedor Responsável <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProdStoreId}
                    onChange={(e) => setNewProdStoreId(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs bg-white"
                  >
                    {stores.map((s) => (
                      <option key={s.storeId} value={s.storeId}>
                        {s.name} ({s.province}) {s.isVerified ? '✓ Verificada' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Kz */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Preço Real em Kwanzas (Kz) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={100}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Exibição: {formatKz(newProdPrice)}</span>
                </div>

                {/* Stock */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Quantidade em Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs bg-white"
                  >
                    <option value="Telemóveis e Eletrónica">Telemóveis e Eletrónica</option>
                    <option value="Computadores e Informática">Computadores e Informática</option>
                    <option value="Moda e Acessórios">Moda e Acessórios</option>
                    <option value="Casa e Eletrodomésticos">Casa e Eletrodomésticos</option>
                    <option value="Veículos e Peças">Veículos e Peças</option>
                    <option value="Beleza e Saúde">Beleza e Saúde</option>
                    <option value="Supermercado e Alimentação">Supermercado e Alimentação</option>
                    <option value="Construção e Ferramentas">Construção e Ferramentas</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs">
                <label className="block font-bold text-slate-800 mb-1">
                  Descrição Detalhada do Artigo <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Descreva o estado do produto, garantia em Angola, acessórios incluídos e condições de entrega."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs"
                />
              </div>

              {/* Real Photo Uploads (Up to 5 images) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">
                    Fotografias Reais do Artigo ({newProdImages.length}/5) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Pelo menos 1 foto obrigatória</span>
                </div>

                {/* Upload Trigger & Previews */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {newProdImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                    >
                      <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Remover fotografia"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        Foto {idx + 1}
                      </span>
                    </div>
                  ))}

                  {newProdImages.length < 5 && (
                    <label className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-red-50/20">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-red-600 mb-1" />
                      <span className="text-[11px] font-bold text-slate-700">Carregar Foto</span>
                      <span className="text-[9px] text-slate-400">PNG / JPG</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFilesUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-50"
                >
                  {isSavingProduct ? (
                    <span>A guardar produto real...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar & Publicar Artigo Real</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Product Moderation Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Catálogo de Artigos & Moderação</h4>
                <span className="text-xs text-slate-500">{products.length} artigos registados no sistema</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                {(['all', 'pending_approval', 'published', 'suspended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setProductTabFilter(filter)}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      productTabFilter === filter ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'all'
                      ? 'Todos'
                      : filter === 'pending_approval'
                      ? `Pendentes (${products.filter((p) => p.status === 'pending_approval').length})`
                      : filter === 'published'
                      ? 'Publicados'
                      : 'Suspensos'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Artigo Real</th>
                    <th className="p-3">Empresa / Vendedor</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ações de Moderação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products
                    .filter((p) => {
                      if (productTabFilter === 'all') return true;
                      return p.status === productTabFilter;
                    })
                    .map((p) => (
                      <tr key={p.productId} className="hover:bg-slate-50">
                        <td className="p-3 flex items-center gap-2.5">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-xs">{p.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400">{p.category}</span>
                              {p.isReal && (
                                <span className="bg-emerald-50 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                                  ✓ REAL
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{p.storeName}</td>
                        <td className="p-3 font-bold text-slate-900 font-mono">{formatKz(p.price)}</td>
                        <td className="p-3 font-mono text-slate-600">{p.stock} un.</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              p.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            }`}
                          >
                            {p.status === 'published'
                              ? 'Publicado'
                              : p.status === 'suspended'
                              ? 'Suspenso'
                              : 'Pendente de Aprovação'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          {p.status === 'pending_approval' ? (
                            <>
                              <button
                                onClick={() => handleApproveProductAction(p.productId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer shadow-xs transition-colors"
                              >
                                Aprovar Artigo
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingProductId(p.productId);
                                  setProdRejectReasonInput('');
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Rejeitar
                              </button>
                            </>
                          ) : p.status !== 'published' ? (
                            <button
                              onClick={() => handleSetProductStatus(p.productId, 'published')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer"
                            >
                              Publicar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetProductStatus(p.productId, 'suspended')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer"
                            >
                              Suspender
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Rejection Dialog */}
          {rejectingProductId && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Rejeitar Artigo do Catálogo</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Descreva o motivo da rejeição para notificar o vendedor (ex: fotos falsas, preço desajustado, descrição insuficiente).
                </p>
                <textarea
                  required
                  rows={3}
                  value={prodRejectReasonInput}
                  onChange={(e) => setProdRejectReasonInput(e.target.value)}
                  placeholder="Ex: As fotografias fornecidas são capturas de ecrã da internet e não fotografias reais do artigo físico em Angola."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setRejectingProductId(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRejectProductAction(rejectingProductId)}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer"
                  >
                    Confirmar Rejeição
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Denúncias & Conflitos</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhuma denúncia pendente.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.reportId}
                  className="p-4 border border-slate-200 rounded-xl space-y-2 text-xs bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Motivo: {rep.reason}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 uppercase">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-slate-800">
                    <strong>Alvo:</strong> {rep.targetType} ({rep.targetTitle})
                  </p>
                  <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                    {rep.details}
                  </p>
                  {rep.status === 'pending' && (
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.reportId, 'resolved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer"
                      >
                        Marcar como Resolvido
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.reportId, 'dismissed')}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer"
                      >
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-xl shadow-xs"
        >
          <h3 className="font-bold text-slate-900 text-sm">Taxas da Plataforma & Políticas Financeiras</h3>

          {settingsSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configurações comerciais guardadas com sucesso no Firestore!</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                1. Taxa Base da Plataforma sobre Vendas Confirmadas (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={25}
                  step={0.5}
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
                  className="w-28 p-2 border border-slate-200 rounded-lg font-bold"
                />
                <span className="text-slate-500 font-medium">% (Regra de referência do negócio: 5%)</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                2. Taxa de Serviço Opcional sobre as Comissões dos Afiliados (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={affiliateServiceFeePercent}
                  onChange={(e) => setAffiliateServiceFeePercent(Number(e.target.value))}
                  className="w-28 p-2 border border-slate-200 rounded-lg font-bold"
                />
                <span className="text-slate-500 font-medium">% (Inicialmente 0% conforme especificação)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Período de Validação / Devoluções (Dias)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={validationDays}
                  onChange={(e) => setValidationDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mínimo para Levantamento (Kz)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={sandboxMode}
                onChange={(e) => setSandboxMode(e.target.checked)}
                className="rounded text-red-600"
              />
              <span>Modo Sandbox / Teste MULTICAIXA GPO EMIS Ativo</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
            >
              Salvar Alterações de Taxas
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Trilha de Auditoria do Sistema</h3>
            <button
              onClick={loadAuditLogs}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recarregar</span>
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {isLoadingLogs ? (
              <p className="text-slate-500">A carregar trilha de auditoria...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-slate-500">Sem registos recentes.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.logId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="font-bold text-slate-900">[{log.action}]</span>{' '}
                    <span className="text-slate-600">{log.entityType} ({log.entityId})</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString('pt-AO')} • {log.actorEmail}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: REAL-TIME NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <AdminNotificationsCenter onNavigateTab={(tab) => setActiveTab(tab as any)} />
      )}

      {/* TAB: ACADEMY & MERIT */}
      {activeTab === 'academy' && (
        <AdminAcademyManager />
      )}

      {/* TAB: CONTACT MESSAGES */}
      {activeTab === 'contacts' && (
        <AdminContactsManager />
      )}

      {/* TAB: ALERT CHANNELS CONFIG */}
      {activeTab === 'channels' && (
        <NotificationChannelsSettings />
      )}

      {/* TAB: TEST LAB */}
      {activeTab === 'tester' && (
        <AdminNotificationTester />
      )}

      {/* PROCESS WITHDRAWAL MODAL */}

      {processingWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Processar Pagamento de Levantamento</h3>
            <p className="text-slate-600">
              Insira o número de referência bancária da transferência emitida (ex: EMIS / IBAN):
            </p>

            <input
              type="text"
              value={transferProofRef}
              onChange={(e) => setTransferProofRef(e.target.value)}
              placeholder="Ref: TRANSF_EMIS_XXXX"
              className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold"
            />

            <textarea
              value={adminPayoutNotes}
              onChange={(e) => setAdminPayoutNotes(e.target.value)}
              rows={2}
              placeholder="Notas internas..."
              className="w-full p-2.5 border border-slate-200 rounded-lg"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProcessingWithdrawalId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl"
              >
                Voltar
              </button>
              <button
                onClick={() => handleProcessWithdrawal('completed')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl"
              >
                Marcar como Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
