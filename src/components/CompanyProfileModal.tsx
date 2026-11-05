import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Globe,
  Clock,
  ShieldCheck,
  Building2,
  Package,
  Layers,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CommercialPartnerCompany, ServiceItem } from '../types/services';
import { Product } from '../types';
import { formatKz } from '../data/angolaData';

interface CompanyProfileModalProps {
  companyId: string | null;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectService?: (service: ServiceItem) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  companyId,
  onClose,
  onSelectProduct,
  onSelectService,
}) => {
  const { companies, services, products } = useMarket();
  const [activeTab, setActiveTab] = useState<'services' | 'products' | 'about'>('services');

  if (!companyId) return null;

  const company = companies.find((c) => c.companyId === companyId);
  if (!company) return null;

  const companyServices = services.filter((s) => s.companyId === companyId || s.companyName === company.name);
  const companyProducts = products.filter((p) => p.sellerId === companyId || p.storeName.includes(company.name));

  const handleWhatsApp = () => {
    const cleanPhone = company.whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Olá ${company.name}! Encontrei a vossa página comercial no Mercado Angola e gostaria de obter informações sobre os vossos serviços/produtos.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${company.phone}`, '_self');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Cover Banner */}
        <div className="relative h-44 sm:h-56 bg-slate-900 overflow-hidden shrink-0">
          <img
            src={
              company.coverImage ||
              'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=1200&auto=format&fit=crop&q=80'
            }
            alt={company.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Company Header Info Bar */}
        <div className="px-6 sm:px-8 pb-4 relative -mt-16 shrink-0 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden shrink-0">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {company.name}
                  </h2>
                  {company.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Empresa Verificada</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{company.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {company.province}, {company.municipality}
                  </span>
                </p>

                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{company.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({company.reviewCount} avaliações de clientes)</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Comercial</span>
              </button>

              <button
                onClick={handleCall}
                className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Ligar Agora</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6 border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Serviços Oferecidos ({companyServices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produtos à Venda ({companyProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sobre a Empresa & Contactos</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'services' && (
            <div className="space-y-4">
              {companyServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyServices.map((service) => (
                    <div
                      key={service.serviceId}
                      className="border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow bg-slate-50/50"
                    >
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-24 h-24 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 space-y-1.5">
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          {service.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2">
                          {service.title}
                        </h4>
                        <div className="text-xs font-black text-slate-950">
                          {service.pricingType === 'quote' ? 'Sob Orçamento' : formatKz(service.priceAoa)}
                        </div>
                        <div className="pt-1 flex gap-2">
                          <button
                            onClick={() => {
                              onSelectService?.(service);
                              onClose();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Pedir Orçamento
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Esta empresa ainda não publicou serviços avulsos.
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {companyProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {companyProducts.map((prod) => (
                    <div
                      key={prod.productId}
                      onClick={() => {
                        onSelectProduct?.(prod);
                        onClose();
                      }}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white group"
                    >
                      <div className="h-32 bg-slate-100 overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3 space-y-1 text-xs">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                        <span className="font-black text-amber-600 block">{formatKz(prod.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Esta empresa foca-se na prestação de serviços. Consulte a aba "Serviços Oferecidos".
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6 text-xs text-slate-700">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Descrição Institucional
                </h4>
                <p className="leading-relaxed text-slate-600 whitespace-pre-line">
                  {company.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Endereço Físico:</span>
                  <p className="font-medium text-slate-900">{company.address}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Horário de Funcionamento:</span>
                  <p className="font-medium text-slate-900">{company.operatingHours || 'Segunda a Sábado: 08h às 18h'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">NIF (Identificação Fiscal):</span>
                  <p className="font-mono font-bold text-slate-900">{company.nif || 'Registado em validação'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Email Comercial:</span>
                  <p className="font-medium text-slate-900">{company.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
