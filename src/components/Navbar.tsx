import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  MapPin,
  Heart,
  Package,
  Store,
  ShieldAlert,
  Menu,
  X,
  GraduationCap,
  PhoneCall,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { ANGOLA_PROVINCES } from '../data/angolaData';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedProvince: string;
  setSelectedProvince: (prov: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchTerm,
  setSearchTerm,
  selectedProvince,
  setSelectedProvince,
}) => {
  const { itemCount, setIsCartOpen } = useCart();
  const {
    activeRole,
    profile,
    user,
    isAdmin,
    isAuthenticated,
    openLoginModal,
    openRegisterModal,
    signOutUser
  } = useAuth();
  const { favorites } = useMarket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-slate-900 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                AO
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight flex items-center gap-1">
                  Mercado<span className="text-red-600">Angola</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block -mt-1">
                  Compras & Vendas • Kz
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar & Province (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar telemóveis, roupas, electrodomésticos..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Province Picker */}
            <div className="relative">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="">Todas Províncias</option>
                  {ANGOLA_PROVINCES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'home'
                    ? 'text-red-600 bg-red-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => setCurrentTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'catalog'
                    ? 'text-red-600 bg-red-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setCurrentTab('services')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'services'
                    ? 'text-blue-700 bg-blue-50 font-bold'
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50/50'
                }`}
              >
                <span>Serviços em Angola</span>
                <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full uppercase font-black">
                  Novo
                </span>
              </button>
              <button
                onClick={() => setCurrentTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  currentTab === 'orders'
                    ? 'text-red-600 bg-red-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Encomendas</span>
              </button>
              <button
                onClick={() => setCurrentTab('company_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  currentTab === 'company_dashboard'
                    ? 'text-purple-700 bg-purple-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-purple-600" />
                <span>Painel Empresa</span>
              </button>
              <button
                onClick={() => setCurrentTab('driver_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  currentTab === 'driver_dashboard'
                    ? 'text-amber-700 bg-amber-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Entregas</span>
              </button>
              <button
                onClick={() => setCurrentTab('academy')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'academy'
                    ? 'text-red-600 bg-red-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-red-600" />
                <span>Academia</span>
              </button>
            </nav>

            {/* Admin Exclusive Dashboard Link */}
            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin_dashboard')}
                className="hidden sm:flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Painel Central do Administrador Principal"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Painel Admin</span>
              </button>
            )}

            {/* Favorites Icon */}
            <button
              onClick={() => setCurrentTab('favorites')}
              className="relative p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {itemCount > 0 && (
                <span className="bg-slate-950 text-amber-400 text-xs font-bold px-1.5 py-0.2 rounded-full min-w-5 text-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {(profile?.displayName || user?.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{profile?.displayName || user?.email}</p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {isAdmin ? 'Administrador Principal' : profile?.role || 'Cliente'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Meu Perfil</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span>Minhas Encomendas</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentTab('admin_dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-700 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Painel do Administrador</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        signOutUser();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openLoginModal('buyer')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openRegisterModal('buyer')}
                  className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Criar Conta
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Province row */}
        <div className="md:hidden pb-3 pt-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar em Angola..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
            />
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mr-1" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold text-slate-800 focus:outline-none max-w-24 truncate cursor-pointer"
            >
              <option value="">Província</option>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 bg-white">
            {!isAuthenticated && (
              <div className="p-2 mb-2 bg-slate-50 rounded-xl flex gap-2 border border-slate-200">
                <button
                  onClick={() => {
                    openLoginModal('buyer');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg text-center"
                >
                  Iniciar Sessão
                </button>
                <button
                  onClick={() => {
                    openRegisterModal('buyer');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-lg text-center shadow-xs"
                >
                  Criar Conta
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Página Inicial
            </button>
            <button
              onClick={() => {
                setCurrentTab('catalog');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Explorar Catálogo de Produtos
            </button>
            <button
              onClick={() => {
                setCurrentTab('orders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Minhas Encomendas
            </button>
            <button
              onClick={() => {
                setCurrentTab('affiliate_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Programa de Afiliados
            </button>
            <button
              onClick={() => {
                setCurrentTab('academy');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Academia de Vendas e Marketing</span>
              <GraduationCap className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => {
                setCurrentTab('contact_admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Contactar o Administrador</span>
              <PhoneCall className="w-4 h-4 text-amber-600" />
            </button>
            <button
              onClick={() => {
                setCurrentTab('seller_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-emerald-800 hover:bg-emerald-50 flex items-center justify-between"
            >
              <span>Painel do Vendedor</span>
              <Store className="w-4 h-4 text-emerald-600" />
            </button>

            {/* ONLY DISPLAYED TO THE ADMINISTRATOR */}
            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentTab('admin_dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-red-800 hover:bg-red-50 flex items-center justify-between border-t border-red-100 mt-2"
              >
                <span>Painel de Administração (Exclusivo)</span>
                <ShieldAlert className="w-4 h-4 text-red-600" />
              </button>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    signOutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminar Sessão ({user?.email})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
