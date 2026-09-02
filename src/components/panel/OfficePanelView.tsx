import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Car,
  ClipboardList,
  Download,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Store,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  DEMO_OWNER,
  getActiveSession,
  getSessionOffice,
  getSessionUser,
  loginWithCpf,
  logoutOffice,
  requestPasswordReset,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatCpf, onlyDigits } from '../../lib/cpf';
import { workshopHost } from '../../lib/slug';
import { PanelSection } from '../../lib/navigation';
import { Logo } from '../layout/Logo';
import { Field, inputClass } from '../ui/Field';
import { Office, OfficeUser } from '../../types';
import { AgendaSection } from './AgendaSection';
import { AtendimentosSection } from './AtendimentosSection';
import { ClientesSection } from './ClientesSection';
import { ConfiguracoesSection } from './ConfiguracoesSection';
import { DashboardSection } from './DashboardSection';
import { FinanceiroSection } from './FinanceiroSection';
import { MinhaOficinaSection } from './MinhaOficinaSection';
import { PerfilSection } from './PerfilSection';
import { ProdutosSection } from './ProdutosSection';
import { ServicosSection } from './ServicosSection';
import { VeiculosSection } from './VeiculosSection';

interface OfficePanelViewProps {
  requestedSlug?: string;
  section: PanelSection;
  panelTab?: string;
  onSectionChange: (section: PanelSection, tab?: string) => void;
  onViewPublicPage: (slug: string) => void;
  onGoHome: () => void;
}

type NavItem = { id: PanelSection; label: string; icon: React.ReactNode };

