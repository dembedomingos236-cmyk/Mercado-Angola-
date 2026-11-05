import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  XCircle,
  CreditCard,
  Banknote,
  MapPin,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../data/angolaData';
import { Order, OrderStatus } from '../types';
import { marketplaceService } from '../services/marketplaceService';

export const BuyerOrdersView: React.FC = () => {
  const { orders, refreshData, setActiveMulticaixaAttempt, setActiveReportTarget } = useMarket();
  const { profile } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Filter orders for this user if in buyer mode, or show all if demo
  const userOrders = orders.filter(
    (o) => !profile || o.buyerId === profile.uid || o.buyerId.startsWith('demo_') || o.buyerId.startsWith('guest_')
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_confirmation':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendente de Confirmação
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmada pelo Vendedor
          </span>
        );
      case 'in_preparation':
        return (
          <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Package className="w-3 h-3" /> Em Preparação
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" /> Enviada / Em Rota de Entrega
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Entregue com Sucesso
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelada
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrderId || !cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await marketplaceService.cancelOrder(cancelModalOrderId, cancelReason);
      await refreshData();
      setCancelModalOrderId(null);
      setCancelReason('');
    } catch (err) {
      console.error('Falha ao cancelar encomenda:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Minhas Encomendas
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhe o estado de entrega dos seus pedidos em Angola
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Atualizar Lista
        </button>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Ainda não tem encomendas registadas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Quando encomendar artigos no Mercado Angola, os seus pedidos e o respetivo estado de entrega aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;

            return (
              <div
                key={order.orderId}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Order Summary Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-950 text-sm">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Data:{' '}
                      {new Date(order.createdAt).toLocaleDateString('pt-AO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                      <span className="font-black text-slate-950 text-base">
                        {formatKz(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between max-w-xl mx-auto relative">
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>

                    {[
                      { key: 'pending_confirmation', label: 'Pendente' },
                      { key: 'confirmed', label: 'Confirmada' },
                      { key: 'in_preparation', label: 'Preparação' },
                      { key: 'shipped', label: 'Enviada' },
                      { key: 'delivered', label: 'Entregue' },
                    ].map((step, idx) => {
                      const orderStatuses = [
                        'pending_confirmation',
                        'confirmed',
                        'in_preparation',
                        'shipped',
                        'delivered',
                      ];
                      const currentIdx = orderStatuses.indexOf(order.orderStatus);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isComplete
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1 font-semibold ${
                              isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-5 bg-slate-50/30">
                    {/* Items List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Artigos Encomendados
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {item.productImage && (
                                <img
                                  src={item.productImage}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-md border border-slate-200"
                                />
                              )}
                              <div>
                                <span className="font-semibold text-slate-900 block">{item.productName}</span>
                                <span className="text-slate-500 text-[11px]">
                                  Qtd: {item.quantity} × {formatKz(item.unitPrice)}
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">{formatKz(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-600" />
                          <span>Endereço de Entrega</span>
                        </span>
                        <p className="text-slate-700 font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-slate-500">{order.shippingAddress.phone}</p>
                        <p className="text-slate-500">
                          {order.shippingAddress.municipality}, {order.shippingAddress.province}
                        </p>
                        <p className="text-slate-600 italic">
                          {order.shippingAddress.streetOrBairro || order.shippingAddress.meetingPointNotes}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Forma & Estado de Pagamento</span>
                        </span>
                        <p className="text-slate-700 font-medium">
                          {order.paymentMethod === 'cash_on_delivery'
                            ? 'Pagamento na Entrega (Dinheiro/TPA)'
                            : 'MULTICAIXA Express / Referência GPO'}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              order.paymentStatus === 'received'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Pagamento: {order.paymentStatus === 'received' ? 'Recebido / Confirmado' : 'Pendente'}
                          </span>
                        </div>

                        {order.paymentConfirmation && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            Confirmado por {order.paymentConfirmation.confirmedBy} em{' '}
                            {new Date(order.paymentConfirmation.confirmedAt).toLocaleDateString('pt-AO')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions bar for this order */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {order.orderStatus === 'pending_confirmation' && (
                          <button
                            onClick={() => setCancelModalOrderId(order.orderId)}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancelar Pedido
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setActiveReportTarget({
                              targetType: 'order',
                              targetId: order.orderId,
                              targetTitle: `Encomenda ${order.orderNumber}`,
                            })
                          }
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Reportar problema com a encomenda</span>
                        </button>
                      </div>

                      {order.paymentMethod === 'multicaixa_express' && order.paymentStatus === 'pending' && (
                        <button
                          onClick={() =>
                            setActiveMulticaixaAttempt({
                              attemptId: 'pay_' + order.orderId,
                              orderId: order.orderId,
                              buyerId: order.buyerId,
                              amount: order.totalAmount,
                              currency: 'AOA',
                              provider: 'MULTICAIXA_GPO_EMIS',
                              reference: '9' + Math.floor(10000000 + Math.random() * 90000000),
                              entity: '00099',
                              status: 'pending',
                              idempotencyKey: `idemp_${order.orderId}`,
                              mode: 'test',
                              createdAt: order.createdAt,
                            })
                          }
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Pagar com MULTICAIXA
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Cancelar Encomenda</h3>
            <p className="text-xs text-slate-600">
              Tem a certeza de que pretende cancelar esta encomenda? Por favor, indique o motivo:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Já não necessito do artigo / Encomenda duplicada"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling || !cancelReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {isCancelling ? 'A cancelar...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
