import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../layout/Logo';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { PATHS } from '../../lib/paths';
import { displayOfficeHost } from '../../office/constants';
import { DEMO_LOGIN_HINT } from '../../office/seed';
import { attemptDemoLogin, getOfficeByHostname, listPublicOffices } from '../../office/repository';
import { formatCpf } from '../../office/validation';
import { DemoBanner } from './shared';

export const AdminLogin: React.FC<{ hostname?: string; tenantMode?: boolean }> = ({ hostname, tenantMode = false }) => {
  const params = useParams();
  const navigate = useNavigate();
  const slug = hostname || params.slug;
  const offices = listPublicOffices();
  const [selected, setSelected] = useState(slug || offices[0]?.currentHostname || '');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const office = useMemo(() => getOfficeByHostname(selected), [selected]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!office) {
      setError('Oficina não encontrada.');
      return;
    }
    const session = attemptDemoLogin(office.id, identifier, password);
    if (!session) {
      setError('Não foi possível entrar. Confira e-mail/CPF e senha.');
      return;
    }
    navigate(tenantMode ? '/admin/dashboard' : PATHS.oficinaAdmin(office.currentHostname));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Logo size="md" variant="dark" />
        <div>
          <h1 className="text-xl font-bold text-[#0B1E36]">Área administrativa</h1>
          <p className="mt-1 text-sm text-slate-600">Acesso da oficina. Autenticação simulada.</p>
        </div>
        <DemoBanner />
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">Oficina</span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5"
            >
              {offices.map((item) => (
                <option key={item.id} value={item.currentHostname}>
                  {item.identity.publicName} · {displayOfficeHost(item.currentHostname)}
                </option>
              ))}
            </select>
          </label>
          <Input
            id="login-id"
            label="E-mail ou CPF"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.includes('@') ? e.target.value : formatCpf(e.target.value))}
            required
          />
          <Input id="login-pass" type="password" label="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" fullWidth>Entrar</Button>
        </form>
        {office && (office.id === 'office_000001' || office.id === 'office_000002') && (
          <p className="text-xs text-slate-500">
            Oficinas de exemplo: {office.email} ou CPF do responsável. Senha de demonstração: {DEMO_LOGIN_HINT}
          </p>
        )}
        {office && office.id !== 'office_000001' && office.id !== 'office_000002' && (
          <p className="text-xs text-slate-500">
            Use o e-mail ou o CPF definidos no cadastro. A senha é a informada na criação desta oficina.
          </p>
        )}
        <p className="text-sm">
          <Link to={PATHS.oficinas} className="font-semibold text-[#0B1E36] hover:underline">
            Voltar para o VEBOOK
          </Link>
        </p>
      </div>
    </div>
  );
};
