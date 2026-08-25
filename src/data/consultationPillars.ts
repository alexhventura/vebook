import type { LucideIcon } from 'lucide-react';
import { FileCheck2, History, Lock, RefreshCw } from 'lucide-react';

export type ConsultationPillarId = 'historico' | 'continuidade' | 'transparencia' | 'privacidade';

export type ConsultationPillar = {
  id: ConsultationPillarId;
  title: string;
  summary: string;
  icon: LucideIcon;
  lead: string;
  points: string[];
};

/** Pilares “Para quem consulta” na home. */
export const CONSULTATION_PILLARS: ConsultationPillar[] = [
  {
    id: 'historico',
    title: 'Histórico',
    summary: 'Registros de manutenções e atendimentos de oficinas participantes.',
    icon: History,
    lead:
      'O diário reúne os serviços registrados por oficinas na plataforma — manutenções, peças e descrições técnicas associadas à placa do veículo.',
    points: [
      'Atendimentos inseridos por oficinas participantes do VEBOOK.',
      'Consulta pública mostra o panorama numérico do que existe no prontuário.',
      'A Certidão detalha o histórico disponível no momento da emissão.',
      'Sem inventário falso: só aparece o que foi de fato registrado.',
    ],
  },
  {
    id: 'continuidade',
    title: 'Continuidade',
    summary: 'O histórico acompanha o veículo ao longo da vida útil.',
    icon: RefreshCw,
    lead:
      'O prontuário está ligado ao veículo. Trocas de dono ou de oficina não apagam o que já foi registrado e validado na plataforma.',
    points: [
      'Memória técnica acompanha a vida útil do veículo.',
      'Oficinas diferentes podem contribuir ao mesmo diário.',
      'Útil em compra, venda e avaliação da procedência de manutenção.',
      'A continuidade depende dos registros realmente inseridos — não de promessas absolutas.',
    ],
  },
  {
    id: 'transparencia',
    title: 'Transparência',
    summary: 'Verifique a existência de registros antes de documentar.',
    icon: FileCheck2,
    lead:
      'A consulta gratuita ajuda a ver se há histórico antes de solicitar a Certidão. Assim você decide com clareza se precisa do documento completo.',
    points: [
      'Consulta: dados numéricos e existência de registros.',
      'Certidão: informação completa e documentada.',
      'Sem notas ou scores inventados sobre o veículo.',
      'O que não foi registrado não aparece — e isso também é informação.',
    ],
  },
  {
    id: 'privacidade',
    title: 'Privacidade',
    summary: 'Dados pessoais do cliente ficam no controle da oficina.',
    icon: Lock,
    lead:
      'O foco da consulta é o histórico técnico do veículo. Dados pessoais do cliente não são o objeto do prontuário público e permanecem sob responsabilidade da oficina.',
    points: [
      'Prontuário do veículo ≠ cadastro público de proprietários.',
      'Contatos e dados pessoais ficam no painel da oficina.',
      'Finalidade de uso alinhada às regras de privacidade publicadas.',
      'Canal institucional disponível para dúvidas sobre tratamento de dados.',
    ],
  },
];
