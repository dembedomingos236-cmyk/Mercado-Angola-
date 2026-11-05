import React, { useState } from 'react';
import {
  X,
  Heart,
  Store,
  MapPin,
  Truck,
  ShieldCheck,
  MessageCircle,
  Flag,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Share2,
  Copy,
  Send,
} from 'lucide-react';
import { Product } from '../types';
import { formatKz } from '../data/angolaData';
import { useCart } from '../context/CartContext';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const {
    toggleFavorite,
    isFavorite,
    setActiveChatSeller,
    setActiveReportTarget,
    stores,
    createLead,
  } = useMarket();

  const { profile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedAff, setCopiedAff] = useState(false);
  const [isGeneratingLead, setIsGeneratingLead] = useState(false);

  if (!product) return null;

  const fav = isFavorite(product.productId);
  const store = stores.find((s) => s.storeId === product.sellerId || s.name === product.storeName);

  const handleWhatsAppTracked = async () => {
    setIsGeneratingLead(true);
    try {
      const sellerPhone = store?.whatsapp || store?.phone || '+244923456789';
      const cleanPhone = sellerPhone.replace(/[^0-9]/g, '') || '244923456789';

      const lead = await createLead({
        itemType: 'product',
        itemId: product.productId,
        itemTitle: product.name,
        sellerId: product.sellerId,
        sellerName: product.storeName,
        sellerPhone: store?.phone || sellerPhone,
        sellerWhatsapp: sellerPhone,
        price: product.price * quantity,
        affiliateId: profile?.affiliateCode,
        buyerName: profile?.displayName || 'Comprador Mercado Angola',
        buyerPhone: profile?.phoneNumber,
        buyerEmail: profile?.email,
      });

      const message = `Olá ${product.storeName}! Tenho interesse no artigo "${product.name}" no valor de ${formatKz(product.price * quantity)} anunciado no Mercado Angola.\n\nCódigo de Atendimento: ${lead.leadCode}\n\nPodemos combinar a entrega e o pagamento em mãos?`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      onClose();
    } catch (e) {
      console.warn('Erro ao gerar lead rastreado:', e);
    } finally {
      setIsGeneratingLead(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
    onClose();
  };

  const handleOpenChat = () => {
    setActiveChatSeller({
      sellerId: product.sellerId,
      storeName: product.storeName,
      productId: product.productId,
      productName: product.name,
    });
    onClose();
  };

  const handleOpenReport = () => {
    setActiveReportTarget({
      targetType: 'product',
      targetId: product.productId,
      targetTitle: product.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Images Section */}
          <div className="space-y-3">
            <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
              <img
                src={
                  product.images[activeImageIndex] ||
                  product.images[0] ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleFavorite(product.productId)}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-colors cursor-pointer ${
                  fav ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-700 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail list if multiple */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-red-600' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Store Information Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{product.storeName}</h4>
                      {store?.isVerified && (
                        <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.2 rounded-full flex items-center gap-1">
                          ✓ LOJA VERIFICADA
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {product.municipality ? `${product.municipality}, ` : ''}
                      {product.province}
                    </span>
                    <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
                      ★ {store?.rating || 4.8} estrelas ({store?.totalSales || 23} vendas) • Verificado pelo Mercado Angola
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Venda direta pelo vendedor.</strong>
                  O Mercado Angola é uma plataforma de classificados. Todas as compras são pagas diretamente ao vendedor no ato da entrega.
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={handleOpenChat}
                  className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mensagem no Chat</span>
                </button>
                <button
                  onClick={handleOpenReport}
                  className="bg-white hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-600 text-xs py-2 px-3 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title="Reportar anúncio suspeito"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Details & Purchase Section */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Condition tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                    product.condition === 'novo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Condição: {product.condition === 'novo' ? 'Novo / Selado' : 'Usado / Em bom estado'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Price */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                  Preço em Kwanzas
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-950">
                    {formatKz(product.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">AOA</span>
                </div>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Em stock ({product.stock} unidades disponíveis)</span>
                  </span>
                ) : (
                  <span className="text-red-700 font-semibold flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Esgotado de momento</span>
                  </span>
                )}
              </div>

              {/* Delivery info */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Truck className="w-4 h-4 text-red-600" />
                  <span>Opções de Entrega & Pagamento</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    • Taxa de entrega estimada:{' '}
                    <span className="font-bold text-slate-900">
                      {product.deliveryCost > 0 ? formatKz(product.deliveryCost) : 'Grátis'}
                    </span>
                  </p>
                  {product.acceptsCashOnDelivery && (
                    <p className="text-emerald-700 font-medium">
                      ✓ Aceita Pagamento na Entrega (Dinheiro ou TPA)
                    </p>
                  )}
                  {product.deliveryNotes && (
                    <p className="text-slate-500 italic text-[11px] mt-1">
                      Nota do vendedor: "{product.deliveryNotes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Affiliate Promotion Banner */}
              {product.affiliateEnabled && product.affiliateCommissionRate && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span>Programa de Afiliados Disponível</span>
                    </span>
                    <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                      Comissão: {Math.round(product.affiliateCommissionRate * 100)}%
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Ganhe <strong className="text-emerald-700 font-bold">{formatKz(Math.round(product.price * product.affiliateCommissionRate))}</strong> por cada venda gerada através do seu link de afiliado!
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        const code = profile?.affiliateCode || 'ANGOLA2026';
                        const link = `${window.location.origin}?ref=${code}&prod=${product.productId}`;
                        navigator.clipboard.writeText(link);
                        setCopiedAff(true);
                        setTimeout(() => setCopiedAff(false), 2000);
                      }}
                      className="flex-1 bg-white hover:bg-slate-50 border border-blue-300 text-blue-900 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>{copiedAff ? 'Link Copiado!' : 'Copiar Link de Afiliado'}</span>
                    </button>
                    <button
                      onClick={() => {
                        const code = profile?.affiliateCode || 'ANGOLA2026';
                        const link = `${window.location.origin}?ref=${code}&prod=${product.productId}`;
                        const msg = `Olá! Recomendo este excelente produto no Mercado Angola: ${product.name} por ${formatKz(product.price)}. Encomenda com segurança: ${link}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Partilhar no WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Descrição do Produto
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white border border-slate-100 p-3 rounded-lg">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions & Quantity */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {product.stock > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-700">Quantidade:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-2 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleWhatsAppTracked}
                  disabled={isGeneratingLead || product.stock <= 0}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                    product.stock > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>
                    {isGeneratingLead ? 'A gerar código de atendimento...' : 'WhatsApp Rastreado (Gera MA-XXXX)'}
                  </span>
                </button>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      product.stock > 0
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-98'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Pagar Direto ao Vendedor</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      product.stock > 0
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-98'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Proteção de Classificados:</strong> Venda direta pelo vendedor. Confirme o código MA- e inspecione o produto antes do pagamento.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
