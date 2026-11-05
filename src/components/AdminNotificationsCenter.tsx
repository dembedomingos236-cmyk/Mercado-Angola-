import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building2,
  Lock,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatKz } from '../data/angolaData';
import { AdminNotification, NotificationCategory, NotificationPriority } from '../types';
import { notificationService } from '../services/notificationService';
import { marketplaceService } from '../services/marketplaceService';

interface AdminNotificationsCenterProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminNotificationsCenter: React.FC<AdminNotificationsCenterProps> = ({ onNavigateTab }) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAdminNotification,
    clearAllAdminNotifications,
    refreshData,
  } = useMarket();

  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter((item) => {
    // Category filter
    if (categoryFilter !== 'todas' && item.category !== categoryFilter) {
      return false;
    }
    // Priority filter
    if (priorityFilter !== 'todas' && item.priority !== priorityFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMessage = item.message.toLowerCase().includes(q);
      const matchEvent = item.event.toLowerCase().includes(q);
      const matchOrder = item.metadata?.orderNumber?.toLowerCase().includes(q) || false;
      const matchCandidate = item.metadata?.candidateName?.toLowerCase().includes(q) || false;
      const matchCandidateEmail = item.metadata?.candidateEmail?.toLowerCase().includes(q) || false;
      return matchTitle || matchMessage || matchEvent || matchOrder || matchCandidate || matchCandidateEmail;
    }
    return true;
  });

  const handleTestSound = () => {
    notificationService.testChime('critico');
  };

  const handleApproveApplicationFromNotif = async (notif: AdminNotification) => {
    if (!notif.metadata?.applicationId) return;
    setActionLoadingId(notif.notificationId);
    try {
      await marketplaceService.reviewAffiliateApplication(notif.metadata.applicationId, 'approved');
      await markNotificationAsRead(notif.notificationId);
      await refreshData();
      setActionFeedback(`Candidatura de ${notif.metadata.candidateName || 'afiliado'} aprovada com sucesso!`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectApplicationFromNotif = async (notif: AdminNotification) => {
    if (!notif.metadata?.applicationId) return;
    setActionLoadingId(notif.notificationId);
    try {
      await marketplaceService.reviewAffiliateApplication(notif.metadata.applicationId, 'rejected');
      await markNotificationAsRead(notif.notificationId);
      await refreshData();
      setActionFeedback(`Candidatura de ${notif.metadata.candidateName || 'afiliado'} rejeitada.`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'vendas':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'candidaturas':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'pagamentos':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'seguranca':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'financeiro':
        return <DollarSign className="w-4 h-4 text-indigo-500" />;
      case 'sistema':
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critico':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Crítico
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Normal
          </span>
        );
      case 'informativo':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Informativo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header controls & stats */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md animate-pulse">
              <BellRing className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>
            {unreadNotificationsCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white min-w-5 text-center animate-bounce shadow-md">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-xs" title="Observador em Tempo Real Ativo" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Centro de Notificações do Administrador
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-0.5 rounded-full font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Tempo Real Ativo
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Notificações instantâneas de novos utilizadores, lojas, produtos publicados, serviços e vendas em Kwanzas.
            </p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestSound}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Testar sinal sonoro de notificação"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Testar Som</span>
          </button>

          {unreadNotificationsCount > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Marcar Todas como Lidas</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Tem a certeza que deseja limpar todo o histórico de notificações?')) {
                  clearAllAdminNotifications();
                }
              }}
              className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por encomenda, candidato, utilizador, tipo de evento ou palavra-chave..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
            >
              <option value="todas">Todas as Prioridades</option>
              <option value="critico">Apenas Críticas / Urgentes</option>
              <option value="normal">Prioridade Normal</option>
              <option value="informativo">Apenas Informativas</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs font-semibold">
          {[
            { id: 'todas', label: 'Todas', count: notifications.length },
            { id: 'vendas', label: 'Vendas & Encomendas', count: notifications.filter((n) => n.category === 'vendas').length },
            { id: 'candidaturas', label: 'Candidaturas', count: notifications.filter((n) => n.category === 'candidaturas').length },
            { id: 'pagamentos', label: 'Pagamentos & Levantamentos', count: notifications.filter((n) => n.category === 'pagamentos').length },
            { id: 'seguranca', label: 'Segurança & Denúncias', count: notifications.filter((n) => n.category === 'seguranca').length },
            { id: 'financeiro', label: 'Regras & Comissões', count: notifications.filter((n) => n.category === 'financeiro').length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  categoryFilter === cat.id ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200 animate-pulse">
              <BellRing className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sistema de Observadores Firestore Ativo em Tempo Real</span>
              </div>
              <h3 className="font-black text-slate-900 text-lg">Pronto para Capturar Novos Eventos</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Os observadores em tempo real estão a escutar ativamente a criação de novos utilizadores, registo de vendedores, publicação de produtos, serviços e vendas. Qualquer evento gerará alerta visual com som e vibração imediata.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={handleTestSound}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Testar Alerta Sonoro do Administrador
              </button>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read;
            const isCritical = notif.priority === 'critico';

            return (
              <div
                key={notif.notificationId}
                className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-3 ${
                  isUnread
                    ? isCritical
                      ? 'border-red-400 bg-red-50/20 ring-1 ring-red-400/30'
                      : 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-300/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: category, priority, time & read state */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                      {getCategoryIcon(notif.category)}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {notif.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    {getPriorityBadge(notif.priority)}

                    {isUnread && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        Nova
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="h-3 w-px bg-slate-200 mx-1"></div>

                    {isUnread ? (
                      <button
                        onClick={() => markNotificationAsRead(notif.notificationId)}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                        title="Marcar como lida"
                      >
                        Marcar lida
                      </button>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-slate-400" />
                        Lida
                      </span>
                    )}

                    <button
                      onClick={() => deleteAdminNotification(notif.notificationId)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Eliminar notificação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Main Message */}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    {notif.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Structured Metadata Breakdown */}
                {notif.metadata && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {notif.metadata.orderNumber && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Nº Encomenda
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {notif.metadata.orderNumber}
                        </span>
                      </div>
                    )}

                    {notif.metadata.saleAmount !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Valor Bruto Venda
                        </span>
                        <span className="font-bold text-slate-950">
                          {formatKz(notif.metadata.saleAmount)}
                        </span>
                      </div>
                    )}

                    {notif.metadata.platformFeeAmount !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Comissão Plataforma (5%)
                        </span>
                        <span className="font-black text-red-600">
                          {formatKz(notif.metadata.platformFeeAmount)}
                        </span>
                      </div>
                    )}

                    {notif.metadata.sellerAmount !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Líquido Vendedores
                        </span>
                        <span className="font-bold text-emerald-700">
                          {formatKz(notif.metadata.sellerAmount)}
                        </span>
                      </div>
                    )}

                    {notif.metadata.candidateName && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Candidato / Empresa
                        </span>
                        <span className="font-bold text-slate-900 truncate block">
                          {notif.metadata.candidateName}
                        </span>
                      </div>
                    )}

                    {notif.metadata.candidateEmail && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Contacto Autorizado
                        </span>
                        <span className="font-medium text-slate-700 truncate block">
                          {notif.metadata.candidateEmail}
                        </span>
                      </div>
                    )}

                    {notif.metadata.withdrawalAmount !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Montante Levantamento
                        </span>
                        <span className="font-black text-amber-700">
                          {formatKz(notif.metadata.withdrawalAmount)}
                        </span>
                      </div>
                    )}

                    {notif.metadata.bankName && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Banco Destino
                        </span>
                        <span className="font-semibold text-slate-800">
                          {notif.metadata.bankName}
                        </span>
                      </div>
                    )}

                    {notif.metadata.paymentMethod && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Método de Pagamento
                        </span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {notif.metadata.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    )}

                    {notif.metadata.paymentStatus && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Estado Pagamento
                        </span>
                        <span
                          className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                            notif.metadata.paymentStatus === 'received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : notif.metadata.paymentStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {notif.metadata.paymentStatus}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons embedded directly in notification */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Evento: {notif.event}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {/* Candidate Management buttons */}
                    {notif.actionType === 'manage_application' && notif.metadata?.applicationId && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApproveApplicationFromNotif(notif)}
                          disabled={actionLoadingId === notif.notificationId}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </button>

                        <button
                          onClick={() => handleRejectApplicationFromNotif(notif)}
                          disabled={actionLoadingId === notif.notificationId}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejeitar</span>
                        </button>
                      </div>
                    )}

                    {/* Navigation shortcuts */}
                    {notif.actionType === 'view_order' && onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('financial')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Ver no Painel Financeiro</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {notif.actionType === 'view_withdrawal' && onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('withdrawals')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Gerir Levantamentos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {notif.actionType === 'view_report' && onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('reports')}
                        className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Ver Denúncia</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
