import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../layout/Logo';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { PATHS } from '../../lib/paths';
import { displayOfficeHost } from '../../office/constants';
import { DEMO_LOGIN_HINT, DEMO_USERS } from '../../office/seed';
import {
  attemptDemoLogin,
  getOfficeByHostname,
  listOfficesForUser,
  switchOfficeContext,
} from '../../office/repository';
import { formatCpf } from '../../office/validation';
import { Office } from '../../office/types';
import { DemoBanner } from './shared';

export const AdminLogin: React.FC<{ hostname?: string; tenantMode?: boolean }> = ({ hostname, tenantMode = false }) => {
  const params = useParams();
  const navigate = useNavigate();
  const slug = hostname || params.slug;
  const preferredOffice = slug ? getOfficeByHostname(slug) : undefined;

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingOffices, setPendingOffices] = useState<Office[] | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const goAdmin = (office: Office) => {
    navigate(tenantMode ? '/admin/dashboard' : PATHS.oficinaAdmin(office.currentHostname));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingOffices(null);

    const result = attemptDemoLogin(cpf, password, preferredOffice?.id);
    if (!result.ok) {
      setError(result.reason);
      return;
    }

    if (preferredOffice) {
      const allowed = result.offices.some((item) => item.id === preferredOffice.id);
      if (!allowed) {
        setError('Este CPF não possui permissão para administrar esta oficina.');
        return;
      }
      goAdmin(preferredOffice);
      return;
    }

    if (result.offices.length === 1) {
      goAdmin(result.offices[0]);
      return;
    }

    if (result.session && result.offices.length > 1 && !result.needsOfficeSelection) {
      const current = result.offices.find((item) => item.id === result.session.officeId) ?? result.offices[0];
      goAdmin(current);
      return;
    }

    setPendingUserId(result.session.userId);
    setPendingOffices(result.offices);
  };

  const selectOffice = (officeId: string) => {
    const session = switchOfficeContext(officeId);
    const office = pendingOffices?.find((item) => item.id === officeId);
    if (!session || !office) {
      setError('Não foi possível abrir esta oficina.');
      return;
    }
    goAdmin(office);
  };

  const hintOffices = useMemo(() => listOfficesForUser(DEMO_USERS.carlos.id).map((item) => item.office.identity.publicName), []);

  if (pendingOffices && pendingOffices.length > 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <Logo size="md" variant="dark" />
          <div>
            <h1 className="text-xl font-bold text-[#0B1E36]">Escolha a oficina</h1>
            <p className="mt-1 text-sm text-slate-600">Este CPF administra mais de uma oficina. Selecione o contexto.</p>
          </div>
          <DemoBanner />
          <ul className="space-y-2">
            {pendingOffices.map((office) => (
              <li key={office.id}>
                <button
                  type="button"
                  onClick={() => selectOffice(office.id)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-[#0B1E36]"
                >
                  <span className="block font-semibold text-[#0B1E36]">{office.identity.publicName}</span>
                  <span className="font-mono text-xs text-slate-500">{displayOfficeHost(office.currentHostname)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">Sessão: {pendingUserId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Logo size="md" variant="dark" />
        <div>
          <h1 className="text-xl font-bold text-[#0B1E36]">Área administrativa</h1>
          <p className="mt-1 text-sm text-slate-600">Login com CPF e senha da identidade VEBOOK.</p>
        </div>
        <DemoBanner />
        {preferredOffice && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Contexto solicitado: <strong>{preferredOffice.identity.publicName}</strong>
            <span className="mt-1 block font-mono text-xs">{displayOfficeHost(preferredOffice.currentHostname)}</span>
          </p>
        )}
        <form onSubmit={submit} className="space-y-4">
          <Input
            id="login-cpf"
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            required
          />
          <Input id="login-pass" type="password" label="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" fullWidth>Entrar</Button>
        </form>
        <div className="space-y-1 text-xs text-slate-500">
          <p>Demonstração — senha: {DEMO_LOGIN_HINT}</p>
          <p>Carlos (várias oficinas: {hintOffices.join(', ')}): {DEMO_USERS.carlos.cpf}</p>
          <p>Maria (somente Norte): {DEMO_USERS.maria.cpf}</p>
          <p>O e-mail não é credencial de login; serve para recuperação e comunicação.</p>
        </div>
        <p className="text-sm">
          <Link to={PATHS.oficinas} className="font-semibold text-[#0B1E36] hover:underline">
            Voltar para o VEBOOK
          </Link>
        </p>
      </div>
    </div>
  );
};
