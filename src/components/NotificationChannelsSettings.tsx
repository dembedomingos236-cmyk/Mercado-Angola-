import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  Mail,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import { AdminNotificationChannelsConfig } from '../types';
import { notificationService, DEFAULT_CHANNEL_PREFERENCES } from '../services/notificationService';

export const NotificationChannelsSettings: React.FC = () => {
  const [config, setConfig] = useState<AdminNotificationChannelsConfig>(DEFAULT_CHANNEL_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const [testPushSent, setTestPushSent] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    loadPreferences();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const saved = await notificationService.getChannelPreferences();
      setConfig(saved);
    } catch (e) {
      console.warn('Erro ao carregar preferências de canais:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await notificationService.saveChannelPreferences(config);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Falha ao guardar preferências:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestPush = async () => {
    const perm = await notificationService.requestPushPermission();
    setPushStatus(perm);
    if (perm === 'granted') {
      setConfig((prev) => ({
        ...prev,
        push: { ...prev.push, enabled: true },
      }));
      notificationService.triggerBrowserPush(
        'Notificações Push Ativadas',
        'Receberá agora alertas instantâneos no seu telemóvel/computador para vendas, candidaturas e eventos críticos.',
        'sistema'
      );
    }
  };

  const handleSendTestPush = () => {
    notificationService.triggerBrowserPush(
      'Teste de Notificação Push',
      'O sistema de notificações no telemóvel do administrador está 100% operacional no Mercado Angola!',
      'seguranca'
    );
    setTestPushSent(true);
    setTimeout(() => setTestPushSent(false), 3000);
  };

  const handleSendTestEmail = () => {
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3500);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500">
        A carregar configurações de canais...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center shadow-md">
            <Smartphone className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Canais & Preferências de Notificação
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize como e por onde deseja receber os alertas operacionais, vendas e candidaturas da plataforma.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'A guardar...' : 'Guardar Preferências'}</span>
        </button>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preferências de notificação guardadas com sucesso no servidor!</span>
        </div>
      )}

      {/* Security notice regarding critical alerts */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">Garantia de Segurança Operacional & Financeira</strong>
          <p className="text-amber-800 leading-relaxed">
            De acordo com as normas da plataforma, os alertas de <strong>segurança crítica, falhas graves de pagamentos e denúncias</strong> permanecem sempre visíveis no Centro de Notificações interno, mesmo que os canais externos opcionais sejam desligados.
          </p>
        </div>
      </div>

      {/* Channel 1: In-App Alerts */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">1. Notificações Dentro da Aplicação (In-App)</h3>
              <p className="text-xs text-slate-500">
                Badges em tempo real, painel de notificações e efeitos sonoros para eventos importantes.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={config.inApp.soundEnabled}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  inApp: { ...prev.inApp, soundEnabled: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-red-600 rounded"
            />
            <span>Sinal Sonoro (Chime Web Audio)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={config.inApp.sales}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  inApp: { ...prev.inApp, sales: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-red-600 rounded"
            />
            <span className="font-semibold text-slate-800">Vendas & Novas Encomendas</span>
          </label>

          <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={config.inApp.applications}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  inApp: { ...prev.inApp, applications: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-red-600 rounded"
            />
            <span className="font-semibold text-slate-800">Candidaturas de Afiliados</span>
          </label>

          <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={config.inApp.payments}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  inApp: { ...prev.inApp, payments: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-red-600 rounded"
            />
            <span className="font-semibold text-slate-800">Pagamentos & Levantamentos</span>
          </label>
        </div>
      </div>

      {/* Channel 2: Push Notifications on Mobile/Browser */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                2. Notificações Push no Telemóvel / Navegador
              </h3>
              <p className="text-xs text-slate-500">
                Receba alertas instantâneos no ecrã do telemóvel ou tablet mesmo quando a janela estiver minimizada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pushStatus === 'granted' ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-bold text-xs bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Autorizado
                </span>
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                >
                  {testPushSent ? 'Enviado!' : 'Enviar Push Teste'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestPush}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Ativar Notificações Push</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={config.push.sales}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  push: { ...prev.push, sales: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="font-semibold text-slate-800">Alertas de Vendas Confirmadas</span>
          </label>

          <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={config.push.payments}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  push: { ...prev.push, payments: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="font-semibold text-slate-800">Pedidos de Levantamento</span>
          </label>

          <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={config.push.security}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  push: { ...prev.push, security: e.target.checked },
                }))
              }
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="font-semibold text-slate-800">Denúncias & Alertas Críticos</span>
          </label>
        </div>
      </div>

      {/* Channel 3: Email Alerts */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">3. Alertas por E-mail</h3>
              <p className="text-xs text-slate-500">
                Receba resumos executivos e relatórios de transações na caixa de correio do administrador.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendTestEmail}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              {testEmailSent ? 'E-mail de Teste Disparado!' : 'Simular Disparo E-mail'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="max-w-md">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Endereço de E-mail do Administrador
            </label>
            <input
              type="email"
              required
              value={config.email.recipientEmail}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  email: { ...prev.email, recipientEmail: e.target.value },
                }))
              }
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                checked={config.email.dailyDigest}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    email: { ...prev.email, dailyDigest: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="font-semibold text-slate-800">Resumo Diário de Vendas & 5%</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                checked={config.email.payments}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    email: { ...prev.email, payments: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="font-semibold text-slate-800">Alertas de Levantamentos</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                checked={config.email.security}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    email: { ...prev.email, security: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="font-semibold text-slate-800">Alertas Críticos Imediatos</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
