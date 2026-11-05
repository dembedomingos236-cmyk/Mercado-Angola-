import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Send,
  X,
  Layers,
  Wrench,
  Building2,
  Laptop,
  Truck,
  Megaphone,
  Briefcase,
  Trees,
  Calendar,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { ServiceItem, ServiceCategory, ServiceQuoteRequest } from '../types/services';
import { ANGOLA_PROVINCES, formatKz } from '../data/angolaData';
import { SERVICE_CATEGORIES_METADATA } from '../data/angolaServicesData';

interface ServicesMarketplaceProps {
  onOpenCompanyProfile?: (companyId: string) => void;
  onOpenAuthModal?: () => void;
}

export const ServicesMarketplace: React.FC<ServicesMarketplaceProps> = ({
  onOpenCompanyProfile,
  onOpenAuthModal,
}) => {
  const { services, companies, submitQuoteRequest, createService } = useMarket();
  const { user, profile, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedProvince, setSelectedProvince] = useState<string>('todas');

  // Modal: Pedir Orçamento / Solicitar Serviço
  const [selectedServiceForQuote, setSelectedServiceForQuote] = useState<ServiceItem | null>(null);
  const [clientName, setClientName] = useState(profile?.displayName || '');
  const [clientPhone, setClientPhone] = useState(profile?.phoneNumber || '+244 ');
  const [quoteProvince, setQuoteProvince] = useState('Luanda');
  const [quoteMunicipality, setQuoteMunicipality] = useState('Talatona');
  const [addressDetails, setAddressDetails] = useState('');
  const [serviceDateNeeded, setServiceDateNeeded] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'urgente' | 'planeada'>('normal');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [budgetProposed, setBudgetProposed] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState(false);

  // Modal: Publicar Novo Serviço
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('Limpeza');
  const [newDesc, setNewDesc] = useState('');
  const [newPricingType, setNewPricingType] = useState<'fixed' | 'quote' | 'starting_at'>('starting_at');
  const [newPrice, setNewPrice] = useState('');
  const [newPriceNotes, setNewPriceNotes] = useState('');
  const [newProvince, setNewProvince] = useState('Luanda');
  const [newZones, setNewZones] = useState('Talatona, Belas, Luanda');
  const [newWhatsapp, setNewWhatsapp] = useState(profile?.phoneNumber || '+244 923 000 000');
  const [newPhone, setNewPhone] = useState(profile?.phoneNumber || '+244 923 000 000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState(false);

  // Filtered Services
  const filteredServices = services.filter((s) => {
    if (s.status === 'suspended') return false;
    if (selectedCategory !== 'todas' && s.category !== selectedCategory) return false;
    if (selectedProvince !== 'todas' && s.province !== selectedProvince) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCompany = s.companyName.toLowerCase().includes(q);
      const matchCategory = s.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCompany || matchCategory;
    }
    return true;
  });

  const handleOpenQuoteModal = (service: ServiceItem) => {
    setSelectedServiceForQuote(service);
    setQuoteDetails('');
    setBudgetProposed('');
    setQuoteSuccessMsg(false);
    if (profile) {
      setClientName(profile.displayName || '');
      setClientPhone(profile.phoneNumber || '+244 ');
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForQuote) return;
    if (!clientName.trim() || !clientPhone.trim() || !quoteDetails.trim()) {
      alert('Por favor preencha o seu nome, telemóvel e detalhes do que necessita.');
      return;
    }

    setIsSubmittingQuote(true);
    try {
      await submitQuoteRequest({
        serviceId: selectedServiceForQuote.serviceId,
        serviceTitle: selectedServiceForQuote.title,
        serviceCategory: selectedServiceForQuote.category,
        companyId: selectedServiceForQuote.companyId,
        companyName: selectedServiceForQuote.companyName,
        clientId: profile?.uid || 'cliente_anonimo_' + Date.now(),
        clientName,
        clientPhone,
        clientEmail: profile?.email || '',
        province: quoteProvince,
        municipality: quoteMunicipality,
        addressOrDetails: addressDetails,
        serviceDateNeeded,
        urgencyLevel,
        details: quoteDetails,
        budgetProposedAoa: budgetProposed ? Number(budgetProposed) : undefined,
      });

      setQuoteSuccessMsg(true);
      setTimeout(() => {
        setSelectedServiceForQuote(null);
        setQuoteSuccessMsg(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar pedido de orçamento. Tente novamente.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleWhatsAppContact = (service: ServiceItem) => {
    const cleanPhone = service.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Olá! Vi o vosso serviço "${service.title}" no Mercado Angola e gostaria de obter mais informações / orçamento.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handlePublishService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Preencha o título e a descrição do serviço.');
      return;
    }

    setIsSubmittingService(true);
    try {
      const zonesList = newZones.split(',').map((z) => z.trim()).filter(Boolean);
      await createService({
        companyId: profile?.uid || 'comp_user_' + Date.now(),
        companyName: profile?.displayName || 'Prestador Angolano',
        companyVerified: profile?.role === 'seller' || profile?.role === 'admin',
        title: newTitle,
        description: newDesc,
        category: newCategory,
        pricingType: newPricingType,
        priceAoa: newPricingType === 'quote' ? 0 : Number(newPrice) || 0,
        priceNotes: newPriceNotes || undefined,
        images: [
          newImageUrl.trim() ||
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        ],
        province: newProvince,
        coverageZones: zonesList.length > 0 ? zonesList : ['Luanda'],
        whatsappNumber: newWhatsapp,
        phone: newPhone,
        status: 'active',
        featured: true,
      });

      setPublishSuccessMsg(true);
      setTimeout(() => {
        setIsPublishModalOpen(false);
        setPublishSuccessMsg(false);
        setNewTitle('');
        setNewDesc('');
        setNewPrice('');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao publicar serviço.');
    } finally {
      setIsSubmittingService(false);
    }
  };

  const getCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'Limpeza':
        return <Sparkles className="w-4 h-4" />;
      case 'Manutenção':
        return <Wrench className="w-4 h-4" />;
      case 'Construção':
        return <Building2 className="w-4 h-4" />;
      case 'Tecnologia':
        return <Laptop className="w-4 h-4" />;
      case 'Transporte':
        return <Truck className="w-4 h-4" />;
      case 'Marketing':
        return <Megaphone className="w-4 h-4" />;
      case 'Serviços empresariais':
        return <Briefcase className="w-4 h-4" />;
      case 'Jardinagem':
        return <Trees className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Módulo Oficial: Serviços em Angola</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Contrate os Melhores Profissionais e Empresas de Angola
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Limpeza, climatização, construção civil, canalização, transporte, tecnologia, marketing e manutenção com empresas verificadas, orçamentos rápidos e contacto direto via WhatsApp.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar o Meu Serviço</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('servicos-catalogo');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              Explorar Serviços Disponíveis ({services.length})
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Pills Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Categorias de Serviços</span>
          </h2>
          <span className="text-xs text-slate-500">
            {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'todas'
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Todos os Serviços</span>
          </button>

          {SERVICE_CATEGORIES_METADATA.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === cat.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Location Filter Bar */}
      <div id="servicos-catalogo" className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por canalizador, lavagem de sofás, ar condicionado, eletricista, empresa..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="todas">Todas as Províncias</option>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.serviceId}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    {getCategoryIcon(service.category)}
                    <span>{service.category}</span>
                  </span>
                  {service.featured && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Destaque
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{service.province}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                {/* Company Name & Verified Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={() => onOpenCompanyProfile?.(service.companyId)}
                    className="flex items-center gap-1.5 cursor-pointer hover:underline"
                  >
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {service.companyName}
                    </span>
                    {service.companyVerified && (
                      <span title="Empresa Verificada">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{service.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({service.reviewCount})</span>
                  </div>
                </div>

                <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                  {service.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>

                {/* Price indicator */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-500">Condições de Preço:</span>
                  <div className="text-right">
                    {service.pricingType === 'quote' ? (
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Sob Orçamento
                      </span>
                    ) : (
                      <div>
                        <span className="text-base font-black text-slate-950">
                          {formatKz(service.priceAoa)}
                        </span>
                        {service.pricingType === 'starting_at' && (
                          <span className="text-[10px] text-slate-500 block">Preço base inicial</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Coverage zones tags */}
                {service.coverageZones && service.coverageZones.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Atende:</span>
                    {service.coverageZones.slice(0, 3).map((zone) => (
                      <span key={zone} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {zone}
                      </span>
                    ))}
                    {service.coverageZones.length > 3 && <span>+{service.coverageZones.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleWhatsAppContact(service)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleOpenQuoteModal(service)}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Pedir Orçamento</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">Nenhum serviço encontrado</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Não foram encontrados serviços com os filtros selecionados. Tente pesquisar com outros termos ou altere a categoria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('todas');
              setSelectedProvince('todas');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Limpar Filtros de Pesquisa
          </button>
        </div>
      )}

      {/* MODAL: Pedir Orçamento / Solicitar Serviço */}
      {selectedServiceForQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedServiceForQuote(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                <Send className="w-3 h-3" />
                <span>Pedido Oficial de Orçamento</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{selectedServiceForQuote.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Empresa: <strong className="text-slate-800">{selectedServiceForQuote.companyName}</strong>
              </p>
            </div>

            {quoteSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-emerald-950">Pedido Enviado com Sucesso!</h4>
                <p className="text-xs text-emerald-800">
                  O seu pedido foi registado na plataforma. A empresa <strong>{selectedServiceForQuote.companyName}</strong> entrará em contacto direto pelo seu WhatsApp/telefone.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">O seu Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: João Baptista"
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telemóvel / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Província *</label>
                    <select
                      value={quoteProvince}
                      onChange={(e) => setQuoteProvince(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      {ANGOLA_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Município / Bairro *</label>
                    <input
                      type="text"
                      required
                      value={quoteMunicipality}
                      onChange={(e) => setQuoteMunicipality(e.target.value)}
                      placeholder="Ex: Talatona, Bairro Benfica"
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data Pretendida</label>
                    <input
                      type="date"
                      value={serviceDateNeeded}
                      onChange={(e) => setServiceDateNeeded(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Urgência do Serviço</label>
                    <select
                      value={urgencyLevel}
                      onChange={(e) => setUrgencyLevel(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="normal">Normal (Dentro de 2 a 3 dias)</option>
                      <option value="urgente">Urgente (Hoje ou amanhã)</option>
                      <option value="planeada">Planeada para o próximo mês</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Descreva o que necessita com detalhes *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={quoteDetails}
                    onChange={(e) => setQuoteDetails(e.target.value)}
                    placeholder="Ex: Preciso de lavagem de 1 sofá de 3 lugares e 2 carpetes de sala de 2x3m em Talatona..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Orçamento Proposto / Estimado em Kwanzas (Opcional)
                  </label>
                  <input
                    type="number"
                    value={budgetProposed}
                    onChange={(e) => setBudgetProposed(e.target.value)}
                    placeholder="Ex: 35000"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingQuote ? 'A enviar pedido...' : 'Submeter Pedido de Orçamento'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Publicar Novo Serviço */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full mb-2">
                <Plus className="w-3 h-3" />
                <span>Área Comercial: Novo Serviço</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Publicar Serviço no Mercado Angola</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alcance milhares de clientes em Luanda e em todas as províncias de Angola.
              </p>
            </div>

            {publishSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-emerald-950">Serviço Publicado com Sucesso!</h4>
                <p className="text-xs text-emerald-800">
                  O seu serviço já está ativo na secção "Serviços em Angola" e pronto para receber pedidos de clientes.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublishService} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título do Serviço *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Instalação e Manutenção de Ar Condicionado Split"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Categoria de Atividade *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ServiceCategory)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      {SERVICE_CATEGORIES_METADATA.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Cobrança *</label>
                    <select
                      value={newPricingType}
                      onChange={(e) => setNewPricingType(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="starting_at">A partir de (Preço Base)</option>
                      <option value="fixed">Preço Fixo</option>
                      <option value="quote">Apenas Sob Orçamento</option>
                    </select>
                  </div>
                </div>

                {newPricingType !== 'quote' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Preço em Kwanzas (AOA) *</label>
                      <input
                        type="number"
                        required
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Ex: 25000"
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nota de Preço (Opcional)</label>
                      <input
                        type="text"
                        value={newPriceNotes}
                        onChange={(e) => setNewPriceNotes(e.target.value)}
                        placeholder="Ex: Por aparelho / Por m²"
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição Completa do Serviço *</label>
                  <textarea
                    rows={3}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Descreva a sua experiência, equipamentos utilizados, garantia oferecida e diferenciais..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Província Sede *</label>
                    <select
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      {ANGOLA_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Zonas de Atendimento</label>
                    <input
                      type="text"
                      value={newZones}
                      onChange={(e) => setNewZones(e.target.value)}
                      placeholder="Ex: Talatona, Belas, Luanda, Viana"
                      className="w-full p-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp para Contacto *</label>
                    <input
                      type="text"
                      required
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefone de Chamadas *</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fotografia do Serviço (URL)</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... (ou deixe vazio para fotografia padrão)"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingService}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>{isSubmittingService ? 'A publicar serviço...' : 'Confirmar e Publicar Serviço'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
