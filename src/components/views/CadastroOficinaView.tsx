import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { COMMERCIAL_CONDITIONS } from '../../data/commercialTerms';
import { OFFICE_PRICING, contractedAmountFor, planLabel, planSummaryLines, renewalAmountFor } from '../../data/officePlans';
import { formatBRL } from '../../lib/currency';
import {
  applyPaymentWebhook,
  createPendingOffice,
  defaultSignupDraft,
  getLatestPayment,
  isSlugAvailable,
  loginWithCpf,
  takenSlugs,
} from '../../data/officeStore';
import { lookupCep, formatCep, isValidCep } from '../../lib/cep';
import { formatCpf, isValidCpf, onlyDigits } from '../../lib/cpf';
import { formatPhone, isValidEmail, isValidPhone } from '../../lib/phone';
import { getPasswordRequirements, isStrongPassword } from '../../lib/password';
import { isDemoPaymentsEnvironment } from '../../lib/payments/mockGateway';
import {
  isValidSlugFormat,
  normalizeSlug,
  slugFromWorkshopName,
  suggestSlugAlternatives,
  workshopHost,
} from '../../lib/slug';
import { Logo } from '../layout/Logo';
import { Field, inputClass } from '../ui/Field';
import { PlanModality, SignupDraft } from '../../types';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const SEGMENT_OPTIONS = [
  'Mecânica geral',
  'Freios',
  'Suspensão',
  'Troca de óleo',
  'Injeção eletrônica',
  'Revisão preventiva',
  'Elétrica',
  'Funilaria',
];

const STEPS = [
  { id: 1, label: 'Você' },
  { id: 2, label: 'Sua oficina' },
  { id: 3, label: 'Seu endereço' },
  { id: 4, label: 'Revisão' },
  { id: 5, label: 'Pagamento' },
  { id: 6, label: 'Ativação' },
] as const;

interface CadastroOficinaViewProps {
  initialModality?: PlanModality;
  onBackToOficinas: () => void;
  onOpenLegal: (type: 'termos' | 'privacidade' | 'comercial') => void;
  onViewPublicPage: (slug: string) => void;
  onOpenPanel: (slug: string) => void;
}

