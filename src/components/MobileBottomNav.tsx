import React from 'react';
import { Home, Grid, Briefcase, Share2, Heart, User, LogIn } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { favorites } = useMarket();
  const { isAdmin, isAuthenticated, openLoginModal } = useAuth();

  return (
    <nav
      id="mercado-angola-bottom-nav"
      data-nav="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-[99999] h-[70px] bg-white border-t border-slate-200 px-1.5 flex items-center justify-around shadow-2xl select-none"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '70px',
        backgroundColor: '#ffffff',
        pointerEvents: 'auto',
      }}
    >
      {/* 1. INÍCIO */}
      <button
        type="button"
        onClick={() => setCurrentTab('home')}
        className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors cursor-pointer ${
          currentTab === 'home' ? 'text-red-600 font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] font-medium leading-none">Início</span>
      </button>

      {/* 2. PRODUTOS */}
      <button
        type="button"
        onClick={() => setCurrentTab('catalog')}
        className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors cursor-pointer ${
          currentTab === 'catalog' ? 'text-red-600 font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] font-medium leading-none">Produtos</span>
      </button>

      {/* 3. SERVIÇOS */}
      <button
        type="button"
        onClick={() => setCurrentTab('services')}
        className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors cursor-pointer ${
          currentTab === 'services' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Briefcase className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] font-medium leading-none">Serviços</span>
      </button>

      {/* 4. AFILIADO (Destaque Central) */}
      <button
        type="button"
        onClick={() => setCurrentTab('affiliate_dashboard')}
        className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors cursor-pointer group ${
          currentTab === 'affiliate_dashboard'
            ? 'text-amber-500 font-black'
            : 'text-slate-800 hover:text-amber-600'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
          <Share2 className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">
          AFILIADO
        </span>
      </button>

      {/* 5. FAVORITOS */}
      <button
        type="button"
        onClick={() => setCurrentTab('favorites')}
        className={`flex-1 relative flex flex-col items-center justify-center h-full py-1 transition-colors cursor-pointer ${
          currentTab === 'favorites' ? 'text-red-600 font-bold' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5 mb-0.5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium leading-none">Favoritos</span>
      </button>

      {/* 6. CONTA */}
      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            openLoginModal('buyer');
          } else if (isAdmin && currentTab === 'admin_dashboard') {
            setCurrentTab('admin_dashboard');
          } else {
            setCurrentTab('profile');
          }
        }}
        className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-colors cursor-pointer ${
          currentTab === 'profile' || currentTab === 'admin_dashboard'
            ? 'text-red-600 font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {isAuthenticated ? (
          <User className="w-5 h-5 mb-0.5" />
        ) : (
          <LogIn className="w-5 h-5 mb-0.5 text-amber-500" />
        )}
        <span className="text-[11px] font-medium leading-none">
          {isAuthenticated ? 'Conta' : 'Entrar'}
        </span>
      </button>
    </nav>
  );
};
