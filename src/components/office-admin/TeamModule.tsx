import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import {
  inviteOfficeMember,
  officeUsers,
  removeMembership,
  updateMembership,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { formatDateTime } from '../../office/period';
import { OfficeRole } from '../../office/types';
import { formatCpf } from '../../office/validation';

type Ctx = { officeId: string; role?: OfficeRole };

const ROLE_LABELS: Record<OfficeRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Colaborador',
};

export const TeamModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId, role } = useOutletContext<Ctx>();
  const [error, setError] = useState('');
  const [invite, setInvite] = useState({ name: '', cpf: '', email: '', phone: '', role: 'EMPLOYEE' as OfficeRole, password: '' });
  const members = officeUsers(officeId);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const addMember = () => {
    setError('');
    try {
      inviteOfficeMember(officeId, {
        name: invite.name,
        cpf: invite.cpf,
        email: invite.email,
        phone: invite.phone || undefined,
        role: invite.role,
        password: invite.password || undefined,
      });
      setInvite({ name: '', cpf: '', email: '', phone: '', role: 'EMPLOYEE', password: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível convidar.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1E36]">Equipe e Permissões</h1>
        <p className="text-sm text-slate-600">Gerencie os vínculos desta oficina (`office_users`). Cada pessoa possui um CPF único no VEBOOK.</p>
      </div>

      <Alert tone="info">
        Alterações de equipe são registradas em auditoria. A senha é opcional na demonstração — padrão &quot;demonstracao&quot; para novos usuários.
      </Alert>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0B1E36]">Membros ativos</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {members.map((item) => (
            <li key={item.membershipId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-slate-500">{formatCpf(item.cpf)} · {item.email}</p>
                <p className="text-xs text-slate-400">
                  Criado em {formatDateTime(item.createdAt)}
                  {item.lastAccessAt && ` · Último acesso ${formatDateTime(item.lastAccessAt)}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  disabled={!canManage || item.role === 'OWNER'}
                  value={item.role}
                  onChange={(e) => updateMembership(item.membershipId, { role: e.target.value as OfficeRole })}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className={`text-xs font-semibold ${item.active ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {item.active ? 'Ativo' : 'Inativo'}
                </span>
                {canManage && item.role !== 'OWNER' && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => updateMembership(item.membershipId, { active: !item.active })}>
                      {item.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    {role === 'OWNER' && (
                      <Button size="sm" variant="secondary" onClick={() => removeMembership(item.membershipId)}>
                        Remover
                      </Button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {canManage && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="font-bold text-[#0B1E36]">Convidar membro</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input id="inv-name" label="Nome" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            <Input id="inv-cpf" label="CPF" value={invite.cpf} onChange={(e) => setInvite({ ...invite, cpf: formatCpf(e.target.value) })} />
            <Input id="inv-email" label="E-mail" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <Input id="inv-phone" label="Telefone" value={invite.phone} onChange={(e) => setInvite({ ...invite, phone: e.target.value })} />
            <Select id="inv-role" label="Função" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as OfficeRole })}>
              <option value="ADMIN">Administrador</option>
              <option value="MANAGER">Gerente</option>
              <option value="EMPLOYEE">Colaborador</option>
            </Select>
            <Input id="inv-pass" label="Senha (opcional)" type="password" value={invite.password} onChange={(e) => setInvite({ ...invite, password: e.target.value })} />
          </div>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <Button onClick={addMember}>Convidar</Button>
        </section>
      )}
    </div>
  );
};
