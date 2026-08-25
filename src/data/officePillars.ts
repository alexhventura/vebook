import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Globe } from 'lucide-react';

export type OfficePillarId = 'pagina' | 'painel';

export type OfficePillar = {
  id: OfficePillarId;
  title: string;
  summary: string;
  icon: LucideIcon;
  lead: string;
  /** Vantagens exibidas com ênfase no card da home */
  highlights: string[];
  points: string[];
};

/**
 * Dois pilares em destaque para oficinas na home:
 * página pública que a oficina ganha e painel de gestão.
 */
export const OFFICE_PILLARS: OfficePillar[] = [
  {
    id: 'pagina',
    title: 'Página da oficina',
    summary: 'Endereço digital próprio na infraestrutura VEBOOK.',
    icon: Globe,
    lead:
      'Ao se credenciar, a oficina ganha uma página pública institucional — presença na rede VEBOOK, dados de contato e identificação clara como origem dos registros no prontuário do veículo.',
    highlights: [
      'Página pública com nome, endereço e identidade da oficina.',
      'Presença na rede de oficinas participantes do VEBOOK.',
      'Origem identificável nos históricos que você registrar.',
      'Personalização da página e PWA instalável pelo painel.',
    ],
    points: [
      'Endereço digital exclusivo para apresentar a oficina a clientes e consulentes.',
      'Integração à infraestrutura nacional de histórico veicular.',
      'Cada atendimento fica associado à sua oficina no Diário Veicular.',
      'Credibilidade: o prontuário mostra quem registrou o serviço.',
    ],
  },
  {
    id: 'painel',
    title: 'Painel de gestão',
    summary: 'Operação do dia a dia: clientes, veículos, agenda e registros.',
    icon: LayoutDashboard,
    lead:
      'O painel concentra a gestão da oficina — cadastros, agenda, retornos e o registro de atendimentos que alimentam o prontuário. Nesta fase a comunicação com o cliente permanece pelos canais da própria oficina.',
    highlights: [
      'Clientes e veículos organizados em um só lugar.',
      'Agenda e controle de retornos no fluxo de atendimento.',
      'Registro de serviços no prontuário do veículo.',
      'Catálogos e gestão interna sem inventar mensagem automática ao cliente.',
    ],
    points: [
      'Cadastro de clientes e veículos atendidos sob responsabilidade da oficina.',
      'Atendimentos com data, serviços e peças entram no Diário Veicular.',
      'Retornos e acompanhamento interno no painel.',
      'A oficina registra; o cliente valida; a VEBOOK preserva.',
    ],
  },
];

export function officePillarById(id: OfficePillarId): OfficePillar | undefined {
  return OFFICE_PILLARS.find((item) => item.id === id);
}
