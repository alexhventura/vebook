import React, { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Car,
  ClipboardList,
  Globe,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Package,
  Settings,
  User,
  Users,
  Wallet,
  Wrench,
  X,
  BarChart3,
} from 'lucide-react';
import { PATHS } from '../../lib/paths';
import { displayOfficeHost } from '../../office/constants';
import {
  assertUserCanAccessOffice,
  clearDemoSession,
  getDemoSession,
  getOfficeByHostname,
  getUserById,
  switchOfficeContext,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { DemoBanner } from './shared';
import { OfficeSwitcher } from './OfficeSwitcher';
import { Button } from '../ui/Button';
import { Office } from '../../office/types';

const NAV = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'atendimentos', label: 'Atendimentos', icon: ClipboardList },
  { to: 'agenda', label: 'Agenda', icon: Calendar },
  { to: 'clientes', label: 'Clientes', icon: Users },
  { to: 'veiculos', label: 'Veículos', icon: Car },
  { to: 'produtos', label: 'Produtos', icon: Package },
  { to: 'financeiro', label: 'Financeiro', icon: Wallet },
  { to: 'equipe', label: 'Equipe e Permissões', icon: Wrench },
  { to: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: 'inteligencia', label: 'Inteligência de Mercado', icon: LineChart },
  { to: 'perfil', label: 'Meu Perfil', icon: User },
  { to: 'site', label: 'Meu Site', icon: Globe },
  { to: 'configuracoes', label: 'Configurações', icon: Settings },
];

export const AdminShell: React.FC<{ slugOverride?: string; tenantMode?: boolean }> = ({ slugOverride, tenantMode = false }) => {
  useOfficeSnapshot();
  const { slug: paramSlug = '' } = useParams();
  const slug = slugOverride || paramSlug;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const location = useLocation();
  const office = getOfficeByHostname(slug);
  const session = getDemoSession();
  const user = session ? getUserById(session.userId) : undefined;
  const welcome = params.get('bem-vindo') === '1';
  const loginPath = tenantMode ? '/admin/entrar' : PATHS.oficinaAdminLogin(slug);
  const publicPath = tenantMode ? '/' : PATHS.oficina(slug);

  useEffect(() => {
    if (!office || !session) return;
    if (session.officeId === office.id) return;
    if (!assertUserCanAccessOffice(session.userId, office.id)) return;
    switchOfficeContext(office.id);
  }, [office?.id, session?.userId, session?.officeId]);

  if (!office) {
    return <Navigate to={tenantMode ? '/' : PATHS.oficinas} replace />;
  }
  const membership = session ? assertUserCanAccessOffice(session.userId, office.id) : null;
  if (!session || !membership) {
    return <Navigate to={loginPath} replace />;
  }

  const activeSession =
    session.officeId === office.id
      ? session
      : { ...session, officeId: office.id, role: membership.role };
  const base = tenantMode ? '/admin' : PATHS.oficinaAdmin(office.currentHostname);
  const currentNav = NAV.find((item) => location.pathname.endsWith(`/${item.to}`));
  const logout = () => {
    clearDemoSession();
    navigate(publicPath);
  };

  const onOfficeSwitched = (next: Office) => {
    if (tenantMode) {
      navigate(PATHS.oficinaAdmin(next.currentHostname));
      return;
    }
    const module = currentNav?.to ?? 'dashboard';
    navigate(PATHS.oficinaAdminModule(next.currentHostname, module));
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#071A33]">
      <div className="flex min-h-screen">
        {menuOpen && (
          <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />
        )}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-slate-200 bg-[#0B1E36] text-white lg:static ${menuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">VEBOOK Admin</p>
              <p className="font-bold">{office.identity.publicName}</p>
              <p className="mt-1 text-[11px] text-slate-400">{activeSession.role}</p>
            </div>
            <button type="button" className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 px-2 pb-6">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={`${base}/${item.to}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-white text-[#0B1E36]' : 'text-slate-200 hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
            <OfficeSwitcher currentOfficeId={office.id} tenantMode={tenantMode} onSwitched={onOfficeSwitched} />
            <p className="hidden text-sm text-slate-500 md:block">{displayOfficeHost(office.currentHostname)}</p>
            <div className="relative ml-auto flex items-center gap-3">
              <button type="button" className="inline-flex items-center gap-1 text-sm text-slate-600" onClick={() => setNotesOpen((open) => !open)}>
                <Bell className="h-4 w-4" /> 3
              </button>
              {notesOpen && (
                <div className="absolute right-24 top-10 z-20 w-72 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
                  <p className="font-semibold">Notificações</p>
                  <ul className="mt-2 space-y-2 text-slate-600">
                    <li>Retornos e agenda do dia disponíveis no Dashboard</li>
                    <li>Inteligência de Mercado usa apenas dados agregados</li>
                    <li>Produto do cliente não entra como receita</li>
                  </ul>
                </div>
              )}
              <Link to={`${base}/perfil`} className="text-sm font-semibold hover:underline">
                {user?.name}
              </Link>
              <Button size="sm" variant="secondary" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </header>

          <main className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-medium text-slate-500">Administração · {currentNav?.label ?? 'Painel'}</p>
            <DemoBanner>
              Demonstração — identidade por CPF; contexto por office_users. Sem autenticação real nem banco.
            </DemoBanner>
            {welcome && (
              <section className="rounded-2xl bg-[#0B1E36] p-6 text-white">
                <h1 className="text-2xl font-bold">Bem-vindo ao VEBOOK</h1>
                <p className="mt-2 text-slate-300">Sua oficina foi criada.</p>
                <p className="mt-1 font-mono">{displayOfficeHost(office.currentHostname)}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to={publicPath} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0B1E36]">
                    Ver meu site
                  </Link>
                  <Button variant="onDark" onClick={() => setParams({})}>
                    Ir ao dashboard
                  </Button>
                </div>
              </section>
            )}
            <Outlet context={{ officeId: office.id, slug: office.currentHostname, publicPath, role: activeSession.role, userId: activeSession.userId, base }} />
          </main>
        </div>
      </div>
    </div>
  );
};
