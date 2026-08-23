import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PATHS } from '../../lib/paths';
import { displayOfficeHost, WEEKDAY_KEYS, WEEKDAY_LABELS } from '../../office/constants';
import { changeOfficeHostname, getOfficeById, hostnameAvailability, officeAudit, officeHostnames, officeUsers, updateOffice, updateUser } from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { formatDateTime } from '../../office/period';
import { Office } from '../../office/types';
import { normalizeHostname } from '../../office/validation';
import { DemoBanner } from './shared';

type Ctx = { officeId: string; slug: string; publicPath?: string };

export const SiteModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId, slug, publicPath } = useOutletContext<Ctx>();
  const office = getOfficeById(officeId)!;
  const [form, setForm] = useState(office);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateOffice(officeId, {
      identity: form.identity,
      phone: form.phone,
      address: form.address,
      hours: form.hours,
      social: form.social,
      acceptsOnlineBooking: form.acceptsOnlineBooking,
    });
    setSaved(true);
  };

  const setIdentity = (patch: Partial<Office['identity']>) => setForm({ ...form, identity: { ...form.identity, ...patch } });
  const setAddress = (patch: Partial<Office['address']>) => setForm({ ...form, address: { ...form.address, ...patch } });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0B1E36]">Meu site</h1>
        <div className="flex gap-2">
          <Button onClick={save}>Salvar alterações</Button>
          <Link to={publicPath || PATHS.oficina(slug)} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
            Visualizar meu site
          </Link>
        </div>
      </div>
      <p className="text-sm text-slate-600">A estrutura do template VEBOOK não é alterada. Só conteúdo, contato, horário e imagens.</p>
      {saved && <p className="text-sm text-emerald-700">Alterações salvas na demonstração local.</p>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-bold">Informações públicas</h2>
        <Input id="pub-name" label="Nome" value={form.identity.publicName} onChange={(e) => setIdentity({ publicName: e.target.value })} />
        <Input id="pub-slogan" label="Slogan" value={form.identity.slogan ?? ''} onChange={(e) => setIdentity({ slogan: e.target.value })} />
        <label className="space-y-1.5">
          <span className="block text-sm font-semibold text-slate-800">Descrição</span>
          <textarea rows={4} value={form.identity.description ?? ''} onChange={(e) => setIdentity({ description: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5" />
        </label>
        <Input id="pub-phone" label="Telefone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input id="pub-street" label="Logradouro" value={form.address.street} onChange={(e) => setAddress({ street: e.target.value })} />
          <Input id="pub-num" label="Número" value={form.address.number} onChange={(e) => setAddress({ number: e.target.value })} />
          <Input id="pub-nb" label="Bairro" value={form.address.neighborhood} onChange={(e) => setAddress({ neighborhood: e.target.value })} />
          <Input id="pub-city" label="Cidade" value={form.address.city} onChange={(e) => setAddress({ city: e.target.value })} />
        </div>
        <Input id="pub-ig" label="Instagram" value={form.social?.instagram ?? ''} onChange={(e) => setForm({ ...form, social: { ...form.social, instagram: e.target.value } })} />
        <Input id="pub-fb" label="Facebook" value={form.social?.facebook ?? ''} onChange={(e) => setForm({ ...form, social: { ...form.social, facebook: e.target.value } })} />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.acceptsOnlineBooking} onChange={(e) => setForm({ ...form, acceptsOnlineBooking: e.target.checked })} />
          Aceita agendamento online
        </label>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-bold">Horário de atendimento</h2>
        <ul className="space-y-2">
          {WEEKDAY_KEYS.map((key) => {
            const day = form.hours[key];
            return (
              <li key={key} className="grid items-center gap-2 sm:grid-cols-[8rem_1fr_1fr]">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => setForm({ ...form, hours: { ...form.hours, [key]: { ...day, enabled: e.target.checked } } })}
                  />
                  {WEEKDAY_LABELS[key]}
                </label>
                <input type="time" disabled={!day.enabled} value={day.open} onChange={(e) => setForm({ ...form, hours: { ...form.hours, [key]: { ...day, open: e.target.value } } })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input type="time" disabled={!day.enabled} value={day.close} onChange={(e) => setForm({ ...form, hours: { ...form.hours, [key]: { ...day, close: e.target.value } } })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </li>
            );
          })}
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-bold">Aparência</h2>
        <p className="text-sm text-slate-500">Logo e foto principal. O layout institucional permanece o do VEBOOK.</p>
        <SiteImageField label="Logo" value={form.identity.logoDataUrl} onChange={(logoDataUrl) => setIdentity({ logoDataUrl })} />
        <SiteImageField label="Foto principal" value={form.identity.coverDataUrl} onChange={(coverDataUrl) => setIdentity({ coverDataUrl })} />
        <p className="font-mono text-sm">{displayOfficeHost(slug)}</p>
      </section>
    </div>
  );
};

const SiteImageField: React.FC<{ label: string; value?: string; onChange: (value?: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-1.5">
    <p className="text-sm font-semibold text-slate-800">{label}</p>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 220_000) return;
        const reader = new FileReader();
        reader.onload = () => onChange(String(reader.result));
        reader.readAsDataURL(file);
      }}
    />
    {value && <img src={value} alt="" className="h-16 rounded-lg border border-slate-200 object-cover" />}
  </div>
);

