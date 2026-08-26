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

/**
 * Pilares “Para quem consulta” na home.
 * Conteúdo mescla a construção do histórico (Como Funciona) e transparência/LGPD.
 */
export const CONSULTATION_PILLARS: ConsultationPillar[] = [
  {
    id: 'historico',
    title: 'Histórico',
    summary: 'Registros de manutenções e atendimentos de oficinas participantes.',
    icon: History,
    lead:
      'O Diário Veicular é construído em três papéis: a oficina registra a ordem de serviço, o cliente confere e pode validar ou contestar, e a VEBOOK preserva o que entrou na plataforma — de forma auditável e vinculada ao veículo.',
    points: [
      'Oficina credenciada registra quilometragem, serviços, peças e especificações técnicas.',
      'O proprietário consulta o registro no Diário e pode validar ou contestar divergências.',
      'A VEBOOK consolida e preserva o registro no prontuário do veículo.',
      'Só aparece o que foi de fato cadastrado na rede — sem inventário fictício.',
      'A Certidão VEBOOK documenta o histórico completo disponível no momento da emissão.',
    ],
  },
  {
    id: 'continuidade',
    title: 'Continuidade',
    summary: 'O histórico acompanha o veículo ao longo da vida útil.',
    icon: RefreshCw,
    lead:
      'O prontuário está ligado ao veículo (placa/chassi), não a um cadastro público de donos. Trocas de proprietário ou de oficina não apagam o que já foi registrado e preservado na plataforma.',
    points: [
      'O histórico de manutenção acompanha o veículo na vida útil e na revenda.',
      'Oficinas diferentes podem contribuir ao mesmo diário ao longo do tempo.',
      'Dados pessoais do antigo proprietário não são transferidos nem expostos na consulta.',
      'Útil em compra, venda e avaliação da procedência de manutenção.',
      'A continuidade reflete apenas registros realmente inseridos — não garante fatos fora da rede.',
    ],
  },
  {
    id: 'transparencia',
    title: 'Transparência',
    summary: 'Verifique a existência de registros antes de documentar.',
    icon: FileCheck2,
    lead:
      'A consulta gratuita mostra o panorama numérico do que existe no prontuário. Assim você decide, com clareza, se precisa da Certidão — o documento formal com a informação completa.',
    points: [
      'Consulta: totais e existência de registros, sem custo.',
      'Certidão: narrativa completa e documentada, com preço publicado.',
      'Sem scores, notas ou rankings inventados sobre o veículo.',
      'O que não foi registrado na rede não aparece — e isso também é informação.',
      'O VEBOOK não substitui CRLV, vistoria cautelar ou documentos oficiais de trânsito.',
    ],
  },
  {
    id: 'privacidade',
    title: 'Privacidade',
    summary: 'Dados pessoais do cliente ficam no controle da oficina.',
    icon: Lock,
    lead:
      'O foco da consulta é o histórico técnico do veículo. Dados pessoais do cliente permanecem sob responsabilidade da oficina (controladora no atendimento). O VEBOOK organiza o prontuário e não comercializa dados identificáveis.',
    points: [
      'Prontuário do veículo ≠ cadastro público de proprietários.',
      'Contatos e dados pessoais ficam no painel da oficina; a comunicação com o cliente é dela.',
      'Tratamentos estatísticos, quando houver, usam dados anonimizados e agregados (LGPD).',
      'Identidade de quem valida pode ser mascarada na camada pública do diário.',
      'Dúvidas e direitos do titular: canal de Contato / Transparência no rodapé.',
    ],
  },
];
