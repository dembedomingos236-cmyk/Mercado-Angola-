import React from 'react';
import { Heart, MapPin, Store, CheckCircle, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatKz } from '../data/angolaData';
import { useMarket } from '../context/MarketContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleFavorite, isFavorite, setSelectedProduct, stores } = useMarket();
  const { addToCart } = useCart();
  const fav = isFavorite(product.productId);
  const store = stores.find((s) => s.storeId === product.sellerId || s.name === product.storeName);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.productId);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col h-full relative"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md text-white shadow-xs ${
              product.condition === 'novo' ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            {product.condition === 'novo' ? 'Novo' : 'Usado'}
          </span>
          {product.featured && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-xs">
              Destaque
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-xs transition-colors cursor-pointer ${
            fav
              ? 'bg-red-500 text-white'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-red-500'
          }`}
          title={fav ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Cash on delivery tag */}
        {product.acceptsCashOnDelivery && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Paga no ato da entrega</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Store Name, Verified Badge & Location */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 gap-1">
            <div className="flex items-center gap-1 font-medium text-slate-700 truncate">
              <Store className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.storeName}</span>
              {store?.isVerified && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                  ✓ VERIFICADA
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>{product.province}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>

          {/* Legal Notice */}
          <p className="text-[10px] text-slate-600 mt-1 font-medium">
            Venda direta pelo vendedor.
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Preço</span>
            <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
              {formatKz(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer ${
              product.stock > 0
                ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Adicionar ao Carrinho"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
