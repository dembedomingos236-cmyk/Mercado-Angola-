import React, { useState } from 'react';
import {
  Store,
  Package,
  Layers,
  ShoppingBag,
  Send,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  TrendingUp,
  Eye,
  ShieldCheck,
  Building2,
  Check,
  X,
  Star,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../data/angolaData';
import { ServiceItem, ServiceQuoteRequest } from '../types/services';
import { Product } from '../types';

export const CompanySellerDashboard: React.FC = () => {
  const {
    products,
    services,
    suborders,
    quoteRequests,
    companies,
    createService,
    updateService,
    deleteService,
    updateQuoteStatus,
  } = useMarket();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'orders' | 'quotes' | 'profile'>('overview');

  // Identify the company associated with the logged-in user
  const myCompany = companies.find(
    (c) => c.ownerId === profile?.uid || c.companyId === profile?.uid || c.email === profile?.email
  ) || companies[0]; // fallback to first company if testing in demo mode

  const companyId = myCompany?.companyId;

  // Filter items belonging to this company
  const myServices = services.filter((s) => s.companyId === companyId || s.companyName === myCompany?.name);
  const myProducts = products.filter((p) => p.sellerId === profile?.uid || p.sellerId === companyId);
  const myOrders = suborders.filter((s) => s.sellerId === profile?.uid || s.sellerId === companyId);
  const myQuoteRequests = quoteRequests.filter((q) => q.companyId === companyId || q.companyName === myCompany?.name);

  // Stats calculation
  const totalSalesRevenue = myOrders
    .filter((o) => o.paymentStatus === 'received' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.netSellerAmount, 0);

  const pendingOrdersCount = myOrders.filter((o) => o.status === 'pending_confirmation').length;
  const pendingQuotesCount = myQuoteRequests.filter((q) => q.status === 'pending').length;

  // Quote answer modal/state
  const [answeringQuoteId, setAnsweringQuoteId] = useState<string | null>(null);
  const [quotePriceInput, setQuotePriceInput] = useState('');
  const [quoteNotesInput, setQuoteNotesInput] = useState('');

  const handleRespondQuote = async (status: 'quoted' | 'accepted' | 'declined') => {
    if (!answeringQuoteId) return;
    try {
      await updateQuoteStatus(
        answeringQuoteId,
        status,
        quotePriceInput ? Number(quotePriceInput) : undefined,
        quoteNotesInput
      );
      setAnsweringQuoteId(null);
      setQuotePriceInput('');
      setQuoteNotesInput('');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar orçamento.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-100 shrink-0">
            <img
              src={myCompany?.logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'}
              alt={myCompany?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{myCompany?.name}</h1>
              {myCompany?.isVerified && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Empresa Verificada</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{myCompany?.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> {myCompany?.province}, {myCompany?.municipality}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            NIF: <span className="font-mono text-slate-900">{myCompany?.nif || '5412998371'}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral & Desempenho</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'services' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Serviços Publicados ({myServices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'quotes' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4 text-amber-600" />
          <span>Pedidos de Orçamento ({myQuoteRequests.length})</span>
          {pendingQuotesCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingQuotesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'orders' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>Vendas de Produtos ({myOrders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Faturação Líquida</span>
              <span className="text-2xl font-black text-slate-950 block">{formatKz(totalSalesRevenue)}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">100% creditado à empresa</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Orçamentos Recebidos</span>
              <span className="text-2xl font-black text-blue-600 block">{myQuoteRequests.length}</span>
              <span className="text-[11px] text-slate-500">{pendingQuotesCount} pendentes de resposta</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Visualizações Comerciais</span>
              <span className="text-2xl font-black text-slate-950 block">{myCompany?.viewsCount || 890}</span>
              <span className="text-[11px] text-slate-500">Cliques no perfil e serviços</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Avaliação Média</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span className="text-2xl font-black text-slate-950">{myCompany?.rating.toFixed(1) || '4.9'}</span>
              </div>
              <span className="text-[11px] text-slate-500">{myCompany?.reviewCount || 32} opiniões de clientes</span>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-blue-950 text-sm">Pronto para expandir o seu negócio em Angola?</h3>
              <p className="text-blue-800">
                Publique novos serviços especializados com fotografias e preços claros para receber pedidos qualificados todos os dias.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('services')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Gerir os Meus Serviços
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Serviços Comerciais da Empresa
            </h2>
            <span className="text-xs text-slate-500">{myServices.length} ativos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myServices.map((service) => (
              <div
                key={service.serviceId}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {service.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2">
                      {service.title}
                    </h3>
                    <div className="text-xs font-black text-slate-950">
                      {service.pricingType === 'quote' ? 'Sob Orçamento' : formatKz(service.priceAoa)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {service.viewsCount || 42} visitas
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm('Tem a certeza que deseja eliminar este serviço?')) {
                          deleteService(service.serviceId);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 text-xs font-semibold cursor-pointer"
                      title="Eliminar Serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {myServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhum serviço publicado ainda</h3>
              <p className="text-xs text-slate-500">
                Comece por publicar o seu primeiro serviço para aparecer na secção Serviços em Angola.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUOTE REQUESTS */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Pedidos de Orçamento Recebidos
            </h2>
            <span className="text-xs text-slate-500">{myQuoteRequests.length} solicitações</span>
          </div>

          <div className="space-y-3">
            {myQuoteRequests.map((req) => (
              <div
                key={req.requestId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-600">{req.serviceCategory}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{req.serviceTitle}</h3>
                    <span className="text-[11px] text-slate-400">
                      Recebido em: {new Date(req.createdAt).toLocaleDateString('pt-AO')} às{' '}
                      {new Date(req.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'quoted'
                        ? 'bg-blue-100 text-blue-800'
                        : req.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {req.status === 'pending'
                      ? 'Pendente de Resposta'
                      : req.status === 'quoted'
                      ? 'Orçamento Enviado'
                      : req.status === 'accepted'
                      ? 'Aceite pelo Cliente'
                      : 'Concluído'}
                  </span>
                </div>

                {/* Client info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cliente:</span>
                    <span className="font-bold text-slate-900">{req.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Localização:</span>
                    <span className="font-medium text-slate-900">{req.province}, {req.municipality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Telemóvel:</span>
                    <span className="font-mono font-bold text-slate-900">{req.clientPhone}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Detalhes da Necessidade:</span>
                  <p className="text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                    {req.details}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${req.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Olá ${req.clientName}! Somos da ${myCompany?.name} no Mercado Angola. Vimos o seu pedido de orçamento para "${req.serviceTitle}".`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Falar no WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${req.clientPhone}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ligar</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setAnsweringQuoteId(req.requestId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Responder com Preço Formal
                  </button>
                </div>

                {/* Inline Quote Answer Box */}
                {answeringQuoteId === req.requestId && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-xs">
                    <h4 className="font-bold text-blue-950">Enviar Proposta de Preço Formal:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Preço em Kwanzas (AOA) *</label>
                        <input
                          type="number"
                          value={quotePriceInput}
                          onChange={(e) => setQuotePriceInput(e.target.value)}
                          placeholder="Ex: 45000"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Observações ou Condições</label>
                        <input
                          type="text"
                          value={quoteNotesInput}
                          onChange={(e) => setQuoteNotesInput(e.target.value)}
                          placeholder="Ex: Inclui deslocação e materiais"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespondQuote('quoted')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
                      >
                        Submeter Proposta
                      </button>
                      <button
                        onClick={() => setAnsweringQuoteId(null)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {myQuoteRequests.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <Send className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Nenhum pedido de orçamento pendente</h3>
                <p className="text-xs text-slate-500">
                  Os clientes que solicitarem orçamentos nos seus serviços aparecerão aqui em tempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Encomendas de Produtos Recebidas
            </h2>
            <span className="text-xs text-slate-500">{myOrders.length} encomendas</span>
          </div>

          <div className="space-y-3">
            {myOrders.map((order) => (
              <div
                key={order.suborderId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
                    <span className="text-slate-400 block text-[11px]">
                      Data: {new Date(order.createdAt).toLocaleDateString('pt-AO')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-950 text-sm block">
                      {formatKz(order.netSellerAmount)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Líquido da Loja</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {order.items.map((i) => (
                    <div key={i.productId} className="flex justify-between text-slate-700">
                      <span>{i.productName} (x{i.quantity})</span>
                      <span className="font-medium">{formatKz(i.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* 4-digit pickup code for driver safety */}
                {order.pickupVerificationCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-950 block">Código de Verificação do Motorista:</span>
                      <span className="text-[11px] text-amber-800">
                        Entregar a mercadoria apenas se o motorista apresentar este código exato.
                      </span>
                    </div>
                    <span className="font-mono text-xl font-black bg-white px-3 py-1 rounded-lg border border-amber-300 text-slate-950 tracking-widest">
                      {order.pickupVerificationCode}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {myOrders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Nenhuma venda de produto registada ainda</h3>
                <p className="text-xs text-slate-500">
                  Quando um cliente comprar produtos da sua loja, os pedidos aparecerão aqui imediatamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
