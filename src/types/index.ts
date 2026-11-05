export type UserRole = 'buyer' | 'affiliate' | 'seller' | 'driver' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  province?: string;
  municipality?: string;
  address?: string;
  // Affiliate specific fields
  affiliateCode?: string;
  affiliateBalancePending?: number;
  affiliateBalanceAvailable?: number;
  affiliateTotalPaid?: number;
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    iban: string; // AO06...
    expressPhone?: string;
  };
  affiliateOnboardingCompleted?: boolean;
  affiliatePreferredChannel?: string;
  affiliateTermsAcceptedAt?: string;
  // Driver specific fields
  driverVehicleType?: 'motorizada' | 'carro' | 'carrinha';
  driverPlateNumber?: string;
  driverDeliveriesCompleted?: number;
  driverTotalEarnedAoa?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SellerStore {
  storeId: string;
  ownerId: string;
  name: string;
  description: string;
  phone: string;
  province: string;
  municipality?: string;
  acceptsCashOnDelivery: boolean;
  status: 'active' | 'pending_review' | 'approved' | 'rejected' | 'banned' | 'suspended';
  commissionRate?: number; // Platform fee (default 0.05 / 5%)
  rating?: number;
  totalSales?: number;
  logo?: string;
  // KYC - Seller Verification
  nifOrBi?: string;
  iban?: string;
  biDocumentUrl?: string; // foto do BI
  storeProofUrl?: string; // foto da loja ou comprovativo de morada
  whatsapp?: string;
  isVerified?: boolean; // Selo verde LOJA VERIFICADA
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductCategory = 
  | 'Telemóveis e Eletrónica'
  | 'Roupa e Calçado'
  | 'Casa e Mobiliário'
  | 'Beleza e Cuidados Pessoais'
  | 'Acessórios'
  | 'Computadores'
  | 'Artigos Desportivos'
  | 'Produtos para Crianças'
  | 'Outros Produtos';

export type ProductStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'suspended';
export type ProductCondition = 'novo' | 'usado';

export interface Product {
  productId: string;
  sellerId: string;
  storeName: string;
  name: string;
  description: string;
  price: number; // in AOA / Kz
  category: ProductCategory | string;
  stock: number;
  condition: ProductCondition;
  province: string;
  municipality?: string;
  images: string[];
  status: ProductStatus;
  featured?: boolean;
  acceptsCashOnDelivery: boolean;
  deliveryCost: number; // in AOA
  deliveryNotes?: string;
  isReal?: boolean;
  rejectionReason?: string;
  // Affiliate Marketing Extensions
  affiliateEnabled?: boolean;
  affiliateCommissionRate?: number; // e.g. 0.15 (15% defined by company)
  requiresAffiliateApproval?: boolean;
  affiliateMarketingMaterials?: string[]; // Banners, promo texts, copy snippets
  createdAt: string;
  updatedAt?: string;
}

// === AUTOMATIC MA- LEAD TRACKING ===
export type LeadStatus = 'pending' | 'contacted' | 'sold' | 'not_sold' | 'commission_paid';
export type LeadItemType = 'product' | 'service';

export interface LeadTracking {
  id?: string;
  leadId: string;
  code?: string;
  leadCode: string; // ex: "MA-7492"
  itemType: LeadItemType;
  itemId: string;
  itemTitle: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp?: string;
  price: number;
  platformCommission?: number;
  platformCommissionRate: number; // 0.05 for products (5%), 0.10 for services (10%)
  platformCommissionAoa: number;
  affiliateId?: string;
  affiliateName?: string;
  affiliateCommission?: number;
  affiliateCommissionRate?: number; // 0.03 (3%)
  affiliateCommissionAoa?: number;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  status: LeadStatus;
  commissionPaidToPlatform: boolean; // Confirmed by admin
  commissionPaidAt?: string;
  soldAt?: string;
  rejectionReason?: string;
  // Trust & review
  clientRating?: number; // 1 to 5 stars
  clientComment?: string;
  clientReviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  sellerId: string;
  appliedAffiliateId?: string;
  appliedReferralCode?: string;
}

export type PaymentMethod = 'cash_on_delivery' | 'multicaixa_express' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'received' | 'failed' | 'refunded';

export type OrderStatus = 
  | 'pending_confirmation'
  | 'confirmed'
  | 'in_preparation'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  municipality: string;
  streetOrBairro: string;
  deliveryType: 'domicilio' | 'ponto_encontro';
  meetingPointNotes?: string;
}

