import React, { useState, useEffect } from 'react';
import {
  Store,
  PlusCircle,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Edit,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  Check,
  Phone,
  MapPin,
  Loader2,
  Share2,
  Users,
  CheckCheck,
  X,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { ANGOLA_PROVINCES, formatKz, PRODUCT_CATEGORIES } from '../data/angolaData';
import { Product, ProductCategory, ProductCondition, SellerStore, OrderStatus, SellerSuborder, AffiliateApplication } from '../types';
import { marketplaceService } from '../services/marketplaceService';

export const SellerDashboard: React.FC = () => {
  const { profile, isAuthenticated, openRegisterModal } = useAuth();
  const { products, suborders, refreshData, stores, applications, leads, updateLeadStatus, updateStoreKYC } = useMarket();

  // Active store state
  const currentSellerId = profile?.uid || 'seller_kamba_tech_uid';
  const existingStore = stores.find((s) => s.ownerId === currentSellerId) || stores[0];

  const [activeTab, setActiveTab] = useState<'leads_debt' | 'orders' | 'products' | 'affiliates' | 'store_settings'>('leads_debt');
  const [storeName, setStoreName] = useState(existingStore?.name || 'Kamba Tech Luanda');
  const [storePhone, setStorePhone] = useState(existingStore?.phone || '+244 923 456 789');
  const [storeWhatsapp, setStoreWhatsapp] = useState(existingStore?.whatsapp || existingStore?.phone || '+244 923 456 789');
  const [storeNifOrBi, setStoreNifOrBi] = useState(existingStore?.nifOrBi || '541289004LA042');
  const [storeIban, setStoreIban] = useState(existingStore?.iban || 'AO06 0040 0000 1234 5678 1012 3');
  const [storeBiDocUrl, setStoreBiDocUrl] = useState(existingStore?.biDocumentUrl || '');
  const [storeProofUrl, setStoreProofUrl] = useState(existingStore?.storeProofUrl || '');
  const [storeDesc, setStoreDesc] = useState(
    existingStore?.description || 'Especialistas em eletrónica e informática em Luanda.'
  );
  const [storeProv, setStoreProv] = useState(existingStore?.province || 'Luanda');
  const [storeAcceptsCOD, setStoreAcceptsCOD] = useState(existingStore?.acceptsCashOnDelivery ?? true);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [storeSaveSuccess, setStoreSaveSuccess] = useState(false);

  // New/Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(50000);
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Telemóveis e Eletrónica');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodCondition, setProdCondition] = useState<ProductCondition>('novo');
  const [prodDeliveryCost, setProdDeliveryCost] = useState<number>(2500);
  const [prodImageUrl, setProdImageUrl] = useState('');
  // Affiliate product settings
  const [prodAffiliateEnabled, setProdAffiliateEnabled] = useState(true);
  const [prodAffiliateRate, setProdAffiliateRate] = useState<number>(15); // 15%
  const [prodRequireApproval, setProdRequireApproval] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Filter products for this seller
  const sellerProducts = products.filter(
    (p) => p.sellerId === currentSellerId || p.storeName === storeName
  );

  // Filter received suborders for this seller
  const sellerOrders = suborders.filter(
    (s) => s.sellerId === currentSellerId || s.storeName === storeName
  );

  // Filter affiliate applications for this seller
  const sellerApplications = applications.filter(
    (a) => a.sellerId === currentSellerId
  );

  // Filter leads for this seller
  const sellerLeads = leads.filter(
    (l) =>
      l.sellerId === currentSellerId ||
      l.sellerName === storeName ||
      l.sellerId === existingStore?.storeId
  );

  // Total Commission Debt (Sum of platformCommission where status is 'sold')
  const totalCommissionDebt = sellerLeads
    .filter((l) => l.status === 'sold')
    .reduce((sum, l) => sum + (l.platformCommission || 0), 0);

  const totalCommissionsPaid = sellerLeads
    .filter((l) => l.status === 'commission_paid')
    .reduce((sum, l) => sum + (l.platformCommission || 0), 0);

  // Financial calculations
  const totalGrossSales = sellerOrders.reduce((sum, s) => sum + s.total, 0);
  const totalPlatformFees = sellerOrders.reduce((sum, s) => sum + (s.platformFeeAmount || Math.round(s.subtotal * 0.05)), 0);
  const totalAffiliateCommissions = sellerOrders.reduce((sum, s) => sum + (s.affiliateCommissionAmount || 0), 0);
  const totalNetEstimated = totalGrossSales - totalPlatformFees - totalAffiliateCommissions;

  const handleMarkLeadSold = async (leadId: string) => {
    try {
      await updateLeadStatus(leadId, 'sold');
    } catch (err) {
      console.error('Falha ao marcar lead como vendido:', err);
    }
  };

  const handleMarkLeadNotSold = async (leadId: string) => {
    try {
      await updateLeadStatus(leadId, 'not_sold');
    } catch (err) {
      console.error('Falha ao marcar lead como não vendido:', err);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStore(true);
    try {
      const storeData: SellerStore = {
        storeId: existingStore?.storeId || `store_${currentSellerId.substring(0, 8)}`,
        ownerId: currentSellerId,
        name: storeName,
        phone: storePhone,
        whatsapp: storeWhatsapp,
        nifOrBi: storeNifOrBi,
        iban: storeIban,
        biDocumentUrl: storeBiDocUrl,
        storeProofUrl: storeProofUrl,
        description: storeDesc,
        province: storeProv,
        acceptsCashOnDelivery: storeAcceptsCOD,
        status: existingStore?.status || 'pending_review',
        isVerified: existingStore?.isVerified || false,
        commissionRate: 0.05,
        rating: existingStore?.rating || 4.9,
        totalSales: sellerOrders.length,
      };
      await marketplaceService.saveSellerStore(storeData);
      await refreshData();
      setStoreSaveSuccess(true);
      setTimeout(() => setStoreSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao guardar loja:', err);
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(45000);
    setProdCategory('Telemóveis e Eletrónica');
    setProdStock(5);
    setProdCondition('novo');
    setProdDeliveryCost(2000);
    setProdImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
    setProdAffiliateEnabled(true);
    setProdAffiliateRate(15);
    setProdRequireApproval(false);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.productId);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdCategory(p.category as ProductCategory);
    setProdStock(p.stock);
    setProdCondition(p.condition);
    setProdDeliveryCost(p.deliveryCost);
    setProdImageUrl(p.images[0] || '');
    setProdAffiliateEnabled(p.affiliateEnabled ?? true);
    setProdAffiliateRate(p.affiliateCommissionRate ? Math.round(p.affiliateCommissionRate * 100) : 15);
    setProdRequireApproval(p.requiresAffiliateApproval ?? false);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0) return;
    setIsSavingProduct(true);

    try {
      const affiliateCommissionRate = prodAffiliateEnabled ? Number(prodAffiliateRate) / 100 : 0;

      if (editingProductId) {
        await marketplaceService.updateProduct(editingProductId, {
          name: prodName,
          description: prodDesc,
          price: Number(prodPrice),
          category: prodCategory,
          stock: Number(prodStock),
          condition: prodCondition,
          deliveryCost: Number(prodDeliveryCost),
          images: [prodImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          affiliateEnabled: prodAffiliateEnabled,
          affiliateCommissionRate,
          requiresAffiliateApproval: prodRequireApproval,
        });
      } else {
        await marketplaceService.createProduct({
          sellerId: currentSellerId,
          storeName: storeName,
          name: prodName,
          description: prodDesc,
          price: Number(prodPrice),
          category: prodCategory,
          stock: Number(prodStock),
          condition: prodCondition,
          province: storeProv,
          images: [prodImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          status: 'pending_approval',
          isReal: true,
          featured: false,
          acceptsCashOnDelivery: storeAcceptsCOD,
          deliveryCost: Number(prodDeliveryCost),
          affiliateEnabled: prodAffiliateEnabled,
          affiliateCommissionRate,
          requiresAffiliateApproval: prodRequireApproval,
        });
      }

      await refreshData();
      setIsProductModalOpen(false);
    } catch (err) {
      console.error('Falha ao gravar produto:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleUpdateSuborderStatus = async (suborderId: string, newStatus: OrderStatus) => {
    try {
      await marketplaceService.updateSuborderStatus(suborderId, newStatus);
      await refreshData();
    } catch (err) {
      console.error('Falha ao atualizar estado da subencomenda:', err);
    }
  };

  const handleConfirmCODPayment = async (sub: SellerSuborder) => {
    try {
      await marketplaceService.confirmCashOnDeliveryPayment(
        sub.orderId,
        sub.suborderId,
        storeName,
        'Pagamento recebido pela empresa vendedora.'
      );
      await refreshData();
    } catch (err) {
      console.error('Erro ao confirmar pagamento na entrega:', err);
    }
  };

  const handleReviewApplication = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      await marketplaceService.reviewAffiliateApplication(applicationId, status);
      await refreshData();
    } catch (err) {
      console.error('Falha ao rever candidatura de afiliado:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Queres vender produtos no Mercado Angola?</h2>
            <p className="text-xs text-white/90">
              Regista a tua empresa ou loja gratuitamente para publicar artigos, definir comissões e receber pagamentos em Kwanzas.
            </p>
          </div>
          <button
            onClick={() => openRegisterModal('seller')}
            className="px-4 py-2 bg-slate-950 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Registar Como Vendedor
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{storeName}</h1>
              {existingStore?.isVerified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> LOJA VERIFICADA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/80 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  ⏳ Aguarda Verificação
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-300 flex items-center gap-2 mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {storeProv} • ★ 4.8 estrelas ({Math.max(12, sellerLeads.length * 3 + 8)} vendas) - Verificado pelo Mercado Angola
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewProduct}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar Novo Artigo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Dívida de Comissões (5%)</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-600">{formatKz(totalCommissionDebt)}</span>
          <span className="text-[11px] text-slate-400 block mt-1">A pagar à plataforma</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Comissões Liquidadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">{formatKz(totalCommissionsPaid)}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Confirmadas pelo admin</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Leads MA- Registados</span>
            <BadgeCheck className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{sellerLeads.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Contactos gerados</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>Produtos Ativos</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-purple-700">{sellerProducts.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">No catálogo público</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('leads_debt')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'leads_debt'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span>Leads e Dívidas (MA-)</span>
          {sellerLeads.filter((l) => l.status === 'sold').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              {sellerLeads.filter((l) => l.status === 'sold').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Meus Produtos & Afiliação ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Encomendas Recebidas ({sellerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliates')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'affiliates'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Candidaturas de Afiliados ({sellerApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('store_settings')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'store_settings'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Edit className="w-4 h-4" />
          <span>Dados da Empresa (KYC)</span>
        </button>
      </div>

      {/* TAB: LEADS E DÍVIDAS MA- (Section 4) */}
      {activeTab === 'leads_debt' && (
        <div className="space-y-6">
          {/* Debt Summary and Bank Payment Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-6 shadow-md space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
                Total de Dívida de Comissão à Plataforma
              </span>
              <span className="text-3xl sm:text-4xl font-black block font-mono">
                {formatKz(totalCommissionDebt)}
              </span>
              <p className="text-xs leading-relaxed opacity-90">
                Comissão de 5% sobre produtos e 10% sobre serviços de vendas concretizadas pelo vendedor via WhatsApp rastreado.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dados Bancários para Liquidação de Comissões</span>
              </div>
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <strong className="text-slate-500 block text-[10px] uppercase">Banco Oficial:</strong>
                  <span className="font-semibold text-slate-900">Banco Angolano de Investimentos (BAI)</span>
                </div>
                <div>
                  <strong className="text-slate-500 block text-[10px] uppercase">IBAN:</strong>
                  <span className="font-mono font-bold text-slate-900 text-xs">AO06 0040 0000 9876 5432 1012 3</span>
                </div>
                <div>
                  <strong className="text-slate-500 block text-[10px] uppercase">Multicaixa Express:</strong>
                  <span className="font-mono font-bold text-emerald-700 text-xs">923 000 111 (Mercado Angola)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Após transferir ou pagar por Multicaixa Express, envie o comprovativo pelo WhatsApp ao Administrador indicando o respetivo código <strong className="text-slate-800">MA-XXXX</strong> para obter baixa imediata da dívida.
              </p>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Negociações Rastreadas com Código MA-</h3>
                <p className="text-xs text-slate-500">Clientes que contactaram a sua loja através do botão WhatsApp.</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {sellerLeads.length} leads registados
              </span>
            </div>

            {sellerLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Ainda não recebeu contactos rastreados de clientes. Assim que os clientes clicarem em "Comprar via WhatsApp", as negociações aparecerão aqui.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Código MA-</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Artigo Negociado</th>
                      <th className="p-3">Comprador</th>
                      <th className="p-3">Preço Acordado</th>
                      <th className="p-3">Comissão Plataforma (5%)</th>
                      <th className="p-3">Estado da Negociação</th>
                      <th className="p-3 text-right">Ação do Vendedor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sellerLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-black text-slate-900">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                            {lead.code}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('pt-AO')}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{lead.itemTitle}</td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{lead.buyerName || 'Cliente'}</div>
                          {lead.buyerPhone && (
                            <a
                              href={`https://wa.me/${lead.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Referente à sua compra do artigo ${lead.itemTitle} (Código ${lead.code}) no Mercado Angola:`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-emerald-600 hover:underline font-mono inline-flex items-center gap-1"
                            >
                              <span>WhatsApp</span> ↗
                            </a>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{formatKz(lead.price)}</td>
                        <td className="p-3 font-bold text-amber-600">{formatKz(lead.platformCommission)}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              lead.status === 'commission_paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lead.status === 'sold'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : lead.status === 'not_sold'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {lead.status === 'commission_paid'
                              ? 'Comissão Liquidada ✓'
                              : lead.status === 'sold'
                              ? 'Vendido (A Pagar Comissão)'
                              : lead.status === 'not_sold'
                              ? 'Não Vendido'
                              : 'Em Contacto'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {lead.status === 'contacted' ? (
                            <>
                              <button
                                onClick={() => handleMarkLeadSold(lead.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer shadow-xs transition-colors"
                              >
                                VENDIDO
                              </button>
                              <button
                                onClick={() => handleMarkLeadNotSold(lead.id)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1 rounded-lg text-[11px] cursor-pointer transition-colors"
                              >
                                NÃO VENDIDO
                              </button>
                            </>
                          ) : lead.status === 'sold' ? (
                            <span className="text-[11px] text-amber-700 font-semibold">
                              Liquidar comissão ao admin
                            </span>
                          ) : lead.status === 'commission_paid' ? (
                            <span className="text-[11px] text-emerald-700 font-bold">
                              Liquidado ✓
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Finalizado</span>
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

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {sellerOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Sem encomendas recebidas ainda</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assim que os compradores realizarem compras dos seus produtos, os pedidos individuais aparecerão aqui para preparação e envio.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerOrders.map((sub) => (
                <div
                  key={sub.suborderId}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {sub.orderNumber}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Comprador: <strong>{sub.buyerName}</strong> ({sub.buyerPhone})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-950 block">
                        {formatKz(sub.total)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Líquido: {formatKz(sub.netSellerAmount)} (Taxa Plataforma: {formatKz(sub.platformFeeAmount || Math.round(sub.subtotal * 0.05))})
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="text-xs space-y-1">
                    {sub.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-semibold">{formatKz(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery destination */}
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">
                        {sub.shippingAddress.municipality}, {sub.shippingAddress.province} -{' '}
                        {sub.shippingAddress.streetOrBairro}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium text-slate-700">
                      Entrega: {sub.deliveryFee > 0 ? formatKz(sub.deliveryFee) : 'Grátis'}
                    </span>
                  </div>

                  {/* Status Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Avançar Estado:</span>
                      {sub.status === 'pending_confirmation' && (
                        <button
                          onClick={() => handleUpdateSuborderStatus(sub.suborderId, 'in_preparation')}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-2.5 py-1 rounded-lg"
                        >
                          Confirmar & Em Preparação
                        </button>
                      )}
                      {sub.status === 'in_preparation' && (
                        <button
                          onClick={() => handleUpdateSuborderStatus(sub.suborderId, 'shipped')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Marcar como Enviada</span>
                        </button>
                      )}
                      {sub.status === 'shipped' && (
                        <button
                          onClick={() => handleUpdateSuborderStatus(sub.suborderId, 'delivered')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Marcar como Entregue</span>
                        </button>
                      )}
                    </div>

                    {/* Cash on delivery payment received button */}
                    {sub.paymentMethod === 'cash_on_delivery' && sub.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handleConfirmCODPayment(sub)}
                        className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirmar Pagamento Recebido</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS & AFFILIATION SETTINGS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sellerProducts.map((p) => (
              <div
                key={p.productId}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video bg-slate-100 relative">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] bg-slate-900/80 text-white font-bold px-2 py-0.5 rounded-md">
                      Stock: {p.stock}
                    </span>
                    {p.affiliateEnabled && (
                      <span className="absolute top-2 right-2 text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                        Afiliados: {Math.round((p.affiliateCommissionRate || 0) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                    <span className="font-black text-slate-950 text-sm block">
                      {formatKz(p.price)}
                    </span>
                    {p.affiliateEnabled && (
                      <span className="text-[11px] text-emerald-700 font-medium block">
                        Comissão disponível: {formatKz(Math.round(p.price * (p.affiliateCommissionRate || 0)))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-0 border-t border-slate-100 flex gap-2 justify-end">
                  <button
                    onClick={() => handleEditProduct(p)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar & Afiliação</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AFFILIATE APPLICATIONS */}
      {activeTab === 'affiliates' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Candidaturas de Afiliados aos seus Produtos</h3>

          {sellerApplications.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhuma candidatura pendente de afiliados.</p>
          ) : (
            <div className="space-y-3">
              {sellerApplications.map((app) => (
                <div
                  key={app.applicationId}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-wrap justify-between items-center gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm">{app.affiliateName}</span>
                    <span className="text-slate-500 block text-[11px]">{app.affiliateEmail}</span>
                    <span className="text-slate-700 font-medium block">Campanha: {app.productId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>

                    {app.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleReviewApplication(app.applicationId, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReviewApplication(app.applicationId, 'rejected')}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: STORE SETTINGS & KYC VERIFICATION (Section 5A) */}
      {activeTab === 'store_settings' && (
        <form
          onSubmit={handleSaveStore}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl shadow-xs"
        >
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verificação de Vendedor (KYC) & Perfil da Empresa</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Campos obrigatórios segundo a regulamentação do Mercado Angola para concessão do selo "LOJA VERIFICADA".
            </p>
          </div>

          {/* Verification Status Banner */}
          {existingStore?.isVerified ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">✓ LOJA VERIFICADA PELO MERCADO ANGOLA</strong>
                <span>Os seus documentos KYC foram validados. Os seus produtos estão ativos e exibem o selo verde de confiança.</span>
              </div>
            </div>
          ) : existingStore?.status === 'banned' ? (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 text-red-950 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">✕ CONTA DE VENDEDOR REJEITADA / SUSPENSA</strong>
                <span>{existingStore.rejectionReason || 'Contacte o administrador em dembedomingos236@gmail.com para regularizar o seu registo.'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-950 text-xs flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">⏳ DOCUMENTAÇÃO EM ANÁLISE PELO ADMINISTRADOR</strong>
                <span>Mantenha os seus dados atualizados. O administrador irá rever o seu BI e fotos da loja para ativar o selo verificado.</span>
              </div>
            </div>
          )}

          {storeSaveSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Dados da empresa e documentos KYC guardados com sucesso no Mercado Angola!</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nome da Empresa / Loja <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  NIF ou Número do BI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeNifOrBi}
                  onChange={(e) => setStoreNifOrBi(e.target.value)}
                  placeholder="Ex: 541289004LA042"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  WhatsApp Comercial Válido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeWhatsapp}
                  onChange={(e) => setStoreWhatsapp(e.target.value)}
                  placeholder="+244 923 456 789"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Para os clientes contactarem via botão rastreado MA-</span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  IBAN para Recebimento de Comissões <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={storeIban}
                  onChange={(e) => setStoreIban(e.target.value)}
                  placeholder="AO06 0040 0000 1234 5678 1012 3"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Telefone Comercial Fixo / Alternativo</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Província da Empresa</label>
                <select
                  value={storeProv}
                  onChange={(e) => setStoreProv(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {ANGOLA_PROVINCES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Descrição Comercial & Horário</label>
              <textarea
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                rows={3}
                placeholder="Ex: Aberto de Segunda a Sábado das 08h às 18h. Especialistas em eletrónica, informática e telemóveis novos com garantia."
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* KYC Documents Upload / Input */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Documentos Comprovativos KYC (Obrigatório para Selo Verificado)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BI Photo */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Foto do BI ou Passaporte do Titular</label>
                  {storeBiDocUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      <img src={storeBiDocUrl} alt="BI" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setStoreBiDocUrl('')}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-xs cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-slate-50">
                      <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="font-bold text-slate-700">Carregar Foto do BI</span>
                      <span className="text-[10px] text-slate-400">Frente ou ambos os lados</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') setStoreBiDocUrl(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Store Proof Photo */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Foto da Loja Física ou Comprovativo de Morada</label>
                  {storeProofUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      <img src={storeProofUrl} alt="Loja" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setStoreProofUrl('')}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-xs cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-slate-50">
                      <Store className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="font-bold text-slate-700">Carregar Foto da Loja</span>
                      <span className="text-[10px] text-slate-400">Ou fatura de água/luz/morada</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') setStoreProofUrl(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={storeAcceptsCOD}
                onChange={(e) => setStoreAcceptsCOD(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Aceito Pagamento na Entrega (Dinheiro ou TPA diretamente pelo cliente ao receber o artigo)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSavingStore}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingStore ? 'A guardar dados...' : 'Guardar Dados da Empresa & Submeter KYC'}</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL: NEW / EDIT PRODUCT WITH AFFILIATE SETTINGS */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProductId ? 'Editar Artigo & Termos de Afiliação' : 'Publicar Novo Artigo'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ex: iPhone 13 Pro 128GB Grafite"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preço em Kwanzas (Kz)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantidade em Stock</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condição</label>
                  <select
                    value={prodCondition}
                    onChange={(e) => setProdCondition(e.target.value as ProductCondition)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="novo">Novo / Selado</option>
                    <option value="usado">Usado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custo Estimado de Entrega (Kz)</label>
                <input
                  type="number"
                  min={0}
                  value={prodDeliveryCost}
                  onChange={(e) => setProdDeliveryCost(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              {/* Affiliate Settings Section */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Programa de Afiliados para este Produto</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodAffiliateEnabled}
                      onChange={(e) => setProdAffiliateEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {prodAffiliateEnabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Percentual de Comissão oferecido ao Afiliado (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={prodAffiliateRate}
                          onChange={(e) => setProdAffiliateRate(Number(e.target.value))}
                          className="w-24 p-2 border border-slate-200 rounded-lg font-bold"
                        />
                        <span className="text-slate-500 font-medium">
                          % = {formatKz(Math.round(prodPrice * (prodAffiliateRate / 100)))} por venda
                        </span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={prodRequireApproval}
                        onChange={(e) => setProdRequireApproval(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Exigir aprovação prévia de cada afiliado antes da divulgação</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição Detalhada</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={3}
                  placeholder="Características técnicas, garantia, estado do artigo..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProduct ? 'A guardar...' : 'Guardar Artigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
