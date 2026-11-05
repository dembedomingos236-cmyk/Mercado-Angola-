import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from './ProductCard';

interface FavoritesViewProps {
  onExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onExplore }) => {
  const { products, favorites } = useMarket();

  const favoriteProducts = products.filter((p) => favorites.includes(p.productId));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Meus Favoritos</h1>
          <p className="text-xs text-slate-500">
            {favoriteProducts.length} artigos guardados para comprar mais tarde
          </p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">A sua lista de favoritos está vazia</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Clique no ícone de coração nos produtos para guardar os seus artigos preferidos aqui.
          </p>
          <button
            onClick={onExplore}
            className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Explorar Produtos em Angola
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
