import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Car,
  CheckCircle2,
  Download,
  LayoutDashboard,
  LogOut,
  Package,
  Repeat,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import {
  createAttendance,
  getActiveSession,
  getSessionOffice,
  getSessionUser,
  getSubscription,
  listAppointments,
  listAttendanceProducts,
  listAttendanceServices,
  listAttendances,
  listCustomers,
  listReturns,
  listVehicles,
  loginWithCpf,
  logoutOffice,
  onboardingProgress,
  requestPasswordReset,
  updateAppointmentStatus,
  updateOfficeProfile,
  upsertCustomer,
  upsertReturn,
  upsertVehicle,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatCpf, onlyDigits } from '../../lib/cpf';
import { formatPhone } from '../../lib/phone';
import { formatPlate } from '../../lib/utils';
import { workshopHost } from '../../lib/slug';
import { DEMO_OWNER } from '../../data/officeStore';
import { planLabel, planSummaryLines } from '../../data/officePlans';
import { Logo } from '../layout/Logo';
import { Field, inputClass } from '../ui/Field';
import { PanelSection } from '../../lib/navigation';
import { Office } from '../../types';

interface OfficePanelViewProps {
  requestedSlug?: string;
  section: PanelSection;
  onSectionChange: (section: PanelSection) => void;
  onViewPublicPage: (slug: string) => void;
  onGoHome: () => void;
}

