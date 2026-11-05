import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { ANGOLA_PROVINCES, formatKz } from '../data/angolaData';
import { PaymentMethod, ShippingAddress } from '../types';
import { marketplaceService } from '../services/marketplaceService';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, platformFeeAmount, deliveryFeeTotal, total, clearCart, deliveryType } =
    useCart();
  const { profile, activeRole } = useAuth();
  const { refreshData, setActiveMulticaixaAttempt, activeReferralCode } = useMarket();

  // Form states
  const [fullName, setFullName] = useState(profile?.displayName || 'Domingos Comprador');
  const [phone, setPhone] = useState(profile?.phoneNumber || '+244 923 111 222');
  const [province, setProvince] = useState(profile?.province || 'Luanda');
  const [municipality, setMunicipality] = useState(profile?.municipality || 'Talatona');
  const [streetOrBairro, setStreetOrBairro] = useState(profile?.address || 'Condomínio Belas Business Park');
  const [meetingPointNotes, setMeetingPointNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [referralCodeInput, setReferralCodeInput] = useState<string>(activeReferralCode || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  // Selected province municipalities
  const activeProvObj = ANGOLA_PROVINCES.find((p) => p.name === province) || ANGOLA_PROVINCES[0];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Por favor, indique o seu nome e número de telefone angolano (+244).');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('O seu carrinho não tem produtos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress: ShippingAddress = {
        fullName,
        phone,
        province,
        municipality,
        streetOrBairro: deliveryType === 'domicilio' ? streetOrBairro : 'Ponto de encontro acordado',
        deliveryType,
        meetingPointNotes: deliveryType === 'ponto_encontro' ? meetingPointNotes : undefined,
      };

      const result = await marketplaceService.createOrder({
        buyerId: profile?.uid || 'guest_buyer_' + Date.now(),
        buyerName: fullName,
        buyerPhone: phone,
        shippingAddress,
        cartItems: items,
        paymentMethod,
        affiliateReferralCode: referralCodeInput,
      });

      if (result) {
        setCompletedOrderNumber(result.order.orderNumber);
        clearCart();
        await refreshData();

        // If MULTICAIXA test was chosen, offer simulator
        if (result.paymentAttempt) {
          setActiveMulticaixaAttempt(result.paymentAttempt);
        }
      }
    } catch (err: any) {
      console.error('Falha ao processar encomenda:', err);
      setErrorMsg('Ocorreu um erro ao registar a sua encomenda. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompletedOrderNumber(null);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              AO
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Finalizar Encomenda</h2>
              <span className="text-xs text-slate-500">Mercado Angola • Pagamento Seguro</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrderNumber ? (
          /* Success Screen */
          <div className="p-6 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              Encomenda Registada com Sucesso!
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto space-y-2 text-sm text-slate-700">
              <p className="font-medium">
                Número da Encomenda:{' '}
                <span className="font-mono font-bold text-slate-950 text-base">
                  {completedOrderNumber}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {paymentMethod === 'cash_on_delivery'
                  ? 'A sua encomenda foi enviada aos vendedores. O pagamento será efetuado em dinheiro ou TPA no momento em que receber os artigos.'
                  : 'Uma referência MULTICAIXA foi gerada para teste. Pode consultar o estado na aba "Minhas Encomendas".'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
              <button
                onClick={handleClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Concluir & Ver Encomendas
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-6">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Customer & Delivery Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <User className="w-4 h-4 text-red-600" />
                <span>1. Dados do Comprador & Local de Entrega em Angola</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Domingos Manuel"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telemóvel (WhatsApp / Chamadas)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      className="w-full pl-8 pr-3 p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Província</label>
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      const match = ANGOLA_PROVINCES.find((p) => p.name === e.target.value);
                      if (match && match.municipalities.length > 0) {
                        setMunicipality(match.municipalities[0]);
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    {ANGOLA_PROVINCES.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Município</label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    {activeProvObj.municipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {deliveryType === 'domicilio' ? (
                <div className="text-xs">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bairro, Rua e Ponto de Referência
                  </label>
                  <input
                    type="text"
                    required
                    value={streetOrBairro}
                    onChange={(e) => setStreetOrBairro(e.target.value)}
                    placeholder="Ex: Bairro Maculusso, Rua Comandante Gika, Próximo ao Banco BIC"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              ) : (
                <div className="text-xs">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ponto de Encontro / Local Acordado para Levantamento
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingPointNotes}
                    onChange={(e) => setMeetingPointNotes(e.target.value)}
                    placeholder="Ex: Entrada principal do Belas Shopping / Porta da Loja física"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Payment Method in Angola */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>2. Modo de Transação (Venda Direta pelo Vendedor)</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Proteção Legal de Classificados:</strong> O Mercado Angola é uma plataforma de classificados.
                  Não existem pagamentos para o Mercado Angola. Todas as mercadorias são pagas diretamente ao vendedor no ato da entrega e inspeção presencial.
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {/* Direct to Seller option */}
                <label
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Pagar Direto ao Vendedor (No Ato da Entrega)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Pague em dinheiro ou TPA diretamente ao vendedor ou estafeta após receber e testar o artigo.
                    </p>
                  </div>
                </label>

                {/* WhatsApp Tracked MA- option */}
                <label
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'multicaixa_express'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'multicaixa_express'}
                    onChange={() => setPaymentMethod('multicaixa_express')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>WhatsApp Rastreado (Gera Código MA-)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Mais Rápido
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Gera automaticamente um código de atendimento MA-XXXX e abre o WhatsApp do vendedor com a mensagem oficial pré-preenchida.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Affiliate Referral Code (Optional) */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800">
                  Código de Afiliado / Recomendação (Opcional)
                </label>
                {referralCodeInput && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Afiliado Atribuído (3% de indicação)
                  </span>
                )}
              </div>
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                placeholder="Ex: ANGOLA2026"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs uppercase"
              />
            </div>

            {/* Order Summary breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Valor das mercadorias (Vendedor):</span>
                <span className="font-semibold text-slate-900">{formatKz(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Entrega direta ou ponto de encontro:</span>
                <span className="font-semibold text-slate-900">
                  {deliveryFeeTotal > 0 ? `+${formatKz(deliveryFeeTotal)}` : 'Grátis'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-950">
                <span>Total a Pagar ao Vendedor:</span>
                <span className="text-slate-950">{formatKz(subtotal + deliveryFeeTotal)}</span>
              </div>
            </div>

            {/* Action buttons: WhatsApp Rastreado + Pagar Direto */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={async () => {
                  if (items.length === 0) return;
                  setIsSubmitting(true);
                  try {
                    const firstItem = items[0];
                    const randomCode = Math.floor(1000 + Math.random() * 9000);
                    const leadCode = `MA-${randomCode}`;
                    const lead = await marketplaceService.createLead({
                      itemType: 'product',
                      itemId: firstItem.product.productId,
                      itemTitle: items.map((i) => `${i.quantity}x ${i.product.name}`).join(', '),
                      sellerId: firstItem.product.sellerId,
                      sellerName: firstItem.product.storeName,
                      sellerPhone: '+244923456789',
                      price: total,
                      affiliateId: referralCodeInput,
                      buyerName: fullName,
                      buyerPhone: phone,
                    });

                    const msg = `Olá ${firstItem.product.storeName}! Gostaria de finalizar a encomenda de:\n${items.map((i) => `• ${i.quantity}x ${i.product.name} (${formatKz(i.product.price * i.quantity)})`).join('\n')}\nTotal: ${formatKz(total)}\n\nCódigo de Atendimento: ${lead.leadCode}\nLocal de Entrega: ${province}, ${municipality}.\nPodemos combinar a entrega e o pagamento em mãos?`;
                    window.open(`https://wa.me/244923456789?text=${encodeURIComponent(msg)}`, '_blank');
                    clearCart();
                    handleClose();
                  } catch (e) {
                    console.warn(e);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>WhatsApp Rastreado (Gera Código MA-)</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>A registar encomenda...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Pagar Direto ao Vendedor na Entrega ({formatKz(subtotal + deliveryFeeTotal)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
