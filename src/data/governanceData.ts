import { DataCategoryDefinition } from '../types';

export interface FaqItem {
  id: string;
  category: 'geral' | 'proprietarios' | 'oficinas' | 'privacidade_lgpd' | 'historico_certidoes' | 'seguranca' | 'cookies_contestações';
  categoryLabel: string;
  question: string;
  answer: string;
}

export const DATA_CATEGORIES_MATRIX: DataCategoryDefinition[] = [
  {
    category: 'dados_pessoais',
    title: 'Dados Pessoais dos Clientes e Usuários',
    examples: ['Nome completo', 'CPF (mascarado)', 'Telefone WhatsApp', 'E-mail de contato', 'Dados cadastrais da conta'],
    legalFramework: 'Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), Art. 7º, II (Cumprimento de obrigação legal/regulatória) e V (Execução de contrato).',
    purpose: 'Identificação para comunicação operacional sobre o veículo, validação de registros de serviço pelo proprietário e controle de segurança de acesso.',
    accessLevel: 'titular_protegido',
    retentionRule: 'Mantidos enquanto durar o vínculo contratual ou operacional, ou pelo prazo legal prescricional do Código de Defesa do Consumidor e Marco Civil da Internet.',
  },
  {
    category: 'dados_veiculo',
    title: 'Dados Técnicos do Veículo',
    examples: ['Placa de identificação', 'Marca, Modelo e Versão', 'Ano de Fabricação e Modelo', 'Combustível', 'Quilometragem (KM) acumulada'],
    legalFramework: 'Código de Trânsito Brasileiro (Lei 9.503/1997) e Marco Civil da Internet (Lei 12.965/2014).',
    purpose: 'Identificação unívoca do bem automotivo objeto das intervenções mecânicas para constituição de sua memória técnica contínua.',
    accessLevel: 'publico_restrito',
    retentionRule: 'Preservados de forma permanente como histórico do prontuário do veículo, desvinculados de dados pessoais de proprietários anteriores em caso de transferência.',
  },
  {
    category: 'dados_manutencao',
    title: 'Dados de Manutenção e Intervenções Técnicas',
    examples: ['Serviço realizado', 'Peças e insumos aplicados (marcas, códigos)', 'Óleo e filtros', 'Data do serviço', 'Número da OS / NF', 'Garantia', 'Oficina responsável'],
    legalFramework: 'Código de Defesa do Consumidor (Lei 8.078/1990, Arts. 39 e 50 - comprovação de garantia e peças) e Legítimo Interesse para preservação da segurança viária.',
    purpose: 'Comprovação técnica da manutenção, rastreabilidade de garantias de produtos e formação do histórico de manutenções preventivas e corretivas.',
    accessLevel: 'apenas_oficina_proprietario',
    retentionRule: 'Armazenamento perpétuo na linha do tempo do veículo para garantir a procedência técnica e valorização de mercado.',
  },
  {
    category: 'dados_operacionais',
    title: 'Dados Operacionais, Logs e Segurança',
    examples: ['Endereço IP de acesso', 'Logs de auditoria e autenticação', 'Tipo de navegador e dispositivo', 'Registros de data/hora de eventos', 'Trilhas de integridade'],
    legalFramework: 'Marco Civil da Internet (Lei 12.965/2014, Art. 15 - guarda de registros de acesso) e Resoluções de Segurança da ANPD.',
    purpose: 'Auditoria técnica, prevenção a fraudes, segurança cibernética e cumprimento de obrigação legal expressa de guarda de logs de conexão e aplicação.',
    accessLevel: 'interno_seguranca',
    retentionRule: 'Armazenamento mínimo de 6 meses conforme Art. 15 do Marco Civil da Internet, podendo estender-se para fins de investigação e auditoria.',
  },
  {
    category: 'dados_estatisticos',
    title: 'Dados Estatísticos, Agregados e Anônimos',
    examples: ['Volume total de trocas de óleo por modelo', 'Índices médios de intervalo de manutenção', 'Peças mais aplicadas no mercado nacional', 'Tendências de desgaste'],
    legalFramework: 'LGPD (Lei 13.709/2018, Art. 12 - dados anonimizados não são considerados dados pessoais para os fins da lei).',
    purpose: 'Geração de inteligência automotiva, benchmarks de durabilidade para o setor e estudos agregados de mercado sem identificação de pessoas ou placas individuais.',
    accessLevel: 'estatistico_agregado',
    retentionRule: 'Retidos de forma permanente em formato estritamente dissociado, anonimizado e agregado.',
  },
];

