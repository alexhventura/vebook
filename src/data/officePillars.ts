import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Globe, Network, CalendarClock } from 'lucide-react';

export type OfficePillarId = 'pagina' | 'painel' | 'rede' | 'previsibilidade';

export type OfficePillar = {
  id: OfficePillarId;
  title: string;
  summary: string;
  icon: LucideIcon;
  lead: string;
  /** Vantagens exibidas no card da home */
  highlights: string[];
  points: string[];
  /** Cards principais (página e painel) vs apoio (rede e previsibilidade) */
  emphasis: 'featured' | 'support';
};

/**
 * Pilares “Para oficinas” na home.
 * Destaque: página e painel. Apoio: rede e previsibilidade.
 */
export const OFFICE_PILLARS: OfficePillar[] = [
  {
    id: 'pagina',
    title: 'Página da oficina',
    summary: 'Endereço digital próprio na infraestrutura VEBOOK.',
    icon: Globe,
    emphasis: 'featured',
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
    emphasis: 'featured',
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
  {
    id: 'rede',
    title: 'Rede',
    summary: 'Participar da infraestrutura nacional de histórico veicular.',
    icon: Network,
    emphasis: 'support',
    lead:
      'A rede VEBOOK conecta oficinas que registram serviços no mesmo padrão de prontuário. Fazer parte dela significa contribuir para um histórico contínuo do veículo — com origem identificável e consulta objetiva.',
    highlights: [
      'Infraestrutura compartilhada de registro e consulta.',
      'Sua oficina aparece como origem nos serviços lançados.',
      'O veículo leva o histórico mesmo quando troca de oficina.',
      'Credibilidade coletiva: cada registro reforça o prontuário.',
    ],
    points: [
      'Não é um diretório isolado: é a base que alimenta o Diário Veicular.',
      'Clientes e consulentes encontram continuidade técnica entre oficinas participantes.',
      'A página e o painel ganham sentido dentro dessa rede — presença + operação.',
      'O que não foi registrado na rede não aparece — e isso também é transparência.',
    ],
  },
  {
    id: 'previsibilidade',
    title: 'Previsibilidade',
    summary: 'Organização do fluxo que melhora o resultado da oficina.',
    icon: CalendarClock,
    emphasis: 'support',
    lead:
      'Com agenda, retornos e o histórico do que já foi feito no veículo, a oficina planeja melhor o próximo atendimento — menos improvisação, mais continuidade e melhor aproveitamento da carteira de clientes.',
    highlights: [
      'Retornos e revisões ficam visíveis no fluxo de trabalho.',
      'Histórico do veículo ajuda a orientar a próxima OS.',
      'Menos retrabalho: o que já foi registrado não se perde.',
      'Carteira acompanhada melhora ocupação e relacionamento.',
    ],
    points: [
      'Previsibilidade operacional: saber o que volta e o que já foi feito.',
      'Decisões de serviço com base no prontuário, não só na memória do balcão.',
      'Agenda e retornos no painel sustentam a rotina sem depender de mensagem automática do VEBOOK.',
      'Resultado: atendimento mais consistente e histórico que valoriza a oficina e o veículo.',
    ],
  },
];

export const OFFICE_PILLARS_FEATURED = OFFICE_PILLARS.filter((p) => p.emphasis === 'featured');
export const OFFICE_PILLARS_SUPPORT = OFFICE_PILLARS.filter((p) => p.emphasis === 'support');

export function officePillarById(id: OfficePillarId): OfficePillar | undefined {
  return OFFICE_PILLARS.find((item) => item.id === id);
}
