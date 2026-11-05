import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';

export const ReportModal: React.FC = () => {
  const { activeReportTarget, setActiveReportTarget, refreshData } = useMarket();
  const { profile } = useAuth();
  const [reason, setReason] = useState('Preço enganoso ou fraudulento');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!activeReportTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await marketplaceService.submitReport({
        reporterId: profile?.uid || 'guest_user',
        reporterName: profile?.displayName || 'Utilizador',
        targetType: activeReportTarget.targetType,
        targetId: activeReportTarget.targetId,
        targetTitle: activeReportTarget.targetTitle,
        reason,
        details,
      });
      setSubmitted(true);
      await refreshData();
      setTimeout(() => {
        setActiveReportTarget(null);
      }, 2500);
    } catch (err) {
      console.error('Falha ao submeter denúncia:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <Flag className="w-4 h-4" />
            <span>Denunciar ao Mercado Angola</span>
          </div>
          <button
            onClick={() => setActiveReportTarget(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Denúncia Enviada com Sucesso</h4>
            <p className="text-xs text-slate-500">
              A nossa equipa de moderação analisará este caso para assegurar a proteção de todos os angolanos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Está a denunciar:{' '}
              <strong className="text-slate-900">{activeReportTarget.targetTitle}</strong>
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motivo Principal</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Preço enganoso ou fraudulento">Preço enganoso ou fraudulento</option>
                <option value="Produto contrafeito ou não autêntico">Produto contrafeito ou não autêntico</option>
                <option value="Artigo proibido pelas regras de Angola">Artigo proibido pelas regras de Angola</option>
                <option value="Vendedor recusa encontro em local seguro">Vendedor recusa encontro em local seguro</option>
                <option value="Outro motivo">Outro motivo</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Explicação Detalhada</label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Descreva o que aconteceu ou o porquê de suspeitar deste anúncio..."
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveReportTarget(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !details.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? 'A submeter...' : 'Submeter Denúncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
