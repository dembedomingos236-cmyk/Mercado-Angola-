// TypeScript interfaces for Academia de Vendas e Marketing Digital
// Includes comprehensive fields for pricing in AOA (Kwanzas), content status workflows, and user progress tracking.

export type ContentStatus = 'draft' | 'published' | 'archived';
export type LessonStatus = 'draft' | 'published';
export type ModuleStatus = 'draft' | 'published';
export type EnrollmentStatus = 'active' | 'completed' | 'suspended' | 'expired' | 'cancelled';
export type EnrollmentAccessType = 'paid' | 'merit_award' | 'admin_grant';
export type CourseDifficulty = 'iniciante' | 'intermediario' | 'avancado';

export type CourseCategory =
  | 'Vendas Online'
  | 'Marketing Digital'
  | 'Publicidade e Anúncios'
  | 'Gestão de Negócios'
  | 'Atendimento ao Cliente';

/**
 * Interface representing an individual Lesson in an Academy module.
 * Includes content status, ordering, and duration.
 */
export interface Lesson {
  lessonId: string;
  title: string;
  durationMinutes: number;
  summary: string;
  content: string; // Strategy guidelines, scripts, actionable steps
  videoUrl?: string;
  isFreePreview?: boolean;
  order?: number;

  // Content status
  status?: LessonStatus;
  contentStatus?: LessonStatus;

  resources?: { title: string; url: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export type CourseLesson = Lesson;

/**
 * Interface representing a curriculum Module containing ordered lessons.
 * Includes content status and module structure.
 */
export interface Module {
  moduleId: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order?: number;

  // Content status
  status?: ModuleStatus;
  contentStatus?: ModuleStatus;

  createdAt?: string;
  updatedAt?: string;
}

export type CourseModule = Module;

/**
 * Interface representing a Course in the Academy.
 * Explicitly includes pricing in AOA (Kwanzas) and content status.
 */
export interface Course {
  courseId: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;

  // Pricing in AOA (Angolan Kwanzas)
  priceAoa: number; // Official price in Kwanzas (AOA)
  currency: 'AOA'; // ISO currency code
  price: number; // Base/current price (in AOA) for general compatibility
  originalPriceAoa?: number; // Strike-through base price before promotional discount
  discountPriceAoa?: number; // Optional promotional discounted price in AOA

  instructor: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };

  modules: Module[];
  totalDurationHours: number;
  difficulty: CourseDifficulty;
  category: CourseCategory;
  enrolledStudentsCount: number;
  rating: number;

  // Content status
  status: ContentStatus; // 'draft' | 'published' | 'archived'
  contentStatus: ContentStatus; // Explicit content status
  isPublished: boolean; // Direct publication flag

  // Merit and rewards eligibility
  meritEligible: boolean; // Can be awarded free for performance/sales milestone
  meritCriteriaDescription?: string;

  createdAt: string;
  updatedAt?: string;
}

/**
 * Interface representing an Enrollment for a user in a Course.
 * Explicitly includes pricing in AOA, enrollment/content status, and granular user progress.
 */
export interface Enrollment {
  enrollmentId: string;
  courseId: string;
  userId: string;
  userEmail: string;
  userName: string;
  accessType: EnrollmentAccessType; // 'paid' | 'merit_award' | 'admin_grant'
  paymentAttemptId?: string;

  // Pricing in AOA (Kwanzas)
  amountPaidAoa: number; // Official amount paid in Kwanzas (AOA)
  amountPaid: number; // Base amount paid (0 for merit awards and admin grants)
  currency?: 'AOA';

  // Merit information
  meritAwardId?: string;
  meritReason?: string;

  // Enrollment and content access status
  status: EnrollmentStatus; // 'active' | 'completed' | 'suspended' | 'expired' | 'cancelled'

  // User Progress tracking
  progressPercentage: number; // 0 to 100
  completedLessonIds: string[]; // List of completed lesson IDs
  completedLessonsCount?: number; // Total count of finished lessons
  totalLessonsCount?: number; // Total lessons in course
  lastAccessedLessonId?: string; // ID of the last viewed lesson
  lastAccessedAt?: string; // Timestamp of last student activity (ISO string)
  isCompleted?: boolean; // Convenience flag when 100% completed
  completedAt?: string; // Completion timestamp
  enrolledAt: string; // ISO date of initial enrollment
}

export type CourseEnrollment = Enrollment;

/**
 * Campaign for rewarding high-performing sellers and affiliates with free courses.
 */
export interface MeritCampaign {
  campaignId: string;
  title: string;
  description: string;
  targetCourseId: string;
  targetCourseTitle: string;
  userTargetType: 'seller' | 'affiliate' | 'all';
  metricType: 'confirmed_sales_count' | 'sales_volume_aoa';
  requiredThreshold: number; // e.g. 5 sales or 100,000 AOA
  active: boolean;
  createdAt: string;
}

/**
 * Record of a merit award granted to an eligible participant.
 */
export interface MeritAward {
  awardId: string;
  campaignId: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  reason: string;
  metricValueAchieved: number;
  awardedAt: string;
}

/**
 * Backend-authoritative financial calculation response for Academy revenue.
 */
export interface AcademyFinancials {
  totalRevenueAoa: number; // Gross course sales in AOA
  platformCommissionRate: number; // Platform fee on course sales (default 0.05 / 5%)
  platformCommissionAmountAoa: number; // Retained by platform in AOA
  instructorShareAmountAoa: number; // Net distributed to instructors / creators in AOA
  paidEnrollmentsCount: number;
  meritAwardsCount: number;
  adminGrantsCount: number;
  totalEnrollments: number;
  averageCourseTicketAoa: number;
  calculatedAt: string;
  calculationEngine: 'backend_authoritative';
}
