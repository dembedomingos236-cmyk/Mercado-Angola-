import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatKz } from '../data/angolaData';
import { marketplaceService } from '../services/marketplaceService';

export const MulticaixaSimulatorModal: React.FC = () => {
  const { activeMulticaixaAttempt, setActiveMulticaixaAttempt, refreshData } = useMarket();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!activeMulticaixaAttempt) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(activeMulticaixaAttempt.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      await marketplaceService.simulateMulticaixaPaymentSuccess(
        activeMulticaixaAttempt.attemptId,
        activeMulticaixaAttempt.orderId
      );
      setSuccess(true);
      await refreshData();
      setTimeout(() => {
        setActiveMulticaixaAttempt(null);
      }, 2500);
    } catch (err) {
      console.error('Falha ao simular pagamento MULTICAIXA:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative border border-slate-200 overflow-hidden">
        {/* Header with Angolan Multicaixa styling */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              MCX
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">MULTICAIXA Express</h3>
              <span className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">
                Gateway de Pagamento Online (Modo Sandbox)
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveMulticaixaAttempt(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Pagamento MULTICAIXA Confirmado!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                A transação foi validada pela simulação do Gateway EMIS e a encomenda avançou para "Confirmada".
              </p>
            </div>
          ) : (
            <>
              {/* Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong>Ambiente de Testes / Sandbox:</strong> Dados oficiais simulados de acordo com as normas EMIS de Angola. Nenhuma cobrança real é realizada na sua conta.
                </div>
              </div>

              {/* Reference Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono">
                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
                  <span>Entidade</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {activeMulticaixaAttempt.entity || '00099'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
                  <span>Referência de Pagamento</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-950 text-base tracking-wider">
                      {activeMulticaixaAttempt.reference}
                    </span>
                    <button
                      onClick={handleCopyRef}
                      className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Copiar"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <span>Montante a Pagar</span>
                  <span className="font-bold text-amber-600 text-base">
                    {formatKz(activeMulticaixaAttempt.amount)}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-800">Como pagar em Angola no MULTICAIXA:</p>
                <p>1. Abra a aplicação MULTICAIXA Express ou dirija-se a um Caixa Automático (ATM).</p>
                <p>2. Selecione Pagamentos → Pagamento por Referência.</p>
                <p>3. Introduza a Entidade <strong>00099</strong> e a Referência acima.</p>
              </div>

              {/* Simulator Action */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A validar no Gateway EMIS...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simular Pagamento Concluído com Sucesso</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveMulticaixaAttempt(null)}
                  className="w-full text-slate-500 hover:text-slate-800 text-xs py-1.5 transition-colors cursor-pointer"
                >
                  Pagar mais tarde / Fechar janela
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
