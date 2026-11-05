import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Banknote,
  ArrowRight,
  TrendingUp,
  MapPin,
  Smartphone,
  Shirt,
  Armchair,
  Sparkle,
  Watch,
  Laptop,
  Dumbbell,
  Baby,
  Package,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from './ProductCard';
import { PRODUCT_CATEGORIES, formatKz } from '../data/angolaData';
import { ProductCategory } from '../types';
import {
  UserPlus,
  Share2,
  Store,
  Briefcase,
  CheckCircle,
  MessageCircle,
  Phone,
  Star,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Wrench
} from 'lucide-react';

interface HomeViewProps {
  onSelectCategory: (category: ProductCategory) => void;
  onExploreAll: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCompanyProfile?: (companyId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-5 h-5" />,
  Shirt: <Shirt className="w-5 h-5" />,
  Armchair: <Armchair className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Watch: <Watch className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Baby: <Baby className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
};

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onExploreAll,
  onNavigateTab,
  onOpenCompanyProfile
}) => {
  const { products, services, companies } = useMarket();
  const { isAuthenticated, openRegisterModal } = useAuth();

  // Published products
  const activeProducts = products.filter((p) => p.status === 'published');
  const featuredProducts = activeProducts.filter((p) => p.featured);
  const recentProducts = [...activeProducts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Active services & verified partner companies
  const activeServices = services.filter((s) => s.status === 'active');
  const verifiedCompanies = companies.filter((c) => c.status === 'active');

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-500/40 text-red-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <span>Plataforma Pública Aberta a Toda a População de Angola</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Marketplace de Produtos & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-amber-200">Serviços em Angola</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            A plataforma comercial completa para particulares, empresas e prestadores de serviços em Angola. Compre com pagamento seguro ou anuncie a sua empresa e serviços com garantia de clientes reais.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('catalog') : onExploreAll()}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Ver Produtos</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('services')}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Serviços em Angola</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => openRegisterModal('buyer')}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </button>
            )}

            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transações em Kwanzas (Kz/AOA)</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 top-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Quick Access Switcher / CTA Grid for Sellers, Companies & Drivers */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab ? onNavigateTab('company_dashboard') : null}
          className="bg-gradient-to-br from-purple-900/10 via-purple-500/5 to-white border border-purple-200/80 hover:border-purple-300 rounded-2xl p-5 cursor-pointer shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Empresas
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
            MERCADO ANGOLA EMPRESAS
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            Crie a sua página empresarial, exiba o seu logótipo, portfólio e capte clientes pelo WhatsApp.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-purple-700 gap-1">
            <span>Registar Empresa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab ? onNavigateTab('services') : null}
          className="bg-gradient-to-br from-blue-900/10 via-blue-500/5 to-white border border-blue-200/80 hover:border-blue-300 rounded-2xl p-5 cursor-pointer shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Serviços
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
            SERVIÇOS EM ANGOLA
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            Limpezas, lavagem de sofás, canalizadores, eletricistas, obras, TI e marketing.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-blue-700 gap-1">
            <span>Explorar Serviços</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab ? onNavigateTab('driver_dashboard') : null}
          className="bg-gradient-to-br from-amber-900/10 via-amber-500/5 to-white border border-amber-200/80 hover:border-amber-300 rounded-2xl p-5 cursor-pointer shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Motoristas
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
            Entrega Mercado Angola
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            2.000 Kz garantidos por entrega ao motorista com verificação de código seguro de 4 dígitos.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-amber-700 gap-1">
            <span>Painel Motorista</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab ? onNavigateTab('affiliate_dashboard') : null}
          className="bg-gradient-to-br from-emerald-900/10 via-emerald-500/5 to-white border border-emerald-200/80 hover:border-emerald-300 rounded-2xl p-5 cursor-pointer shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Afiliados
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
            Comissões & Vendas
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            Partilhe links exclusivos e receba levantamentos em Multicaixa Express sem saldo fictício.
          </p>
          <div className="mt-3 flex items-center text-xs font-bold text-emerald-700 gap-1">
            <span>Aceder ao Painel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* Services in Angola Highlight Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Serviços em Angola em Destaque
              </h2>
              <p className="text-xs text-slate-500">
                Profissionais qualificados para a sua residência ou empresa com orçamento rápido
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('services')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos os serviços</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeServices.slice(0, 3).map((service) => (
            <div
              key={service.serviceId}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-44 bg-slate-100">
                <img
                  src={service.images[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                  {service.pricingType === 'fixed'
                    ? formatKz(service.priceAoa || 0)
                    : service.pricingType === 'starting_at'
                    ? `A partir de ${formatKz(service.priceAoa || 0)}`
                    : 'Sob Orçamento'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">{service.companyName}</span>
                    <CheckCircle className="w-3 h-3 text-blue-600 fill-blue-50" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{service.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${service.whatsappNumber?.replace(/[^0-9]/g, '') || '244923000000'}?text=${encodeURIComponent(
                      `Olá! Vi o serviço "${service.title}" no Mercado Angola e gostaria de mais informações.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab('services')}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Pedir Orçamento</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Partner Companies Showcase */}
      {verifiedCompanies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Empresas Parceiras Verificadas
                </h2>
                <p className="text-xs text-slate-500">
                  Empresas certificadas no Mercado Angola com canais diretos de contacto
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('company_dashboard')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Registar a minha empresa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedCompanies.map((comp) => (
              <div
                key={comp.companyId}
                onClick={() => onOpenCompanyProfile ? onOpenCompanyProfile(comp.companyId) : (onNavigateTab && onNavigateTab('services'))}
                className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <img
                  src={comp.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200'}
                  alt={comp.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                      {comp.name}
                    </h3>
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 block truncate">
                    {comp.category} • {comp.province}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{comp.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-purple-700 font-bold">
                    <span>Ver Serviços & Contactos</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Angola Features Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Pague no Ato da Entrega</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Compre com confiança e realize o pagamento apenas ao receber e inspecionar o produto.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Entregas em 18 Províncias</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Receba no seu domicílio ou combine pontos de encontro seguros e movimentados.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Vendedores Verificados</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Lojas registadas, comissões justas e proteção ativa contra fraudes e anúncios falsos.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Categorias Populares
            </h2>
            <p className="text-xs text-slate-500">Explore produtos por setor em Angola</p>
          </div>
          <button
            onClick={onExploreAll}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl flex flex-col items-center text-center gap-2 transition-all shadow-xs cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-amber-100 group-hover:text-amber-800 text-slate-700 flex items-center justify-center transition-colors">
                {CATEGORY_ICONS[cat.icon] || <Package className="w-5 h-5" />}
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-red-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Destaques da Semana
                </h2>
                <p className="text-xs text-slate-500">Artigos mais procurados e com stock imediato</p>
              </div>
            </div>

            <button
              onClick={onExploreAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
            >
              Ver mais
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Novidades Recentes
              </h2>
              <p className="text-xs text-slate-500">Últimos produtos anunciados em todo o país</p>
            </div>
          </div>

          <button
            onClick={onExploreAll}
            className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
          >
            Ver catálogo completo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </section>

      {/* Safety Notice Box for Angola */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          <span>Guia de Segurança para Compras no Mercado Angola</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <strong className="text-slate-800 block mb-0.5">1. Pontos de Encontro</strong>
            Ao escolher levantamento em mãos, prefira locais públicos movimentados como Belas Shopping, Xyami, ou praças centrais.
          </div>
          <div>
            <strong className="text-slate-800 block mb-0.5">2. Verifique o Artigo</strong>
            Abra a encomenda, ligue o dispositivo eletrónico ou teste o calçado antes de entregar o dinheiro ao estafeta.
          </div>
          <div>
            <strong className="text-slate-800 block mb-0.5">3. Sem Transferências Antecipadas</strong>
            Nunca faça transferências antecipadas a vendedores desconhecidos sem confirmação de envio.
          </div>
        </div>
      </section>
    </div>
  );
};