const NAV_GROUPS: Array<{ title?: string; items: NavItem[] }> = [
  {
    items: [{ id: 'inicio', label: 'Início', icon: <LayoutDashboard className="w-4 h-4" /> }],
  },
  {
    items: [
      { id: 'atendimentos', label: 'Atendimentos', icon: <Wrench className="w-4 h-4" /> },
      { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
    ],
  },
  {
    items: [
      { id: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
      { id: 'veiculos', label: 'Veículos', icon: <Car className="w-4 h-4" /> },
      { id: 'servicos', label: 'Serviços', icon: <ClipboardList className="w-4 h-4" /> },
      { id: 'produtos', label: 'Produtos', icon: <Package className="w-4 h-4" /> },
      { id: 'financeiro', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
    ],
  },
  {
    items: [{ id: 'minha-oficina', label: 'Minha oficina', icon: <Store className="w-4 h-4" /> }],
  },
  {
    items: [
      { id: 'perfil', label: 'Perfil', icon: <UserRound className="w-4 h-4" /> },
      { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export const OfficePanelView: React.FC<OfficePanelViewProps> = ({
  requestedSlug,
  section,
  panelTab,
  onSectionChange,
  onViewPublicPage,
  onGoHome,
}) => {
  useOfficeStore();
  const session = getActiveSession();
  const user = getSessionUser();
  const office = getSessionOffice();

  if (!session || !user || !office) {
    return <PanelLogin onGoHome={onGoHome} expectedSlug={requestedSlug} />;
  }

  if (requestedSlug && office.slug !== requestedSlug) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-3 text-sm">
          <h1 className="text-lg font-extrabold text-[#0B1E36]">Acesso recusado</h1>
          <p className="text-slate-600">
            Esta sessão pertence a outra oficina. O isolamento por office_id impede visualizar ou alterar dados de terceiros.
          </p>
          <button type="button" onClick={() => { logoutOffice(); }} className="font-bold text-sky-800 cursor-pointer">
            Sair e entrar com outro CPF
          </button>
        </div>
      </div>
    );
  }

  return (
    <PanelShell
      office={office}
      user={user}
      section={section}
      panelTab={panelTab}
      onSectionChange={onSectionChange}
      onViewPublicPage={onViewPublicPage}
      onGoHome={onGoHome}
    />
  );
};

const PanelLogin: React.FC<{ onGoHome: () => void; expectedSlug?: string }> = ({ onGoHome, expectedSlug }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await loginWithCpf(cpf, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0B1E36] text-white">
        <div className="max-w-md mx-auto px-4 py-5 flex items-center justify-between">
          <Logo size="sm" variant="light" />
          <button type="button" onClick={onGoHome} className="text-xs font-bold text-sky-300 cursor-pointer">
            Portal VEBOOK
          </button>
        </div>
      </div>
      <form onSubmit={(e) => void submit(e)} className="max-w-md mx-auto px-4 py-10 space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Área restrita</p>
          <h1 className="text-2xl font-extrabold text-[#0B1E36]">Acesso ao painel da oficina</h1>
          <p className="text-sm text-slate-600">Entre com CPF e senha do responsável.{expectedSlug ? ` Oficina: ${expectedSlug}.vebook.com.br` : ''}</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <Field label="CPF">
            <input className={inputClass} value={formatCpf(cpf)} onChange={(e) => setCpf(onlyDigits(e.target.value))} />
          </Field>
          <Field label="Senha">
            <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {resetMessage ? <p className="text-sm text-emerald-700">{resetMessage}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#0B1E36] text-white font-extrabold text-sm cursor-pointer disabled:opacity-60"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = requestPasswordReset(cpf);
              setResetMessage(
                ok
                  ? 'Se o CPF estiver cadastrado, enviaremos o procedimento de redefinição. Neste protótipo o pedido fica registrado na conta.'
                  : 'Se o CPF estiver cadastrado, enviaremos o procedimento de redefinição.',
              );
            }}
            className="w-full text-xs font-bold text-slate-600 cursor-pointer"
          >
            Esqueci minha senha
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Demonstração da oficina Prisma: CPF {formatCpf(DEMO_OWNER.cpf)} · senha {DEMO_OWNER.password}
        </p>
      </form>
    </div>
  );
};

const PanelShell: React.FC<{
  office: Office;
  user: OfficeUser;
  section: PanelSection;
  panelTab?: string;
  onSectionChange: (section: PanelSection, tab?: string) => void;
  onViewPublicPage: (slug: string) => void;
  onGoHome: () => void;
}> = ({ office, user, section, panelTab, onSectionChange, onViewPublicPage, onGoHome }) => {
  const pending = office.status !== 'active';
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installHint, setInstallHint] = useState('');

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw-oficina.js');
    }
  }, []);

  const go = (next: PanelSection, tab?: string) => {
    onSectionChange(next, tab);
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const agendaTab = section === 'agenda' && panelTab === 'retornos' ? 'retornos' : 'agendamentos';
  const configTab =
    section === 'configuracoes' && panelTab === 'equipe'
      ? 'equipe'
      : section === 'configuracoes' && panelTab === 'assinatura'
        ? 'assinatura'
        : section === 'configuracoes' && panelTab === 'privacidade'
          ? 'privacidade'
          : section === 'configuracoes' && panelTab === 'pagina-publica'
            ? 'pagina-publica'
            : 'conta';

  const nav = (
    <nav className="bg-[#0B1E36] rounded-2xl border border-[#132c4d] p-2 space-y-3 shadow-sm">
      {NAV_GROUPS.map((group, index) => (
        <div key={index} className="space-y-1">
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                section === item.id
                  ? 'bg-[#c4a35a]/15 text-white border-l-2 border-[#c4a35a] pl-[10px]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <span className={section === item.id ? 'text-[#c4a35a]' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          {index < NAV_GROUPS.length - 1 ? <div className="border-t border-white/10 mx-2" /> : null}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-[#F8FAFC] text-[#071A33]">
      <header className="shrink-0 bg-[#0B1E36] text-white z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="lg:hidden mt-1 p-2 rounded-lg bg-white/10 cursor-pointer"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Abrir menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <p className="text-[11px] text-sky-300 font-bold uppercase tracking-wider">VEBOOK — Gestão da Oficina</p>
              <h1 className="text-lg font-extrabold">{office.name}</h1>
              <p className="text-[11px] text-slate-300">{office.city} — {office.state}</p>
              <p className="text-[11px] text-slate-400 font-mono">{workshopHost(office.slug)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onViewPublicPage(office.slug)}
              className="px-3 py-2 rounded-lg bg-white/10 text-xs font-bold cursor-pointer"
            >
              Ver página pública
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="px-3 py-2 rounded-lg bg-white/10 text-xs font-bold cursor-pointer"
              >
                {user.fullName}
              </button>
              {accountOpen ? (
                <div className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-lg p-2 z-20">
                  <button type="button" onClick={() => go('perfil')} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 cursor-pointer">Perfil</button>
                  <button type="button" onClick={() => go('configuracoes')} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 cursor-pointer">Configurações</button>
                  <button
                    type="button"
                    onClick={() => {
                      logoutOffice();
                      onGoHome();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-700 hover:bg-rose-50 cursor-pointer inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {pending ? (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 text-amber-950 text-sm px-4 py-3 text-center font-medium">
          Pagamento ainda não confirmado. A oficina permanece pendente e fora da busca pública até a ativação.
        </div>
      ) : null}

      <div className="flex-1 min-h-0">
        <div className="h-full max-w-6xl mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 lg:gap-6 items-stretch">
          <aside
            className={`min-h-0 flex flex-col gap-4 ${
              menuOpen ? 'block' : 'hidden'
            } lg:flex`}
          >
            <div className="min-h-0 overflow-y-auto overscroll-contain pr-0.5">
              {nav}
            </div>
            <div className="shrink-0 bg-white rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
              <p className="font-bold text-[#0B1E36] flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Instalar o VEBOOK</p>
              <p className="text-slate-600">PWA VEBOOK — Gestão da Oficina. O atalho abre diretamente no painel.</p>
              <button
                type="button"
                onClick={async () => {
                  if (installEvent) {
                    await installEvent.prompt();
                    setInstallEvent(null);
                    setInstallHint('Instalação solicitada.');
                    return;
                  }
                  setInstallHint('No celular, use o menu do navegador e escolha “Adicionar à tela inicial”. No computador, use o ícone de instalação da barra de endereço.');
                }}
                className="w-full py-2 rounded-lg bg-slate-100 font-bold cursor-pointer"
              >
                Instalar aplicativo
              </button>
              {installHint ? <p className="text-slate-500">{installHint}</p> : null}
            </div>
            <p className="shrink-0 text-[11px] text-slate-500 px-1">Dados isolados por office_id.</p>
          </aside>

          <main className="min-h-0 min-w-0 flex flex-col">
            <div className="vebook-panel-frame flex-1 min-h-0 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              {section === 'inicio' && (
                <DashboardSection
                  office={office}
                  onSectionChange={(next, tab) => go(next, tab)}
                />
              )}
              {section === 'atendimentos' && <AtendimentosSection officeId={office.officeId} />}
              {section === 'agenda' && <AgendaSection officeId={office.officeId} initialTab={agendaTab} />}
              {section === 'clientes' && <ClientesSection officeId={office.officeId} />}
              {section === 'veiculos' && <VeiculosSection officeId={office.officeId} />}
              {section === 'servicos' && <ServicosSection officeId={office.officeId} />}
              {section === 'produtos' && <ProdutosSection officeId={office.officeId} />}
              {section === 'financeiro' && <FinanceiroSection officeId={office.officeId} />}
              {section === 'minha-oficina' && <MinhaOficinaSection office={office} onViewPublicPage={onViewPublicPage} />}
              {section === 'perfil' && <PerfilSection user={user} />}
              {section === 'configuracoes' && <ConfiguracoesSection office={office} user={user} initialTab={configTab} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
