import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Share2,
  Copy,
  Check,
  Send,
  Building2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
  ExternalLink,
  Smartphone,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { ANGOLAN_BANKS, formatKz } from '../data/angolaData';

interface AffiliateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliateOnboardingModal: React.FC<AffiliateOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfileDetails } = useAuth();
  const { products, settings } = useMarket();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 2 Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [antiFraudAccepted, setAntiFraudAccepted] = useState(false);

  // Step 3 Channels & Banking
  const [preferredChannel, setPreferredChannel] = useState(profile?.affiliatePreferredChannel || 'WhatsApp');
  const [bankName, setBankName] = useState(profile?.bankDetails?.bankName || ANGOLAN_BANKS[0].name);
  const [accountHolder, setAccountHolder] = useState(profile?.bankDetails?.accountHolder || profile?.displayName || '');
  const [iban, setIban] = useState(profile?.bankDetails?.iban || 'AO06.');
  const [expressPhone, setExpressPhone] = useState(profile?.bankDetails?.expressPhone || profile?.phoneNumber || '+244 ');

  // Step 4 Referral Link Generator
  const initialCode = profile?.affiliateCode || (profile?.displayName ? profile.displayName.split(' ')[0].toUpperCase() + '2026' : 'ANGOLA2026');
  const [customCode, setCustomCode] = useState(initialCode);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Base URL
  const appBaseUrl = window.location.origin;
  const generatedLink =
    selectedProductSlug === 'all'
      ? `${appBaseUrl}?ref=${customCode.trim().toUpperCase()}`
      : `${appBaseUrl}?ref=${customCode.trim().toUpperCase()}&prod=${selectedProductSlug}`;

  const selectedProdObj = products.find((p) => p.productId === selectedProductSlug);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customCode.trim().toUpperCase());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWhatsAppShare = () => {
    let text = `Olá! Recomendo os melhores produtos com entrega segura no Mercado Angola. Podes comprar e pagar na entrega: ${generatedLink}`;
    if (selectedProdObj) {
      text = `Olá! Dá uma olhada neste produto no Mercado Angola: ${selectedProdObj.name} por ${formatKz(selectedProdObj.price)}. Podes pagar no ato da entrega! Vê os detalhes aqui: ${generatedLink}`;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await updateProfileDetails({
        affiliateCode: customCode.trim().toUpperCase(),
        affiliateOnboardingCompleted: true,
        affiliateTermsAcceptedAt: new Date().toISOString(),
        affiliatePreferredChannel: preferredChannel,
        bankDetails: {
          bankName,
          accountHolder,
          iban,
          expressPhone,
        },
      });
      onClose();
    } catch (err) {
      console.error('Falha ao concluir onboarding de afiliado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200 flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg sm:text-xl tracking-tight">
                  Programa de Afiliados Mercado Angola
                </h2>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Passo {step} de 4
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Integração oficial para novos promotores e criadores em Angola
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 max-w-lg mx-auto">
            <span className={step >= 1 ? 'text-blue-600 flex items-center gap-1' : ''}>
              1. Boas-vindas
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 2 ? 'text-blue-600 flex items-center gap-1' : ''}>
              2. Termos e Comissões
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 3 ? 'text-blue-600 flex items-center gap-1' : ''}>
              3. Dados de Recebimento
            </span>
            <span className="text-slate-300">→</span>
            <span className={step >= 4 ? 'text-blue-600 flex items-center gap-1' : ''}>
              4. Gerar 1º Link
            </span>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* STEP 1: WELCOME & OVERVIEW */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Comece a Faturar em Kwanzas Promovendo Produtos Reais
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  O Mercado Angola conecta criadores de conteúdo, promotores e angolanos empreendedores a empresas e lojas físicas verificadas em todo o país.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                  <span className="text-emerald-700 font-black text-xs uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Gratuito
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Sem Taxa de Adesão</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Não cobramos inscrição nem mensalidades para candidatar-se a campanhas ou divulgar produtos.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                  <span className="text-blue-700 font-black text-xs uppercase flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Até 25% de Comissão
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Ganhos em Kwanzas</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Comissões atribuídas automaticamente por vendas confirmadas em smartphones, vestuário e tecnologia.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                  <span className="text-purple-700 font-black text-xs uppercase flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Bancos de Angola
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Levantamento por IBAN</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Transfira o seu saldo disponível diretamente para a sua conta no Banco BAI, BFA, BIC, BPC ou MULTICAIXA.
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Rever Termos de Comissão</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW PLATFORM COMMISSION TERMS & ANTI-FRAUD */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Revisão Obrigatória dos Termos de Comissão</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Transparência total: saiba exatamente como o cálculo financeiro e os pagamentos são processados.
                </p>
              </div>

              {/* Terms Breakdown Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs text-slate-700 max-h-72 overflow-y-auto">
                <div className="space-y-1 pb-2 border-b border-slate-200">
                  <strong className="text-slate-900 block text-xs">
                    1. Taxas da Plataforma & Comissões de Afiliado
                  </strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A plataforma aplica uma taxa de intermediação de <strong>5%</strong> sobre o valor elegível de cada venda confirmada. A comissão do afiliado é definida diretamente pela empresa vendedora para cada produto (ex: 15% ou 20%). A taxa de serviço da plataforma sobre o afiliado é inicialmente de <strong>0%</strong>. Caso venha a ser ajustada pelo administrador, nunca será aplicada retroativamente a campanhas já contratadas sem novo consentimento.
                  </p>
                </div>

                <div className="space-y-1 pb-2 border-b border-slate-200">
                  <strong className="text-slate-900 block text-xs">
                    2. Ciclo de Vida da Comissão e Confirmação de Pagamento
                  </strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    As comissões só são geradas quando o cliente conclui uma encomenda legítima e paga. As comissões passam pelo período de validação de <strong>{settings.validationPeriodDays || 7} dias</strong> para garantir que o artigo foi entregue e não houve cancelamento ou devolução. Após esse período, tornam-se imediatamente <em>disponíveis para levantamento</em>.
                  </p>
                </div>

                <div className="space-y-1 pb-2 border-b border-slate-200">
                  <strong className="text-slate-900 block text-xs">
                    3. Regras Antifraude e Atribuição Limpa
                  </strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    É estritamente proibida a autorreferência (o afiliado não pode comprar os próprios produtos usando o seu link para inflacionar saldos). Cliques sem compras, tentativas de compra fraudulenta ou contas duplicadas serão detetadas e resultarão no cancelamento da comissão e suspensão da conta.
                  </p>
                </div>

                <div className="space-y-1">
                  <strong className="text-slate-900 block text-xs">
                    4. Boas Práticas de Divulgação em Angola
                  </strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    É proibida publicidade enganosa, promessas irreais de enriquecimento ou divulgação de artigos não autorizados pela lei da República de Angola. Ao partilhar nas redes sociais e WhatsApp, identifique claramente que se trata de uma recomendação oficial de compras no Mercado Angola.
                  </p>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-2.5 pt-1">
                <label
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-800"
                >
                  <div className="mt-0.5 text-blue-600">
                    {termsAccepted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </div>
                  <span>
                    Compreendo e aceito os termos de comissão (taxa de plataforma 5%, taxa de afiliado 0% inicial, e prazo de garantia pós-entrega).
                  </span>
                </label>

                <label
                  onClick={() => setAntiFraudAccepted(!antiFraudAccepted)}
                  className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-800"
                >
                  <div className="mt-0.5 text-blue-600">
                    {antiFraudAccepted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </div>
                  <span>
                    Comprometo-me a cumprir as regras antifraude (proibição de autorreferência e publicidade enganosa).
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  disabled={!termsAccepted || !antiFraudAccepted}
                  onClick={() => setStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Aceitar e Configurar Recebimento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHANNELS & BANKING DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Canais de Divulgação e Conta Bancária (Angola)
                </h3>
                <p className="text-xs text-slate-500">
                  Informe onde pretende promover e configure a sua conta para receber levantamentos de comissões.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Channel Picker */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Onde pretende promover com mais frequência?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['WhatsApp', 'Instagram', 'TikTok / YouTube', 'Facebook / Grupos'].map((ch) => (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => setPreferredChannel(ch)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          preferredChannel === ch
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank account setup for Angola */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Conta Bancária para Transferências de Comissões (Kz)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Banco em Angola</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                      >
                        {ANGOLAN_BANKS.map((b) => (
                          <option key={b.code} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Titular da Conta</label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Nome completo na conta bancária"
                        className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      IBAN Nacional (AO06...)
                    </label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value.toUpperCase())}
                      placeholder="AO06.0040.0000.XXXX.XXXX.XXXX.X"
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-mono font-bold uppercase"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Pode editar ou confirmar o IBAN a qualquer momento ao solicitar levantamentos.
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Gerar Primeiro Link de Afiliado</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FIRST REFERRAL LINK & CODE GENERATOR */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Gerador do Seu Primeiro Link de Afiliado</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Personalize o seu código exclusivo e selecione o artigo inicial para começar a divulgar.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Custom Code Input */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Afiliado Personalizado (identificador nas encomendas)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase())}
                      placeholder="Ex: ANGOLA2026"
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-black text-sm uppercase text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Product to promote picker */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Artigo para o Seu Primeiro Link
                  </label>
                  <select
                    value={selectedProductSlug}
                    onChange={(e) => setSelectedProductSlug(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-xs font-medium"
                  >
                    <option value="all">🌟 Todo o Catálogo do Mercado Angola (Recomendação Geral)</option>
                    {products
                      .filter((p) => p.status === 'published' && p.affiliateEnabled)
                      .map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.name} — Ganha {Math.round((p.affiliateCommissionRate || 0) * 100)}% ({formatKz(Math.round(p.price * (p.affiliateCommissionRate || 0)))})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Output Link Box */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900 text-[11px] uppercase tracking-wider">
                      Seu Link de Afiliado Pronto para Partilha
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Atribuição Ativa
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-blue-200 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all">
                    <span className="truncate">{generatedLink}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Completo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Partilhar no WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Completion Action */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setStep(3)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  disabled={isSubmitting || !customCode.trim()}
                  onClick={handleFinishOnboarding}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-black py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'A guardar...' : 'Concluir & Entrar no Painel'}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
