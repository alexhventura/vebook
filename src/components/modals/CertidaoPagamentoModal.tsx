import React, { useState } from 'react';
import { FileCheck2, Lock, X } from 'lucide-react';
import { CERTIDAO_PRICE } from '../../data/certidaoPricing';
import { formatBRL } from '../../lib/currency';
import { Button } from '../ui/Button';

interface CertidaoPagamentoModalProps {
  open: boolean;
  plate?: string;
  onClose: () => void;
  onPaid: () => void;
}

/**
 * Gate de pagamento mock da Certidão VEBOOK.
 * A visualização completa só é liberada após confirmar o pagamento.
 */
export const CertidaoPagamentoModal: React.FC<CertidaoPagamentoModalProps> = ({
  open,
  plate,
  onClose,
  onPaid,
}) => {
  const [paying, setPaying] = useState(false);

  if (!open) return null;

  const handlePay = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      onPaid();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-vebook-navy-deep/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certidao-pagamento-title"
    >
      <div className="relative w-full max-w-md rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white shadow-[0_16px_48px_rgba(11,30,54,0.35)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 bg-vebook-navy px-5 py-4 text-vebook-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-vebook border border-vebook-mustard/70 text-vebook-mustard">
              <Lock className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-vebook-mustard">
                Certidão VEBOOK
              </p>
              <h2 id="certidao-pagamento-title" className="text-sm font-bold truncate">
                Liberar visualização completa
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-vebook-sm p-1.5 text-vebook-blue-muted hover:bg-vebook-navy-mid hover:text-vebook-white cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-6">
          <p className="text-sm text-vebook-muted leading-relaxed">
            A consulta pública mostra apenas dados numéricos. A Certidão entrega o histórico
            completo do veículo{plate ? (
              <>
                {' '}
                <strong className="font-mono text-vebook-navy">{plate}</strong>
              </>
            ) : null}
            . O documento permanece bloqueado ao fundo até a confirmação do pagamento.
          </p>

          <div className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-mustard-soft/50 px-5 py-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-vebook-mustard-deep">
              Valor da certidão
            </p>
            <p className="mt-2 font-bold text-vebook-navy text-4xl tracking-tight">
              {formatBRL(CERTIDAO_PRICE)}
            </p>
            <p className="mt-1 text-xs text-vebook-muted">Pagamento único por emissão</p>
          </div>

          <ul className="space-y-2 text-xs text-vebook-text leading-relaxed">
            <li className="flex gap-2">
              <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vebook-mustard" aria-hidden />
              Histórico detalhado disponível no momento da emissão
            </li>
            <li className="flex gap-2">
              <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vebook-mustard" aria-hidden />
              Documento nominal, autenticável e com QR Code
            </li>
            <li className="flex gap-2">
              <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vebook-mustard" aria-hidden />
              Download e impressão liberados após o pagamento
            </li>
          </ul>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={paying}>
              Agora não
            </Button>
            <Button type="button" variant="accent" fullWidth onClick={handlePay} disabled={paying}>
              {paying ? 'Processando…' : `Pagar ${formatBRL(CERTIDAO_PRICE)}`}
            </Button>
          </div>

          <p className="text-[11px] text-vebook-subtle leading-relaxed text-center">
            Pagamento simulado no protótipo — nenhuma cobrança real é efetuada.
          </p>
        </div>
      </div>
    </div>
  );
};
