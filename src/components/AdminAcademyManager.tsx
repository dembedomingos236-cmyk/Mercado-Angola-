import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Users,
  DollarSign,
  Plus,
  CheckCircle2,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Send,
  UserCheck,
  BarChart2,
  BookOpen
} from 'lucide-react';
import { Course, MeritCampaign, CourseEnrollment, MeritAward, AcademyFinancials } from '../types';
import { academyService } from '../services/academyService';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';

export const AdminAcademyManager: React.FC = () => {
  const { user } = useAuth();
  const {
    courses: contextCourses,
    enrollments: contextEnrollments,
    academyFinancials,
    recalculateAcademyFinancials,
  } = useMarket();

  const [campaigns, setCampaigns] = useState<MeritCampaign[]>([]);
  const [loading, setLoading] = useState(false);


  // Team grant form
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [grantReason, setGrantReason] = useState('Capacitação da equipa interna de vendas e suporte');
  const [isGranting, setIsGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  const [fallbackCourses, setFallbackCourses] = useState<Course[]>([]);
  const courses = contextCourses.length > 0 ? contextCourses : fallbackCourses;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allCourses, allCampaigns] = await Promise.all([
        academyService.getCourses(),
        academyService.getMeritCampaigns(),
      ]);
      setFallbackCourses(allCourses);
      setCampaigns(allCampaigns);
      if (allCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(allCourses[0].courseId);
      }
    } catch (err) {
      console.error('Error loading academy admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: boolean) => {
    await academyService.toggleMeritCampaign(campaignId, !currentStatus);
    setCampaigns(prev =>
      prev.map(c => (c.campaignId === campaignId ? { ...c, active: !currentStatus } : c))
    );
  };

  const handleGrantTeamAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !targetEmail.trim() || !targetName.trim()) return;

    setIsGranting(true);
    setGrantSuccess(null);
    try {
      const course = courses.find(c => c.courseId === selectedCourseId);
      const res = await academyService.grantAdminAccess({
        courseId: selectedCourseId,
        courseTitle: course?.title || 'Curso da Academia',
        targetUserId: `team-${Date.now()}`,
        targetUserEmail: targetEmail.trim(),
        targetUserName: targetName.trim(),
        grantReason: grantReason.trim()
      });

      if (res.success) {
        setGrantSuccess(`Curso atribuído com sucesso a ${targetName}!`);
        setTargetName('');
        setTargetEmail('');
        // Recalculate on backend
        await recalculateAcademyFinancials();
      }
    } catch (err) {
      console.error('Error granting access:', err);
    } finally {
      setIsGranting(false);
    }
  };

  // Authoritative financial values calculated on backend
  const totalRevenue = academyFinancials?.totalRevenueAoa || 0;
  const platformFee = academyFinancials?.platformCommissionAmountAoa || Math.round(totalRevenue * 0.05);
  const instructorShare = academyFinancials?.instructorShareAmountAoa || (totalRevenue - platformFee);
  const paidCount = academyFinancials?.paidEnrollmentsCount || 0;
  const meritCount = academyFinancials?.meritAwardsCount || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-red-600" />
            Gestão da Academia & Sistema de Mérito
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Controlo de receitas de cursos, cálculo de taxas e comissões no servidor backend e campanhas de mérito.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Motor Financeiro Backend Ativo
          </span>
          <button
            onClick={() => recalculateAcademyFinancials()}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Recalcular Métricas
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Receita Bruta (AOA)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900">
            {totalRevenue.toLocaleString('pt-AO')} Kz
          </p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Vendas confirmadas de cursos
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa Plataforma (5%)</span>
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-600">
            {platformFee.toLocaleString('pt-AO')} Kz
          </p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Receita líquida da plataforma
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Quota Instrutores (95%)</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-700">
            {instructorShare.toLocaleString('pt-AO')} Kz
          </p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Repasse a formadores/criadores
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inscrições Pagas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900">{paidCount}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Validadas via MULTICAIXA Express
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cursos por Mérito</span>
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900">{meritCount}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            Conquistados por vendas confirmadas
          </span>
        </div>
      </div>


      {/* Financial Split Separation Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Separação Financeira Rigorosa:</strong>
          As receitas dos cursos são mantidas de forma independente das comissões do marketplace (taxa base de 5%). Não há sobreposição ou dupla cobrança sobre as mesmas transações.
        </div>
      </div>

      {/* Courses Catalog Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-600" />
            Catálogo de Cursos da Academia
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Curso</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Preço (AOA)</th>
                <th className="px-5 py-3">Alunos</th>
                <th className="px-5 py-3">Mérito Elegível</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {courses.map(course => (
                <tr key={course.courseId} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{course.title}</p>
                        <p className="text-[11px] text-gray-500">Instrutor: {course.instructor.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] font-bold">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    {course.price.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="px-5 py-3.5">{course.enrolledStudentsCount} inscritos</td>
                  <td className="px-5 py-3.5">
                    {course.meritEligible ? (
                      <span className="text-yellow-600 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Sim
                      </span>
                    ) : (
                      <span className="text-gray-400">Apenas Pago</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Publicado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Merit Reward Campaigns Management */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Campanhas Ativas de Recompensas por Mérito
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Os cursos são desbloqueados automaticamente quando o participante atinge as vendas confirmadas (exclui devoluções ou cancelamentos).
          </p>
        </div>

        <div className="space-y-4">
          {campaigns.map(camp => (
            <div
              key={camp.campaignId}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">{camp.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase">
                    Alvo: {camp.userTargetType === 'all' ? 'Todos' : camp.userTargetType}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{camp.description}</p>
                <div className="mt-2 text-xs font-semibold text-gray-700 flex items-center gap-3">
                  <span>Requisito: <strong>{camp.requiredThreshold} {camp.metricType === 'confirmed_sales_count' ? 'vendas confirmadas' : 'Kz'}</strong></span>
                  <span>•</span>
                  <span>Curso Grátis: <strong className="text-red-600">{camp.targetCourseTitle}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleCampaign(camp.campaignId, camp.active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    camp.active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {camp.active ? 'Ativa' : 'Pausada'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Administrative & Team Training Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="max-w-2xl mb-6">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Formação do Administrador e da Equipa
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Atribua cursos gratuitos para capacitar funcionários, colaboradores internos de suporte ou parceiros estratégicos.
          </p>
        </div>

        {grantSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{grantSuccess}</span>
          </div>
        )}

        <form onSubmit={handleGrantTeamAccess} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nome do Colaborador / Membro *
              </label>
              <input
                type="text"
                required
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                placeholder="Ex: Manuel Silva"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                E-mail do Colaborador *
              </label>
              <input
                type="email"
                required
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
                placeholder="colaborador@empresa.ao"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Curso a Atribuir *
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-red-500"
            >
              {courses.map(course => (
                <option key={course.courseId} value={course.courseId}>
                  {course.title} ({course.price.toLocaleString('pt-AO')} Kz)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Justificação / Registo Administrativo *
            </label>
            <input
              type="text"
              required
              value={grantReason}
              onChange={e => setGrantReason(e.target.value)}
              placeholder="Ex: Treino de atendimento e redução de devoluções"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={isGranting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            {isGranting ? 'A conceder acesso...' : 'Atribuir Curso Gratuitamente à Equipa'}
          </button>
        </form>
      </div>
    </div>
  );
};
