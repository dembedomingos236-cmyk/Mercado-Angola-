import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatKz } from '../data/angolaData';

export const CartModal: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    sellerGroups,
    subtotal,
    platformFeeAmount,
    deliveryFeeTotal,
    driverFeeTotal,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    setIsCheckoutOpen,
    deliveryType,
    setDeliveryType,
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-lg">Meu Carrinho</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {itemCount} {itemCount === 1 ? 'artigo' : 'artigos'}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {itemCount === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">O seu carrinho está vazio</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore os melhores produtos de vendedores de toda Angola e adicione ao seu carrinho.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Continuar a Comprar
              </button>
            </div>
          ) : (
            <>
              {/* Delivery method selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Modo de Entrega:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDeliveryType('domicilio')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      deliveryType === 'domicilio'
                        ? 'border-amber-500 bg-amber-50/50 font-semibold text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-slate-900 mb-0.5">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ao Domicílio</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Entrega no seu endereço</span>
                  </button>

                  <button
                    onClick={() => setDeliveryType('ponto_encontro')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      deliveryType === 'ponto_encontro'
                        ? 'border-amber-500 bg-amber-50/50 font-semibold text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-slate-900 mb-0.5">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ponto Acordado</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold">Grátis (Levantamento)</span>
                  </button>
                </div>
              </div>

              {/* Items grouped per seller */}
              <div className="space-y-4">
                {sellerGroups.map((group) => (
                  <div
                    key={group.sellerId}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    {/* Seller header */}
                    <div className="bg-slate-100/70 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Store className="w-3.5 h-3.5 text-red-600" />
                        <span>Loja: {group.storeName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Entrega:{' '}
                        {group.deliveryFee > 0 ? formatKz(group.deliveryFee) : 'Grátis'}
                      </span>
                    </div>

                    {/* Products in this group */}
                    <div className="divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <div key={item.product.productId} className="p-3 flex gap-3 items-center">
                          <img
                            src={
                              item.product.images[0] ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
                            }
                            alt=""
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-slate-900 truncate">
                              {item.product.name}
                            </h4>
                            <span className="text-xs font-bold text-slate-900 block mt-0.5">
                              {formatKz(item.product.price)}
                            </span>
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center border border-slate-200 rounded-md">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.productId, item.quantity - 1)
                              }
                              className="p-1 hover:bg-slate-100 text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.productId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Delete item */}
                          <button
                            onClick={() => removeFromCart(item.product.productId)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer & Checkout Action */}
        {itemCount > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Preço dos produtos (Vendedor):</span>
                <span className="font-semibold text-slate-900">{formatKz(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa da plataforma (5%):</span>
                <span className="font-semibold text-amber-600">+{formatKz(platformFeeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega Mercado Angola:</span>
                <span className="font-semibold text-slate-900">
                  {deliveryFeeTotal > 0 ? (
                    <span>
                      +{formatKz(deliveryFeeTotal)}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        (Motorista 2.000 Kz + Logística 1.000 Kz)
                      </span>
                    </span>
                  ) : (
                    'Grátis (Ponto de Encontro)'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Total a Pagar pelo Cliente:</span>
                <span className="text-amber-600">{formatKz(total)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Avançar para Encomenda</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <button
                onClick={clearCart}
                className="hover:text-red-600 transition-colors cursor-pointer"
              >
                Esvaziar carrinho
              </button>
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3 h-3" /> Compra Segura Mercado Angola
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
