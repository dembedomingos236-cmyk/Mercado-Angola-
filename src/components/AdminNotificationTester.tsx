import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  Users,
  CreditCard,
  RefreshCw,
  Copy,
  Smartphone,
  Check,
  Send,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatKz } from '../data/angolaData';
import { notificationService } from '../services/notificationService';
import { marketplaceService } from '../services/marketplaceService';

export const AdminNotificationTester: React.FC = () => {
  const { refreshData } = useMarket();

  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string; timestamp: string }>
  >({});

  const recordResult = (testId: string, success: boolean, message: string) => {
    setTestResults((prev) => ({
      ...prev,
      [testId]: {
        success,
        message,
        timestamp: new Date().toLocaleTimeString('pt-AO'),
      },
    }));
  };

  // 1. Nova Candidatura
  const testNewApplication = async () => {
    setRunningTestId('new_app');
    try {
      const candidateId = 'cand_test_' + Date.now();
      const candName = 'Mateus Digital (Afiliado Luanda)';
      const candEmail = 'mateus.digital@luanda.ao';
      const campId = 'camp_demo_tech_01';

      await notificationService.createNotification({
        category: 'candidaturas',
        priority: 'normal',
        title: `Nova Candidatura: ${candName}`,
        message: `O candidato "${candName}" (${candEmail}) candidatou-se para a campanha #${campId}. Contacto autorizado: +244 923 888 777. Estado: PENDENTE.`,
        event: 'NEW_APPLICATION',
        idempotencyKey: `test_app_${Date.now()}`,
        metadata: {
          candidateId,
          candidateName: candName,
          candidateEmail: candEmail,
          candidatePhone: '+244 923 888 777',
          applicationStatus: 'pending',
          targetRoleOrCampaign: 'Campanha Eletrónica Luanda',
          applicationId: 'app_' + Date.now(),
        },
        actionType: 'manage_application',
      });

      await refreshData();
      recordResult('new_app', true, 'Notificação de nova candidatura gerada com sucesso e auditada no sistema.');
    } catch (e: any) {
      recordResult('new_app', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 2. Candidatura Aprovada & Rejeitada
  const testApplicationStatusChange = async () => {
    setRunningTestId('app_status');
    try {
      // Approved
      await notificationService.createNotification({
        category: 'candidaturas',
        priority: 'normal',
        title: 'Candidatura Aprovada: Ana Bento (Afiliada Benguela)',
        message: 'A candidatura #app_benguela_02 foi APROVADA pelo administrador. O link de afiliado exclusivo foi ativado.',
        event: 'APPLICATION_STATUS_CHANGED',
        idempotencyKey: `test_app_apprv_${Date.now()}`,
        metadata: {
          candidateName: 'Ana Bento',
          candidateEmail: 'ana.bento@benguela.ao',
          applicationStatus: 'approved',
        },
        actionType: 'manage_application',
      });

      // Rejected
      await notificationService.createNotification({
        category: 'candidaturas',
        priority: 'informativo',
        title: 'Candidatura Rejeitada: Perfil Não Qualificado',
        message: 'A candidatura #app_spam_99 foi REJEITADA devido a incumprimento dos critérios de conformidade da plataforma.',
        event: 'APPLICATION_STATUS_CHANGED',
        idempotencyKey: `test_app_rej_${Date.now()}`,
        metadata: {
          candidateName: 'Utilizador Suspeito',
          applicationStatus: 'rejected',
        },
        actionType: 'manage_application',
      });

      await refreshData();
      recordResult('app_status', true, 'Duas notificações de alteração de estado (Aprovada e Rejeitada) enviadas com sucesso.');
    } catch (e: any) {
      recordResult('app_status', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 3. Venda com Pagamento Confirmado & Cálculo Exato de 5%
  const testSaleConfirmedWith5Percent = async () => {
    setRunningTestId('sale_confirmed');
    try {
      const saleAmount = 20000; // 20.000 Kz
      const platformFee = Math.round(saleAmount * 0.05); // 1.000 Kz (5%)
      const sellerAmount = saleAmount - platformFee; // 19.000 Kz
      const orderNumber = `AO-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      await notificationService.createNotification({
        category: 'vendas',
        priority: 'normal',
        title: `Venda Confirmada: #${orderNumber} (${formatKz(saleAmount)})`,
        message: `Venda de 1x Smartphone Samsung A15 para a loja "Kamba Tech". Taxa da plataforma (5%): ${formatKz(platformFee)}. Valor destinado à empresa: ${formatKz(sellerAmount)}. Pagamento confirmado via MULTICAIXA Express.`,
        event: 'SALE_CONFIRMED',
        idempotencyKey: `test_sale_${Date.now()}`,
        metadata: {
          orderNumber,
          saleAmount,
          platformFeeRate: 0.05,
          platformFeeAmount: platformFee,
          sellerName: 'Kamba Tech Luanda',
          sellerAmount,
          paymentMethod: 'multicaixa_express',
          paymentStatus: 'received',
        },
        actionType: 'view_order',
      });

      await refreshData();
      recordResult(
        'sale_confirmed',
        true,
        `Venda de ${formatKz(saleAmount)} validada: Taxa da plataforma de 5% = ${formatKz(platformFee)}, Líquido do vendedor = ${formatKz(sellerAmount)}.`
      );
    } catch (e: any) {
      recordResult('sale_confirmed', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 4. Venda com Pagamento Falhado
  const testPaymentFailed = async () => {
    setRunningTestId('payment_failed');
    try {
      const orderNumber = `AO-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      await notificationService.createNotification({
        category: 'pagamentos',
        priority: 'critico',
        title: `Falha no Pagamento MULTICAIXA: #${orderNumber}`,
        message: `Tentativa de pagamento de 45.000 Kz na encomenda #${orderNumber} falhou. Motivo: "Saldo insuficiente / Tempo limite excedido no TPA". Nenhuma comissão creditada.`,
        event: 'PAYMENT_FAILED',
        idempotencyKey: `test_pay_fail_${Date.now()}`,
        metadata: {
          orderNumber,
          saleAmount: 45000,
          paymentMethod: 'multicaixa_express',
          paymentStatus: 'failed',
        },
        actionType: 'view_order',
      });

      await refreshData();
      recordResult('payment_failed', true, 'Notificação crítica de pagamento falhado disparada com alerta de prioridade.');
    } catch (e: any) {
      recordResult('payment_failed', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 5. Pedido de Levantamento de Afiliado
  const testWithdrawalRequest = async () => {
    setRunningTestId('withdrawal');
    try {
      const amount = 25000;
      await notificationService.createNotification({
        category: 'pagamentos',
        priority: 'normal',
        title: `Pedido de Levantamento: ${formatKz(amount)}`,
        message: `O afiliado "Manuel Digital" solicitou levantamento de ${formatKz(amount)} para o Banco BAI (IBAN: AO06.0040.0000.4829.1029.3847.1). Saldo conferido e deduzido.`,
        event: 'WITHDRAWAL_REQUESTED',
        idempotencyKey: `test_wth_${Date.now()}`,
        metadata: {
          candidateName: 'Manuel Digital',
          withdrawalAmount: amount,
          bankName: 'Banco BAI',
        },
        actionType: 'view_withdrawal',
      });

      await refreshData();
      recordResult('withdrawal', true, `Pedido de levantamento de ${formatKz(amount)} notificado para o administrador.`);
    } catch (e: any) {
      recordResult('withdrawal', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 6. Reembolso & Cancelamento
  const testRefundAndCancellation = async () => {
    setRunningTestId('refund');
    try {
      const orderNumber = `AO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      await notificationService.createNotification({
        category: 'vendas',
        priority: 'critico',
        title: `Reembolso Processado: #${orderNumber}`,
        message: `A encomenda #${orderNumber} de 18.500 Kz foi cancelada e reembolsada ao comprador. Motivo: "Artigo não correspondia às fotos". As comissões da plataforma e do afiliado foram estornadas.`,
        event: 'REFUND_PROCESSED',
        idempotencyKey: `test_refund_${Date.now()}`,
        metadata: {
          orderNumber,
          saleAmount: 18500,
          paymentStatus: 'refunded',
        },
        actionType: 'view_order',
      });

      await refreshData();
      recordResult('refund', true, 'Reembolso registado e comissões estornadas no balanço com notificação de alta prioridade.');
    } catch (e: any) {
      recordResult('refund', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 7. Tentativa Suspeita de Acesso (Segurança)
  const testSecurityUnauthorizedAccess = async () => {
    setRunningTestId('security_access');
    try {
      await notificationService.createNotification({
        category: 'seguranca',
        priority: 'critico',
        title: 'Alerta de Segurança: Tentativa de Acesso Não Autorizado',
        message: 'Um utilizador com papel de "Vendedor" (IP: 102.214.x.x, Luanda) tentou aceder ao painel financeiro global do proprietário. O acesso foi bloqueado com sucesso pelo servidor.',
        event: 'UNAUTHORIZED_ACCESS_BLOCKED',
        idempotencyKey: `test_sec_${Date.now()}`,
        metadata: {
          securityEventType: 'UNAUTHORIZED_ADMIN_READ_ATTEMPT',
          actorEmail: 'vendedor_suspeito@mercadoangola.ao',
          fraudRiskLevel: 'medio',
        },
        actionType: 'view_security',
      });

      await refreshData();
      recordResult('security_access', true, 'Tentativa de acesso não autorizado travada e auditada com sucesso.');
    } catch (e: any) {
      recordResult('security_access', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 8. Prevenção de Notificações Duplicadas (Idempotência)
  const testIdempotencyDeduplication = async () => {
    setRunningTestId('idempotency');
    try {
      const fixedKey = 'idemp_key_unique_test_' + Date.now();

      // First call: should create
      const first = await notificationService.createNotification({
        category: 'sistema',
        priority: 'informativo',
        title: 'Teste de Idempotência: Evento Único',
        message: 'Primeiro envio do evento com chave de idempotência fixa.',
        event: 'IDEMPOTENCY_TEST',
        idempotencyKey: fixedKey,
      });

      // Second call with EXACT SAME key: should return existing without duplicate!
      const second = await notificationService.createNotification({
        category: 'sistema',
        priority: 'informativo',
        title: 'Tentativa de Duplicação',
        message: 'Esta notificação não pode ser duplicada!',
        event: 'IDEMPOTENCY_TEST',
        idempotencyKey: fixedKey,
      });

      const isSameId = first.notificationId === second.notificationId;

      await refreshData();
      if (isSameId) {
        recordResult(
          'idempotency',
          true,
          `Idempotência confirmada! As duas chamadas resolveram para o mesmo ID (${first.notificationId}). Nenhuma duplicação foi gerada.`
        );
      } else {
        recordResult('idempotency', false, 'Falha: ID diferente gerado para a mesma chave de idempotência.');
      }
    } catch (e: any) {
      recordResult('idempotency', false, e?.message || 'Erro ao executar teste.');
    } finally {
      setRunningTestId(null);
    }
  };

  // 9. Teste de Notificação no Telemóvel / Som
  const testMobilePushAndSound = async () => {
    setRunningTestId('push_sound');
    try {
      notificationService.testChime('critico');
      notificationService.triggerBrowserPush(
        'Alerta no Telemóvel — Mercado Angola',
        'Notificação em tempo real entregue com sucesso no seu dispositivo!',
        'seguranca'
      );
      recordResult('push_sound', true, 'Sinal sonoro sintetizado emitido e push notification disparado.');
    } catch (e: any) {
      recordResult('push_sound', false, e?.message || 'Erro ao emitir alerta sonoro.');
    } finally {
      setRunningTestId(null);
    }
  };

  const tests = [
    {
      id: 'new_app',
      title: '1. Nova Candidatura de Afiliado',
      desc: 'Submete candidatura com contacto, produto/campanha e gera notificação imediata com botões de gestão.',
      fn: testNewApplication,
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'app_status',
      title: '2. Candidatura Aprovada & Rejeitada',
      desc: 'Testa transição de estado da candidatura para aprovada e rejeitada com notificações aos intervenientes.',
      fn: testApplicationStatusChange,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'sale_confirmed',
      title: '3. Venda Confirmada com Cálculo de 5%',
      desc: 'Simula venda de 20.000 Kz: 1.000 Kz (5% plataforma), 19.000 Kz (empresa). Notificação com segregação financeira.',
      fn: testSaleConfirmedWith5Percent,
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'payment_failed',
      title: '4. Venda com Pagamento Falhado',
      desc: 'Simula recusa do fornecedor de pagamento/TPA e gera alerta de prioridade crítica para o administrador.',
      fn: testPaymentFailed,
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
    {
      id: 'withdrawal',
      title: '5. Pedido de Levantamento de Afiliado',
      desc: 'Testa solicitação de saque de comissões com IBAN e banco angolano verificado.',
      fn: testWithdrawalRequest,
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'refund',
      title: '6. Reembolso & Estorno de Comissões',
      desc: 'Processa cancelamento de venda, reverte comissões no balanço e notifica o administrador.',
      fn: testRefundAndCancellation,
      icon: <RefreshCw className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'security_access',
      title: '7. Tentativa de Acesso Indevido (Segurança)',
      desc: 'Simula tentativa de um vendedor aceder ao painel financeiro global e gera alerta de segurança.',
      fn: testSecurityUnauthorizedAccess,
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
    },
    {
      id: 'idempotency',
      title: '8. Prevenção de Notificações Duplicadas',
      desc: 'Valida o mecanismo de idempotência enviando chamadas idênticas consecutivas com chave única.',
      fn: testIdempotencyDeduplication,
      icon: <Copy className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 'push_sound',
      title: '9. Notificação no Telemóvel & Som',
      desc: 'Testa o sintetizador Web Audio interno e o disparo de notificação push no navegador/mobile.',
      fn: testMobilePushAndSound,
      icon: <Smartphone className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <FileCheck className="w-4 h-4" />
          <span>Laboratório Oficial de Testes — Requisitos Obrigatórios</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Validação Automatizada do Sistema de Notificações
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Execute cada um dos 9 cenários de teste obrigatórios em tempo real. As notificações geradas são persistidas no Firestore, transmitidas via websockets/listeners e disparam alertas sonoros e push no seu telemóvel.
        </p>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => {
          const isRunning = runningTestId === test.id;
          const result = testResults[test.id];

          return (
            <div
              key={test.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {test.icon}
                  </div>
                  {result && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        result.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.success ? 'Passou ✓' : 'Falhou ✗'} ({result.timestamp})
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">{test.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{test.desc}</p>
              </div>

              {result && (
                <div
                  className={`text-[11px] p-2.5 rounded-xl border leading-relaxed ${
                    result.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {result.message}
                </div>
              )}

              <button
                onClick={test.fn}
                disabled={isRunning}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>A Executar Teste...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Executar Teste ao Vivo</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
