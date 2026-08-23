import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from '../layout/Logo';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import { PATHS } from '../../lib/paths';
import {
  BRAZILIAN_STATES,
  ONBOARDING_STEPS,
  OnboardingStepId,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  displayOfficeHost,
} from '../../office/constants';
import { emptyOnboardingDraft } from '../../office/draft';
import {
  clearOnboardingDraft,
  getDemoSession,
  getLastPublishedHostname,
  getUserById,
  hostnameAvailability,
  loadOnboardingDraft,
  publishOfficeFromDraft,
  saveOnboardingDraft,
  setDemoSession,
  setLastPublishedHostname,
} from '../../office/repository';
import { OnboardingDraft } from '../../office/types';
import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhone,
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  normalizeHostname,
  passwordError,
} from '../../office/validation';

const STEP_IDS = ONBOARDING_STEPS.map((item) => item.id);

function isStepId(value: string | undefined): value is OnboardingStepId {
  return !!value && STEP_IDS.includes(value as OnboardingStepId);
}

export const OfficeOnboarding: React.FC = () => {
  const { step } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingSession = getDemoSession();
  const existingUser = existingSession ? getUserById(existingSession.userId) : undefined;
  const attachingToExisting = Boolean(existingUser && (searchParams.get('nova') === '1' || existingSession));

  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const loaded = loadOnboardingDraft();
    if (loaded) {
      return {
        ...loaded,
        account: loaded.account ?? loaded.access ?? emptyOnboardingDraft().account,
        skipAccount: loaded.skipAccount || Boolean(existingUser),
      };
    }
    return emptyOnboardingDraft({ skipAccount: Boolean(existingUser) });
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hostStatus, setHostStatus] = useState<{ available: boolean; message: string } | null>(null);

  const visibleSteps = useMemo(
    () => ONBOARDING_STEPS.filter((item) => !(draft.skipAccount && item.id === 'acesso')),
    [draft.skipAccount]
  );
  const current = isStepId(step) ? step : 'identificacao';
  const index = visibleSteps.findIndex((item) => item.id === current);

  useEffect(() => {
    if (existingUser) {
      setDraft((prev) => ({
        ...prev,
        skipAccount: true,
        account: {
          ...prev.account,
          name: existingUser.name,
          cpf: existingUser.cpf,
          email: existingUser.email,
          phone: existingUser.phone ?? '',
        },
      }));
    }
  }, [existingUser?.id]);

  useEffect(() => {
    saveOnboardingDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (current === 'acesso' && draft.skipAccount) {
      navigate(PATHS.cadastroStep('revisao'), { replace: true });
    }
  }, [current, draft.skipAccount, navigate]);

  useEffect(() => {
    if (current === 'subdominio' && draft.hostname) {
      const result = hostnameAvailability(draft.hostname);
      setHostStatus({
        available: result.available,
        message: result.available ? 'Disponível' : result.reason || 'Indisponível',
      });
    }
  }, [current, draft.hostname]);

  const patch = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (id: OnboardingStepId): boolean => {
    const next: Record<string, string> = {};
    if (id === 'identificacao') {
      const i = draft.identification;
      if (!i.legalName.trim()) next.legalName = 'Informe o nome da oficina.';
      if (!isValidCnpj(i.cnpj)) next.cnpj = 'CNPJ inválido.';
      if (!i.responsibleName.trim()) next.responsibleName = 'Informe o responsável.';
      if (!isValidCpf(i.responsibleCpf)) next.responsibleCpf = 'CPF inválido.';
      if (!isValidEmail(i.email)) next.email = 'E-mail inválido.';
      if (!isValidPhone(i.phone)) next.phone = 'Telefone inválido.';
    }
    if (id === 'endereco') {
      const a = draft.address;
      if (!isValidCep(a.zipCode)) next.zipCode = 'CEP inválido.';
      if (!a.state) next.state = 'Informe o estado.';
      if (!a.city.trim()) next.city = 'Informe a cidade.';
      if (!a.neighborhood.trim()) next.neighborhood = 'Informe o bairro.';
      if (!a.street.trim()) next.street = 'Informe o logradouro.';
      if (!a.number.trim()) next.number = 'Informe o número.';
    }
    if (id === 'identidade' && !draft.identity.publicName.trim()) {
      next.publicName = 'Informe o nome público.';
    }
    if (id === 'servicos' && !draft.services.some((item) => item.active && item.name.trim())) {
      next.services = 'Ative ao menos um serviço.';
    }
    if (id === 'atendimento' && !WEEKDAY_KEYS.some((key) => draft.hours[key].enabled)) {
      next.hours = 'Informe ao menos um dia de atendimento.';
    }
    if (id === 'subdominio') {
      const result = hostnameAvailability(draft.hostname);
      if (!result.available) next.hostname = result.reason || 'Endereço indisponível.';
    }
    if (id === 'acesso' && !draft.skipAccount) {
      if (!draft.account.name.trim()) next.accountName = 'Informe o nome completo.';
      if (!isValidCpf(draft.account.cpf)) next.accountCpf = 'CPF inválido.';
      if (!isValidEmail(draft.account.email)) next.accountEmail = 'E-mail inválido.';
      if (!isValidPhone(draft.account.phone)) next.accountPhone = 'Telefone inválido.';
      const pwd = passwordError(draft.account.password, draft.account.confirmPassword);
      if (pwd) next.password = pwd;
    }
    if (id === 'revisao') {
      if (!draft.termsAccepted) next.terms = 'É necessário aceitar os termos.';
      if (!draft.skipAccount) {
        const pwd = passwordError(draft.account.password, draft.account.confirmPassword);
        if (pwd) next.password = pwd;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const go = (id: OnboardingStepId) => navigate(PATHS.cadastroStep(id));

  const nextStep = () => {
    if (current === 'concluido') return;
    if (!validate(current)) return;
    if (current === 'identificacao' && !draft.identity.publicName) {
      patch('identity', { ...draft.identity, publicName: draft.identification.tradeName || draft.identification.legalName });
    }
    if (current === 'identificacao' && !draft.skipAccount && !draft.account.email) {
      patch('account', {
        ...draft.account,
        name: draft.identification.responsibleName,
        email: draft.identification.email,
        cpf: draft.identification.responsibleCpf,
        phone: draft.identification.phone,
      });
    }
    if (current === 'identidade' && !draft.hostname) {
      patch('hostname', normalizeHostname(draft.identity.publicName));
    }
    const next = visibleSteps[index + 1];
    if (next) go(next.id);
  };

  const prevStep = () => {
    const prev = visibleSteps[index - 1];
    if (prev && prev.id !== 'concluido') go(prev.id);
  };

  const publish = () => {
    if (!validate('revisao')) return;
    try {
      const { office, user, membership } = publishOfficeFromDraft(draft, {
        existingUserId: draft.skipAccount ? existingSession?.userId : undefined,
      });
      setDemoSession({
        officeId: office.id,
        userId: user.id,
        role: membership.role,
        startedAt: new Date().toISOString(),
        demo: true,
      });
      clearOnboardingDraft();
      setLastPublishedHostname(office.currentHostname);
      navigate(PATHS.cadastroStep('concluido'));
    } catch (err) {
      setErrors({ publish: err instanceof Error ? err.message : 'Não foi possível criar a oficina.' });
    }
  };

  if (!isStepId(step)) {
    return <Navigate to={PATHS.cadastroStep('identificacao')} replace />;
  }

  if (current === 'concluido' && !getLastPublishedHostname()) {
    return <Navigate to={PATHS.cadastroStep('revisao')} replace />;
  }

  if (current === 'acesso' && draft.skipAccount) {
    return <Navigate to={PATHS.cadastroStep('revisao')} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to={PATHS.home} aria-label="VEBOOK">
            <Logo size="md" variant="dark" />
          </Link>
          <p className="text-sm font-medium text-slate-500">
            {attachingToExisting ? 'Nova oficina na sua conta VEBOOK' : 'Cadastro de oficina'}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <ol className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-9">
          {visibleSteps.map((item, stepIndex) => {
            const done = stepIndex < index;
            const active = item.id === current;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={stepIndex > index}
                  onClick={() => stepIndex <= index && go(item.id)}
                  className={`w-full rounded-lg border px-2 py-2 text-left ${
                    active
                      ? 'border-[#0B1E36] bg-[#0B1E36] text-white'
                      : done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  <span className="block text-[11px] font-semibold">
                    {done ? <Check className="inline h-3 w-3" /> : stepIndex + 1}
                  </span>
                  <span className="hidden text-[11px] font-medium sm:block">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          {current === 'identificacao' && (
            <StepFrame title="Identificação" description="Dados da oficina e do responsável. A validação é apenas de formato.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="legalName" label="Nome da oficina" value={draft.identification.legalName} error={errors.legalName} required onChange={(e) => patch('identification', { ...draft.identification, legalName: e.target.value })} />
                <Input id="tradeName" label="Nome comercial" hint="Facultativo" value={draft.identification.tradeName} onChange={(e) => patch('identification', { ...draft.identification, tradeName: e.target.value })} />
                <Input id="cnpj" label="CNPJ" value={draft.identification.cnpj} error={errors.cnpj} required onChange={(e) => patch('identification', { ...draft.identification, cnpj: formatCnpj(e.target.value) })} />
                <Input id="responsibleName" label="Nome do responsável" value={draft.identification.responsibleName} error={errors.responsibleName} required onChange={(e) => patch('identification', { ...draft.identification, responsibleName: e.target.value })} />
                <Input id="responsibleCpf" label="CPF do responsável" value={draft.identification.responsibleCpf} error={errors.responsibleCpf} required onChange={(e) => patch('identification', { ...draft.identification, responsibleCpf: formatCpf(e.target.value) })} />
                <Input id="email" type="email" label="E-mail" value={draft.identification.email} error={errors.email} required onChange={(e) => patch('identification', { ...draft.identification, email: e.target.value })} />
                <Input id="phone" label="Celular / WhatsApp" value={draft.identification.phone} error={errors.phone} required onChange={(e) => patch('identification', { ...draft.identification, phone: formatPhone(e.target.value) })} />
                <Input id="secondaryPhone" label="Telefone secundário" hint="Facultativo" value={draft.identification.secondaryPhone} onChange={(e) => patch('identification', { ...draft.identification, secondaryPhone: formatPhone(e.target.value) })} />
              </div>
            </StepFrame>
          )}

          {current === 'endereco' && (
            <StepFrame title="Endereço" description="Endereço de atendimento da oficina. Sem consulta de CEP nesta etapa.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="zipCode" label="CEP" value={draft.address.zipCode} error={errors.zipCode} required onChange={(e) => patch('address', { ...draft.address, zipCode: formatCep(e.target.value) })} />
                <Select id="state" label="Estado" value={draft.address.state} error={errors.state} required onChange={(e) => patch('address', { ...draft.address, state: e.target.value })}>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </Select>
                <Input id="city" label="Cidade" value={draft.address.city} error={errors.city} required onChange={(e) => patch('address', { ...draft.address, city: e.target.value })} />
                <Input id="neighborhood" label="Bairro" value={draft.address.neighborhood} error={errors.neighborhood} required onChange={(e) => patch('address', { ...draft.address, neighborhood: e.target.value })} />
                <Input id="street" label="Logradouro" value={draft.address.street} error={errors.street} required onChange={(e) => patch('address', { ...draft.address, street: e.target.value })} />
                <Input id="number" label="Número" value={draft.address.number} error={errors.number} required onChange={(e) => patch('address', { ...draft.address, number: e.target.value })} />
                <Input id="complement" label="Complemento" hint="Facultativo" value={draft.address.complement ?? ''} onChange={(e) => patch('address', { ...draft.address, complement: e.target.value })} />
                <Input id="reference" label="Ponto de referência" hint="Facultativo" value={draft.address.reference ?? ''} onChange={(e) => patch('address', { ...draft.address, reference: e.target.value })} />
              </div>
            </StepFrame>
          )}

          {current === 'identidade' && (
            <StepFrame title="Identidade da oficina" description="A estrutura visual do VEBOOK permanece. A oficina personaliza nome, textos e imagens.">
              <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
                <div className="grid gap-4">
                  <Input id="publicName" label="Nome público" value={draft.identity.publicName} error={errors.publicName} required onChange={(e) => patch('identity', { ...draft.identity, publicName: e.target.value })} />
                  <Input id="slogan" label="Slogan" hint="Facultativo" value={draft.identity.slogan ?? ''} onChange={(e) => patch('identity', { ...draft.identity, slogan: e.target.value })} />
                  <label className="space-y-1.5">
                    <span className="block text-sm font-semibold text-slate-800">Descrição</span>
                    <textarea
                      rows={4}
                      value={draft.identity.description ?? ''}
                      onChange={(e) => patch('identity', { ...draft.identity, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5"
                    />
                  </label>
                  <Input id="foundedYear" label="Ano de fundação" hint="Facultativo" type="number" value={draft.identity.foundedYear ?? ''} onChange={(e) => patch('identity', { ...draft.identity, foundedYear: e.target.value ? Number(e.target.value) : undefined })} />
                  <ImageField label="Logo" value={draft.identity.logoDataUrl} onChange={(logoDataUrl) => patch('identity', { ...draft.identity, logoDataUrl })} />
                  <ImageField label="Foto principal" value={draft.identity.coverDataUrl} onChange={(coverDataUrl) => patch('identity', { ...draft.identity, coverDataUrl })} />
                </div>
                <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prévia</p>
                  <div className="mt-3 rounded-lg bg-[#0B1E36] p-4 text-white">
                    <p className="text-lg font-bold">{draft.identity.publicName || 'Nome público'}</p>
                    <p className="mt-1 text-sm text-slate-300">{draft.identity.slogan || 'Slogan da oficina'}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{draft.identity.description || 'A descrição aparece no site público.'}</p>
                </aside>
              </div>
            </StepFrame>
          )}

          {current === 'servicos' && (
            <StepFrame title="Serviços" description="Ative o catálogo inicial e, se quiser, inclua um serviço próprio.">
              {errors.services && <Alert tone="error">{errors.services}</Alert>}
              <ul className="divide-y divide-slate-100">
                {draft.services.map((item, serviceIndex) => (
                  <li key={`${item.catalogKey}-${serviceIndex}`} className="grid gap-3 py-3 sm:grid-cols-[auto_1fr_6rem_6rem]">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(e) => {
                          const services = [...draft.services];
                          services[serviceIndex] = { ...item, active: e.target.checked };
                          patch('services', services);
                        }}
                      />
                      {item.name}
                    </label>
                    <input
                      placeholder="Descrição"
                      value={item.description}
                      onChange={(e) => {
                        const services = [...draft.services];
                        services[serviceIndex] = { ...item, description: e.target.value };
                        patch('services', services);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Preço"
                      value={item.price}
                      onChange={(e) => {
                        const services = [...draft.services];
                        services[serviceIndex] = { ...item, price: e.target.value };
                        patch('services', services);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Minutos"
                      value={item.durationMinutes}
                      onChange={(e) => {
                        const services = [...draft.services];
                        services[serviceIndex] = { ...item, durationMinutes: e.target.value };
                        patch('services', services);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </li>
                ))}
              </ul>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() =>
                  patch('services', [
                    ...draft.services,
                    { name: 'Serviço personalizado', description: '', price: '', durationMinutes: '', active: true, custom: true },
                  ])
                }
              >
                Adicionar serviço personalizado
              </Button>
            </StepFrame>
          )}

          {current === 'atendimento' && (
            <StepFrame title="Atendimento" description="Horários e regras de agendamento que alimentam o site e a agenda.">
              {errors.hours && <Alert tone="error">{errors.hours}</Alert>}
              <ul className="space-y-3">
                {WEEKDAY_KEYS.map((key) => {
                  const day = draft.hours[key];
                  return (
                    <li key={key} className="grid items-center gap-3 sm:grid-cols-[8rem_auto_1fr_1fr]">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) => patch('hours', { ...draft.hours, [key]: { ...day, enabled: e.target.checked } })}
                        />
                        {WEEKDAY_LABELS[key]}
                      </label>
                      <span className="text-sm text-slate-500">{day.enabled ? 'Aberto' : 'Fechado'}</span>
                      <input type="time" disabled={!day.enabled} value={day.open} onChange={(e) => patch('hours', { ...draft.hours, [key]: { ...day, open: e.target.value } })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                      <input type="time" disabled={!day.enabled} value={day.close} onChange={(e) => patch('hours', { ...draft.hours, [key]: { ...day, close: e.target.value } })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={draft.acceptsOnlineBooking} onChange={(e) => patch('acceptsOnlineBooking', e.target.checked)} />
                  Aceita agendamento online
                </label>
                <Input id="minAdvance" type="number" label="Antecedência mínima (h)" value={draft.minAdvanceHours} onChange={(e) => patch('minAdvanceHours', Number(e.target.value))} />
                <Input id="slot" type="number" label="Intervalo entre atendimentos (min)" value={draft.slotIntervalMinutes} onChange={(e) => patch('slotIntervalMinutes', Number(e.target.value))} />
              </div>
            </StepFrame>
          )}

          {current === 'subdominio' && (
            <StepFrame title="Escolha o endereço da sua oficina no VEBOOK" description="Depois de confirmado, o subdomínio permanece reservado para esta oficina.">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    id="hostname"
                    label="Subdomínio"
                    value={draft.hostname}
                    error={errors.hostname}
                    onChange={(e) => patch('hostname', normalizeHostname(e.target.value))}
                  />
                </div>
                <p className="mb-2 text-sm font-semibold text-slate-600">.vebook.com.br</p>
              </div>
              {hostStatus && (
                <p className={`mt-3 text-sm font-semibold ${hostStatus.available ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {hostStatus.available ? 'Disponível' : hostStatus.message}
                </p>
              )}
              <p className="mt-4 font-mono text-sm text-[#0B1E36]">{displayOfficeHost(draft.hostname || 'suaoficina')}</p>
            </StepFrame>
          )}

          {current === 'acesso' && !draft.skipAccount && (
            <StepFrame title="Criar conta VEBOOK" description="Identidade pessoal única. O login é CPF + senha. O e-mail é para recuperação e comunicação.">
              <Alert>Demonstração: a senha é armazenada apenas como fingerprint local, sem valor de segurança.</Alert>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input id="accountName" label="Nome completo" value={draft.account.name} error={errors.accountName} required onChange={(e) => patch('account', { ...draft.account, name: e.target.value })} />
                <Input id="accountCpf" label="CPF" value={draft.account.cpf} error={errors.accountCpf} required onChange={(e) => patch('account', { ...draft.account, cpf: formatCpf(e.target.value) })} />
                <Input id="accountEmail" type="email" label="E-mail" hint="Não é usado como login" value={draft.account.email} error={errors.accountEmail} required onChange={(e) => patch('account', { ...draft.account, email: e.target.value })} />
                <Input id="accountPhone" label="Telefone" value={draft.account.phone} error={errors.accountPhone} required onChange={(e) => patch('account', { ...draft.account, phone: formatPhone(e.target.value) })} />
                <Input id="password" type="password" label="Senha" value={draft.account.password} error={errors.password} required onChange={(e) => patch('account', { ...draft.account, password: e.target.value })} />
                <Input id="confirmPassword" type="password" label="Confirmação da senha" value={draft.account.confirmPassword} required onChange={(e) => patch('account', { ...draft.account, confirmPassword: e.target.value })} />
              </div>
            </StepFrame>
          )}

          {current === 'concluido' && (
            <PublicationStep hostname={getLastPublishedHostname() || draft.hostname} />
          )}

          {current === 'revisao' && (
            <StepFrame title="Revisão" description="Depois de confirmar, o endereço VEBOOK será criado e a área administrativa estará disponível.">
              {draft.skipAccount && existingUser && (
                <Alert>A nova oficina será vinculada à conta já autenticada: {existingUser.name} ({existingUser.cpf}) como OWNER.</Alert>
              )}
              <div className="grid gap-6 sm:grid-cols-2 text-sm">
                <Summary title="Sua oficina" lines={[
                  `Nome: ${draft.identification.legalName}`,
                  `CNPJ: ${draft.identification.cnpj}`,
                  `Responsável: ${draft.identification.responsibleName}`,
                  `E-mail: ${draft.identification.email}`,
                  `Telefone: ${draft.identification.phone}`,
                ]} />
                <Summary title="Endereço" lines={[
                  `${draft.address.street}, ${draft.address.number}`,
                  `${draft.address.neighborhood} — ${draft.address.city}/${draft.address.state}`,
                  `CEP ${draft.address.zipCode}`,
                ]} />
                <Summary title="Site" lines={[displayOfficeHost(draft.hostname)]} />
                <Summary title="Conta VEBOOK" lines={[
                  `Nome: ${draft.skipAccount && existingUser ? existingUser.name : draft.account.name}`,
                  `Login (CPF): ${draft.skipAccount && existingUser ? existingUser.cpf : draft.account.cpf}`,
                  `E-mail: ${draft.skipAccount && existingUser ? existingUser.email : draft.account.email}`,
                  'Papel: OWNER',
                ]} />
              </div>
              <label className="mt-6 flex items-start gap-3 text-sm">
                <input type="checkbox" checked={draft.termsAccepted} onChange={(e) => patch('termsAccepted', e.target.checked)} className="mt-1" />
                <span>Declaro que as informações fornecidas são verdadeiras e concordo com os termos de utilização do VEBOOK.</span>
              </label>
              {errors.terms && <p className="mt-2 text-sm text-rose-700">{errors.terms}</p>}
              {errors.password && <p className="mt-2 text-sm text-rose-700">{errors.password} Volte à etapa Conta VEBOOK se a senha não estiver preenchida nesta sessão.</p>}
              {errors.publish && <p className="mt-2 text-sm text-rose-700">{errors.publish}</p>}
            </StepFrame>
          )}

          {current !== 'concluido' && (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="secondary" disabled={index === 0} onClick={prevStep}>
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              {current === 'revisao' ? (
                <Button onClick={publish}>Criar minha oficina</Button>
              ) : (
                <Button onClick={nextStep}>
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PublicationStep: React.FC<{ hostname: string }> = ({ hostname }) => (
  <StepFrame title="Bem-vindo ao VEBOOK" description="Sua oficina foi criada. O endereço público e a área administrativa já estão disponíveis.">
    <p className="font-mono text-lg font-semibold text-[#0B1E36]">{displayOfficeHost(hostname)}</p>
    <p className="text-sm text-slate-600">
      Depois de confirmar, o subdomínio permanece reservado para esta oficina. A página pública já consome os dados cadastrados.
    </p>
    <div className="flex flex-wrap gap-3">
      <Link
        to={`${PATHS.oficinaAdmin(hostname)}?bem-vindo=1`}
        className="inline-flex items-center rounded-lg bg-[#0B1E36] px-4 py-2 text-sm font-semibold text-white"
      >
        Ir para a administração
      </Link>
      <Link
        to={PATHS.oficina(hostname)}
        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
      >
        Ver meu site
      </Link>
    </div>
  </StepFrame>
);

const StepFrame: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-bold text-[#0B1E36]">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
    {children}
  </div>
);

const Summary: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => (
  <div>
    <h2 className="font-bold text-[#0B1E36]">{title}</h2>
    <ul className="mt-2 space-y-1 text-slate-600">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  </div>
);

const ImageField: React.FC<{ label: string; value?: string; onChange: (value?: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-1.5">
    <p className="text-sm font-semibold text-slate-800">{label}</p>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 220_000) {
          onChange(undefined);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => onChange(String(reader.result));
        reader.readAsDataURL(file);
      }}
    />
    {value && <img src={value} alt="" className="h-16 rounded-lg border border-slate-200 object-cover" />}
    <p className="text-xs text-slate-500">Facultativo. Imagens grandes não são persistidas nesta demonstração.</p>
  </div>
);

