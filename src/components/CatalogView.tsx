import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Tag,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from './ProductCard';
import { ANGOLA_PROVINCES, PRODUCT_CATEGORIES, formatKz } from '../data/angolaData';
import { ProductCategory, ProductCondition } from '../types';

interface CatalogViewProps {
  initialCategory?: ProductCategory | string;
  initialSearch?: string;
  initialProvince?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory = '',
  initialSearch = '',
  initialProvince = '',
}) => {
  const { products } = useMarket();

  // Filter states
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [onlyVerifiedStores, setOnlyVerifiedStores] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyCOD, setOnlyCOD] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { stores } = useMarket();

  // Selected province municipalities
  const activeProvinceObj = useMemo(() => {
    return ANGOLA_PROVINCES.find((p) => p.name === selectedProvince);
  }, [selectedProvince]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'published')
      .filter((p) => {
        // Search term
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchStore = p.storeName.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchStore) return false;
        }

        // Category
        if (selectedCategory && p.category !== selectedCategory) {
          return false;
        }

        // Province
        if (selectedProvince && p.province !== selectedProvince) {
          return false;
        }

        // Municipality
        if (selectedMunicipality && p.municipality && p.municipality !== selectedMunicipality) {
          return false;
        }

        // Only verified stores
        if (onlyVerifiedStores) {
          const store = stores.find((s) => s.storeId === p.sellerId || s.name === p.storeName);
          if (!store?.isVerified) return false;
        }

        // Condition
        if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
          return false;
        }

        // Price range
        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;

        // Cash on Delivery
        if (onlyCOD && !p.acceptsCashOnDelivery) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    products,
    stores,
    search,
    selectedCategory,
    selectedProvince,
    selectedMunicipality,
    onlyVerifiedStores,
    selectedCondition,
    minPrice,
    maxPrice,
    onlyCOD,
    sortBy,
  ]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setOnlyCOD(false);
    setSortBy('recent');
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    Boolean(selectedProvince) ||
    selectedCondition !== 'all' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    onlyCOD;

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Sorting row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Catálogo de Produtos em Angola
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mostrando <strong>{filteredProducts.length}</strong> produtos disponíveis em Kwanzas
          </p>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
            )}
          </button>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="recent">Mais Recentes</option>
              <option value="price_asc">Menor Preço (Kz)</option>
              <option value="price_desc">Maior Preço (Kz)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Sidebar Filters (Desktop & Collapsible Mobile) */}
        <aside
          className={`space-y-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs ${
            showMobileFilters ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-red-600" />
              <span>Filtrar Resultados</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
            >
              <option value="">Todas as Categorias</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Province filter */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block">Província em Angola</label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedMunicipality('');
              }}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
            >
              <option value="">Todas as 18 Províncias</option>
              {ANGOLA_PROVINCES.map((prov) => (
                <option key={prov.name} value={prov.name}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* Municipality filter (Dynamic) */}
          {activeProvinceObj && activeProvinceObj.municipalities.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">
                Município em {activeProvinceObj.name}
              </label>
              <select
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
              >
                <option value="">Todos os Municípios</option>
                {activeProvinceObj.municipalities.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Condition filter */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block">Condição do Artigo</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'novo', label: 'Novo' },
                { id: 'usado', label: 'Usado' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCondition(c.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedCondition === c.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block">Intervalo de Preço (Kz)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min Kz"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max Kz"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
              />
            </div>
          </div>

          {/* Verified Stores filter */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={onlyVerifiedStores}
                onChange={(e) => setOnlyVerifiedStores(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="flex items-center gap-1">
                <span>Apenas</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  ✓ Lojas Verificadas
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={onlyCOD}
                onChange={(e) => setOnlyCOD(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Pagamento na Entrega</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                  Nenhum produto ainda, seja o primeiro vendedor
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Não foram encontrados artigos com os filtros atuais. Pode ajustar a sua pesquisa ou registar a sua loja e começar a vender agora no Mercado Angola.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
