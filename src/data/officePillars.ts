import type { LucideIcon } from 'lucide-react';
import { Building2, Car, Shield, Wrench } from 'lucide-react';

export type OfficePillarId = 'rede' | 'registro' | 'gestao' | 'credibilidade';

export type OfficePillar = {
  id: OfficePillarId;
  title: string;
  summary: string;
  icon: LucideIcon;
  lead: string;
  points: string[];
};

/** Conteúdo institucional dos pilares “Para oficinas” na home. */
export const OFFICE_PILLARS: OfficePillar[] = [
  {
    id: 'rede',
    title: 'Rede',
    summary: 'Presença na infraestrutura VEBOOK.',
    icon: Building2,
    lead:
      'Ao se credenciar, a oficina passa a integrar a infraestrutura nacional de histórico veicular do VEBOOK — com página pública e identificação na plataforma.',
    points: [
      'Página pública da oficina com dados institucionais e endereço.',
      'Presença na rede de oficinas participantes do VEBOOK.',
      'Identificação clara da origem dos registros no prontuário do veículo.',
      'Personalização da página e PWA instalável pelo painel.',
    ],
  },
  {
    id: 'registro',
    title: 'Registro',
    summary: 'Atendimentos no prontuário do veículo.',
    icon: Wrench,
    lead:
      'Cada atendimento registrado pela oficina alimenta o diário do veículo: data, serviços, peças e descrições ficam preservados como memória técnica.',
    points: [
      'Registro de atendimentos vinculados à placa e ao veículo.',
      'Catálogo de serviços e produtos para organização do fluxo.',
      'Histórico consultável no Diário Veicular após a inserção.',
      'A oficina registra; o cliente valida; a VEBOOK preserva.',
    ],
  },
  {
    id: 'gestao',
    title: 'Gestão',
    summary: 'Clientes, veículos, agenda e retornos.',
    icon: Car,
    lead:
      'O painel concentra a operação cotidiana da oficina — sem inventar comunicação automática nesta fase: a oficina continua falando com o cliente pelos seus próprios canais.',
    points: [
      'Cadastro de clientes e veículos atendidos.',
      'Agenda e controle interno de retornos.',
      'Gestão financeira e catálogos no painel.',
      'Dados pessoais do cliente ficam sob responsabilidade da oficina.',
    ],
  },
  {
    id: 'credibilidade',
    title: 'Credibilidade',
    summary: 'Histórico com origem identificável.',
    icon: Shield,
    lead:
      'Registros com oficina identificável fortalecem a procedência do histórico — útil para o cliente, para a própria oficina e para quem consulta o veículo depois.',
    points: [
      'Origem do serviço associada à oficina credenciada.',
      'Continuidade do histórico ao longo da vida útil do veículo.',
      'Base objetiva para a Certidão VEBOOK quando a formalidade importa.',
      'Transparência: o prontuário mostra o que foi registrado, sem inventar o que não há.',
    ],
  },
];

export function officePillarById(id: OfficePillarId): OfficePillar | undefined {
  return OFFICE_PILLARS.find((item) => item.id === id);
}
