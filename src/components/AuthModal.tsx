import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Store,
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ANGOLA_PROVINCES } from '../data/angolaData';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    registerUser,
    loginUser,
    signInGoogle,
    authModalDefaultRole
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode || 'register');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('Luanda');
  const [municipality, setMunicipality] = useState('Talatona');
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | 'affiliate' | 'driver'>('buyer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (authModalMode) {
      setActiveTab(authModalMode);
    }
    if (authModalDefaultRole && authModalDefaultRole !== 'admin') {
      setSelectedRole(authModalDefaultRole);
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalMode, authModalDefaultRole, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Por favor, indica o teu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, indica um endereço de e-mail válido.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Por favor, indica o teu número de telefone em Angola.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As palavras-passe não coincidem.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('Deves aceitar os termos de utilização da plataforma.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        province,
        municipality,
        role: selectedRole,
        password
      });

      if (res.success) {
        setSuccessMessage('Conta criada com sucesso! Bem-vindo ao Mercado Angola.');
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Erro ao criar conta. Tenta novamente.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao criar conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMessage('Por favor, introduz um e-mail válido.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor, introduz a tua palavra-passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(loginEmail.trim().toLowerCase(), loginPassword);
      if (res.success) {
        setSuccessMessage('Sessão iniciada com sucesso!');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifica o teu e-mail e palavra-passe.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao iniciar sessão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInGoogle();
      setSuccessMessage('Autenticação Google concluída com sucesso!');
      setTimeout(() => {
        closeAuthModal();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Não foi possível autenticar com o Google. Utiliza o registo por e-mail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdminLogin = () => {
    setLoginEmail('dembedomingos236@gmail.com');
    setLoginPassword('AdminAngola2026!');
    setActiveTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/20">
              AO
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-snug">
                Mercado<span className="text-amber-300">Angola</span>
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {activeTab === 'register' ? 'Criar Conta de Acesso Público' : 'Iniciar Sessão na Tua Conta'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Nova Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Já Tenho Conta (Entrar)
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Notifications / Alerts */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'register' ? (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Como pretendes participar no Mercado Angola?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'buyer'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <ShoppingBag className={`w-4 h-4 mb-1.5 ${selectedRole === 'buyer' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Cliente</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Fazer compras</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'seller'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Store className={`w-4 h-4 mb-1.5 ${selectedRole === 'seller' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Empresa</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Vender produtos</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('affiliate')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'affiliate'
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Share2 className={`w-4 h-4 mb-1.5 ${selectedRole === 'affiliate' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Afiliado</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Comissões</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('driver')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'driver'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Truck className={`w-4 h-4 mb-1.5 ${selectedRole === 'driver' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">Motorista</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Entregas 2.000 Kz</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: João Baptista da Silva"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone & Province row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone (Unitel / Africell) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+244 923 000 000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Província *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                    >
                      {ANGOLA_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço de E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teu-email@exemplo.ao"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Palavra-passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmar Palavra-passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repete a palavra-passe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Terms check */}
              <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 mt-0.5"
                />
                <span>
                  Li e aceito os Termos de Utilização, Política de Privacidade e Regras de Segurança do Mercado Angola.
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A criar conta no Mercado Angola...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Minha Conta Gratuita</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail Registado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="teu-email@exemplo.ao"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Palavra-passe</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Introduz a tua palavra-passe"
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A validar credenciais...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Mercado Angola</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Fast Admin Button for the Owner */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Sou o Administrador (dembedomingos236@gmail.com)</span>
                </button>
              </div>
            </form>
          )}

          {/* Alternative Auth Provider: Google */}
          <div className="pt-3">
            <div className="relative flex items-center justify-center mb-3">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2 text-[11px] text-slate-400 font-medium absolute">ou</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-2 px-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>
          </div>

          {/* Security footnote */}
          <div className="pt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Dados encriptados • Permissões rigorosas por perfil</span>
          </div>
        </div>
      </div>
    </div>
  );
};
