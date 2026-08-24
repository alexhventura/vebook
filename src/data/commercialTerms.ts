import { formatBRL } from '../lib/currency';
import { OFFICE_ANNUAL, OFFICE_PRICING } from './officePlans';

export const COMMERCIAL_CONDITIONS = [
  'A adesão da oficina ao VEBOOK é contratual e onerosa, com cobrança recorrente no cartão de crédito.',
  `No primeiro ano o valor vigente é de ${formatBRL(OFFICE_PRICING.year1Monthly)} por mês ou ${formatBRL(OFFICE_PRICING.year1Annual)} no plano anual (pagamento antecipado de 12 meses, com economia de ${formatBRL(OFFICE_ANNUAL.year1Savings)} em relação ao mensal).`,
  `A partir do segundo ano o valor vigente passa a ${formatBRL(OFFICE_PRICING.year2Monthly)} por mês ou ${formatBRL(OFFICE_PRICING.year2Annual)} no plano anual.`,
  'A alteração de preço do segundo ano é condição comercial conhecida e aceita no momento da contratação.',
  'A oficina permanece pendente até a confirmação do pagamento. Somente após a confirmação ela é ativada, recebe página pública e acesso ao painel.',
  'O cadastro inicial exige apenas os dados essenciais. Informações complementares podem ser preenchidas depois, no painel.',
  'O endereço digital (slug.vebook.com.br) é único e pode ser recusado quando conflitar com nome reservado ou oficina já cadastrada.',
] as const;

export const OFFICE_BENEFITS = [
  {
    title: 'Página pública própria',
    detail: 'Presença profissional dentro do VEBOOK, com identidade, contato, horários e serviços.',
  },
  {
    title: 'Endereço personalizado',
    detail: 'Endereço digital no formato oficinax.vebook.com.br.',
  },
  {
    title: 'Painel de gestão',
    detail: 'Área restrita para completar o perfil, cadastrar clientes, veículos, atendimentos e retornos.',
  },
  {
    title: 'Cadastro de clientes e veículos',
    detail: 'Base operacional isolada por oficina, sem acesso cruzado a dados de outras oficinas.',
  },
  {
    title: 'Registro de atendimentos, serviços e produtos',
    detail: 'Histórico dos serviços realizados na oficina, com peças e procedimentos aplicados.',
  },
  {
    title: 'Gestão interna de retornos',
    detail: 'Organize os próximos retornos dos seus clientes e consulte-os diretamente pelo painel. Nesta fase o VEBOOK não envia mensagens: o contato é responsabilidade da oficina.',
  },
  {
    title: 'Dados de contato administrativos',
    detail: 'A oficina cadastra nome, telefone, WhatsApp e e-mail do cliente. O VEBOOK armazena para consulta no painel; a oficina se comunica pelos seus próprios meios.',
  },
  {
    title: 'Dashboard operacional',
    detail: 'Visão resumida da atividade da oficina após a ativação.',
  },
  {
    title: 'Visibilidade na rede VEBOOK',
    detail: 'Oficinas ativas e autorizadas passam a aparecer na busca e listagem públicas.',
  },
] as const;
