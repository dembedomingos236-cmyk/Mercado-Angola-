import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  AlertTriangle,
  Lock,
  Unlock,
  Package,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatKz } from '../data/angolaData';
import { marketplaceService } from '../services/marketplaceService';
import { Order } from '../types';

export const DriverDeliveryDashboard: React.FC = () => {
  const { orders, refreshData } = useMarket();
  const { profile } = useAuth();

  const [enteredCodeMap, setEnteredCodeMap] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  // Deliveries available or assigned
  const availableDeliveries = orders.filter((o) => o.orderStatus !== 'cancelled');

  const myDeliveries = availableDeliveries.filter(
    (o) => o.driverId === profile?.uid || (profile?.role === 'driver' && o.deliveryState === 'driver_accepted')
  );

  const pendingDeliveries = availableDeliveries.filter(
    (o) => !o.driverId || o.deliveryState === 'pending_driver'
  );

  const completedDeliveries = availableDeliveries.filter(
    (o) => o.deliveryState === 'delivered' && (o.driverId === profile?.uid || profile?.role === 'driver')
  );

  const totalEarned = completedDeliveries.length * 2000;

  const handleAcceptDelivery = async (order: Order) => {
    setLoadingOrderId(order.orderId);
    setErrorFeedback(null);
    try {
      await marketplaceService.driverAcceptDelivery({
        orderId: order.orderId,
        driverId: profile?.uid || 'driver_luanda_express_01',
        driverName: profile?.displayName || 'António Motorista Express',
        driverPhone: profile?.phoneNumber || '+244 923 777 888',
        driverVehicle: profile?.driverVehicleType || 'Motorizada',
      });
      await refreshData();
      setActionFeedback(`Entrega da Encomenda #${order.orderNumber} aceite com sucesso! Dirija-se ao vendedor.`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: any) {
      setErrorFeedback(err.message || 'Erro ao aceitar entrega.');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleVerifyPickupCode = async (order: Order) => {
    const code = enteredCodeMap[order.orderId] || '';
    if (!code.trim() || code.length < 4) {
      setErrorFeedback('Introduza o código de 4 dígitos conferido com o vendedor.');
      return;
    }

    setLoadingOrderId(order.orderId);
    setErrorFeedback(null);
    try {
      const res = await marketplaceService.driverVerifyPickupWithCode(order.orderId, code.trim());
      if (res.success) {
        setActionFeedback(res.message);
        await refreshData();
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        setErrorFeedback(res.message);
      }
    } catch (err: any) {
      setErrorFeedback(err.message || 'Erro ao validar código com o vendedor.');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleConfirmCustomerDelivery = async (order: Order) => {
    if (!window.confirm('Confirma que o cliente recebeu a mercadoria e foi validada? A custódia do dinheiro será libertada na hora.')) {
      return;
    }

    setLoadingOrderId(order.orderId);
    setErrorFeedback(null);
    try {
      const res = await marketplaceService.driverConfirmDeliveryToCustomer(order.orderId);
      if (res.success) {
        setActionFeedback(res.message);
        await refreshData();
        setTimeout(() => setActionFeedback(null), 3500);
      } else {
        setErrorFeedback(res.message);
      }
    } catch (err: any) {
      setErrorFeedback(err.message || 'Erro ao concluir entrega.');
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Feedback Messages */}
      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {errorFeedback && (
        <div className="bg-red-50 border border-red-300 text-red-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-in fade-in duration-300">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorFeedback}</span>
        </div>
      )}

      {/* Driver Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Painel de Entregas Mercado Angola
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  Motorista Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validação com código de 4 dígitos • Custódia segura • Ganhe 2.000 Kz por entrega
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-right">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Ganhos em Entregas:</span>
            <span className="text-xl font-black text-amber-400">{formatKz(totalEarned)}</span>
            <span className="text-[10px] text-slate-400 block">{completedDeliveries.length} entregas concluídas</span>
          </div>
        </div>

        {/* Security Rule Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Regra de Segurança Inviolável:</strong> O vendedor só entrega o produto ao motorista se o código de 4 dígitos gerado for rigorosamente idêntico. O dinheiro do cliente permanece guardado na plataforma até a receção final.
          </span>
        </div>
      </div>

      {/* Available & Active Deliveries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />
            <span>Entregas Disponíveis & em Andamento ({availableDeliveries.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Atualizado em tempo real</span>
        </div>

        <div className="space-y-4">
          {availableDeliveries.map((order) => {
            const isAssignedToMe = order.driverId === profile?.uid || (profile?.role === 'driver' && order.deliveryState === 'driver_accepted');
            const isPickedUp = order.deliveryState === 'picked_up_verified';
            const isDelivered = order.deliveryState === 'delivered';

            return (
              <div
                key={order.orderId}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDelivered
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isPickedUp
                    ? 'border-blue-300 bg-blue-50/20'
                    : isAssignedToMe
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      Encomenda #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPickedUp
                          ? 'bg-blue-100 text-blue-800'
                          : isAssignedToMe
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDelivered
                        ? 'Entregue ao Cliente'
                        : isPickedUp
                        ? 'Mercadoria com o Motorista (Em Trânsito)'
                        : isAssignedToMe
                        ? 'A Caminho do Vendedor'
                        : 'A Aguardar Motorista'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500">Taxa do Motorista: </span>
                    <span className="text-sm font-black text-amber-600">
                      {formatKz(order.driverFeeAmount || 2000)}
                    </span>
                  </div>
                </div>

                {/* Items and Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Ponto de Levantamento (Vendedor) */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>1. Ponto de Levantamento (Loja/Vendedor):</span>
                    </span>
                    <p className="font-bold text-slate-900">
                      {order.items.map((i) => i.productName).join(', ')}
                    </p>
                    <p className="text-slate-600">
                      Contacto do vendedor: <strong>+244 923 456 789</strong> (Loja Parceira)
                    </p>
                  </div>

                  {/* Ponto de Entrega (Cliente) */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>2. Ponto de Entrega (Cliente Final):</span>
                    </span>
                    <p className="font-bold text-slate-900">
                      {order.buyerName} ({order.buyerPhone})
                    </p>
                    <p className="text-slate-600">
                      {order.shippingAddress.province}, {order.shippingAddress.municipality} -{' '}
                      {order.shippingAddress.streetOrBairro || 'Ponto de referência acordado'}
                    </p>
                  </div>
                </div>

                {/* Escrow Status Tag */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      Custódia da Plataforma:{' '}
                      <strong className={isDelivered ? 'text-emerald-600' : 'text-blue-600'}>
                        {isDelivered ? 'Libertada ao Vendedor e Motorista' : 'Guardado em Segurança'}
                      </strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Valor total da encomenda: <strong>{formatKz(order.totalAmount)}</strong>
                  </span>
                </div>

                {/* ACTION BUTTONS & 4-DIGIT VERIFICATION */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {!order.driverId || order.deliveryState === 'pending_driver' ? (
                    <button
                      onClick={() => handleAcceptDelivery(order)}
                      disabled={loadingOrderId === order.orderId}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Aceitar Esta Entrega (+2.000 Kz)</span>
                    </button>
                  ) : order.deliveryState === 'driver_accepted' ? (
                    /* Step 2: Pickup Verification with 4 digits */
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          <span>Conferência de Código de 4 Dígitos no Vendedor:</span>
                        </span>
                        <p className="text-[11px] text-amber-800">
                          Peça ao vendedor o código de levantamento ({order.pickupVerificationCode ? 'Código do Vendedor: ' + order.pickupVerificationCode : '4 Dígitos'}).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredCodeMap[order.orderId] || ''}
                          onChange={(e) =>
                            setEnteredCodeMap((prev) => ({ ...prev, [order.orderId]: e.target.value }))
                          }
                          placeholder="Ex: 8492"
                          className="w-24 p-2 bg-white border border-amber-300 rounded-lg text-center font-mono font-black text-sm uppercase tracking-widest focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          onClick={() => handleVerifyPickupCode(order)}
                          disabled={loadingOrderId === order.orderId}
                          className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer disabled:opacity-50"
                        >
                          Validar Levantamento
                        </button>
                      </div>
                    </div>
                  ) : order.deliveryState === 'picked_up_verified' ? (
                    /* Step 3: Final Delivery to Customer */
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <div className="space-y-0.5">
                        <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Mercadoria a Caminho do Cliente</span>
                        </span>
                        <p className="text-[11px] text-blue-800">
                          Entregue no endereço e clique abaixo para confirmar a receção e receber os 2.000 Kz.
                        </p>
                      </div>

                      <button
                        onClick={() => handleConfirmCustomerDelivery(order)}
                        disabled={loadingOrderId === order.orderId}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Entrega ao Cliente & Libertar Saldo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Entrega finalizada. Valor creditado ao motorista e vendedor com sucesso.</span>
                    </div>
                  )}

                  <a
                    href={`tel:${order.buyerPhone}`}
                    className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ligar ao Cliente</span>
                  </a>
                </div>
              </div>
            );
          })}

          {availableDeliveries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Truck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-black text-slate-900 text-base">Nenhuma entrega disponível no momento</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando novos clientes fizerem compras com opção de entrega ao domicílio, as encomendas aparecerão aqui instantaneamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
