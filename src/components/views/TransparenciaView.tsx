import React, { useState, useEffect } from 'react';
import { TransparenciaSection } from '../../types';
import { DATA_CATEGORIES_MATRIX, FAQ_DATA, PROVENANCE_SAMPLE } from '../../data/governanceData';
import {
  ShieldCheck,
  Scale,
  Lock,
  FileText,
  Cookie,
  HelpCircle,
  AlertTriangle,
  FileCheck2,
  Building2,
  Sliders,
  ChevronRight,
  Send,
  Eye,
  CheckCircle,
  Info,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  BookOpen,
  UserCheck,
} from 'lucide-react';

interface TransparenciaViewProps {
  initialSection?: TransparenciaSection;
  onOpenCookiesConfig: () => void;
  onOpenContestacaoModal: () => void;
  onOpenPrivacidadeModal: () => void;
  onNavigateToDiario: () => void;
  onNavigateToCertidao: () => void;
}

export const TransparenciaView: React.FC<TransparenciaViewProps> = ({
  initialSection = 'como-tratamos',
  onOpenCookiesConfig,
  onOpenContestacaoModal,
  onOpenPrivacidadeModal,
  onNavigateToDiario,
  onNavigateToCertidao,
}) => {
  const [activeSection, setActiveSection] = useState<TransparenciaSection>(initialSection);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('todos');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const menuItems: { id: TransparenciaSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'como-tratamos', label: 'Como Tratamos Informações', icon: Info },
    { id: 'termos', label: 'Termos de Uso', icon: Scale },
    { id: 'privacidade', label: 'Política de Privacidade (LGPD)', icon: Lock },
    { id: 'cookies', label: 'Política de Cookies', icon: Cookie },
    { id: 'seguranca', label: 'Segurança da Informação', icon: Server },
    { id: 'direitos-titular', label: 'Direitos do Titular', icon: UserCheck },
    { id: 'regras-historico', label: 'Regras do Histórico Veicular', icon: BookOpen },
    { id: 'regras-consulta', label: 'Regras de Consulta', icon: Search },
    { id: 'certidoes', label: 'Certidões VEBOOK', icon: FileCheck2 },
    { id: 'regras-oficinas', label: 'Regras para Oficinas', icon: Building2 },
    { id: 'contestações', label: 'Política de Contestações', icon: AlertTriangle },
    { id: 'faq', label: 'FAQ Institucional', icon: HelpCircle },
    { id: 'minha-privacidade', label: 'Minha Privacidade (Painel)', icon: ShieldCheck },
  ];

  const filteredFaq = FAQ_DATA.filter((item) => {
    const matchesCategory = faqCategoryFilter === 'todos' || item.category === faqCategoryFilter;
    const matchesSearch =
      faqSearchQuery === '' ||
      item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="view-transparencia-governanca" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO INSTITUCIONAL DE AUTORIDADE */}
        <div className="bg-[#0B1E36] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950/90 border border-sky-800 text-sky-300 text-xs font-mono">
                <Scale className="w-3.5 h-3.5" />
                <span>Arquitetura de Transparência, Governança & Segurança Jurídica</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Centro de Governança e Transparência VEBOOK
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                "O VEBOOK é uma plataforma tecnológica destinada a organizar, registrar, preservar e disponibilizar informações relacionadas à manutenção e ao histórico veicular, respeitando a legislação aplicável, os direitos dos titulares e as responsabilidades de cada participante da plataforma."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenPrivacidadeModal}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Painel Minha Privacidade</span>
              </button>

              <button
                onClick={onOpenCookiesConfig}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Preferências de Cookies</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] text-slate-400">
            <span><strong>Versão Documental:</strong> 2026.2 (Homologada)</span>
            <span><strong>Última Atualização:</strong> 21 de Agosto de 2026</span>
            <span><strong>Encarregado de Dados (DPO):</strong> dpo@vebook.com.br</span>
            <span><strong>Conformidade:</strong> LGPD (Lei 13.709/18) · Marco Civil (Lei 12.965/14) · CDC (Lei 8.078/90)</span>
          </div>
        </div>

        {/* ESTRUTURA PRINCIPAL: MENU LATERAL + CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* MENU LATERAL DE NAVEGAÇÃO JURÍDICA */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs sticky top-6 space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Documentos & Políticas
              </div>
              <nav className="space-y-0.5 pt-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B1E36] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 mt-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5">
                <span className="font-bold text-slate-800 block">Precisa de suporte ou retificação?</span>
                <p>Abra um protocolo formal de contestação ou solicitação LGPD.</p>
                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    onClick={onOpenContestacaoModal}
                    className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-all cursor-pointer text-center"
                  >
                    Contestar um Registro
                  </button>
                  <button
                    onClick={onOpenPrivacidadeModal}
                    className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition-all cursor-pointer text-center"
                  >
                    Canal LGPD do Titular
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL DINÂMICO */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. COMO TRATAMOS INFORMAÇÕES */}
            {activeSection === 'como-tratamos' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-slate-700">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Info className="w-3.5 h-3.5" />
                    <span>Visão Humana, Didática e Transparente</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Como o VEBOOK Trata Informações
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Entenda de maneira simples quais dados são coletados, de onde eles vêm, por que são utilizados, quem pode visualizá-los e como a sua privacidade é preservada.
                  </p>
                </div>

                {/* Ciclo dos Dados em 4 Passos */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    O Ciclo de Vida da Informação no VEBOOK
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#0B1E36] text-xs">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">1</span>
                        <span>Origem & Inclusão Técnica</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        A oficina mecânica credenciada executa a manutenção e registra as peças, óleos e serviços com identificação do responsável técnico.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#0B1E36] text-xs">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Validação Transparente pelo Cliente</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        O proprietário recebe o extrato seguro para conferir itens e quilometragem. Havendo divergência, pode contestar antes da consolidação.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#0B1E36] text-xs">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Preservação no Prontuário do Veículo</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        O histórico técnico vincula-se ao veículo para valorização futura. Dados pessoais do dono não são expostos em consultas públicas.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#0B1E36] text-xs">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">4</span>
                        <span>Inteligência Agregada & Anônima</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Métricas de desgaste e modelos mais atendidos são agregadas de forma 100% anonimizada (Art. 12 da LGPD), sem venda de cadastros individuais.
                      </p>
                    </div>
                  </div>
                </div>

                {/* As 5 Categorias de Dados */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    As 5 Categorias Fundamentais de Dados
                  </h3>
                  <div className="space-y-3">
                    {DATA_CATEGORIES_MATRIX.map((cat) => (
                      <div key={cat.category} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-[#0B1E36] text-sm">{cat.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                            {cat.accessLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Exemplos:</strong> {cat.examples.join(', ')}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Por que utilizamos:</strong> {cat.purpose}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          <strong>Retenção & Descarte:</strong> {cat.retentionRule}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* O que o VEBOOK NÃO faz */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <span className="font-bold block text-sm text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    O que o VEBOOK NÃO faz com suas informações:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-amber-900 leading-relaxed">
                    <li>Não comercializa dados pessoais identificáveis (nome, CPF, telefone ou e-mail) para listas de marketing de terceiros.</li>
                    <li>Não expõe o nome ou CPF do antigo proprietário para novos compradores durante a consulta do histórico.</li>
                    <li>Não altera registros validados de serviços sem a devida trilha de auditoria e contraditório entre as partes.</li>
                    <li>Não se apresenta como órgão governamental nem promete acesso a bases públicas restritas sem autorização legal.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. TERMOS DE USO */}
            {activeSection === 'termos' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Contrato de Adesão e Uso da Plataforma</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Termos de Uso do Ecossistema VEBOOK
                  </h2>
                  <p className="text-xs text-slate-500">
                    Versão 2026.2 · Aplicável a proprietários de veículos, oficinas credenciadas e consulentes.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">1. Objeto e Natureza da Plataforma</h4>
                  <p>
                    O <strong>VEBOOK</strong> é uma infraestrutura tecnológica destinada a organizar, registrar, armazenar, preservar e disponibilizar informações técnicas relativas a manutenções, peças e histórico de veículos automotores. O VEBOOK atua como plataforma neutra e não é proprietário dos veículos nem dos dados lançados originariamente por terceiros.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm">2. Delimitação Institucional e Responsabilidade</h4>
                  <p>
                    O VEBOOK não é órgão governamental, cartório de registro de títulos ou substituto dos órgãos do Sistema Nacional de Trânsito (SENATRAN, CONTRAN, Detrans). O histórico e a Certidão VEBOOK não comprovam propriedade jurídica, posse, inexistência de gravames, inexistência de débitos fiscais ou ausência de sinistros não comunicados à rede credenciada.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm">3. Responsabilidade pelos Registros de Serviço</h4>
                  <p>
                    A oficina mecânica cadastrada é a única responsável originária pela veracidade, exatidão técnica e integridade das ordens de serviço, peças, óleos e quilometragens inseridas. O usuário proprietário possui a prerrogativa de validar ou contestar registros.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm">4. Uso Legítimo e Vedações</h4>
                  <p>
                    É expressamente vedado aos usuários e oficinas: (a) inserir dados sabidamente falsos ou adulterados; (b) utilizar a plataforma para fins ilícitos, difamatórios ou concorrenciais predatórios; (c) tentar violar as barreiras de segurança cibernética ou acessar dados de terceiros sem permissão.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm">5. Foro e Legislação Aplicável</h4>
                  <p>
                    Os presentes Termos de Uso são regidos pela legislação da República Federativa do Brasil, em especial a Constituição Federal, o Código Civil, o Marco Civil da Internet (Lei 12.965/14) e o Código de Defesa do Consumidor (Lei 8.078/90).
                  </p>
                </div>
              </div>
            )}

            {/* 3. POLÍTICA DE PRIVACIDADE */}
            {activeSection === 'privacidade' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Conformidade Estrita com a Lei 13.709/2018 (LGPD)</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Política de Privacidade e Proteção de Dados
                  </h2>
                  <p className="text-xs text-slate-500">
                    Transparência sobre papéis de tratamento, bases legais, armazenamento e segurança.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">1. Agentes de Tratamento (Controlador x Operador)</h4>
                  <p>
                    Em consonância com as diretrizes da ANPD: (a) <strong>A Oficina Credenciada</strong> atua como Controladora dos dados pessoais coletados no balcão de atendimento; (b) <strong>O VEBOOK</strong> atua como Operador para o processamento, envio de validações e organização do prontuário, e como Controlador nas operações próprias de gestão de contas, segurança e faturamento da plataforma.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm">2. Bases Legais Utilizadas (Art. 7º da LGPD)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Execução de Contrato (Art. 7º, V):</strong> para disponibilização das ferramentas de histórico e emissão de certidões.</li>
                    <li><strong>Cumprimento de Obrigação Legal (Art. 7º, II):</strong> para guarda de logs de conexão nos termos do Marco Civil da Internet.</li>
                    <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> para prevenção a fraudes de hodômetro e garantia da segurança das informações.</li>
                    <li><strong>Consentimento (Art. 7º, I):</strong> para comunicações promocionais e cookies opcionais de navegação.</li>
                  </ul>

                  <h4 className="font-bold text-slate-900 text-sm">3. Compartilhamento e Provedores Tecnológicos</h4>
                  <p>
                    O VEBOOK não comercializa cadastros de titulares. O compartilhamento ocorre exclusivamente com suboperadores tecnológicos estritamente homologados (como infraestrutura de nuvem, envio de SMS/WhatsApp e segurança da informação), mediante cláusulas de confidencialidade e segurança equivalentes.
                  </p>

                  <h4 className="font-bold text-slate-900 text-sm">4. Encarregado pelo Tratamento de Dados (DPO)</h4>
                  <p>
                    Para esclarecimentos, dúvidas ou requisições formais, nosso Encarregado pode ser acionado diretamente pelo e-mail: <strong className="text-sky-700">dpo@vebook.com.br</strong> ou pelo painel <button onClick={onOpenPrivacidadeModal} className="text-sky-700 underline font-bold cursor-pointer">Minha Privacidade</button>.
                  </p>
                </div>
              </div>
            )}

            {/* 4. POLÍTICA DE COOKIES */}
            {activeSection === 'cookies' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Cookie className="w-3.5 h-3.5" />
                    <span>Transparência e Gestão de Consentimento</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Política de Cookies e Tecnologias Semelhantes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Elaborada com base no Guia Orientativo de Cookies da ANPD.
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    Cookies são pequenos arquivos digitais armazenados em seu dispositivo para garantir o funcionamento seguro das páginas, lembrar preferências e aferir estatísticas de uso.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 text-xs block">Cookies Essenciais (Obrigatórios)</span>
                      <p className="text-xs text-slate-600">
                        Necessários para autenticação de oficinas, proteção contra fraudes e balanceamento de tráfego. Não podem ser desativados.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 text-xs block">Cookies Opcionais (Desempenho & Funcionais)</span>
                      <p className="text-xs text-slate-600">
                        Ajudam a analisar páginas mais acessadas de forma agregada e salvar preferências de filtro no Diário Veicular.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-sky-950 space-y-0.5">
                      <span className="font-bold block">Você pode alterar suas preferências a qualquer momento:</span>
                      <p className="text-sky-800">Suas escolhas são salvas localmente e podem ser revisadas sem burocracia.</p>
                    </div>
                    <button
                      onClick={onOpenCookiesConfig}
                      className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg transition-all shrink-0 cursor-pointer"
                    >
                      Abrir Gerenciador de Cookies
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SEGURANÇA DA INFORMAÇÃO */}
            {activeSection === 'seguranca' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Server className="w-3.5 h-3.5" />
                    <span>Medidas Técnicas e Administrativas</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Segurança da Informação e Gestão de Incidentes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Diretrizes em conformidade com o Guia de Segurança da ANPD e Resolução CD/ANPD nº 15/2024.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-[#0B1E36] text-xs block">Controle Estrito de Acesso</span>
                      <p className="text-xs text-slate-600">
                        Autenticação segura para oficinas credenciadas, segregação de privilégios e permissões por perfil de usuário.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-[#0B1E36] text-xs block">Criptografia & Mascaramento</span>
                      <p className="text-xs text-slate-600">
                        Criptografia de dados em trânsito (TLS 1.3) e mascaramento de CPFs e telefones em telas públicas de consulta.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-[#0B1E36] text-xs block">Segregação Lógica entre Oficinas</span>
                      <p className="text-xs text-slate-600">
                        Uma oficina não tem acesso a relatórios gerenciais, cadastros de clientes ou faturamento de outras oficinas da rede.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-[#0B1E36] text-xs block">Backups e Redundância</span>
                      <p className="text-xs text-slate-600">
                        Rotinas diárias automatizadas de backup em servidores geograficamente distribuídos para continuidade do serviço.
                      </p>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm pt-2">Plano de Resposta a Incidentes de Segurança</h4>
                  <p>
                    O VEBOOK adota medidas técnicas e administrativas para proteger os dados. Em caso de incidente comprovado com risco ou dano relevante a titulares, mantemos fluxo formal de contenção, investigação forense, notificação tempestiva à ANPD e comunicação direta aos usuários impactados, mantendo registros por prazo não inferior a 5 anos conforme norma vigente.
                  </p>
                </div>
              </div>
            )}

            {/* 6. DIREITOS DO TITULAR */}
            {activeSection === 'direitos-titular' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Exercício Efetivo dos Direitos do Art. 18 da LGPD</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Direitos do Titular de Dados Pessoais
                  </h2>
                  <p className="text-xs text-slate-500">
                    O VEBOOK transforma a proteção de dados em funcionalidade prática do seu dia a dia.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <strong className="block text-slate-900 text-xs font-bold mb-1">1. Confirmação & Acesso</strong>
                      <p className="text-xs text-slate-600">Saber se tratamos seus dados e obter extrato completo das informações.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <strong className="block text-slate-900 text-xs font-bold mb-1">2. Correção de Dados</strong>
                      <p className="text-xs text-slate-600">Solicitar a retificação de dados incompletos, inexatos ou desatualizados.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <strong className="block text-slate-900 text-xs font-bold mb-1">3. Anonimização ou Bloqueio</strong>
                      <p className="text-xs text-slate-600">Solicitar desvinculação de dados pessoais excessivos ou desnecessários.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <strong className="block text-slate-900 text-xs font-bold mb-1">4. Eliminação & Revogação</strong>
                      <p className="text-xs text-slate-600">Pedir exclusão de dados tratados com consentimento e revogar autorizações.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1E36] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-sm block">Quer exercer seus direitos agora?</span>
                      <p className="text-xs text-slate-300">Abra uma requisição direta pelo formulário eletrônico do DPO.</p>
                    </div>
                    <button
                      onClick={onOpenPrivacidadeModal}
                      className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shrink-0 cursor-pointer"
                    >
                      Acessar Canal do Titular
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. REGRAS DO HISTÓRICO VEICULAR */}
            {activeSection === 'regras-historico' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Conceito de Prontuário Técnico e Proveniência</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Regras do Histórico Veicular
                  </h2>
                  <p className="text-xs text-slate-500">
                    O VEBOOK não é "tribunal do carro": preserva registros técnicos legítimos.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="font-bold text-slate-900 block text-sm">O que o histórico representa:</span>
                    <p className="text-slate-600 leading-relaxed">
                      O histórico representa informações técnicas fornecidas por oficinas mecânicas no momento do atendimento. Cada lançamento possui origem rastreável, data, quilometragem informada e itens aplicados.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 text-amber-950">
                    <span className="font-bold block text-amber-900">O que o histórico NÃO constitui por si só:</span>
                    <ul className="list-disc list-inside space-y-1 text-amber-900 leading-relaxed">
                      <li>Não é prova de propriedade ou posse do veículo.</li>
                      <li>Não é atestado de culpa em eventuais falhas mecânicas fora da garantia.</li>
                      <li>Não garante a inexistência de fatos ou serviços não registrados na plataforma.</li>
                      <li>Não substitui laudo de vistoria cautelar veicular.</li>
                    </ul>
                  </div>

                  {/* Exemplo de Proveniência */}
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Modelo Conceitual de Proveniência do Registro
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5 border border-slate-800">
                      <div className="text-sky-400 font-bold">» Registro de Manutenção Técnica Homologada</div>
                      <div>Registrado por: <span className="text-white">{PROVENANCE_SAMPLE.registeredBy}</span></div>
                      <div>Responsável Técnico: <span className="text-white">{PROVENANCE_SAMPLE.technicalManager}</span></div>
                      <div>Data do Registro: <span className="text-white">{PROVENANCE_SAMPLE.registeredAt}</span></div>
                      <div>Fonte: <span className="text-white">{PROVENANCE_SAMPLE.sourceType}</span></div>
                      <div>Situação: <span className="text-emerald-400 font-bold">{PROVENANCE_SAMPLE.status}</span></div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onNavigateToDiario}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ver Prontuário no Diário Veicular</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. REGRAS DE CONSULTA */}
            {activeSection === 'regras-consulta' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Search className="w-3.5 h-3.5" />
                    <span>Níveis de Acesso e Finalidades Legítimas</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Regras de Consulta ao Histórico
                  </h2>
                  <p className="text-xs text-slate-500">
                    Equilíbrio entre valorização do veículo e respeito à privacidade dos titulares.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                      <span className="font-bold text-[#0B1E36] text-xs block">Consulta Pública / Informativa</span>
                      <p className="text-xs text-slate-600">
                        Permite a qualquer interessado (ex: potencial comprador) consultar a linha do tempo técnica das manutenções do veículo através da placa, verificando a regularidade de revisões e peças aplicadas, com <strong>mascaramento absoluto de dados pessoais</strong>.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                      <span className="font-bold text-[#0B1E36] text-xs block">Consulta do Proprietário Titular</span>
                      <p className="text-xs text-slate-600">
                        O proprietário autenticado possui visão ampliada das ordens de serviço de seu veículo, podendo emitir certidões formais, validar serviços pendentes e contestar eventuais erros de lançamento.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                      <span className="font-bold text-[#0B1E36] text-xs block">Consulta da Oficina Credenciada</span>
                      <p className="text-xs text-slate-600">
                        A oficina consulta o prontuário para formular diagnósticos mais precisos com base em trocas anteriores de correias, fluidos e filtros realizadas no ecossistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. CERTIDÕES VEBOOK */}
            {activeSection === 'certidoes' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Histórico Informativo vs. Certidão Formal</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Regras de Emissão de Certidões VEBOOK
                  </h2>
                  <p className="text-xs text-slate-500">
                    Documento formal emitido com código de autenticidade e validação por QR Code.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 text-xs block">Histórico Diário (Consulta)</span>
                      <p className="text-xs text-slate-600">
                        Visualização dinâmica e aberta do histórico de manutenções no navegador. Atualiza-se em tempo real a cada novo serviço cadastrado.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                      <span className="font-bold text-sky-950 text-xs block">Certidão Formal VEBOOK</span>
                      <p className="text-xs text-sky-800">
                        Documento oficial congelado em data/hora, com código alfanumérico único e QR Code para comprovação formal perante seguradoras, concessionárias ou compradores.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2">
                    <strong className="text-white block font-bold">Cláusula Padrão da Certidão VEBOOK:</strong>
                    <p className="italic leading-relaxed text-slate-300">
                      "A presente certidão reproduz com fidelidade as informações disponíveis na base tecnológica do VEBOOK na data e no momento exato de sua emissão, não constituindo garantia absoluta de inexistência de fatos ou serviços que não tenham sido registrados na plataforma."
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onNavigateToCertidao}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Emitir ou Validar uma Certidão</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. REGRAS PARA OFICINAS */}
            {activeSection === 'regras-oficinas' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Deveres, Veracidade e Boas Práticas da Rede</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Regras para Oficinas Credenciadas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Responsabilidade técnica originária sobre os registros de serviços e peças.
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    As oficinas credenciadas compõem a linha de frente do ecossistema VEBOOK. O credenciamento confere autoridade de registro e exige cumprimento rigoroso das seguintes diretrizes:
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-slate-900 block font-bold">Dever de Veracidade e Exatidão:</strong>
                        A oficina deve registrar exclusivamente serviços efetivamente executados, com quilometragem real aferida no painel e discriminação correta das peças e marcas aplicadas.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-slate-900 block font-bold">Guarda e Sigilo de Credenciais:</strong>
                        As senhas e tokens de acesso aos terminais são pessoais e intransferíveis, respondendo a oficina pelos atos praticados por seus operadores autorizados.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-slate-900 block font-bold">Respeito aos Direitos dos Clientes:</strong>
                        Garantir a emissão de nota fiscal correspondente e permitir que o proprietário valide ou conteste os dados registrados.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. POLÍTICA DE CONTESTAÇÕES */}
            {activeSection === 'contestações' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Princípio da Não Eliminação Arbitrária</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Política de Contestações e Retificações
                  </h2>
                  <p className="text-xs text-slate-500">
                    Como funciona o procedimento técnico de auditoria quando há divergência em um registro.
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    Para garantir a confiabilidade nacional do histórico, o VEBOOK não apaga registros de forma sumária ou arbitrária. Quando um usuário identifica erro (ex: erro de digitação de quilometragem ou peça divergente), é instaurado o fluxo de contestação:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <span className="font-bold text-[#0B1E36] block">1. Abertura do Protocolo</span>
                      <p className="text-slate-600">O titular aponta a divergência e o status do serviço passa imediatamente para "Contestado / Em Análise".</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <span className="font-bold text-[#0B1E36] block">2. Notificação & Contraditório</span>
                      <p className="text-slate-600">A oficina responsável é notificada para apresentar a OS e notas fiscais ou concordar com a retificação.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <span className="font-bold text-[#0B1E36] block">3. Retificação com Trilha</span>
                      <p className="text-slate-600">Realizada a correção, o histórico preserva o registro da retificação para fins de integridade e auditoria.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onOpenContestacaoModal}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Abrir Formulário de Contestação</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 12. FAQ INSTITUCIONAL */}
            {activeSection === 'faq' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Perguntas Frequentes Estruturadas</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Central de Perguntas Frequentes (FAQ)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Respostas objetivas sobre funcionamento, oficinas, proprietários, LGPD e certidões.
                  </p>
                </div>

                {/* Filtro por Categoria e Busca */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Pesquisar pergunta ou palavra-chave..."
                      value={faqSearchQuery}
                      onChange={(e) => setFaqSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <select
                    value={faqCategoryFilter}
                    onChange={(e) => setFaqCategoryFilter(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="todos">Todas as Categorias</option>
                    <option value="geral">Geral</option>
                    <option value="proprietarios">Proprietários</option>
                    <option value="oficinas">Oficinas</option>
                    <option value="privacidade_lgpd">Privacidade & LGPD</option>
                    <option value="historico_certidoes">Histórico & Certidões</option>
                    <option value="seguranca">Segurança</option>
                    <option value="cookies_contestações">Cookies & Contestações</option>
                  </select>
                </div>

                {/* Lista de FAQ */}
                <div className="space-y-3 pt-2">
                  {filteredFaq.map((faq) => (
                    <details
                      key={faq.id}
                      className="group p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                    >
                      <summary className="font-bold text-xs sm:text-sm text-[#0B1E36] cursor-pointer flex items-center justify-between gap-2">
                        <span>{faq.question}</span>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                          {faq.categoryLabel}
                        </span>
                      </summary>
                      <div className="pt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 mt-3">
                        {faq.answer}
                      </div>
                    </details>
                  ))}

                  {filteredFaq.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Nenhuma dúvida encontrada para o termo pesquisado.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 13. MINHA PRIVACIDADE (ATALHO DIRETO) */}
            {activeSection === 'minha-privacidade' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2 border-b border-slate-200 pb-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Governança Ativa do Usuário</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0B1E36]">
                    Painel Central de Privacidade e LGPD
                  </h2>
                  <p className="text-xs text-slate-500">
                    Acesse o painel interativo para visualizar seus dados, gerenciar preferências ou exercer seus direitos de titular.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0B1E36]">
                      Controle Total dos Seus Dados no VEBOOK
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Consulte a matriz de retenção, solicite extratos de registros ou abra um protocolo formal junto ao nosso DPO.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={onOpenPrivacidadeModal}
                      className="px-6 py-2.5 rounded-xl bg-[#0B1E36] hover:bg-[#122b4d] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-sky-400" />
                      <span>Abrir Painel Minha Privacidade</span>
                    </button>
                    <button
                      onClick={onOpenCookiesConfig}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-slate-500" />
                      <span>Revisar Cookies</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
