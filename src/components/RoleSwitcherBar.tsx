import React, { useState } from 'react';
import { useAuth, ADMIN_PRIMARY_EMAIL } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Store,
  ShoppingBag,
  LogIn,
  LogOut,
  Share2,
  Copy,
  Check,
  UserPlus,
  Lock,
  Globe,
  Sparkles
} from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const {
    user,
    profile,
    activeRole,
    switchRole,
    signOutUser,
    isAdmin,
    isAuthenticated,
    openLoginModal,
    openRegisterModal
  } = useAuth();

  const [copiedLink, setCopiedLink] = useState(false);
  const publicShareUrl = 'https://ais-pre-ba7kqsjevij54giguwbx4m-265904619512.europe-west1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="bg-slate-950 text-slate-200 text-xs px-3 py-1.5 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Platform Public Status & Admin Preview Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mercado Angola • Acesso Público</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          {/* Share Public Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            title="Copiar link público para partilhar com clientes, vendedores e afiliados"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Link Público</span>
              </>
            )}
          </button>

          {/* If Logged in as Admin, allow switching view perspective */}
          {isAdmin && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-800">
              <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden md:inline">Vista Admin:</span>
              </span>

              <button
                onClick={() => switchRole('admin')}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Painel Admin
              </button>

              <button
                onClick={() => switchRole('seller')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  activeRole === 'seller'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Empresa
              </button>

              <button
                onClick={() => switchRole('affiliate')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  activeRole === 'affiliate'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Afiliado
              </button>

              <button
                onClick={() => switchRole('driver')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  activeRole === 'driver'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Motorista
              </button>

              <button
                onClick={() => switchRole('buyer')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  activeRole === 'buyer'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Cliente
              </button>
            </div>
          )}
        </div>

        {/* Right: Authentication Status & Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAdmin ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                ></span>
                <span className="text-slate-300 font-medium truncate max-w-44">
                  {profile?.displayName || user?.email}
                </span>

                {isAdmin ? (
                  <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                    Admin
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-sm capitalize">
                    {activeRole === 'seller' ? 'Empresa' : activeRole === 'driver' ? 'Motorista' : activeRole === 'affiliate' ? 'Afiliado' : 'Cliente'}
                  </span>
                )}
              </div>

              <div className="h-3 w-px bg-slate-700"></div>

              <button
                onClick={signOutUser}
                className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer transition-colors"
                title="Terminar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openLoginModal('buyer')}
                className="text-slate-300 hover:text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Entrar</span>
              </button>

              <button
                onClick={() => openRegisterModal('buyer')}
                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
