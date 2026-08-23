import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { PATHS } from '../../lib/paths';
import { displayOfficeHost, WEEKDAY_KEYS, WEEKDAY_LABELS } from '../../office/constants';
import {
  changeOfficeHostname,
  getOfficeById,
  getUserById,
  hostnameAvailability,
  inviteOfficeMember,
  officeAudit,
  officeHostnames,
  officeUsers,
  removeMembership,
  updateMembership,
  updateOffice,
  updateVebookUser,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { formatDateTime } from '../../office/period';
import { Office, OfficeRole } from '../../office/types';
import { formatCpf, normalizeHostname } from '../../office/validation';
import { DemoBanner } from './shared';

type Ctx = { officeId: string; slug: string; publicPath?: string; role?: OfficeRole; userId?: string };

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
  const { userId } = useOutletContext<Ctx>();
  const user = userId ? getUserById(userId) : undefined;
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#0B1E36]">Perfil</h1>
      <DemoBanner>Identidade pessoal VEBOOK. O CPF é o login; a senha não é armazenada de forma segura nesta etapa.</DemoBanner>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <Input id="p-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="p-cpf" label="CPF (login)" value={user?.cpf ?? ''} disabled />
        <Input id="p-email" label="E-mail (recuperação e comunicação)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input id="p-phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input id="p-pass" label="Senha" type="password" placeholder="Alteração de senha disponível no backend" disabled />
        <Button onClick={() => user && updateVebookUser(user.id, { name, email, phone })}>Salvar perfil</Button>
      </section>
    </div>
  );
};

export const SettingsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId, role } = useOutletContext<Ctx>();
  const navigate = useNavigate();
  const office = getOfficeById(officeId)!;
  const events = officeAudit(officeId).slice(0, 12);
  const hosts = officeHostnames(officeId);
  const members = officeUsers(officeId);
  const [nextHost, setNextHost] = useState('');
  const [hostMsg, setHostMsg] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [invite, setInvite] = useState({ name: '', cpf: '', email: '', role: 'EMPLOYEE' as OfficeRole });

  const canManage = role === 'OWNER' || role === 'ADMIN';

  const requestHostnameChange = () => {
    const check = hostnameAvailability(nextHost);
    if (!check.available) {
      setHostMsg(check.reason || 'Endereço indisponível.');
      return;
    }
    const updated = changeOfficeHostname(officeId, nextHost);
    setHostMsg('Endereço atualizado. O anterior permanece reservado e redireciona.');
    navigate(PATHS.oficinaAdminModule(updated.currentHostname, 'configuracoes'));
  };

  const addMember = () => {
    setInviteError('');
    try {
      inviteOfficeMember(officeId, {
        name: invite.name,
        cpf: invite.cpf,
        email: invite.email,
        role: invite.role,
      });
      setInvite({ name: '', cpf: '', email: '', role: 'EMPLOYEE' });
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Não foi possível cadastrar.');
    }
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-bold">Usuários e permissões</h2>
        <p className="text-sm text-slate-600">
          Cada pessoa tem um CPF único no VEBOOK. O gerenciamento principal da equipe está em <strong>Equipe e Permissões</strong>; aqui permanece como atalho secundário para vínculos (`office_users`).
        </p>
        <ul className="space-y-2 text-sm">
          {members.map((item) => (
            <li key={item.membershipId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-slate-500">{item.cpf} · {item.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  disabled={!canManage || item.role === 'OWNER'}
                  value={item.role}
                  onChange={(e) => updateMembership(item.membershipId, { role: e.target.value as OfficeRole })}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
                <span className={`text-xs font-semibold ${item.active ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {item.active ? 'ativo' : 'inativo'}
                </span>
                {canManage && item.role !== 'OWNER' && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => updateMembership(item.membershipId, { active: !item.active })}>
                      {item.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    {role === 'OWNER' && (
                      <Button size="sm" variant="secondary" onClick={() => removeMembership(item.membershipId)}>
                        Remover acesso
                      </Button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        {canManage && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <h3 className="font-semibold">Cadastrar usuário nesta oficina</h3>
            <p className="text-xs text-slate-500">Não cria nova oficina. Cria/reutiliza a pessoa e vincula o papel.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input id="inv-name" label="Nome" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
              <Input id="inv-cpf" label="CPF" value={invite.cpf} onChange={(e) => setInvite({ ...invite, cpf: formatCpf(e.target.value) })} />
              <Input id="inv-email" label="E-mail" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
              <Select id="inv-role" label="Função" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as OfficeRole })}>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
              </Select>
            </div>
            {inviteError && <p className="text-sm text-rose-700">{inviteError}</p>}
            <Button onClick={addMember}>Adicionar à oficina</Button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-sm">
        <h2 className="font-bold">Endereço digital</h2>
        <p>O subdomínio identifica a oficina. O CPF identifica a pessoa.</p>
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
        <h2 className="font-bold">Segurança</h2>
        <DemoBanner>
          Sem autenticação real, MFA, RLS ou recuperação de senha. A validação de office_users no repositório mock prepara o futuro Supabase Auth + RLS.
        </DemoBanner>
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