export const ProfileModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const users = officeUsers(officeId);
  const owner = users[0];
  const [name, setName] = useState(owner?.name ?? '');
  const [email, setEmail] = useState(owner?.email ?? '');
  const [phone, setPhone] = useState(owner?.phone ?? '');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#0B1E36]">Perfil</h1>
      <DemoBanner>Perfil do usuário administrativo. A senha não é armazenada de forma segura nesta etapa.</DemoBanner>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <Input id="p-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="p-cpf" label="CPF" value={owner?.cpf ?? ''} disabled />
        <Input id="p-email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input id="p-phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input id="p-pass" label="Senha" type="password" placeholder="Alteração de senha disponível no backend" disabled />
        <Button onClick={() => owner && updateUser(owner.id, { name, email, phone })}>Salvar perfil</Button>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Usuários da oficina</h2>
        <p className="mt-1 text-sm text-slate-600">Interface preparada para múltiplos usuários. Papéis conceituais: OWNER, ADMIN, MANAGER, EMPLOYEE.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {users.map((item) => (
            <li key={item.id} className="flex justify-between rounded-lg bg-slate-50 p-3">
              <span>{item.name} · {item.email}</span>
              <span className="font-semibold">{item.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export const SettingsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const navigate = useNavigate();
  const office = getOfficeById(officeId)!;
  const events = officeAudit(officeId).slice(0, 12);
  const hosts = officeHostnames(officeId);
  const [nextHost, setNextHost] = useState('');
  const [hostMsg, setHostMsg] = useState('');

  const requestHostnameChange = () => {
    const check = hostnameAvailability(nextHost);
    if (!check.available) {
      setHostMsg(check.reason || 'Endereço indisponível.');
      return;
    }
    const updated = changeOfficeHostname(officeId, nextHost);
    setHostMsg(`Endereço atualizado. O anterior permanece reservado e redireciona.`);
    navigate(PATHS.oficinaAdminModule(updated.currentHostname, 'configuracoes'));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#0B1E36]">Configurações</h1>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-sm">
        <h2 className="font-bold">Dados da oficina</h2>
        <p>Razão social: {office.legalName}</p>
        <p>CNPJ: {office.cnpj}</p>
        <p>Identificador estável: <span className="font-mono">{office.id}</span></p>
        <p>Agendamento online: {office.acceptsOnlineBooking ? 'sim' : 'não'}</p>
        <p>Antecedência mínima: {office.minAdvanceHours}h</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-sm">
        <h2 className="font-bold">Endereço digital</h2>
        <p>O subdomínio não é o identificador principal. Histórico de hostnames permanece reservado.</p>
        <ul className="space-y-1">
          {hosts.map((item) => (
            <li key={`${item.hostname}-${item.createdAt}`} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3">
              <span className="font-mono">{displayOfficeHost(item.hostname)}</span>
              <span>{item.isCurrent ? 'atual' : item.status}{item.redirectTo ? ` → ${item.redirectTo}` : ''}</span>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input id="new-host" label="Novo subdomínio (demonstração)" value={nextHost} onChange={(e) => setNextHost(normalizeHostname(e.target.value))} />
          <Button variant="secondary" onClick={requestHostnameChange}>Reservar e redirecionar</Button>
        </div>
        {hostMsg && <p className="text-sm text-slate-700">{hostMsg}</p>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-sm">
        <h2 className="font-bold">Notificações e preferências</h2>
        <label className="flex gap-2"><input type="checkbox" defaultChecked /> Avisar retornos próximos</label>
        <label className="flex gap-2"><input type="checkbox" defaultChecked /> Avisar agendamentos do dia</label>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-sm">
        <h2 className="font-bold">Segurança e gerenciamento de acesso</h2>
        <DemoBanner>
          Sem autenticação, sessão, MFA, RBAC, RLS, recuperação de senha, logs reais ou auditoria persistente.
          A estrutura de papéis e eventos abaixo é conceitual, para conexão posterior.
        </DemoBanner>
        <p>Papéis previstos: OWNER, ADMIN, MANAGER, EMPLOYEE.</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Eventos administrativos (mock)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {events.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border-b border-slate-100 py-2">
              <span>{item.action} · {item.entity}</span>
              <span className="text-slate-500">{formatDateTime(item.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
