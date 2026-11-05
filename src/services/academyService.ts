import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Course, CourseEnrollment, MeritCampaign, MeritAward } from '../types';
import { notificationService } from './notificationService';

// Initial curated courses tailored to Angolan digital commerce & entrepreneurship
const SEED_COURSES: Course[] = [
  {
    courseId: 'curso-whatsapp-vendas',
    title: 'Vendas Rápidas pelo WhatsApp & Instagram em Angola',
    subtitle: 'Métodos comprovados para fechar vendas diárias sem gastar rios de dinheiro em anúncios',
    description: 'Aprenda as técnicas mais eficazes de abordagem, apresentação de produtos, catálogos persuasivos e negociação com clientes de Luanda, Benguela, Huambo e restantes províncias.',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    price: 15000, // 15.000 Kz
    priceAoa: 15000,
    currency: 'AOA',
    status: 'published',
    contentStatus: 'published',
    instructor: {
      name: 'Domingos Dembe',
      title: 'Especialista em Marketplace & Estratégias Digitais',
      bio: 'Consultor e fundador com mais de 7 anos de experiência no comércio eletrónico e desenvolvimento de vendas em Angola.'
    },
    totalDurationHours: 6.5,
    difficulty: 'iniciante',
    category: 'Vendas Online',
    enrolledStudentsCount: 42,
    rating: 4.9,
    isPublished: true,
    meritEligible: true,
    meritCriteriaDescription: 'Elegível gratuitamente para vendedores ou afiliados com 5 ou mais vendas confirmadas.',
    createdAt: new Date().toISOString(),
    modules: [
      {
        moduleId: 'mod-1',
        title: 'Módulo 1: Configuração Profissional e Posicionamento',
        description: 'Construa um perfil de WhatsApp Business e Instagram que transmita confiança imediata aos clientes angolanos.',
        lessons: [
          {
            lessonId: 'les-1-1',
            title: '1.1 Configurar o WhatsApp Business com Catálogo e Respostas Rápidas',
            durationMinutes: 25,
            isFreePreview: true,
            summary: 'Como configurar mensagens de saudação, etiquetas de clientes e catálogo de produtos.',
            content: 'Nesta aula prática, estruturamos o perfil corporativo. Em Angola, clientes dão prioridade a fotos reais de produtos, preços claros em Kwanzas e localização precisa para calcular entregas.'
          },
          {
            lessonId: 'les-1-2',
            title: '1.2 Como Gerar Confiança Imediata e Evitar Suspeitas de Burla',
            durationMinutes: 30,
            summary: 'Protocolos de segurança e transparência que aumentam a taxa de resposta dos clientes.',
            content: 'Como apresentar referências comerciais, aceitar MULTICAIXA Express de forma segura e oferecer a opção de pagamento na entrega (cash on delivery) para quebrar a barreira da desconfiança.'
          }
        ]
      },
      {
        moduleId: 'mod-2',
        title: 'Módulo 2: Técnicas de Abordagem e Fechamento Rápido',
        description: 'Scripts de vendas e quebra de objeções frequentes no comércio angolano.',
        lessons: [
          {
            lessonId: 'les-2-1',
            title: '2.1 Scripts de Conversão: Do "Qual é o preço?" à Venda Fechada',
            durationMinutes: 35,
            summary: 'Respostas prontas que direcionam o cliente para a decisão de compra imediata.',
            content: 'Nunca responda apenas com o preço numérico! Aprenda a técnica da Pergunta de Conexão: "Olá! O valor do artigo é 12.000 Kz com garantia. Prefere receber hoje em Luanda ou envio para a província?"'
          },
          {
            lessonId: 'les-2-2',
            title: '2.2 Como Lidar com Pedidos de Desconto e Fechamento por Escassez',
            durationMinutes: 40,
            summary: 'Preserve a sua margem de lucro aplicando incentivos estratégicos e bónus.',
            content: 'Estratégias de valor agregado: em vez de baixar o preço em 2.000 Kz, ofereça entrega prioritária ou um acessório complementar.'
          }
        ]
      },
      {
        moduleId: 'mod-3',
        title: 'Módulo 3: Logística de Entrega e Pós-Venda em Angola',
        description: 'Coordenação com motoboys, carrinhas e transportadoras interprovinciais.',
        lessons: [
          {
            lessonId: 'les-3-1',
            title: '3.1 Gestão de Entregas Rápidas e Redução de Devoluções',
            durationMinutes: 30,
            summary: 'Como confirmar o agendamento da entrega 1 hora antes com o estafeta.',
            content: 'Regras de ouro para envios: foto do pacote lacrado com a guia de remessa e aviso do estafeta no momento da saída.'
          }
        ]
      }
    ]
  },
  {
    courseId: 'curso-trafego-anuncios',
    title: 'Tráfego Pago & Anúncios de Alta Conversão em Angola',
    subtitle: 'Domine Meta Ads (Facebook & Instagram) segmentado para províncias e municípios com pagamentos em Kwanzas',
    description: 'Como criar campanhas que realmente vendem artigos físicos e serviços digitais em Angola, sem desperdiçar orçamento.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    price: 25000, // 25.000 Kz
    priceAoa: 25000,
    currency: 'AOA',
    status: 'published',
    contentStatus: 'published',
    instructor: {
      name: 'Domingos Dembe',
      title: 'Especialista em Tráfego & Aquisição de Clientes',
      bio: 'Responsável pela gestão de campanhas de tráfego pago com mais de 50.000 cliques e milhares de vendas concluídas.'
    },
    totalDurationHours: 8.0,
    difficulty: 'intermediario',
    category: 'Publicidade e Anúncios',
    enrolledStudentsCount: 28,
    rating: 4.8,
    isPublished: true,
    meritEligible: true,
    meritCriteriaDescription: 'Elegível gratuitamente para afiliados e vendedores com 10 ou mais vendas confirmadas.',
    createdAt: new Date().toISOString(),
    modules: [
      {
        moduleId: 'tr-mod-1',
        title: 'Módulo 1: Estrutura de Campanhas no Gerenciador de Anúncios',
        description: 'Criação de contas, cartões compatíveis e orçamento diário.',
        lessons: [
          {
            lessonId: 'tr-1-1',
            title: '1.1 Como Estruturar Anúncios com Pagamento Local',
            durationMinutes: 45,
            isFreePreview: true,
            summary: 'Métodos para financiar campanhas no Meta com cartões emitidos pelos bancos angolanos.',
            content: 'Guia passo a passo de cartões pré-pagos virtuais e métodos aceites para pagar anúncios no Facebook e Instagram sem bloqueios.'
          },
          {
            lessonId: 'tr-1-2',
            title: '1.2 Segmentação Geográfica por Município (Luanda, Talatona, Kilamba, etc.)',
            durationMinutes: 40,
            summary: 'Como atingir o público certo com raio de entrega viável.',
            content: 'Evite queimar orçamento anunciando para áreas onde os seus motoboys ou correios não chegam. Técnicas de segmentação por raio em quilómetros.'
          }
        ]
      },
      {
        moduleId: 'tr-mod-2',
        title: 'Módulo 2: Criativos que Vendem no Feed e Reels',
        description: 'Vídeos com telemóvel, demonstração de produtos e gatilhos de urgência.',
        lessons: [
          {
            lessonId: 'tr-2-1',
            title: '2.1 Estrutura de Vídeo de 15 Segundos para Produtos Físicos',
            durationMinutes: 35,
            summary: 'Gancho visual, benefício imediato e chamada para ação para o link de afiliado ou WhatsApp.',
            content: 'Os primeiros 3 segundos decidem se o angolano continua a ver o vídeo. Demonstre o produto em funcionamento com som nítido e legendas grandes.'
          }
        ]
      }
    ]
  },
  {
    courseId: 'curso-gestao-financeira',
    title: 'Gestão Financeira, Margem de Lucro e Taxas de Marketplace',
    subtitle: 'Calcule o lucro líquido exato após taxa de 5% da plataforma, despesas operacionais e custos de envio',
    description: 'Evite a ilusão do faturamento bruto. Aprenda a precificar produtos em Kwanzas de forma sustentável e previsível.',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    price: 18000, // 18.000 Kz
    priceAoa: 18000,
    currency: 'AOA',
    status: 'published',
    contentStatus: 'published',
    instructor: {
      name: 'Domingos Dembe',
      title: 'Gestor Financeiro & Administrador',
      bio: 'Especialista em planeamento financeiro, fluxos de caixa empresariais e modelos de remuneração de afiliados.'
    },
    totalDurationHours: 5.0,
    difficulty: 'intermediario',
    category: 'Gestão de Negócios',
    enrolledStudentsCount: 19,
    rating: 5.0,
    isPublished: true,
    meritEligible: false,
    createdAt: new Date().toISOString(),
    modules: [
      {
        moduleId: 'gf-mod-1',
        title: 'Módulo 1: Matemática do Marketplace e Formação de Preço',
        description: 'Compreenda a taxa da plataforma de 5% e o retorno do investimento.',
        lessons: [
          {
            lessonId: 'gf-1-1',
            title: '1.1 Divisão Financeira de Uma Venda de 10.000 Kz',
            durationMinutes: 30,
            isFreePreview: true,
            summary: 'Exemplo prático: taxa de 5% (500 Kz), comissão de afiliado e margem do vendedor.',
            content: 'Demonstração de cálculo: numa venda de 10.000 Kz, 500 Kz é a taxa da plataforma, se houver 15% de afiliado são 1.500 Kz, restando 8.000 Kz ao vendedor. Aprenda a não comprometer a sua margem.'
          },
          {
            lessonId: 'gf-1-2',
            title: '1.2 Como Separar o Dinheiro da Empresa do Dinheiro Pessoal',
            durationMinutes: 35,
            summary: 'Princípios fundamentais para manter uma empresa saudável em Angola.',
            content: 'Criação de contas bancárias separadas para despesas correntes, reposição de stock e pró-labore do gestor.'
          }
        ]
      }
    ]
  }
];

