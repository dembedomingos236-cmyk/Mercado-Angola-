import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  FileText,
  LogOut,
  Store,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ANGOLA_PROVINCES } from '../data/angolaData';
import { AffiliateOnboardingModal } from './AffiliateOnboardingModal';
import { TermsConditionsModal } from './TermsConditionsModal';

export const UserProfileView: React.FC = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const {
    profile,
    updateProfileDetails,
    activeRole,
    switchRole,
    signOutUser,
    user,
    isAuthenticated,
    openLoginModal,
    openRegisterModal
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '+244 ');
  const [province, setProvince] = useState(profile?.province || 'Luanda');
  const [municipality, setMunicipality] = useState(profile?.municipality || 'Talatona');
  const [address, setAddress] = useState(profile?.address || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhoneNumber(profile.phoneNumber || '+244 ');
      setProvince(profile.province || 'Luanda');
      setMunicipality(profile.municipality || 'Talatona');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const activeProvObj = ANGOLA_PROVINCES.find((p) => p.name === province) || ANGOLA_PROVINCES[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openRegisterModal('buyer');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfileDetails({
        displayName,
        phoneNumber,
        province,
        municipality,
        address,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Falha ao guardar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-16">
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Estás a navegar como visitante</h2>
            <p className="text-xs text-white/80 mt-0.5">
              Cria uma conta gratuita ou entra para guardar os teus dados de entrega e acompanhar pedidos no Mercado Angola.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => openLoginModal('buyer')}
              className="px-3 py-1.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Iniciar Sessão
            </button>
            <button
              onClick={() => openRegisterModal('buyer')}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Criar Conta
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Meu Perfil</h1>
            <p className="text-xs text-slate-500">
              {profile?.email || (isAuthenticated ? user?.email : 'Visitante Público')} • Função:{' '}
              <span className="font-bold uppercase text-red-600">{activeRole}</span>
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={signOutUser}
            className="text-xs text-slate-500 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        )}
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
      >
        <h3 className="font-bold text-slate-900 text-sm">Dados Pessoais & Localização</h3>

        {isSaved && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-3 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Perfil atualizado com sucesso!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Telemóvel (+244)</label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Província</label>
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                const match = ANGOLA_PROVINCES.find((p) => p.name === e.target.value);
                if (match && match.municipalities.length > 0) {
                  setMunicipality(match.municipalities[0]);
                }
              }}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
            >
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Município</label>
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
            >
              {activeProvObj.municipalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Morada habitual (Bairro, Rua, Ponto de Referência)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSaving ? 'A guardar...' : 'Guardar Alterações'}</span>
          </button>
        </div>
      </form>

      {/* Affiliate Program & Commission Terms Section */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-900/60 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Programa de Afiliados Mercado Angola</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  100% Gratuito
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ganhe comissões automáticas em Kwanzas (Kz) divulgando produtos reais de empresas angolanas.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{profile?.affiliateOnboardingCompleted ? 'Rever Termos & Gerar Link' : 'Onboarding de Afiliado'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-blue-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Taxas Transparentes</span>
            <span className="text-white font-medium">5% retido da venda • 0% taxa de serviço sobre o afiliado</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-blue-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Seu Código de Afiliado</span>
            <span className="font-mono text-amber-400 font-bold text-sm">{profile?.affiliateCode || 'ANGOLA2026'}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-blue-900/40">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Levantamentos Bancários</span>
            <span className="text-emerald-400 font-medium">BAI, BFA, BIC, Atlântico, BPC e MULTICAIXA Express</span>
          </div>
        </div>
      </div>

      {/* Affiliate Onboarding Modal */}
      <AffiliateOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Privacy Policy & Terms of Service in Portuguese */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span>Termos de Utilização & Política de Privacidade em Angola</span>
        </div>

        <div className="space-y-2 text-slate-600 leading-relaxed">
          <p>
            <strong>1. Privacidade e Proteção de Dados:</strong> O Mercado Angola não comercializa nem partilha dados privados com terceiros. Apenas partilhamos as informações estritamente necessárias para a entrega acordada (nome, telefone e local de entrega).
          </p>
          <p>
            <strong>2. Proteção de Credenciais Bancárias:</strong> O Mercado Angola nunca recolhe PINs, códigos de autorização bancária ou palavras-passe de contas. Todos os pagamentos por referência MULTICAIXA são processados diretamente na rede EMIS/Bancos oficiais.
          </p>
          <p>
            <strong>3. Responsabilidade de Compra e Venda:</strong> É proibida a publicação de artigos ilegais segundo as leis da República de Angola. Os compradores têm o direito de inspecionar os artigos antes do pagamento no ato da entrega.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Consultar Termos & Condições de Classificados (Legislação Angolana)</span>
          </button>
        </div>
      </div>

      <TermsConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
};
