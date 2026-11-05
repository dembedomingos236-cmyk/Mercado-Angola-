import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { MarketProvider, useMarket } from './context/MarketContext';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { BuyerOrdersView } from './components/BuyerOrdersView';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { FavoritesView } from './components/FavoritesView';
import { UserProfileView } from './components/UserProfileView';
import { AffiliateDashboard } from './components/AffiliateDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { MulticaixaSimulatorModal } from './components/MulticaixaSimulatorModal';
import { ChatModal } from './components/ChatModal';
import { ReportModal } from './components/ReportModal';
import { ProductCategory } from './types';
import { Heart, ShieldCheck, ShoppingBag, Briefcase, Truck } from 'lucide-react';
import { AcademyView } from './components/AcademyView';
import { ContactAdminView } from './components/ContactAdminView';
import { AuthModal } from './components/AuthModal';
import { ServicesMarketplace } from './components/ServicesMarketplace';
import { CompanySellerDashboard } from './components/CompanySellerDashboard';
import { DriverDeliveryDashboard } from './components/DriverDeliveryDashboard';
import { CompanyProfileModal } from './components/CompanyProfileModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<ProductCategory | string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  const { activeRole, isAdmin } = useAuth();
  const { selectedProduct, setSelectedProduct } = useMarket();

  // Guard admin_dashboard navigation: strictly allow only verified admin
  React.useEffect(() => {
    if (currentTab === 'admin_dashboard' && !isAdmin) {
      setCurrentTab('home');
    }
  }, [currentTab, isAdmin]);

  // Switch tab when user changes role via RoleSwitcherBar
  const prevRoleRef = React.useRef(activeRole);
  React.useEffect(() => {
    if (prevRoleRef.current !== activeRole) {
      prevRoleRef.current = activeRole;
      if (activeRole === 'affiliate') setCurrentTab('affiliate_dashboard');
      else if (activeRole === 'seller') setCurrentTab('company_dashboard');
      else if (activeRole === 'driver') setCurrentTab('driver_dashboard');
      else if (activeRole === 'admin' && isAdmin) setCurrentTab('admin_dashboard');
      else if (activeRole === 'buyer') setCurrentTab('home');
    }
  }, [activeRole, isAdmin]);

  const handleSelectCategory = (cat: ProductCategory) => {
    setFilterCategory(cat);
    setCurrentTab('catalog');
  };

  const handleExploreAll = () => {
    setFilterCategory('');
    setSearchTerm('');
    setCurrentTab('catalog');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Informative Persona & Role Switcher Bar */}
      <RoleSwitcherBar />

      {/* Primary Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'catalog') {
            setFilterCategory('');
          }
        }}
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          if (term && currentTab !== 'catalog') {
            setCurrentTab('catalog');
          }
        }}
        selectedProvince={selectedProvince}
        setSelectedProvince={(prov) => {
          setSelectedProvince(prov);
          if (prov && currentTab !== 'catalog') {
            setCurrentTab('catalog');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'home' && (
          <HomeView
            onSelectCategory={handleSelectCategory}
            onExploreAll={handleExploreAll}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenCompanyProfile={(companyId) => setSelectedCompanyId(companyId)}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogView
            initialCategory={filterCategory}
            initialSearch={searchTerm}
            initialProvince={selectedProvince}
          />
        )}

        {currentTab === 'services' && (
          <ServicesMarketplace
            onOpenCompanyProfile={(companyId) => setSelectedCompanyId(companyId)}
          />
        )}

        {currentTab === 'company_dashboard' && <CompanySellerDashboard />}

        {currentTab === 'driver_dashboard' && <DriverDeliveryDashboard />}

        {currentTab === 'orders' && <BuyerOrdersView />}

        {currentTab === 'affiliate_dashboard' && <AffiliateDashboard />}

        {currentTab === 'seller_dashboard' && <SellerDashboard />}

        {currentTab === 'admin_dashboard' && <AdminDashboard />}

        {currentTab === 'academy' && (
          <AcademyView onContactAdmin={() => setCurrentTab('contact_admin')} />
        )}

        {currentTab === 'contact_admin' && (
          <ContactAdminView onNavigateHome={() => setCurrentTab('home')} />
        )}

        {currentTab === 'favorites' && (
          <FavoritesView onExplore={handleExploreAll} />
        )}

        {currentTab === 'profile' && <UserProfileView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 via-amber-500 to-slate-900 flex items-center justify-center text-white font-black">
                AO
              </div>
              <span className="font-extrabold text-base text-white">
                Mercado<span className="text-red-500">Angola</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400 flex-wrap">
              <button
                onClick={() => setCurrentTab('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Início
              </button>
              <button
                onClick={() => setCurrentTab('catalog')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Produtos
              </button>
              <button
                onClick={() => setCurrentTab('services')}
                className="hover:text-blue-400 text-blue-400 font-bold transition-colors cursor-pointer"
              >
                Serviços em Angola
              </button>
              <button
                onClick={() => setCurrentTab('company_dashboard')}
                className="hover:text-white transition-colors cursor-pointer text-purple-300 font-semibold"
              >
                Registar / Painel Empresa
              </button>
              <button
                onClick={() => setCurrentTab('driver_dashboard')}
                className="hover:text-white transition-colors cursor-pointer text-amber-300 font-semibold"
              >
                Painel Motorista
              </button>
              <button
                onClick={() => setCurrentTab('academy')}
                className="hover:text-white transition-colors cursor-pointer text-yellow-400 font-semibold"
              >
                Academia de Vendas
              </button>
              <button
                onClick={() => setCurrentTab('contact_admin')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contactar Administrador
              </button>
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer text-amber-300 font-semibold"
              >
                Termos & Privacidade (Classificados)
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transações em Kwanzas (Kz/AOA)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Mercado Angola. Todos os direitos reservados na República de Angola.</p>
            <p>Marketplace de Produtos, Serviços em Angola, Pagamento Multicaixa & Entregas Seguras</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Global Interactive Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CompanyProfileModal
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
      />
      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <CartModal />
      <CheckoutModal />
      <MulticaixaSimulatorModal />
      <ChatModal />
      <ReportModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MarketProvider>
          <MainApp />
        </MarketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