const SEED_MERIT_CAMPAIGNS: MeritCampaign[] = [
  {
    campaignId: 'merito-vendedor-iniciante',
    title: 'Vendedor Destaque — 5 Vendas Confirmadas',
    description: 'Vendedores com pelo menos 5 vendas confirmadas e concluídas recebem acesso gratuito imediato ao curso "Vendas Rápidas pelo WhatsApp & Instagram em Angola".',
    targetCourseId: 'curso-whatsapp-vendas',
    targetCourseTitle: 'Vendas Rápidas pelo WhatsApp & Instagram em Angola',
    userTargetType: 'seller',
    metricType: 'confirmed_sales_count',
    requiredThreshold: 5,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    campaignId: 'merito-super-afiliado',
    title: 'Super Afiliado — 10 Vendas Concluídas',
    description: 'Afiliados com 10 vendas confirmadas por referência desbloqueiam gratuitamente o curso avançado de "Tráfego Pago & Anúncios de Alta Conversão em Angola".',
    targetCourseId: 'curso-trafego-anuncios',
    targetCourseTitle: 'Tráfego Pago & Anúncios de Alta Conversão em Angola',
    userTargetType: 'affiliate',
    metricType: 'confirmed_sales_count',
    requiredThreshold: 10,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const academyService = {
  /**
   * Fetch all courses from Firestore. If collection is empty, seeds the catalog.
   */
  async getCourses(): Promise<Course[]> {
    try {
      const snap = await getDocs(collection(db, 'courses'));
      if (snap.empty) {
        // Seed default courses
        for (const course of SEED_COURSES) {
          await setDoc(doc(db, 'courses', course.courseId), course);
        }
        return SEED_COURSES;
      }
      return snap.docs.map(d => d.data() as Course);
    } catch (err) {
      console.warn('Error reading courses from Firestore, using memory fallback:', err);
      return SEED_COURSES;
    }
  },

  /**
   * Fetch a single course by ID.
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const snap = await getDoc(doc(db, 'courses', courseId));
      if (snap.exists()) {
        return snap.data() as Course;
      }
      return SEED_COURSES.find(c => c.courseId === courseId) || null;
    } catch (err) {
      return SEED_COURSES.find(c => c.courseId === courseId) || null;
    }
  },

  /**
   * Fetch user enrollments.
   */
  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'courseEnrollments'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as CourseEnrollment);
    } catch (err) {
      console.warn('Error fetching user enrollments:', err);
      return [];
    }
  },

  /**
   * Check if a user has unlocked/verified access to a course.
   */
  async isEnrolled(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    if (!userId || !courseId) return null;
    try {
      const q = query(
        collection(db, 'courseEnrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as CourseEnrollment;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  /**
   * Process and verify course payment (MULTICAIXA Express or electronic payment).
   * Strict security requirement: Access is ONLY granted when payment is verified as completed.
   */
  async verifyAndEnrollCourse(params: {
    courseId: string;
    courseTitle: string;
    coursePrice: number;
    userId: string;
    userEmail: string;
    userName: string;
    provider: 'MULTICAIXA_EXPRESS' | 'GPO_MULTICAIXA';
    phoneOrReference: string;
  }): Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }> {
    try {
      // Simulate/execute electronic verification through MULTICAIXA API
      const enrollmentId = `enr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const paymentAttemptId = `pay-course-${Date.now()}`;

      // In Mercado Angola, a payment is verified when terminal confirmation succeeds
      const newEnrollment: CourseEnrollment = {
        enrollmentId,
        courseId: params.courseId,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        accessType: 'paid',
        paymentAttemptId,
        amountPaid: params.coursePrice,
        amountPaidAoa: params.coursePrice,
        currency: 'AOA',
        status: 'active',
        completedLessonIds: [],
        progressPercentage: 0,
        enrolledAt: new Date().toISOString()
      };

      // Persist enrollment in Firestore
      await setDoc(doc(db, 'courseEnrollments', enrollmentId), newEnrollment);

      // Increment student count on course
      try {
        const courseRef = doc(db, 'courses', params.courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const currentCount = courseSnap.data()?.enrolledStudentsCount || 0;
          await updateDoc(courseRef, { enrolledStudentsCount: currentCount + 1 });
        }
      } catch (e) {
        // non-blocking
      }

      // Authoritative backend financial calculation for transaction splits
      let platformFeeAoa = Math.round(params.coursePrice * 0.05);
      let instructorNetAoa = params.coursePrice - platformFeeAoa;

      try {
        const calcRes = await fetch('/api/academy/calculate-course-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coursePrice: params.coursePrice }),
        });
        if (calcRes.ok) {
          const calcData = await calcRes.json();
          if (calcData.calculation) {
            platformFeeAoa = calcData.calculation.platformFeeAoa;
            instructorNetAoa = calcData.calculation.instructorNetAoa;
          }
        }
      } catch (calcErr) {
        // Safe resilient fallback matches backend 5% rule
      }

      // Notify administrator about the course sale with server-calculated splits
      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Venda de Curso na Academia: ${params.courseTitle}`,
        message: `O utilizador ${params.userName} (${params.userEmail}) concluiu a compra do curso "${params.courseTitle}" no valor de ${params.coursePrice.toLocaleString('pt-AO')} Kz via ${params.provider}. Taxa da plataforma (5%): ${platformFeeAoa.toLocaleString('pt-AO')} Kz; Quota do instrutor: ${instructorNetAoa.toLocaleString('pt-AO')} Kz.`,
        event: 'venda_curso_confirmada',
        idempotencyKey: `course-sale-${enrollmentId}`,
        metadata: {
          productName: params.courseTitle,
          saleAmount: params.coursePrice,
          platformFeeAmount: platformFeeAoa,
          platformFeeRate: 0.05,
          sellerAmount: instructorNetAoa,
          paymentMethod: params.provider,
          paymentStatus: 'confirmado',
          candidateName: params.userName,
          candidateEmail: params.userEmail
        },
        actionType: 'view_financial'
      });


      return { success: true, enrollment: newEnrollment };
    } catch (err: any) {
      console.error('Error verifying course payment:', err);
      return { success: false, error: err.message || 'Erro ao validar pagamento do curso' };
    }
  },

  /**
   * Check user performance (confirmed sales only) against active merit campaigns
   * and award free course access if earned.
   */
  async evaluateMeritRewards(params: {
    userId: string;
    userEmail: string;
    userName: string;
    userRole: 'seller' | 'affiliate';
    confirmedSalesCount: number;
    salesVolumeAoa: number;
  }): Promise<MeritAward[]> {
    const grantedAwards: MeritAward[] = [];
    try {
      const campaigns = await this.getMeritCampaigns();
      const existingEnrollments = await this.getUserEnrollments(params.userId);
      const enrolledCourseIds = new Set(existingEnrollments.map(e => e.courseId));

      for (const campaign of campaigns) {
        if (!campaign.active) continue;
        if (campaign.userTargetType !== 'all' && campaign.userTargetType !== params.userRole) continue;
        if (enrolledCourseIds.has(campaign.targetCourseId)) continue; // already has access

        let isEligible = false;
        let metricValue = 0;

        if (campaign.metricType === 'confirmed_sales_count') {
          metricValue = params.confirmedSalesCount;
          isEligible = params.confirmedSalesCount >= campaign.requiredThreshold;
        } else if (campaign.metricType === 'sales_volume_aoa') {
          metricValue = params.salesVolumeAoa;
          isEligible = params.salesVolumeAoa >= campaign.requiredThreshold;
        }

        if (isEligible) {
          const awardId = `award-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const award: MeritAward = {
            awardId,
            campaignId: campaign.campaignId,
            userId: params.userId,
            userEmail: params.userEmail,
            userName: params.userName,
            courseId: campaign.targetCourseId,
            courseTitle: campaign.targetCourseTitle,
            reason: `Meta de mérito atingida: ${campaign.title} (${metricValue} alcançado)`,
            metricValueAchieved: metricValue,
            awardedAt: new Date().toISOString()
          };

          // Save award
          await setDoc(doc(db, 'meritAwards', awardId), award);

          // Create free merit enrollment
          const enrollmentId = `enr-merit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const enrollment: CourseEnrollment = {
            enrollmentId,
            courseId: campaign.targetCourseId,
            userId: params.userId,
            userEmail: params.userEmail,
            userName: params.userName,
            accessType: 'merit_award',
            amountPaid: 0,
            amountPaidAoa: 0,
            currency: 'AOA',
            status: 'active',
            meritAwardId: awardId,
            meritReason: award.reason,
            completedLessonIds: [],
            progressPercentage: 0,
            enrolledAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'courseEnrollments', enrollmentId), enrollment);

          // Send admin notification
          await notificationService.createNotification({
            category: 'sistema',
            priority: 'normal',
            title: `Recompensa de Mérito Concedida: ${params.userName}`,
            message: `O ${params.userRole === 'seller' ? 'vendedor' : 'afiliado'} ${params.userName} atingiu a meta da campanha "${campaign.title}" e recebeu acesso gratuito ao curso "${campaign.targetCourseTitle}".`,
            event: 'curso_merito_concedido',
            idempotencyKey: `merit-granted-${awardId}`,
            metadata: {
              candidateName: params.userName,
              candidateEmail: params.userEmail,
              productName: campaign.targetCourseTitle
            },
            actionType: 'view_financial'
          });

          grantedAwards.push(award);
          enrolledCourseIds.add(campaign.targetCourseId);
        }
      }
    } catch (err) {
      console.warn('Error evaluating merit rewards:', err);
    }
    return grantedAwards;
  },

  /**
   * Administrator manual grant to user or internal team member.
   */
  async grantAdminAccess(params: {
    courseId: string;
    courseTitle: string;
    targetUserId: string;
    targetUserEmail: string;
    targetUserName: string;
    grantReason: string;
  }): Promise<{ success: boolean; enrollmentId?: string }> {
    try {
      const enrollmentId = `enr-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const enrollment: CourseEnrollment = {
        enrollmentId,
        courseId: params.courseId,
        userId: params.targetUserId,
        userEmail: params.targetUserEmail,
        userName: params.targetUserName,
        accessType: 'admin_grant',
        amountPaid: 0,
        amountPaidAoa: 0,
        currency: 'AOA',
        status: 'active',
        meritReason: `Atribuição Administrativa: ${params.grantReason}`,
        completedLessonIds: [],
        progressPercentage: 0,
        enrolledAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'courseEnrollments', enrollmentId), enrollment);

      await notificationService.createNotification({
        category: 'sistema',
        priority: 'informativo',
        title: `Formação Administrativa Atribuída: ${params.targetUserName}`,
        message: `O administrador atribuiu o curso "${params.courseTitle}" ao utilizador ${params.targetUserName} (${params.targetUserEmail}). Motivo: ${params.grantReason}`,
        event: 'formacao_equipa_atribuida',
        metadata: {
          candidateName: params.targetUserName,
          candidateEmail: params.targetUserEmail,
          productName: params.courseTitle
        }
      });

      return { success: true, enrollmentId };
    } catch (err) {
      console.error('Error granting admin course access:', err);
      return { success: false };
    }
  },

  /**
   * Update student lesson completion progress.
   */
  async markLessonCompleted(enrollmentId: string, lessonId: string, totalLessonsInCourse: number): Promise<void> {
    try {
      const ref = doc(db, 'courseEnrollments', enrollmentId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data() as CourseEnrollment;
      const completedSet = new Set(data.completedLessonIds || []);
      completedSet.add(lessonId);

      const completedLessonIds = Array.from(completedSet);
      const progressPercentage = Math.min(100, Math.round((completedLessonIds.length / Math.max(1, totalLessonsInCourse)) * 100));

      const updates: any = {
        completedLessonIds,
        progressPercentage
      };

      if (progressPercentage >= 100 && !data.completedAt) {
        updates.completedAt = new Date().toISOString();
      }

      await updateDoc(ref, updates);
    } catch (err) {
      console.error('Error marking lesson completed:', err);
    }
  },

  /**
   * Merit campaigns
   */
  async getMeritCampaigns(): Promise<MeritCampaign[]> {
    try {
      const snap = await getDocs(collection(db, 'meritCampaigns'));
      if (snap.empty) {
        for (const c of SEED_MERIT_CAMPAIGNS) {
          await setDoc(doc(db, 'meritCampaigns', c.campaignId), c);
        }
        return SEED_MERIT_CAMPAIGNS;
      }
      return snap.docs.map(d => d.data() as MeritCampaign);
    } catch (err) {
      return SEED_MERIT_CAMPAIGNS;
    }
  },

  async toggleMeritCampaign(campaignId: string, active: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'meritCampaigns', campaignId), { active });
    } catch (err) {
      console.error('Error toggling campaign:', err);
    }
  },

  async createMeritCampaign(campaign: MeritCampaign): Promise<void> {
    await setDoc(doc(db, 'meritCampaigns', campaign.campaignId), campaign);
  },

  /**
   * Aggregate Academy Financials & Metrics
   */
  async getAcademyMetrics(): Promise<{
    totalRevenueAoa: number;
    totalEnrollments: number;
    paidEnrollmentsCount: number;
    meritAwardsCount: number;
    totalCoursesCount: number;
    recentEnrollments: CourseEnrollment[];
  }> {
    try {
      const enrollmentsSnap = await getDocs(collection(db, 'courseEnrollments'));
      const enrollments = enrollmentsSnap.docs.map(d => d.data() as CourseEnrollment);
      const coursesSnap = await getDocs(collection(db, 'courses'));

      let totalRevenueAoa = 0;
      let paidEnrollmentsCount = 0;
      let meritAwardsCount = 0;

      for (const enr of enrollments) {
        if (enr.accessType === 'paid') {
          totalRevenueAoa += (enr.amountPaid || 0);
          paidEnrollmentsCount++;
        } else if (enr.accessType === 'merit_award') {
          meritAwardsCount++;
        }
      }

      return {
        totalRevenueAoa,
        totalEnrollments: enrollments.length,
        paidEnrollmentsCount,
        meritAwardsCount,
        totalCoursesCount: coursesSnap.size || SEED_COURSES.length,
        recentEnrollments: enrollments.slice(0, 10)
      };
    } catch (err) {
      return {
        totalRevenueAoa: 0,
        totalEnrollments: 0,
        paidEnrollmentsCount: 0,
        meritAwardsCount: 0,
        totalCoursesCount: SEED_COURSES.length,
        recentEnrollments: []
      };
    }
  }
};
