import React from 'react';
import { X, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Termos de Utilização & Proteção Legal
            </h2>
            <p className="text-xs text-slate-500">
              Classificados Comerciais da República de Angola
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="block font-bold mb-1">Aviso Importante aos Compradores:</strong>
              O Mercado Angola é estritamente uma plataforma digital de divulgação e intermediação comercial (classificados).
              Todas as transações, entregas e pagamentos de mercadorias realizam-se <span className="font-bold underline">diretamente entre o vendedor e o comprador</span>.
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              1. Natureza da Plataforma
            </h3>
            <p>
              O <strong>Mercado Angola</strong> funciona como um catálogo e diretório público que aproxima empresas, comerciantes, prestadores de serviços e clientes em todo o território nacional. A plataforma não é proprietária nem detentora do stock das mercadorias anunciadas pelas lojas parceiras.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Venda Direta pelo Vendedor & Pagamentos
            </h3>
            <p>
              A plataforma <strong>não recebe pagamentos antecipados de mercadorias em seu nome</strong>. Os compradores devem inspecionar cuidadosamente o produto antes de efetuar o pagamento presencial ou transferência ao vendedor.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              3. Sistema de Atendimento Rastreado MA-
            </h3>
            <p>
              Para segurança dos utilizadores, a plataforma gera códigos únicos de rastreio (ex: <code>MA-XXXX</code>) que registam o interesse do comprador e vinculam o vendedor à taxa justa de intermediação (5% em produtos e 10% em serviços).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              4. Diretrizes de Segurança & Locais de Encontro
            </h3>
            <p>
              Recomendamos sempre a escolha de locais públicos e movimentados para levantamento em mãos (ex: Belas Shopping, Xyami Shopping, Estações e Praças Centrais). Nunca envie dinheiro antecipado a desconhecidos sem confirmação de envio ou prova documental.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              5. Verificação de Vendedores (KYC)
            </h3>
            <p>
              O Mercado Angola exige documento de identificação (BI/NIF), contacto telefónico e comprovativo de localização a todas as lojas e empresas com o selo <strong>LOJA VERIFICADA</strong>. Anúncios fraudulentos são banidos permanentemente.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Legislação comercial da República de Angola
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Compreendi os Termos
          </button>
        </div>
      </div>
    </div>
  );
};