export const FAQ_DATA: FaqItem[] = [
  // GERAL
  {
    id: 'faq-g1',
    category: 'geral',
    categoryLabel: 'Geral',
    question: 'O que é o VEBOOK e qual é o seu papel no mercado automotivo?',
    answer: 'O VEBOOK é uma infraestrutura tecnológica nacional para registro, organização, armazenamento, consulta e disponibilização legítima de informações de manutenção veicular. O VEBOOK não é proprietário dos veículos nem das informações inseridas por terceiros; atua como plataforma neutra para conectar o trabalho técnico das oficinas à valorização da procedência do veículo.',
  },
  {
    id: 'faq-g2',
    category: 'geral',
    categoryLabel: 'Geral',
    question: 'O VEBOOK é um órgão governamental, cartório ou substituto do Detran/SENATRAN?',
    answer: 'Não. O VEBOOK é uma plataforma de tecnologia privada. O VEBOOK não emite documentos públicos obrigatórios de trânsito (como CRLV ou ATPV-e), não realiza vistoria cautelar veicular e não atesta propriedade jurídica ou quitação de débitos fiscais. Sua finalidade é estritamente o prontuário técnico de manutenção e serviços.',
  },
  {
    id: 'faq-g3',
    category: 'geral',
    categoryLabel: 'Geral',
    question: 'Qual a diferença entre a consulta de Histórico e a emissão de Certidão VEBOOK?',
    answer: 'O Histórico no Diário Veicular é uma visualização dinâmica e informativa das manutenções registradas na base até o momento. Já a Certidão VEBOOK é um documento formal gerado em data e hora determinadas, com código verificador e QR Code de autenticidade, retratando o instantâneo exato dos registros homologados até aquela data.',
  },

  // PROPRIETÁRIOS
  {
    id: 'faq-p1',
    category: 'proprietarios',
    categoryLabel: 'Para Proprietários',
    question: 'Como um serviço realizado no meu carro vai parar no VEBOOK?',
    answer: 'Quando você leva seu veículo a uma oficina credenciada VEBOOK, a oficina registra a ordem de serviço com as peças e insumos aplicados. Em seguida, você recebe um resumo por WhatsApp ou SMS com link seguro para conferir e validar os dados informados.',
  },
  {
    id: 'faq-p2',
    category: 'proprietarios',
    categoryLabel: 'Para Proprietários',
    question: 'O que acontece com o histórico do carro se eu vendê-lo?',
    answer: 'O prontuário de manutenção acompanha o chassi e a placa do veículo, beneficiando o próximo proprietário com a comprovação da boa manutenção. No entanto, seus dados pessoais (nome, CPF, telefone, e-mail) não são transferidos nem expostos publicamente na consulta do histórico.',
  },
  {
    id: 'faq-p3',
    category: 'proprietarios',
    categoryLabel: 'Para Proprietários',
    question: 'Como o histórico no VEBOOK ajuda a valorizar meu carro na revenda?',
    answer: 'Veículos com manutenção preventiva comprovada e peças homologadas registradas por oficinas credenciadas possuem maior liquidez e menor risco de desvalorização, pois eliminam a desconfiança de hodômetro adulterado e histórico oculto de intervenções.',
  },

  // OFICINAS
  {
    id: 'faq-o1',
    category: 'oficinas',
    categoryLabel: 'Para Oficinas',
    question: 'Quem é responsável pela veracidade das informações cadastradas?',
    answer: 'A oficina credenciada que executa o serviço é a responsável originária pelos dados lançados (quilometragem, peças utilizadas, diagnósticos e datas). O VEBOOK fornece a infraestrutura de auditoria e segurança, mantendo a proveniência e a trilha de integridade do registro.',
  },
  {
    id: 'faq-o2',
    category: 'oficinas',
    categoryLabel: 'Para Oficinas',
    question: 'A oficina pode alterar ou excluir um registro após a validação do cliente?',
    answer: 'Por segurança e integridade histórica, um registro validado não é simplesmente apagado. Caso haja erro material (como digitação de KM ou especificação de peça), é aberto um procedimento de retificação que preserva o histórico de alterações para auditoria mútua.',
  },
  {
    id: 'faq-o3',
    category: 'oficinas',
    categoryLabel: 'Para Oficinas',
    question: 'Como a oficina é posicionada nos termos da LGPD perante seus clientes?',
    answer: 'A oficina atua como Controladora dos dados pessoais que coleta diretamente de seus clientes no momento do atendimento. O VEBOOK atua como Operador para o processamento e organização do histórico, e como Controlador independente nas operações próprias de segurança e infraestrutura da plataforma.',
  },

  // PRIVACIDADE & LGPD
  {
    id: 'faq-lg1',
    category: 'privacidade_lgpd',
    categoryLabel: 'Privacidade & LGPD',
    question: 'O VEBOOK comercializa dados pessoais de motoristas ou oficinas?',
    answer: 'Não. O VEBOOK não vende dados pessoais identificáveis (como nome, CPF, telefone ou e-mail) para listas de marketing ou terceiros. Tratamentos estatísticos de mercado utilizam dados estritamente anonimizados e agregados (Art. 12 da LGPD).',
  },
  {
    id: 'faq-lg2',
    category: 'privacidade_lgpd',
    categoryLabel: 'Privacidade & LGPD',
    question: 'Como posso exercer meus direitos de titular de dados (Art. 18 da LGPD)?',
    answer: 'Você pode acessar o painel "Minha Privacidade" no rodapé do VEBOOK ou enviar solicitação direta pelo Canal LGPD / Encarregado de Dados para: confirmação de tratamento, acesso a dados, correção de informações incompletas ou revogação de consentimento quando aplicável.',
  },
  {
    id: 'faq-lg3',
    category: 'privacidade_lgpd',
    categoryLabel: 'Privacidade & LGPD',
    question: 'Toda informação veicular é considerada dado pessoal?',
    answer: 'Não. Informações estritamente técnicas de peças, produtos e parâmetros mecânicos de um veículo não são inerentemente dados pessoais. Elas tornam-se tuteladas pela LGPD quando associadas a uma pessoa natural identificada ou identificável (por exemplo, proprietário vinculado à placa com CPF). O VEBOOK aplica proteção reforçada na camada de vinculação individual.',
  },

  // HISTÓRICO & CERTIDÕES
  {
    id: 'faq-h1',
    category: 'historico_certidoes',
    categoryLabel: 'Histórico & Certidões',
    question: 'O histórico no VEBOOK garante que o carro nunca sofreu acidentes ou sinistros não registrados?',
    answer: 'Não. O histórico do VEBOOK reflete com fidelidade as manutenções efetivamente cadastradas e validadas na rede credenciada. A plataforma não atesta a inexistência de intervenções realizadas fora da rede VEBOOK ou de fatos ocorridos sem comunicação formal à base de dados.',
  },
  {
    id: 'faq-h2',
    category: 'historico_certidoes',
    categoryLabel: 'Histórico & Certidões',
    question: 'Qual a validade de uma Certidão VEBOOK emitida com QR Code?',
    answer: 'A Certidão VEBOOK é um documento formal com autenticidade verificável via QR Code e código alfanumérico. Ela atesta o extrato de manutenções registradas e validadas até o momento exato de sua emissão, servindo como documento de transparência e valorização entre particulares e empresas.',
  },

  // SEGURANÇA
  {
    id: 'faq-s1',
    category: 'seguranca',
    categoryLabel: 'Segurança da Informação',
    question: 'Quais medidas de segurança protegem os dados no VEBOOK?',
    answer: 'Adotamos segregação lógica de ambientes, controle estrito de acessos com autenticação multifator para oficinas, criptografia em trânsito (TLS 1.3), mascaramento de documentos pessoais, rotinas automáticas de backup e monitoramento contínuo de logs de auditoria.',
  },
  {
    id: 'faq-s2',
    category: 'seguranca',
    categoryLabel: 'Segurança da Informação',
    question: 'Como funciona o plano de resposta a incidentes de segurança?',
    answer: 'Mantemos protocolo interno de contenção, análise forense, mitigação e, caso constatado risco ou dano relevante a titulares de dados, comunicação tempestiva à ANPD e aos usuários afetados conforme a Resolução CD/ANPD nº 15/2024.',
  },

  // COOKIES & CONTESTAÇÕES
  {
    id: 'faq-c1',
    category: 'cookies_contestações',
    categoryLabel: 'Cookies & Contestações',
    question: 'O que devo fazer se encontrar um serviço com quilometragem ou peça errada no meu veículo?',
    answer: 'Você pode acionar o recurso "Contestar este registro" diretamente no Diário Veicular ou no canal de Transparência. A contestação abre um protocolo formal onde você indica a divergência e a oficina é notificada para prestar esclarecimentos ou retificar o registro.',
  },
  {
    id: 'faq-c2',
    category: 'cookies_contestações',
    categoryLabel: 'Cookies & Contestações',
    question: 'Como posso alterar minhas preferências de cookies no VEBOOK?',
    answer: 'Você pode clicar no link "Preferências de Cookies" no rodapé a qualquer momento para revisar, ativar ou desativar cookies opcionais de análise de desempenho e funcionalidades, sem nenhum impacto no funcionamento essencial da plataforma.',
  },
];

export const PROVENANCE_SAMPLE = {
  registeredBy: 'Auto Center Prisma (CNPJ 14.892.441/0001-08)',
  technicalManager: 'Carlos Eduardo Mendes (CREA/CFT: 84920-SP)',
  registeredAt: '15/07/2026 às 14:32:10 (Horário de Brasília)',
  sourceType: 'Registro direto autenticado por terminal de oficina credenciada',
  status: 'Ativo e Homologado',
  lastModifiedAt: '16/07/2026 às 09:15:22',
  changeHistory: [
    {
      date: '15/07/2026 14:32',
      author: 'Oficina (Recepção Técnica)',
      action: 'Inclusão originária da OS nº 4892 com checklist de 32 itens',
    },
    {
      date: '15/07/2026 17:40',
      author: 'Proprietário (WhatsApp)',
      action: 'Validação digital confirmada pelo titular (Autenticação 2FA)',
    },
    {
      date: '16/07/2026 09:15',
      author: 'Sistema VEBOOK',
      action: 'Consolidação definitiva do registro no prontuário do veículo',
    }
  ]
};