export const OfficePanelView: React.FC<OfficePanelViewProps> = ({
  requestedSlug,
  section,
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
      ownerName={user.fullName}
      section={section}
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

const NAV: Array<{ id: PanelSection; label: string; icon: React.ReactNode }> = [
  { id: 'inicio', label: 'Início', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'minha-oficina', label: 'Minha oficina', icon: <Store className="w-4 h-4" /> },
  { id: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
  { id: 'veiculos', label: 'Veículos', icon: <Car className="w-4 h-4" /> },
  { id: 'atendimentos', label: 'Atendimentos', icon: <Wrench className="w-4 h-4" /> },
  { id: 'retornos', label: 'Retornos', icon: <Repeat className="w-4 h-4" /> },
  { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
];

const PanelShell: React.FC<{
  office: Office;
  ownerName: string;
  section: PanelSection;
  onSectionChange: (section: PanelSection) => void;
  onViewPublicPage: (slug: string) => void;
  onGoHome: () => void;
}> = ({ office, ownerName, section, onSectionChange, onViewPublicPage, onGoHome }) => {
  const pending = office.status !== 'active';
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#071A33]">
      <header className="bg-[#0B1E36] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-sky-300 font-bold uppercase tracking-wider">VEBOOK — Gestão da Oficina</p>
            <h1 className="text-lg font-extrabold">{office.name}</h1>
            <p className="text-[11px] text-slate-300 font-mono">{workshopHost(office.slug)}/painel</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onViewPublicPage(office.slug)}
              className="px-3 py-2 rounded-lg bg-white/10 text-xs font-bold cursor-pointer"
            >
              Ver página pública
            </button>
            <button
              type="button"
              onClick={() => {
                logoutOffice();
                onGoHome();
              }}
              className="px-3 py-2 rounded-lg bg-white/10 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      {pending ? (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950 text-sm px-4 py-3 text-center font-medium">
          Pagamento ainda não confirmado. A oficina permanece pendente e fora da busca pública até a ativação.
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-4">
          <nav className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer ${
                  section === item.id ? 'bg-[#0B1E36] text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
            <p className="font-bold text-[#0B1E36] flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Instalar o VEBOOK</p>
            <p className="text-slate-600">O painel pode ser instalado no computador, celular ou tablet. É o mesmo sistema, em atalho PWA.</p>
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
          <p className="text-[11px] text-slate-500 px-1">Sessão de {ownerName}. Dados isolados por office_id.</p>
        </aside>

        <main className="min-w-0">
          {section === 'inicio' && <Dashboard office={office} onSectionChange={onSectionChange} />}
          {section === 'minha-oficina' && <MinhaOficina office={office} />}
          {section === 'clientes' && <Clientes officeId={office.officeId} />}
          {section === 'veiculos' && <Veiculos officeId={office.officeId} />}
          {section === 'atendimentos' && <Atendimentos officeId={office.officeId} />}
          {section === 'retornos' && <Retornos officeId={office.officeId} />}
          {section === 'agenda' && <Agenda officeId={office.officeId} />}
        </main>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ office: Office; onSectionChange: (section: PanelSection) => void }> = ({ office, onSectionChange }) => {
  const snapshot = useOfficeStore();
  const progress = onboardingProgress(office.officeId);
  const subscription = getSubscription(office.officeId);
  const customers = listCustomers(office.officeId);
  const vehicles = listVehicles(office.officeId);
  const attendances = listAttendances(office.officeId);
  const returns = listReturns(office.officeId);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-xl font-extrabold text-[#0B1E36]">Vamos deixar sua oficina pronta para receber clientes.</h2>
        <p className="text-sm text-slate-600">O uso do painel não é bloqueado por informações incompletas. Complete no seu ritmo.</p>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-[#0B1E36]" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="text-xs font-bold text-slate-600">{progress.percent}% concluído</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {progress.items.map((item) => (
            <li key={item.id} className={`flex items-center gap-2 ${item.done ? 'text-emerald-700' : 'text-slate-600'}`}>
              <CheckCircle2 className={`w-4 h-4 ${item.done ? 'text-emerald-600' : 'text-slate-300'}`} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Clientes', value: customers.length, go: 'clientes' as PanelSection },
          { label: 'Veículos', value: vehicles.length, go: 'veiculos' as PanelSection },
          { label: 'Atendimentos', value: attendances.length, go: 'atendimentos' as PanelSection },
          { label: 'Retornos', value: returns.filter((row) => row.status === 'scheduled').length, go: 'retornos' as PanelSection },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onSectionChange(card.go)}
            className="bg-white rounded-2xl border border-slate-200 p-4 text-left cursor-pointer"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-[#0B1E36]">{card.value}</p>
          </button>
        ))}
      </div>
      {subscription ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm space-y-1">
          <p className="font-bold text-[#0B1E36]">{planLabel(subscription.modality)}</p>
          {planSummaryLines(subscription.modality).map((line) => <p key={line} className="text-slate-600 text-xs">{line}</p>)}
          <p className="text-xs text-slate-500">Status da assinatura: {subscription.status}. Valor contratado nesta adesão permanece registrado para auditoria.</p>
        </div>
      ) : null}
      <p className="hidden">{snapshot.offices.length}</p>
    </div>
  );
};

const MinhaOficina: React.FC<{ office: Office }> = ({ office }) => {
  const [form, setForm] = useState({
    name: office.name,
    description: office.description,
    phone: office.phone,
    whatsapp: office.whatsapp,
    street: office.street,
    streetNumber: office.streetNumber,
    complement: office.complement ?? '',
    neighborhood: office.neighborhood ?? '',
    city: office.city,
    state: office.state,
    zipCode: office.zipCode ?? '',
    instagram: office.socialLinks?.instagram ?? '',
    website: office.socialLinks?.website ?? '',
    weekdays: office.businessHoursDetail?.weekdays ?? '08:00 — 18:00',
    saturday: office.businessHoursDetail?.saturday ?? '08:00 — 13:00',
    sunday: office.businessHoursDetail?.sunday ?? 'Fechado',
    logoUrl: office.logoUrl ?? '',
    coverImageUrl: office.coverImageUrl ?? '',
    servicesText: (office.servicesList ?? []).map((item) => item.title).join('\n'),
  });
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const services = form.servicesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, index) => ({
        id: `svc_${office.officeId}_${index}`,
        title,
        category: 'Serviços',
        shortDescription: title,
      }));
    updateOfficeProfile(office.officeId, {
      name: form.name,
      description: form.description,
      phone: form.phone,
      whatsapp: form.whatsapp,
      street: form.street,
      streetNumber: form.streetNumber,
      complement: form.complement,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      logoUrl: form.logoUrl || undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      socialLinks: { ...office.socialLinks, instagram: form.instagram || undefined, website: form.website || undefined },
      businessHoursDetail: { weekdays: form.weekdays, saturday: form.saturday, sunday: form.sunday },
      businessHours: `Seg — Sex: ${form.weekdays} | Sábado: ${form.saturday} | Domingo: ${form.sunday}`,
      servicesList: services,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={save} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E36]">Minha oficina</h2>
      <p className="text-sm text-slate-600">Tudo o que você alterar aqui passa a aparecer na página pública.</p>
      <Field label="Nome público"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Descrição"><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Telefone"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
      </div>
      <Field label="URL da logo" optional><input className={inputClass} value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} /></Field>
      <Field label="URL da capa" optional><input className={inputClass} value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Endereço"><input className={inputClass} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></Field>
        <Field label="Número"><input className={inputClass} value={form.streetNumber} onChange={(e) => setForm({ ...form, streetNumber: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Bairro"><input className={inputClass} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></Field>
        <Field label="Cidade"><input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="UF"><input className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Segunda a sexta"><input className={inputClass} value={form.weekdays} onChange={(e) => setForm({ ...form, weekdays: e.target.value })} /></Field>
        <Field label="Sábado"><input className={inputClass} value={form.saturday} onChange={(e) => setForm({ ...form, saturday: e.target.value })} /></Field>
        <Field label="Domingo"><input className={inputClass} value={form.sunday} onChange={(e) => setForm({ ...form, sunday: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Instagram" optional><input className={inputClass} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></Field>
        <Field label="Site" optional><input className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
      </div>
      <Field label="Serviços (um por linha)" hint="Esses itens alimentam a página pública.">
        <textarea className={inputClass} rows={5} value={form.servicesText} onChange={(e) => setForm({ ...form, servicesText: e.target.value })} />
      </Field>
      <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#0B1E36] text-white text-sm font-extrabold cursor-pointer">
        Salvar alterações
      </button>
      {saved ? <p className="text-sm text-emerald-700 font-bold">Página pública atualizada.</p> : null}
    </form>
  );
};

const Clientes: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listCustomers(officeId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E36]">Clientes</h2>
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          upsertCustomer(officeId, { name, phone });
          setName('');
          setPhone('');
        }}
      >
        <input className={inputClass} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputClass} placeholder="Telefone" value={formatPhone(phone)} onChange={(e) => setPhone(onlyDigits(e.target.value))} />
        <button className="rounded-xl bg-[#0B1E36] text-white font-bold text-sm cursor-pointer">Cadastrar cliente</button>
      </form>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum cliente ainda.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">
            <strong>{row.name}</strong>
            <span className="text-slate-500"> · {row.phone ? formatPhone(row.phone) : 'sem telefone'}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Veiculos: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listVehicles(officeId);
  const customers = listCustomers(officeId);
  const [plate, setPlate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [model, setModel] = useState('');
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E36]">Veículos</h2>
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!plate.trim()) return;
          upsertVehicle(officeId, { plate: formatPlate(plate), customerId: customerId || undefined, model });
          setPlate('');
          setModel('');
        }}
      >
        <input className={`${inputClass} uppercase`} placeholder="Placa" value={plate} onChange={(e) => setPlate(e.target.value)} />
        <input className={inputClass} placeholder="Modelo" value={model} onChange={(e) => setModel(e.target.value)} />
        <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Cliente (opcional)</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
        </select>
        <button className="rounded-xl bg-[#0B1E36] text-white font-bold text-sm cursor-pointer">Cadastrar veículo</button>
      </form>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum veículo ainda.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm">
            <strong className="font-mono">{row.plate}</strong>
            <span className="text-slate-500"> · {row.model || 'modelo a completar'}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Atendimentos: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listAttendances(officeId);
  const vehicles = listVehicles(officeId);
  const customers = listCustomers(officeId);
  const [vehicleId, setVehicleId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [service, setService] = useState('');
  const [product, setProduct] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E36]">Atendimentos</h2>
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          createAttendance(officeId, {
            vehicleId: vehicleId || undefined,
            customerId: customerId || undefined,
            date: new Date().toISOString().slice(0, 10),
            notes,
            status: 'completed',
            services: service ? [service] : [],
            products: product ? [{ name: product }] : [],
          });
          setService('');
          setProduct('');
          setNotes('');
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Cliente</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <select className={inputClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Veículo</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate}</option>)}
          </select>
        </div>
        <input className={inputClass} placeholder="Serviço realizado" value={service} onChange={(e) => setService(e.target.value)} />
        <input className={inputClass} placeholder="Produto utilizado" value={product} onChange={(e) => setProduct(e.target.value)} />
        <textarea className={inputClass} rows={2} placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="px-4 py-2 rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer">Registrar atendimento</button>
      </form>
      <div className="space-y-3">
        {rows.length === 0 ? <p className="text-sm text-slate-500">Nenhum atendimento ainda.</p> : null}
        {rows.map((row) => (
          <article key={row.id} className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-1">
            <p className="font-bold text-[#0B1E36]">{row.date} · {row.status === 'completed' ? 'Concluído' : 'Aberto'}</p>
            {listAttendanceServices(officeId, row.id).map((line) => <p key={line.id}>Serviço: {line.title}</p>)}
            {listAttendanceProducts(officeId, row.id).map((line) => (
              <p key={line.id} className="flex items-center gap-1 text-slate-600"><Package className="w-3.5 h-3.5" /> {line.brand ? `${line.brand} · ` : ''}{line.name}</p>
            ))}
            {row.notes ? <p className="text-slate-500">{row.notes}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
};

const Retornos: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listReturns(officeId);
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E36]">Retornos</h2>
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason || !dueDate) return;
          upsertReturn(officeId, { reason, dueDate, status: 'scheduled' });
          setReason('');
          setDueDate('');
        }}
      >
        <input className={inputClass} placeholder="Motivo do retorno" value={reason} onChange={(e) => setReason(e.target.value)} />
        <input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button className="rounded-xl bg-[#0B1E36] text-white font-bold text-sm cursor-pointer">Agendar retorno</button>
      </form>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum retorno agendado.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm flex items-center justify-between gap-3">
            <span><strong>{row.dueDate}</strong> · {row.reason}</span>
            <button
              type="button"
              onClick={() => upsertReturn(officeId, { ...row, status: 'done' })}
              className="text-xs font-bold text-sky-800 cursor-pointer"
            >
              {row.status === 'done' ? 'Concluído' : 'Marcar como feito'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const Agenda: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listAppointments(officeId);
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E36]">Agenda / solicitações</h2>
      <p className="text-sm text-slate-600">Pedidos recebidos pela página pública da oficina.</p>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhuma solicitação no momento.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm space-y-1">
            <p><strong>{row.customerName}</strong> · {row.phone}</p>
            <p className="text-slate-600">{row.service || 'Serviço a combinar'} {row.date ? `· ${row.date}` : ''}</p>
            <div className="flex gap-2">
              <button type="button" className="text-xs font-bold text-emerald-700 cursor-pointer" onClick={() => updateAppointmentStatus(officeId, row.id, 'confirmed')}>Confirmar</button>
              <button type="button" className="text-xs font-bold text-rose-700 cursor-pointer" onClick={() => updateAppointmentStatus(officeId, row.id, 'cancelled')}>Cancelar</button>
              <span className="text-[11px] text-slate-500">{row.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
