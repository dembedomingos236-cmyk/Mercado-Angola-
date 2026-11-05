import { Product, ProductCategory, SellerStore, AffiliateCampaign } from '../types';

export const ANGOLA_PROVINCES: { name: string; municipalities: string[] }[] = [
  {
    name: 'Luanda',
    municipalities: ['Luanda', 'Talatona', 'Belas', 'Viana', 'Cazenga', 'Kilamba Kiaxi', 'Cacuaco', 'Icolo e Bengo', 'Quiçama'],
  },
  {
    name: 'Benguela',
    municipalities: ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Ganda', 'Cubal', 'Bocoio', 'Balombo'],
  },
  {
    name: 'Huambo',
    municipalities: ['Huambo', 'Caála', 'Bailundo', 'Longonjo', 'Ekunha', 'Ukuma', 'Tchicala Tcholohanga'],
  },
  {
    name: 'Huíla',
    municipalities: ['Lubango', 'Chibia', 'Humpata', 'Matala', 'Quilengues', 'Cacula', 'Caluquembe'],
  },
  {
    name: 'Cabinda',
    municipalities: ['Cabinda', 'Cacongo', 'Buco-Zau', 'Belize'],
  },
  {
    name: 'Cuanza Sul',
    municipalities: ['Sumbe', 'Porto Amboim', 'Gabela', 'Waku Kungo', 'Quibala', 'Libolo'],
  },
  {
    name: 'Cuanza Norte',
    municipalities: ['Ndalatando', 'Cazengo', 'Cambambe', 'Golungo Alto', 'Lucala'],
  },
  {
    name: 'Malanje',
    municipalities: ['Malanje', 'Calandula', 'Cangandala', 'Cacuso', 'Quela'],
  },
  {
    name: 'Uíge',
    municipalities: ['Uíge', 'Negage', 'Damba', 'Maquela do Zombo', 'Sanza Pombo'],
  },
  {
    name: 'Namibe',
    municipalities: ['Moçâmedes', 'Tômbwa', 'Bibala', 'Camucuio', 'Virei'],
  },
  {
    name: 'Zaire',
    municipalities: ['Mbanza Kongo', 'Soyo', 'Nzeto', 'Tomboco', 'Noqui'],
  },
  {
    name: 'Bengo',
    municipalities: ['Caxito', 'Dande', 'Ambriz', 'Bula Atumba', 'Nambuangongo'],
  },
  {
    name: 'Bié',
    municipalities: ['Cuito', 'Andulo', 'Camacupa', 'Chinguar', 'Catabola'],
  },
  {
    name: 'Moxico',
    municipalities: ['Luena', 'Léua', 'Cameia', 'Camanongue', 'Luau'],
  },
  {
    name: 'Lunda Norte',
    municipalities: ['Dundo', 'Chitato', 'Cambulo', 'Lucapa', 'Cuilo'],
  },
  {
    name: 'Lunda Sul',
    municipalities: ['Saurimo', 'Dala', 'Muconda', 'Cacolo'],
  },
  {
    name: 'Cunene',
    municipalities: ['Ondjiva', 'Cuanhama', 'Namacunde', 'Ombadja', 'Cahama'],
  },
  {
    name: 'Cuando Cubango',
    municipalities: ['Menongue', 'Cuito Cuanavale', 'Cuchi', 'Mavinga'],
  },
];

export const ANGOLAN_BANKS = [
  { code: '0040', name: 'Banco BAI (Banco Angolano de Investimentos)' },
  { code: '0006', name: 'Banco BFA (Banco de Fomento Angola)' },
  { code: '0043', name: 'Banco Millennium Atlântico' },
  { code: '0051', name: 'Banco BIC (Banco Internacional de Crédito)' },
  { code: '0004', name: 'Banco BPC (Banco de Poupança e Crédito)' },
  { code: '0055', name: 'Banco Sol' },
  { code: '0059', name: 'Standard Bank Angola' },
  { code: '0044', name: 'Banco Caixa Geral Angola' },
];

