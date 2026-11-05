import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Phone,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { Course, CourseEnrollment, CourseLesson } from '../types';
import { academyService } from '../services/academyService';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';

interface AcademyViewProps {
  onContactAdmin?: () => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ onContactAdmin }) => {
  const { user, profile } = useAuth();
  const { orders } = useMarket();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Classroom / Course viewer state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

  // Payment modal state
  const [paymentModalCourse, setPaymentModalCourse] = useState<Course | null>(null);
  const [multicaixaPhone, setMulticaixaPhone] = useState(profile?.phoneNumber || '');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Merit calculations
  const [sellerConfirmedSales, setSellerConfirmedSales] = useState(0);
  const [sellerSalesVolume, setSellerSalesVolume] = useState(0);

  useEffect(() => {
    loadAcademyData();
  }, [user]);

  const loadAcademyData = async () => {
    setLoading(true);
    try {
      const allCourses = await academyService.getCourses();
      setCourses(allCourses);

      if (user?.uid) {
        const userEnrs = await academyService.getUserEnrollments(user.uid);
        setEnrollments(userEnrs);

        // Calculate confirmed sales for merit eligibility
        // Confirmed sales: paymentStatus === 'confirmed' and status !== 'cancelled' and status !== 'refunded'
        let confirmedSales = 0;
        let volume = 0;

        orders.forEach(ord => {
          const isRelated =
            (profile?.role === 'seller' && ord.sellerIds?.includes(user.uid)) ||
            (profile?.role === 'affiliate' && ord.affiliateId === user.uid);

          const isConfirmed =
            (ord.paymentStatus === 'received' || ord.orderStatus === 'confirmed' || ord.orderStatus === 'delivered') &&
            ord.orderStatus !== 'cancelled' &&
            ord.orderStatus !== 'refunded';

          if (isRelated && isConfirmed) {
            confirmedSales++;
            volume += ord.totalAmount;
          }
        });

        setSellerConfirmedSales(confirmedSales);
        setSellerSalesVolume(volume);

        // Check if user is eligible for any merit awards
        if (profile?.role === 'seller' || profile?.role === 'affiliate') {
          const newAwards = await academyService.evaluateMeritRewards({
            userId: user.uid,
            userEmail: user.email || '',
            userName: profile.displayName || user.email || 'Utilizador',
            userRole: profile.role,
            confirmedSalesCount: confirmedSales,
            salesVolumeAoa: volume
          });

          if (newAwards.length > 0) {
            // refresh enrollments if awarded
            const updatedEnrs = await academyService.getUserEnrollments(user.uid);
            setEnrollments(updatedEnrs);
          }
        }
      }
    } catch (err) {
      console.error('Error loading academy:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEnrollmentForCourse = (courseId: string): CourseEnrollment | undefined => {
    return enrollments.find(e => e.courseId === courseId);
  };

  const handleOpenCourse = (course: Course) => {
    setActiveCourse(course);
    // Select first lesson by default
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      setActiveLesson(course.modules[0].lessons[0]);
    }
  };

  const handleToggleLessonComplete = async (courseId: string, lessonId: string) => {
    const enr = getEnrollmentForCourse(courseId);
    if (!enr || !activeCourse) return;

    let totalLessons = 0;
    activeCourse.modules.forEach(m => (totalLessons += m.lessons.length));

    await academyService.markLessonCompleted(enr.enrollmentId, lessonId, totalLessons);
    // Refresh enrollments locally
    const updated = await academyService.getUserEnrollments(user!.uid);
    setEnrollments(updated);
  };

  const handleConfirmCoursePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCourse || !user) return;

    if (!multicaixaPhone.trim()) {
      setPaymentError('Por favor informe o número de telemóvel associado ao MULTICAIXA Express.');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      const res = await academyService.verifyAndEnrollCourse({
        courseId: paymentModalCourse.courseId,
        courseTitle: paymentModalCourse.title,
        coursePrice: paymentModalCourse.price,
        userId: user.uid,
        userEmail: user.email || '',
        userName: profile?.displayName || user.email || 'Aluno Mercado Angola',
        provider: 'MULTICAIXA_EXPRESS',
        phoneOrReference: multicaixaPhone.trim()
      });

      if (res.success && res.enrollment) {
        setPaymentSuccess(true);
        // Refresh enrollments
        const updatedEnrs = await academyService.getUserEnrollments(user.uid);
        setEnrollments(updatedEnrs);
        setTimeout(() => {
          setPaymentModalCourse(null);
          setPaymentSuccess(false);
          // Open the course
          handleOpenCourse(paymentModalCourse);
        }, 1500);
      } else {
        setPaymentError(res.error || 'Falha ao confirmar o pagamento eletrónico.');
      }
    } catch (err: any) {
      setPaymentError('Erro durante o processamento da transação.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const categories = ['Todas', 'Vendas Online', 'Marketing Digital', 'Publicidade e Anúncios', 'Gestão de Negócios'];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'Todas' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-700 via-yellow-600 to-amber-700 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-yellow-200 mb-3">
            <GraduationCap className="w-4 h-4" /> Academia Oficial do Mercado Angola
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
            Academia de Vendas e Marketing Digital
          </h1>
          <p className="text-sm sm:text-base text-yellow-100 leading-relaxed mb-6">
            Aprenda a vender no WhatsApp, dominar o tráfego pago em Angola, negociar com clientes e expandir as suas vendas e comissões. Cursos práticos adaptados ao mercado angolano com preços em Kwanzas (AOA) e recompensas de mérito para os melhores vendedores e afiliados.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Acesso Seguro com MULTICAIXA Express</span>
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Award className="w-4 h-4 text-yellow-300" />
              <span>Desbloqueio Gratuito por Mérito</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance & Merit Status Banner */}
      {user && (profile?.role === 'seller' || profile?.role === 'affiliate') && (
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-red-500/10 border-2 border-yellow-300/80 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  O seu Desempenho no Mercado Angola
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-yellow-100 text-yellow-800">
                  {profile.role === 'seller' ? 'Vendedor' : 'Afiliado'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Vendas Confirmadas: <strong className="text-red-600">{sellerConfirmedSales}</strong> • Volume: <strong className="text-gray-900">{sellerSalesVolume.toLocaleString('pt-AO')} Kz</strong> (Vendas canceladas ou em disputa são excluídas).
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-yellow-200">
              {sellerConfirmedSales >= 5
                ? '⭐ Recompensa de Mérito Conquistada!'
                : `Faltam ${5 - sellerConfirmedSales} vendas para ganhar 1 curso grátis`}
            </span>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar cursos..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>
      </div>

      {/* Course Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredCourses.map(course => {
          const enrollment = getEnrollmentForCourse(course.courseId);
          const isEnrolled = !!enrollment;

          let totalLessonsCount = 0;
          course.modules.forEach(m => (totalLessonsCount += m.lessons.length));

          return (
            <div
              key={course.courseId}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/75 backdrop-blur-sm text-white">
                      {course.category}
                    </span>
                    {course.meritEligible && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-yellow-500 text-white flex items-center gap-1 shadow-sm">
                        <Award className="w-3 h-3" /> Mérito Elegível
                      </span>
                    )}
                  </div>
                  {isEnrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {enrollment.accessType === 'merit_award' ? 'Prémio Mérito' : 'Inscrito'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-red-500" /> {course.totalDurationHours}h de aulas
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-red-500" /> {totalLessonsCount} aulas
                    </span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-gray-600">{course.difficulty}</span>
                  </div>

                  <h3 className="font-black text-gray-900 text-base leading-snug mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {course.subtitle || course.description}
                  </p>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                      {course.instructor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-none">{course.instructor.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{course.instructor.title}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Price and Action Button */}
              <div className="p-5 pt-0">
                {isEnrolled ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-600 font-semibold">
                      <span>Progresso do Aluno</span>
                      <span>{enrollment.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progressPercentage || 0}%` }}
                      />
                    </div>
                    <button
                      onClick={() => handleOpenCourse(course)}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <PlayCircle className="w-4 h-4" /> Continuar a Estudar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Investimento</span>
                      <span className="text-lg font-black text-gray-900">
                        {course.price.toLocaleString('pt-AO')} Kz
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCourse(course)}
                        className="py-2 px-3 border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold rounded-xl transition"
                        title="Ver grade curricular"
                      >
                        Ver Conteúdo
                      </button>
                      <button
                        onClick={() => setPaymentModalCourse(course)}
                        className="py-2.5 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Comprar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Classroom / Course Viewer Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                    {activeCourse.category}
                  </span>
                  <h2 className="text-base sm:text-xl font-black text-white line-clamp-1">
                    {activeCourse.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setActiveCourse(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split into Curriculum Sidebar & Lesson Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Sidebar with modules & lessons */}
              <div className="w-full md:w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4 shrink-0">
                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
                  Estrutura do Curso
                </h4>

                {activeCourse.modules.map((module, mIdx) => (
                  <div key={module.moduleId} className="mb-4">
                    <p className="text-xs font-bold text-gray-800 mb-2 leading-tight">
                      {module.title}
                    </p>
                    <div className="space-y-1">
                      {module.lessons.map(lesson => {
                        const enrollment = getEnrollmentForCourse(activeCourse.courseId);
                        const isEnrolled = !!enrollment;
                        const isCompleted = enrollment?.completedLessonIds?.includes(lesson.lessonId);
                        const isLocked = !isEnrolled && !lesson.isFreePreview;
                        const isSelected = activeLesson?.lessonId === lesson.lessonId;

                        return (
                          <button
                            key={lesson.lessonId}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                                : 'hover:bg-gray-200/60 text-gray-700 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2 line-clamp-1 pr-2">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              ) : (
                                <PlayCircle className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {lesson.durationMinutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lesson View Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
                {activeLesson ? (
                  <div>
                    {/* Check if locked */}
                    {(() => {
                      const enrollment = getEnrollmentForCourse(activeCourse.courseId);
                      const isEnrolled = !!enrollment;
                      const isLocked = !isEnrolled && !activeLesson.isFreePreview;

                      if (isLocked) {
                        return (
                          <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 max-w-lg mx-auto my-8">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Lock className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              Aula Exclusiva para Alunos Inscritos
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed mb-6">
                              O acesso completo às estratégias, scripts e aulas gravadas é liberado mediante confirmação eletrónica de pagamento ou por recompensa de mérito.
                            </p>
                            <button
                              onClick={() => setPaymentModalCourse(activeCourse)}
                              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 mx-auto"
                            >
                              <CreditCard className="w-4 h-4" /> Desbloquear Acesso por {activeCourse.price.toLocaleString('pt-AO')} Kz
                            </button>
                          </div>
                        );
                      }

                      // Lesson is accessible
                      const isCompleted = enrollment?.completedLessonIds?.includes(activeLesson.lessonId);

                      return (
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                                Aula Prática • {activeLesson.durationMinutes} minutos
                              </span>
                              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                                {activeLesson.title}
                              </h2>
                            </div>

                            {isEnrolled && (
                              <button
                                onClick={() => handleToggleLessonComplete(activeCourse.courseId, activeLesson.lessonId)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                                {isCompleted ? 'Concluída' : 'Marcar como Concluída'}
                              </button>
                            )}
                          </div>

                          {/* Video player simulation / placeholder */}
                          <div className="w-full aspect-video bg-gray-900 rounded-2xl mb-6 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner">
                            <PlayCircle className="w-16 h-16 text-red-600 hover:scale-110 transition cursor-pointer mb-2" />
                            <p className="text-xs font-bold text-gray-300">
                              Aula Interativa • {activeCourse.title}
                            </p>
                            <span className="text-[10px] text-gray-500 mt-1">
                              Instrutor: {activeCourse.instructor.name}
                            </span>
                          </div>

                          {/* Lesson Summary & Content */}
                          <div className="prose max-w-none">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                              Resumo Operacional da Aula:
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 bg-yellow-50/70 p-4 rounded-xl border border-yellow-200">
                              {activeLesson.summary}
                            </p>

                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                              Instruções Práticas e Aplicação Imediata:
                            </h4>
                            <div className="text-xs sm:text-sm text-gray-800 leading-relaxed bg-white p-5 rounded-xl border border-gray-200 whitespace-pre-line">
                              {activeLesson.content}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Selecione uma aula na coluna esquerda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTICAIXA Express Electronic Payment Modal */}
      {paymentModalCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => {
                setPaymentModalCourse(null);
                setPaymentError(null);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Inscrição com MULTICAIXA Express
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Pagamento eletrónico seguro em Kwanzas (AOA)
              </p>
            </div>

            {/* Course Summary Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Curso Selecionado
              </p>
              <h4 className="text-sm font-bold text-gray-900 leading-snug">
                {paymentModalCourse.title}
              </h4>
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Total a Pagar:</span>
                <span className="text-lg font-black text-red-600">
                  {paymentModalCourse.price.toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-950">
                  Pagamento Confirmado!
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  O curso foi desbloqueado com sucesso na sua conta. A redirecionar para a sala de aula...
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmCoursePayment} className="space-y-4">
                {paymentError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número de Telemóvel MULTICAIXA Express *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={multicaixaPhone}
                      onChange={e => setMulticaixaPhone(e.target.value)}
                      placeholder="Ex: 923 000 000"
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Receberá a notificação de autorização no seu aplicativo MULTICAIXA Express.
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <strong>Regra de Segurança:</strong> O acesso ao curso só é validado após a confirmação eletrónica do pagamento pelo sistema.
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <span>A comunicar com a rede MULTICAIXA...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirmar Pagamento de {paymentModalCourse.price.toLocaleString('pt-AO')} Kz
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