export interface OrderItem {
  productId: string;
  sellerId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  affiliateCommissionRate?: number;
}

export interface Order {
  orderId: string;
  orderNumber: string; // e.g. AO-2026-8492
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  sellerIds: string[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  // Financial Splits (Regra Oficial Mercado Angola)
  // Exemplo 100.000 Kz: Produto 100.000 Kz + Taxa Plataforma 5% (5.000 Kz) + Entrega 3.000 Kz = 108.000 Kz total
  platformFeeRate?: number; // 0.05 (5%)
  platformFeeAmount?: number; // 5.000 Kz
  sellerGrossAmount?: number; // 100.000 Kz (Preço original do artigo recebido pelo vendedor)
  driverFeeAmount?: number; // 2.000 Kz (Quota do motorista)
  platformDeliveryFeeAmount?: number; // 1.000 Kz (Quota da plataforma na entrega)
  // Escrow & Segurança do Dinheiro
  escrowStatus?: 'held_by_platform' | 'released_to_seller_and_driver' | 'refunded';
  // Driver Delivery with 4-Digit Pickup Verification Code
  pickupVerificationCode?: string; // Código de 4 dígitos (ex: "8492") exigido pelo vendedor
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  deliveryState?: 'pending_driver' | 'driver_accepted' | 'picked_up_verified' | 'delivered';
  driverAssignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  // Affiliate tracking
  affiliateId?: string;
  affiliateName?: string;
  affiliateReferralCode?: string;
  affiliateGrossCommission?: number;
  affiliateServiceFee?: number;
  affiliateNetCommission?: number;
  paymentConfirmation?: {
    confirmedBy: string;
    confirmedAt: string;
    receiptRef?: string;
    notes?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerSuborder {
  suborderId: string;
  orderId: string;
  orderNumber: string;
  sellerId: string;
  storeName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  platformFeeAmount: number; // 5%
  affiliateCommissionAmount: number; // Total affiliate commission deducted from product
  netSellerAmount: number; // What seller receives (ex: 100.000 Kz)
  driverFeeAmount?: number; // 2.000 Kz
  platformDeliveryFeeAmount?: number; // 1.000 Kz
  pickupVerificationCode?: string; // Código de 4 dígitos para conferência do vendedor
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryState?: 'pending_driver' | 'driver_accepted' | 'picked_up_verified' | 'delivered';
  escrowStatus?: 'held_by_platform' | 'released_to_seller_and_driver' | 'refunded';
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export type CommissionStatus = 
  | 'pending'                  // A aguardar confirmação de pagamento
  | 'validation_period'        // Em período de validação / garantia
  | 'approved'                 // Aprovada
  | 'available_for_withdrawal' // Disponível para levantamento
  | 'processing_payout'        // Em processamento de pagamento
  | 'paid'                     // Paga
  | 'reversed';                // Revertida por cancelamento/reembolso

export interface CommissionRecord {
  commissionId: string;
  orderId: string;
  orderNumber: string;
  suborderId: string;
  sellerId: string;
  affiliateId?: string;
  affiliateName?: string;
  productId: string;
  productName: string;
  saleAmount: number; // Price of item * qty
  platformFeeRate: number; // 0.05 (5%)
  platformFeeAmount: number;
  affiliateCommissionRate: number; // e.g. 0.15 (15%)
  affiliateGrossCommission: number;
  platformServiceFeeOnAffiliateRate: number; // e.g. 0% or 10%
  platformServiceFeeOnAffiliateAmount: number;
  affiliateNetCommission: number;
  sellerNetAmount: number;
  status: CommissionStatus;
  validationEndsAt?: string;
  paidAt?: string;
  reversalReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateCampaign {
  campaignId: string;
  productId: string;
  sellerId: string;
  storeName: string;
  productName: string;
  productPrice: number;
  productImage: string;
  category: string;
  commissionRate: number; // e.g. 0.15 (15%)
  estimatedCommissionKz: number; // price * commissionRate
  requiresApproval: boolean;
  status: 'active' | 'paused' | 'closed';
  promotionalMaterials?: {
    headline: string;
    copySnippet: string;
    targetAudience: string;
  };
  createdAt: string;
}

export interface AffiliateApplication {
  applicationId: string;
  campaignId: string;
  productId: string;
  sellerId: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AffiliateClick {
  clickId: string;
  affiliateId: string;
  referralCode: string;
  productId?: string;
  referrerSource?: string; // 'WhatsApp', 'Instagram', 'Facebook', 'Direct'
  ipHash?: string;
  timestamp: string;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface WithdrawalRequest {
  requestId: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  amount: number; // in AOA / Kz
  bankDetails: {
    bankName: string;
    accountHolder: string;
    iban: string; // AO06...
    expressPhone?: string;
  };
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNotes?: string;
  referenceProof?: string;
}

export interface PaymentAttempt {
  attemptId: string;
  orderId: string;
  buyerId: string;
  amount: number;
  currency: 'AOA';
  provider: 'MULTICAIXA_GPO_EMIS' | 'CASH_ON_DELIVERY';
  reference: string;
  entity?: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  idempotencyKey: string;
  mode: 'test' | 'live';
  createdAt: string;
  completedAt?: string;
  terminalRef?: string;
}

export interface PlatformSettings {
  defaultCommissionRate: number; // 0.05 (5%) on product sales
  affiliateServiceFeeRate: number; // 0.00 (0% initially, configurable by owner)
  fixedFee: number;
  enableFixedFee: boolean;
  electronicPaymentsActive: boolean;
  multicaixaSandboxMode: boolean;
  validationPeriodDays: number; // e.g. 7 days for return window
  minimumWithdrawalAmount: number; // e.g. 5.000 Kz
  updatedBy?: string;
  updatedAt?: string;
}

export interface AuditLog {
  logId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface Report {
  reportId: string;
  reporterId: string;
  reporterName: string;
  targetType: 'product' | 'seller' | 'order' | 'affiliate';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  productId?: string;
  productName?: string;
  text: string;
  createdAt: string;
}

export interface Review {
  reviewId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// === ADMIN NOTIFICATIONS SYSTEM ===
export type NotificationCategory =
  | 'vendas'
  | 'candidaturas'
  | 'pagamentos'
  | 'seguranca'
  | 'financeiro'
  | 'sistema'
  | 'utilizadores';

export type NotificationPriority = 'critico' | 'normal' | 'informativo';

export interface AdminNotification {
  notificationId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  event: string;
  idempotencyKey?: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    productName?: string;
    saleAmount?: number;
    platformFeeRate?: number;
    platformFeeAmount?: number;
    sellerId?: string;
    sellerName?: string;
    sellerAmount?: number;
    affiliateId?: string;
    affiliateName?: string;
    affiliateCommission?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    candidateId?: string;
    candidateName?: string;
    candidateEmail?: string;
    candidatePhone?: string;
    targetRoleOrCampaign?: string;
    applicationId?: string;
    applicationStatus?: string;
    withdrawalId?: string;
    withdrawalAmount?: number;
    bankName?: string;
    reportId?: string;
    reportReason?: string;
    securityEventType?: string;
    actorEmail?: string;
    fraudRiskLevel?: 'baixo' | 'medio' | 'alto';
  };
  actionType?: 'view_order' | 'manage_application' | 'view_withdrawal' | 'view_report' | 'view_financial' | 'view_security';
  actionUrl?: string;
}

export interface AdminNotificationChannelsConfig {
  inApp: {
    sales: boolean;
    applications: boolean;
    payments: boolean;
    security: boolean;
    financial: boolean;
    soundEnabled: boolean;
  };
  push: {
    enabled: boolean;
    sales: boolean;
    applications: boolean;
    payments: boolean;
    security: boolean;
    financial: boolean;
  };
  email: {
    enabled: boolean;
    recipientEmail: string;
    sales: boolean;
    applications: boolean;
    payments: boolean;
    security: boolean;
    financial: boolean;
    dailyDigest: boolean;
  };
}

export interface ContactMessage {
  messageId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  userType: 'cliente' | 'empresa' | 'vendedor' | 'afiliado';
  subject: string;
  content: string;
  status: 'pendente' | 'em_atendimento' | 'resolvido';
  operatorNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

// === ACADEMIA DE VENDAS E MARKETING DIGITAL ===
export * from './academy';

// === SERVIÇOS EM ANGOLA & EMPRESAS PARCEIRAS ===
export * from './services';