export const PRODUCT_CATEGORIES: { name: ProductCategory; icon: string; count: number }[] = [
  { name: 'Telemóveis e Eletrónica', icon: 'Smartphone', count: 18 },
  { name: 'Roupa e Calçado', icon: 'Shirt', count: 24 },
  { name: 'Casa e Mobiliário', icon: 'Armchair', count: 12 },
  { name: 'Beleza e Cuidados Pessoais', icon: 'Sparkles', count: 15 },
  { name: 'Acessórios', icon: 'Watch', count: 9 },
  { name: 'Computadores', icon: 'Laptop', count: 14 },
  { name: 'Artigos Desportivos', icon: 'Dumbbell', count: 7 },
  { name: 'Produtos para Crianças', icon: 'Baby', count: 11 },
  { name: 'Outros Produtos', icon: 'Package', count: 6 },
];

export function formatKz(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 Kz';
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' Kz';
}

export const SEED_STORES: SellerStore[] = [
  {
    storeId: 'store_kamba_tech',
    ownerId: 'seller_kamba_tech_uid',
    name: 'Kamba Tech Luanda',
    description: 'Especialistas em smartphones, computadores e gadgets originais com garantia em Angola.',
    phone: '+244 923 456 789',
    province: 'Luanda',
    municipality: 'Talatona',
    acceptsCashOnDelivery: true,
    status: 'approved',
    isVerified: true,
    nifOrBi: '541289472LA041',
    whatsapp: '+244 923 456 789',
    commissionRate: 0.05,
    rating: 4.9,
    totalSales: 47,
    createdAt: new Date().toISOString(),
  },
  {
    storeId: 'store_benguela_moda',
    ownerId: 'seller_benguela_moda_uid',
    name: 'Benguela Chic & Moda',
    description: 'Vestuário e calçado contemporâneo angolano, acessórios e artigos de moda com entrega rápida.',
    phone: '+244 912 345 678',
    province: 'Benguela',
    municipality: 'Lobito',
    acceptsCashOnDelivery: true,
    status: 'approved',
    isVerified: true,
    nifOrBi: '540932187BA032',
    whatsapp: '+244 912 345 678',
    commissionRate: 0.05,
    rating: 4.8,
    totalSales: 32,
    createdAt: new Date().toISOString(),
  },
  {
    storeId: 'store_huambo_eletro',
    ownerId: 'seller_huambo_eletro_uid',
    name: 'Huambo Eletro & Lar',
    description: 'Electrodomésticos e utilidades para a sua casa com entrega rápida no Planalto Central.',
    phone: '+244 934 567 890',
    province: 'Huambo',
    municipality: 'Huambo',
    acceptsCashOnDelivery: true,
    status: 'approved',
    isVerified: true,
    nifOrBi: '542019843HB019',
    whatsapp: '+244 934 567 890',
    commissionRate: 0.05,
    rating: 4.7,
    totalSales: 19,
    createdAt: new Date().toISOString(),
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    productId: 'prod_001',
    sellerId: 'seller_kamba_tech_uid',
    storeName: 'Kamba Tech Luanda',
    name: 'Samsung Galaxy A55 5G 256GB - Novo Selado',
    description: 'Smartphone Samsung Galaxy A55 5G com 8GB RAM, 256GB de armazenamento, ecrã Super AMOLED 120Hz e câmara tripla de 50MP. Versão oficial com garantia de 1 ano.',
    price: 360000,
    category: 'Telemóveis e Eletrónica',
    stock: 8,
    condition: 'novo',
    province: 'Luanda',
    municipality: 'Talatona',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'published',
    featured: true,
    acceptsCashOnDelivery: true,
    deliveryCost: 2500,
    deliveryNotes: 'Entrega em Luanda no mesmo dia. Ponto de encontro no Belas Shopping ou entrega em casa.',
    affiliateEnabled: true,
    affiliateCommissionRate: 0.15, // 15% de comissão = 54.000 Kz
    requiresAffiliateApproval: false,
    affiliateMarketingMaterials: [
      'Smartphone mais vendido do momento em Luanda! 8GB RAM, câmara fantástica de 50MP e bateria para dois dias.',
      'Garantia oficial e entrega no mesmo dia com pagamento na entrega.'
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    productId: 'prod_002',
    sellerId: 'seller_kamba_tech_uid',
    storeName: 'Kamba Tech Luanda',
    name: 'Portátil HP Pavilion 15" Core i7 16GB 512GB SSD',
    description: 'Computador portátil de alta performance para trabalho, estudo e programação. Processador Intel Core i7 12ª geração, teclado retroiluminado com layout português e bateria de longa duração.',
    price: 680000,
    category: 'Computadores',
    stock: 4,
    condition: 'novo',
    province: 'Luanda',
    municipality: 'Luanda',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'published',
    featured: true,
    acceptsCashOnDelivery: true,
    deliveryCost: 3500,
    deliveryNotes: 'Entregamos em toda a província de Luanda com teste no ato da entrega.',
    affiliateEnabled: true,
    affiliateCommissionRate: 0.10, // 10% = 68.000 Kz
    requiresAffiliateApproval: true, // Requer aprovação da empresa
    affiliateMarketingMaterials: [
      'O portátil ideal para profissionais e estudantes universitários em Angola. Core i7 + 16GB RAM super rápido!',
    ],
    isReal: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    productId: 'prod_004',
    sellerId: 'seller_benguela_moda_uid',
    storeName: 'Benguela Chic & Moda',
    name: 'Sapatilhas Desportivas Air Pro Unissexo (Tamanhos 39 a 44)',
    description: 'Calçado ergonómico e super leve para corrida e uso diário. Sola antiderrapante com amortecimento a ar.',
    price: 45000,
    category: 'Roupa e Calçado',
    stock: 12,
    condition: 'novo',
    province: 'Benguela',
    municipality: 'Benguela',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'published',
    featured: false,
    acceptsCashOnDelivery: true,
    deliveryCost: 1500,
    deliveryNotes: 'Entrega gratuita na cidade de Benguela para compras de 2 pares.',
    affiliateEnabled: true,
    affiliateCommissionRate: 0.12, // 12% = 5.400 Kz
    requiresAffiliateApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    productId: 'prod_005',
    sellerId: 'seller_huambo_eletro_uid',
    storeName: 'Huambo Eletro & Lar',
    name: 'Fritadeira Elétrica sem Óleo (Air Fryer) Digital 5.5L',
    description: 'Cozinhe de forma mais saudável com a Air Fryer digital de 5.5 litros. Painel touch com 8 programas pré-definidos, potência de 1800W e cesto antiaderente fácil de limpar.',
    price: 75000,
    category: 'Casa e Mobiliário',
    stock: 7,
    condition: 'novo',
    province: 'Huambo',
    municipality: 'Huambo',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'published',
    featured: true,
    acceptsCashOnDelivery: true,
    deliveryCost: 2000,
    deliveryNotes: 'Entrega na cidade do Huambo e Caála.',
    affiliateEnabled: true,
    affiliateCommissionRate: 0.15, // 15% = 11.250 Kz
    requiresAffiliateApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    productId: 'prod_008',
    sellerId: 'seller_benguela_moda_uid',
    storeName: 'Benguela Chic & Moda',
    name: 'Kit de Cuidados de Pele com Karité e Baobá Angolano',
    description: 'Kit orgânico de cuidados com a pele, formulado com manteiga de karité pura e óleo de sementes de baobá angolano. Nutre profundamente em clima seco.',
    price: 22000,
    category: 'Beleza e Cuidados Pessoais',
    stock: 18,
    condition: 'novo',
    province: 'Benguela',
    municipality: 'Lobito',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'published',
    featured: true,
    acceptsCashOnDelivery: true,
    deliveryCost: 1500,
    affiliateEnabled: true,
    affiliateCommissionRate: 0.20, // 20% = 4.400 Kz
    requiresAffiliateApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];
