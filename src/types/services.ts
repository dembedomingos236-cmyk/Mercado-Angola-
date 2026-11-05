export type ServiceCategory =
  | 'Serviços domésticos'
  | 'Serviços empresariais'
  | 'Construção'
  | 'Tecnologia'
  | 'Transporte'
  | 'Limpeza'
  | 'Manutenção'
  | 'Marketing'
  | 'Consultoria'
  | 'Segurança e vigilância'
  | 'Jardinagem'
  | 'Outros serviços';

export type ServicePricingType = 'fixed' | 'quote' | 'starting_at' | 'hourly';

export type ServiceStatus = 'active' | 'pending_approval' | 'suspended';

export interface ServiceItem {
  serviceId: string;
  companyId: string;
  companyName: string;
  companyVerified: boolean;
  companyLogo?: string;
  title: string;
  description: string;
  category: ServiceCategory;
  pricingType: ServicePricingType;
  priceAoa: number; // 0 if quote
  priceNotes?: string; // ex: "Por metro quadrado" or "A partir de"
  images: string[];
  videoUrl?: string;
  province: string;
  municipality?: string;
  coverageZones: string[]; // ex: ['Talatona', 'Belas', 'Luanda', 'Viana']
  whatsappNumber: string;
  phone: string;
  rating: number; // 1 to 5
  reviewCount: number;
  status: ServiceStatus;
  featured?: boolean;
  totalRequestsCount?: number;
  viewsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export type QuoteRequestStatus = 'pending' | 'quoted' | 'accepted' | 'declined' | 'completed';

export interface ServiceQuoteRequest {
  requestId: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: ServiceCategory;
  companyId: string;
  companyName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  province: string;
  municipality: string;
  addressOrDetails: string;
  serviceDateNeeded?: string;
  urgencyLevel?: 'normal' | 'urgente' | 'planeada';
  details: string;
  budgetProposedAoa?: number;
  status: QuoteRequestStatus;
  companyQuotePriceAoa?: number;
  companyQuoteNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommercialPartnerCompany {
  companyId: string;
  ownerId: string;
  name: string;
  tradeName: string; // Nome comercial
  category: string;
  description: string;
  logo: string;
  coverImage?: string;
  province: string;
  municipality: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  nif?: string;
  isVerified: boolean;
  isFeatured: boolean;
  status: 'active' | 'pending_approval' | 'suspended';
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  operatingHours?: string;
  totalProductsCount?: number;
  totalServicesCount?: number;
  rating: number;
  reviewCount: number;
  viewsCount?: number;
  contactsReceivedCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceReview {
  reviewId: string;
  targetType: 'service' | 'company' | 'product';
  targetId: string;
  targetTitle: string;
  authorId: string;
  authorName: string;
  authorLocation?: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedCustomer: boolean;
  createdAt: string;
}