function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export const CadastroOficinaView: React.FC<CadastroOficinaViewProps> = ({
  initialModality = 'monthly',
  onBackToOficinas,
  onOpenLegal,
  onViewPublicPage,
  onOpenPanel,
}) => {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<SignupDraft>(() => defaultSignupDraft(initialModality));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cepStatus, setCepStatus] = useState('');
  const [consent, setConsent] = useState({
    terms: false,
    privacy: false,
    commercial: false,
    priceChange: false,
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [activatedSlug, setActivatedSlug] = useState('');
  const [pendingOfficeId, setPendingOfficeId] = useState('');
  const [paymentExternalId, setPaymentExternalId] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const taken = useMemo(() => takenSlugs(), [step, draft.slug]);
  const suggestedSlug = slugFromWorkshopName(draft.office.tradeName || draft.office.legalName);
  const alternatives = suggestSlugAlternatives(draft.office.tradeName || draft.office.legalName || draft.slug, taken);

  const progressIndex = Math.min(step, 6);

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {};
    if (draft.owner.fullName.trim().length < 5) next.fullName = 'Informe o nome completo.';
    if (!isValidCpf(draft.owner.cpf)) next.cpf = 'CPF inválido.';
    if (!isValidPhone(draft.owner.phone)) next.phone = 'Celular/WhatsApp inválido.';
    if (!isValidEmail(draft.owner.email)) next.email = 'E-mail inválido.';
    if (!isStrongPassword(draft.owner.password)) next.password = 'A senha não atende aos requisitos mínimos.';
    if (draft.owner.password !== confirmPassword) next.confirmPassword = 'A confirmação não confere.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: Record<string, string> = {};
    if (draft.office.legalName.trim().length < 3) next.legalName = 'Informe o nome da oficina.';
    if (!isValidPhone(draft.office.phone)) next.officePhone = 'Telefone inválido.';
    if (draft.office.whatsapp && !isValidPhone(draft.office.whatsapp)) next.whatsapp = 'WhatsApp inválido.';
    if (!isValidCep(draft.office.zipCode)) next.zipCode = 'CEP inválido.';
    if (!draft.office.street.trim()) next.street = 'Informe o endereço.';
    if (!draft.office.streetNumber.trim()) next.streetNumber = 'Informe o número.';
    if (!draft.office.neighborhood.trim()) next.neighborhood = 'Informe o bairro.';
    if (!draft.office.city.trim()) next.city = 'Informe a cidade.';
    if (!draft.office.state) next.state = 'Informe o estado.';
    if (draft.office.cnpj && onlyDigits(draft.office.cnpj).length !== 14) {
      next.cnpj = 'CNPJ incompleto. Deixe em branco se a oficina não possuir CNPJ.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = (): boolean => {
    const slug = normalizeSlug(draft.slug || suggestedSlug);
    const next: Record<string, string> = {};
    if (!isValidSlugFormat(slug)) next.slug = 'Use 3 a 32 caracteres, sem espaços, iniciando por letra.';
    else if (!isSlugAvailable(slug)) next.slug = 'Este endereço já está em uso.';
    setErrors(next);
    if (!next.slug) setDraft((current) => ({ ...current, slug }));
    return Object.keys(next).length === 0;
  };

  const goNext = async () => {
    setFormError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 2 && !draft.slug) {
      setDraft((current) => ({ ...current, slug: suggestedSlug }));
    }
    setStep((current) => Math.min(current + 1, 6));
  };

  const handleCepBlur = async () => {
    if (!isValidCep(draft.office.zipCode)) return;
    setCepStatus('Consultando CEP...');
    try {
      const found = await lookupCep(draft.office.zipCode);
      if (!found) {
        setCepStatus('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }
      setDraft((current) => ({
        ...current,
        office: {
          ...current.office,
          zipCode: found.zipCode,
          street: found.street || current.office.street,
          neighborhood: found.neighborhood || current.office.neighborhood,
          city: found.city || current.office.city,
          state: found.state || current.office.state,
        },
      }));
      setCepStatus('Endereço localizado pelo CEP.');
    } catch {
      setCepStatus('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
    }
  };

  const submitReview = async () => {
    if (!consent.terms || !consent.privacy || !consent.commercial || !consent.priceChange) {
      setFormError('Confirme todos os aceites para continuar. Nenhum item vem pré-marcado.');
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const created = await createPendingOffice(draft, consent);
      setPendingOfficeId(created.office.officeId);
      setPaymentExternalId(created.payment.externalId ?? '');
      setStep(5);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar o cadastro.');
    } finally {
      setBusy(false);
    }
  };

  const simulatePayment = async (event: 'payment.paid' | 'payment.failed') => {
    if (!paymentExternalId) return;
    setBusy(true);
    setPaymentMessage('');
    try {
      const payment = applyPaymentWebhook(paymentExternalId, event);
      if (event === 'payment.paid' && payment?.status === 'paid') {
        await loginWithCpf(draft.owner.cpf, draft.owner.password);
        setActivatedSlug(draft.slug);
        setStep(6);
      } else {
        const latest = getLatestPayment(pendingOfficeId);
        setPaymentMessage(
          latest?.status === 'failed'
            ? 'Pagamento não confirmado. A oficina permanece pendente até a aprovação.'
            : 'Status de pagamento atualizado.',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0B1E36] text-white">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <Logo size="sm" variant="light" />
          <button
            type="button"
            onClick={onBackToOficinas}
            className="text-xs font-bold text-sky-300 hover:text-white cursor-pointer"
          >
            Voltar para Para Oficinas
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Cadastro da oficina</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">
            Cadastre o mínimo necessário para começar.
          </h1>
          <p className="text-sm text-slate-600">
            Você completa logo, horários e serviços depois, no painel. O plano escolhido:{' '}
            <strong>{planLabel(draft.modality)}</strong>.
          </p>
        </div>

        <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STEPS.map((item) => {
            const active = item.id === progressIndex;
            const done = item.id < progressIndex;
            return (
              <li
                key={item.id}
                className={`rounded-xl border px-2 py-2 text-center text-[11px] font-bold ${
                  active
                    ? 'border-[#0B1E36] bg-[#0B1E36] text-white'
                    : done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {item.id}. {item.label}
              </li>
            );
          })}
        </ol>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Primeiro, vamos identificar você.</h2>
              <Field label="Nome completo" error={errors.fullName}>
                <input
                  className={inputClass}
                  value={draft.owner.fullName}
                  onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, fullName: e.target.value } })}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CPF" hint="O CPF será o identificador principal para o login." error={errors.cpf}>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={formatCpf(draft.owner.cpf)}
                    onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, cpf: onlyDigits(e.target.value) } })}
                  />
                </Field>
                <Field label="Celular / WhatsApp" error={errors.phone}>
                  <input
                    className={inputClass}
                    value={formatPhone(draft.owner.phone)}
                    onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, phone: onlyDigits(e.target.value) } })}
                  />
                </Field>
              </div>
              <Field label="E-mail" error={errors.email}>
                <input
                  className={inputClass}
                  type="email"
                  value={draft.owner.email}
                  onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, email: e.target.value } })}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Senha" error={errors.password}>
                  <input
                    className={inputClass}
                    type="password"
                    value={draft.owner.password}
                    onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, password: e.target.value } })}
                  />
                </Field>
                <Field label="Confirmação de senha" error={errors.confirmPassword}>
                  <input
                    className={inputClass}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                {getPasswordRequirements(draft.owner.password).map((item) => (
                  <li key={item.id} className={item.ok ? 'text-emerald-700' : ''}>
                    {item.ok ? '✓' : '•'} {item.label}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Agora, vamos cadastrar sua oficina.</h2>
              <Field label="Nome da oficina" error={errors.legalName}>
                <input
                  className={inputClass}
                  value={draft.office.legalName}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, legalName: e.target.value } })}
                />
              </Field>
              <Field label="Nome fantasia" optional>
                <input
                  className={inputClass}
                  value={draft.office.tradeName}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, tradeName: e.target.value } })}
                />
              </Field>
              <Field label="CNPJ" optional hint="Não é obrigatório. Oficinas sem CNPJ podem se cadastrar." error={errors.cnpj}>
                <input
                  className={inputClass}
                  value={formatCnpj(draft.office.cnpj)}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, cnpj: onlyDigits(e.target.value) } })}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Telefone" error={errors.officePhone}>
                  <input
                    className={inputClass}
                    value={formatPhone(draft.office.phone)}
                    onChange={(e) => setDraft({ ...draft, office: { ...draft.office, phone: onlyDigits(e.target.value) } })}
                  />
                </Field>
                <Field label="WhatsApp" optional error={errors.whatsapp}>
                  <input
                    className={inputClass}
                    value={formatPhone(draft.office.whatsapp)}
                    onChange={(e) => setDraft({ ...draft, office: { ...draft.office, whatsapp: onlyDigits(e.target.value) } })}
                  />
                </Field>
              </div>
              <Field label="CEP" hint={cepStatus} error={errors.zipCode}>
                <input
                  className={inputClass}
                  value={formatCep(draft.office.zipCode)}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, zipCode: onlyDigits(e.target.value) } })}
                  onBlur={() => void handleCepBlur()}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Endereço" error={errors.street}>
                    <input
                      className={inputClass}
                      value={draft.office.street}
                      onChange={(e) => setDraft({ ...draft, office: { ...draft.office, street: e.target.value } })}
                    />
                  </Field>
                </div>
                <Field label="Número" error={errors.streetNumber}>
                  <input
                    className={inputClass}
                    value={draft.office.streetNumber}
                    onChange={(e) => setDraft({ ...draft, office: { ...draft.office, streetNumber: e.target.value } })}
                  />
                </Field>
              </div>
              <Field label="Complemento" optional>
                <input
                  className={inputClass}
                  value={draft.office.complement}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, complement: e.target.value } })}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Bairro" error={errors.neighborhood}>
                  <input
                    className={inputClass}
                    value={draft.office.neighborhood}
                    onChange={(e) => setDraft({ ...draft, office: { ...draft.office, neighborhood: e.target.value } })}
                  />
                </Field>
                <Field label="Cidade" error={errors.city}>
                  <input
                    className={inputClass}
                    value={draft.office.city}
                    onChange={(e) => setDraft({ ...draft, office: { ...draft.office, city: e.target.value } })}
                  />
                </Field>
                <Field label="Estado" error={errors.state}>
                  <select
                    className={inputClass}
                    value={draft.office.state}
                    onChange={(e) => setDraft({ ...draft, office: { ...draft.office, state: e.target.value } })}
                  >
                    <option value="">UF</option>
                    {UF_OPTIONS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <p className="text-xs font-bold text-[#0B1E36]">Complementos (opcional)</p>
                <p className="text-[11px] text-slate-500">Você poderá completar essas informações depois.</p>
                <div className="flex flex-wrap gap-2">
                  {SEGMENT_OPTIONS.map((segment) => {
                    const selected = draft.extras.segments.includes(segment);
                    return (
                      <button
                        key={segment}
                        type="button"
                        onClick={() => {
                          const segments = selected
                            ? draft.extras.segments.filter((item) => item !== segment)
                            : [...draft.extras.segments, segment];
                          setDraft({ ...draft, extras: { ...draft.extras, segments } });
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                          selected ? 'bg-[#0B1E36] text-white border-[#0B1E36]' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {segment}
                      </button>
                    );
                  })}
                </div>
                <Field label="Instagram" optional>
                  <input
                    className={inputClass}
                    value={draft.extras.instagram}
                    onChange={(e) => setDraft({ ...draft, extras: { ...draft.extras, instagram: e.target.value } })}
                  />
                </Field>
                <Field label="Site" optional>
                  <input
                    className={inputClass}
                    value={draft.extras.website}
                    onChange={(e) => setDraft({ ...draft, extras: { ...draft.extras, website: e.target.value } })}
                  />
                </Field>
                <Field label="Descrição curta" optional>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={draft.extras.shortDescription}
                    onChange={(e) => setDraft({ ...draft, extras: { ...draft.extras, shortDescription: e.target.value } })}
                  />
                </Field>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Escolha o endereço digital da oficina.</h2>
              <p className="text-sm text-slate-600">
                Este será o endereço público da sua página no VEBOOK.
              </p>
              <Field label="Endereço VEBOOK" error={errors.slug}>
                <div className="flex items-center gap-2">
                  <input
                    className={`${inputClass} font-mono`}
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: normalizeSlug(e.target.value) })}
                    placeholder={suggestedSlug}
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">.vebook.com.br</span>
                </div>
              </Field>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-mono text-[#0B1E36]">
                {workshopHost(draft.slug || suggestedSlug)}
              </div>
              {draft.slug && isSlugAvailable(draft.slug) ? (
                <p className="text-xs font-bold text-emerald-700">Endereço disponível.</p>
              ) : null}
              {draft.slug && !isSlugAvailable(draft.slug) ? (
                <div className="space-y-2">
                  <p className="text-xs text-rose-700 font-bold">Indisponível. Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {alternatives.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDraft({ ...draft, slug: item })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Revise os dados antes do pagamento.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Responsável</p>
                  <p><strong>{draft.owner.fullName}</strong></p>
                  <p>CPF {formatCpf(draft.owner.cpf)}</p>
                  <p>{draft.owner.email}</p>
                  <p>{formatPhone(draft.owner.phone)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Oficina</p>
                  <p><strong>{draft.office.tradeName || draft.office.legalName}</strong></p>
                  <p>{draft.office.street}, {draft.office.streetNumber} — {draft.office.city}/{draft.office.state}</p>
                  <p>{formatPhone(draft.office.phone)}</p>
                  <p>WhatsApp {formatPhone(draft.office.whatsapp || draft.office.phone)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 space-y-1 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Endereço VEBOOK</p>
                <p className="font-mono font-bold text-[#0B1E36]">{workshopHost(draft.slug)}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 space-y-1 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-800">{planLabel(draft.modality)}</p>
                {planSummaryLines(draft.modality).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="space-y-3 text-xs text-slate-700">
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.terms} onChange={(e) => setConsent({ ...consent, terms: e.target.checked })} />
                  <span>Li e aceito os <button type="button" className="font-bold underline cursor-pointer" onClick={() => onOpenLegal('termos')}>Termos de Uso</button>.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.privacy} onChange={(e) => setConsent({ ...consent, privacy: e.target.checked })} />
                  <span>Li e aceito a <button type="button" className="font-bold underline cursor-pointer" onClick={() => onOpenLegal('privacidade')}>Política de Privacidade</button>.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.commercial} onChange={(e) => setConsent({ ...consent, commercial: e.target.checked })} />
                  <span>Aceito as <button type="button" className="font-bold underline cursor-pointer" onClick={() => onOpenLegal('comercial')}>condições comerciais</button> da adesão da oficina.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.priceChange} onChange={(e) => setConsent({ ...consent, priceChange: e.target.checked })} />
                  <span>
                    Estou ciente de que o primeiro ano custa {formatBRL(OFFICE_PRICING.year1Monthly)}/mês
                    {draft.modality === 'annual' ? ` (${formatBRL(OFFICE_PRICING.year1Annual)} no anual)` : ''} e que, a partir do segundo ano, o valor vigente passa a {formatBRL(OFFICE_PRICING.year2Monthly)}/mês
                    {draft.modality === 'annual' ? ` (${formatBRL(OFFICE_PRICING.year2Annual)} no anual)` : ''}.
                  </span>
                </label>
              </div>
              <ul className="text-[11px] text-slate-500 space-y-1">
                {COMMERCIAL_CONDITIONS.slice(0, 4).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Pagamento da adesão</h2>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 space-y-2">
                <p className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Ambiente de demonstração</p>
                <p>
                  Nenhum gateway de pagamento real está configurado. A arquitetura de checkout, status, webhook e assinatura já está preparada.
                  A oficina só é ativada após a confirmação do pagamento.
                </p>
                {isDemoPaymentsEnvironment() ? (
                  <p className="text-xs">Neste ambiente, use a simulação abaixo para confirmar ou recusar o pagamento.</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <p className="text-sm font-bold text-[#0B1E36] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {planLabel(draft.modality)} — {formatBRL(contractedAmountFor(draft.modality))}
                </p>
                <p className="text-xs text-slate-600">
                  Renovação prevista: {formatBRL(renewalAmountFor(draft.modality))}
                  {draft.modality === 'annual' ? '/ano' : '/mês'}.
                </p>
                <p className="text-xs text-slate-600">Cartão recorrente. Dados de cartão não são armazenados neste protótipo.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Nome no cartão" />
                  <input className={inputClass} placeholder="Número do cartão (simulado)" />
                  <input className={inputClass} placeholder="Validade MM/AA" />
                  <input className={inputClass} placeholder="CVV" />
                </div>
              </div>
              {paymentMessage ? <p className="text-sm text-rose-700 font-medium">{paymentMessage}</p> : null}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void simulatePayment('payment.paid')}
                  className="px-5 py-3 rounded-xl bg-[#0B1E36] text-white text-sm font-extrabold cursor-pointer disabled:opacity-60"
                >
                  Simular pagamento aprovado
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void simulatePayment('payment.failed')}
                  className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-sm font-bold cursor-pointer"
                >
                  Simular falha
                </button>
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="space-y-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B1E36]">Sua oficina agora faz parte do VEBOOK.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sua página pública</p>
                  <p className="font-mono font-bold text-[#0B1E36] flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {workshopHost(activatedSlug)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onViewPublicPage(activatedSlug)}
                    className="w-full py-2.5 rounded-xl bg-[#0B1E36] text-white text-xs font-extrabold cursor-pointer"
                  >
                    Ver minha página
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Seu painel de gestão</p>
                  <p className="font-mono font-bold text-[#0B1E36]">{workshopHost(activatedSlug)}/painel</p>
                  <button
                    type="button"
                    onClick={() => onOpenPanel(activatedSlug)}
                    className="w-full py-2.5 rounded-xl bg-sky-500 text-[#0B1E36] text-xs font-extrabold cursor-pointer"
                  >
                    Acessar meu painel
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Você poderá completar os dados da sua oficina, adicionar serviços, imagens, informações de contato e outras informações disponíveis no painel.
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Login do painel: CPF + senha cadastrados.
              </p>
            </section>
          )}

          {formError ? <p className="text-sm font-medium text-rose-700">{formError}</p> : null}

          {step < 6 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  if (step === 1) onBackToOficinas();
                  else setStep((current) => current - 1);
                }}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              {step < 4 && (
                <button
                  type="button"
                  onClick={() => void goNext()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1E36] text-white text-sm font-extrabold cursor-pointer"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 4 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submitReview()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1E36] text-white text-sm font-extrabold cursor-pointer disabled:opacity-60"
                >
                  Ir para o pagamento
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
