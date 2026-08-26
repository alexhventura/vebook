import type { LucideIcon } from 'lucide-react';
import { FileCheck2, Lock, Shield } from 'lucide-react';

export type GovernancePillarId = 'origem' | 'separacao' | 'documento';

export type GovernancePillar = {
  id: GovernancePillarId;
  title: string;
  summary: string;
  icon: LucideIcon;
  lead: string;
  points: string[];
};

/** Pilares de governança da home — tom institucional, sem promessas absolutas. */
export const GOVERNANCE_PILLARS: GovernancePillar[] = [
  {
    id: 'origem',
    title: 'Origem',
    summary: 'Registros com identificação dentro da plataforma.',
    icon: Shield,
    lead:
      'Cada serviço no VEBOOK carrega a identificação da oficina participante. A procedência do registro é rastreável — sem confundir isso com garantia absoluta sobre o estado mecânico do veículo.',
    points: [
      'Oficina credenciada associada ao atendimento registrado.',
      'Data, descrição e elementos técnicos preservados no prontuário.',
      'Consulta e certidão mostram a origem disponível no sistema.',
      'A VEBOOK organiza e preserva; não inventa serviços não registrados.',
    ],
  },
  {
    id: 'separacao',
    title: 'Separação',
    summary: 'Prontuário técnico do veículo ≠ dados pessoais do cliente.',
    icon: Lock,
    lead:
      'O diário trata do histórico técnico do veículo. Dados pessoais do cliente permanecem sob responsabilidade da oficina e não são o objeto da consulta pública do prontuário.',
    points: [
      'Consulta pública foca no veículo e nos registros técnicos.',
      'Dados de contato do cliente ficam no controle da oficina.',
      'Troca de proprietário não implica exposição de dados pessoais anteriores.',
      'Tratamento alinhado à finalidade anunciada e às regras de privacidade da plataforma.',
    ],
  },
  {
    id: 'documento',
    title: 'Documento',
    summary: 'A Certidão retrata o disponível no momento da emissão.',
    icon: FileCheck2,
    lead:
      'A Certidão VEBOOK é um snapshot formal do histórico disponível até a data e hora da emissão — útil para apresentação a terceiros, sem substituir documentos oficiais de trânsito ou laudos cautelares.',
    points: [
      'Documento nominal ao solicitante, com código e QR Code.',
      'Retrata o que está registrado na plataforma no instante da emissão.',
      'Não comprova propriedade, quitação tributária ou estado mecânico atual.',
      'Valor unitário definido na plataforma; a consulta numérica permanece gratuita.',
    ],
  },
];
