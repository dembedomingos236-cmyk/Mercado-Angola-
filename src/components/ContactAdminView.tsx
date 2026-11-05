import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  Send,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { OFFICIAL_ADMIN_CONTACTS, contactService } from '../services/contactService';
import { useAuth } from '../context/AuthContext';

interface ContactAdminViewProps {
  onNavigateHome?: () => void;
}

export const ContactAdminView: React.FC<ContactAdminViewProps> = ({ onNavigateHome }) => {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'geral' | 'parcerias'>('geral');
  const [senderName, setSenderName] = useState(profile?.displayName || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [senderPhone, setSenderPhone] = useState(profile?.phoneNumber || '');
  const [userType, setUserType] = useState<'cliente' | 'empresa' | 'vendedor' | 'afiliado'>(
    profile?.role === 'seller' ? 'vendedor' : profile?.role === 'affiliate' ? 'afiliado' : 'cliente'
  );
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!senderName.trim() || !senderEmail.trim() || !subject.trim() || !content.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await contactService.submitContactMessage({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim(),
        userType,
        subject: subject.trim(),
        content: content.trim()
      });

      if (res.success) {
        setSubmittedSuccess(true);
        setContent('');
        setSubject('');
      } else {
        setErrorMessage(res.error || 'Erro ao enviar mensagem.');
      }
    } catch (err: any) {
      setErrorMessage('Ocorreu um erro ao comunicar com os serviços da plataforma.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/${OFFICIAL_ADMIN_CONTACTS.whatsappNumber}?text=${encodeURIComponent(
    'Olá! Entrei em contacto através da plataforma Mercado Angola e gostaria de falar com a administração.'
  )}`;

  const emailSubject = encodeURIComponent(
    activeTab === 'parcerias'
      ? 'Interesse em Parceria Comercial — Mercado Angola'
      : 'Contacto com a Administração — Mercado Angola'
  );
  const mailtoUrl = `mailto:${OFFICIAL_ADMIN_CONTACTS.email}?subject=${emailSubject}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-red-600 via-yellow-600 to-black text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-yellow-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Canal Oficial e Direto
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            Contactar o Administrador
          </h1>
          <p className="text-yellow-100 text-sm sm:text-base leading-relaxed">
            Linha direta e oficial da administração do Mercado Angola. Suporte a parceiros, vendedores, afiliados e clientes em todo o território nacional.
          </p>
        </div>
      </div>

      {/* Welcome & Partnership Notice Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Welcome message */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold mb-2">
            <MessageCircle className="w-5 h-5 text-amber-600" />
            <span>Mensagem de Boas-Vindas da Administração</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950/80 italic leading-relaxed bg-white/60 p-4 rounded-xl border border-amber-100">
            "{OFFICIAL_ADMIN_CONTACTS.welcomeMessage}"
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Horário de Atendimento: {OFFICIAL_ADMIN_CONTACTS.supportHours}</span>
          </div>
        </div>

        {/* Partnership message */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-900 font-bold mb-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Contactos para Empresas e Parcerias</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950/80 italic leading-relaxed bg-white/60 p-4 rounded-xl border border-emerald-100">
            "{OFFICIAL_ADMIN_CONTACTS.partnershipMessage}"
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Sede Operacional: {OFFICIAL_ADMIN_CONTACTS.location}</span>
          </div>
        </div>
      </div>

      {/* Official Quick Contact Cards */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-600" />
          Contactos Oficiais Disponíveis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unitel */}
          <div className="bg-white rounded-xl border-2 border-red-100 hover:border-red-400 p-5 transition shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase">
                Rede Unitel
              </span>
              <p className="text-xl font-black text-gray-900 mt-2">{OFFICIAL_ADMIN_CONTACTS.unitelPhone}</p>
              <p className="text-xs text-gray-500 mt-1">Chamadas de voz e suporte direto</p>
            </div>
            <a
              href={`tel:${OFFICIAL_ADMIN_CONTACTS.unitelPhoneRaw}`}
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
            >
              <Phone className="w-4 h-4" /> Ligar Unitel
            </a>
          </div>

          {/* Africell */}
          <div className="bg-white rounded-xl border-2 border-purple-100 hover:border-purple-400 p-5 transition shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 uppercase">
                Rede Africell
              </span>
              <p className="text-xl font-black text-gray-900 mt-2">{OFFICIAL_ADMIN_CONTACTS.africellPhone}</p>
              <p className="text-xs text-gray-500 mt-1">Linha móvel alternativa</p>
            </div>
            <a
              href={`tel:${OFFICIAL_ADMIN_CONTACTS.africellPhoneRaw}`}
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition"
            >
              <Phone className="w-4 h-4" /> Ligar Africell
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-xl border-2 border-emerald-100 hover:border-emerald-400 p-5 transition shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
                WhatsApp Oficial
              </span>
              <p className="text-xl font-black text-gray-900 mt-2">{OFFICIAL_ADMIN_CONTACTS.unitelPhone}</p>
              <p className="text-xs text-gray-500 mt-1">Mensagens instantâneas e apoio</p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
            </a>
          </div>

          {/* E-mail */}
          <div className="bg-white rounded-xl border-2 border-blue-100 hover:border-blue-400 p-5 transition shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase">
                Correio Eletrónico
              </span>
              <p className="text-sm font-black text-gray-900 mt-2 break-all">{OFFICIAL_ADMIN_CONTACTS.email}</p>
              <p className="text-xs text-gray-500 mt-1">Propostas formais e apoio</p>
            </div>
            <a
              href={mailtoUrl}
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
            >
              <Mail className="w-4 h-4" /> Enviar E-mail
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Contact & Inquiry Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Envie uma Mensagem Direta à Administração
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-6">
            A sua solicitação será registada no painel administrativo e a equipa receberá uma notificação prioritária em tempo real.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center max-w-xl mx-auto my-6 animate-scale-up">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-emerald-950 mb-1">
              Mensagem Registada com Sucesso!
            </h3>
            <p className="text-sm text-emerald-800 mb-4">
              O administrador foi notificado de imediato. Acompanharemos o seu pedido com a maior brevidade possível através dos seus contactos informados.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
              >
                Enviar Outra Mensagem
              </button>
              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  Voltar ao Início
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  O seu Nome ou da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="Ex: Domingos Silva ou Silva & Filhos Lda"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  E-mail de Contacto *
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)}
                  placeholder="seuemail@exemplo.ao"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Telemóvel / WhatsApp (Opcional)
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  placeholder="Ex: 923 000 000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tipo de Utilizador / Perfil *
                </label>
                <select
                  value={userType}
                  onChange={e => setUserType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="empresa">Empresa / Parceiro Comercial</option>
                  <option value="vendedor">Vendedor Registado</option>
                  <option value="afiliado">Afiliado</option>
                  <option value="cliente">Cliente / Comprador</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Assunto da Mensagem *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Ex: Proposta de Parceria de Vendas / Dúvida sobre Comissões"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mensagem Detalhada *
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Descreva a sua proposta, questão ou necessidade..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-y"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Transmissão direta e segura ao administrador
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition"
              >
                {isSubmitting ? (
                  <span>A enviar solicitação...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Enviar para a Administração
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
