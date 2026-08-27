import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { COMMERCIAL_CONDITIONS } from '../../data/commercialTerms';
import {
  PLAN_OFFERS,
  contractSummaryFor,
  planLabel,
} from '../../data/officePlans';
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
import { ThemeColorPicker } from '../ui/ThemeColorPicker';
import { WorkshopSitePreview } from '../workshop/WorkshopSitePreview';
import { PlanModality, SignupDraft, SignupWeekdayKey } from '../../types';
import { normalizeThemeColor } from '../../lib/themeColor';

const WEEKDAY_FIELDS: Array<{ key: SignupWeekdayKey; label: string }> = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const STEPS = [
  { id: 1, label: 'Acesso' },
  { id: 2, label: 'Oficina' },
  { id: 3, label: 'Site' },
  { id: 4, label: 'Revisão' },
  { id: 5, label: 'Pagamento' },
  { id: 6, label: 'Conclusão' },
] as const;

interface CadastroOficinaViewProps {
  initialModality?: PlanModality;
  planPreselected?: boolean;
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
  planPreselected = false,
  onBackToOficinas,
  onOpenLegal,
  onViewPublicPage,
  onOpenPanel,
}) => {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<SignupDraft>(() => defaultSignupDraft(initialModality));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const taken = useMemo(() => takenSlugs(), [step, draft.site.slug]);
  const suggestedSlug = slugFromWorkshopName(draft.site.displayName || draft.office.name);
  const alternatives = suggestSlugAlternatives(
    draft.site.displayName || draft.office.name || draft.site.slug,
    taken,
  );
  const contractSummary = contractSummaryFor(draft.modality);

  const updateSite = (patch: Partial<SignupDraft['site']>) => {
    setDraft((current) => ({ ...current, site: { ...current.site, ...patch } }));
  };

  const updateSocial = (key: keyof SignupDraft['site']['socialLinks'], value: string) => {
    setDraft((current) => ({
      ...current,
      site: {
        ...current.site,
        socialLinks: { ...current.site.socialLinks, [key]: value },
      },
    }));
  };

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {};
    if (draft.owner.fullName.trim().length < 5) next.fullName = 'Informe o nome completo.';
    if (!isValidCpf(draft.owner.cpf)) next.cpf = 'CPF inválido.';
    if (!isValidEmail(draft.owner.email)) next.email = 'E-mail inválido.';
    if (!isStrongPassword(draft.owner.password)) next.password = 'A senha não atende aos requisitos mínimos.';
    if (draft.owner.password !== confirmPassword) next.confirmPassword = 'A confirmação não confere.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: Record<string, string> = {};
    if (draft.office.name.trim().length < 3) next.officeName = 'Informe o nome da oficina.';
    if (!isValidPhone(draft.office.phone)) next.officePhone = 'Telefone inválido.';
    if (draft.office.address.trim().length < 8) next.address = 'Informe o endereço completo da oficina.';
    if (draft.office.cnpj && onlyDigits(draft.office.cnpj).length !== 14) {
      next.cnpj = 'CNPJ incompleto. Deixe em branco se a oficina não possuir CNPJ.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = (): boolean => {
    const slug = normalizeSlug(draft.site.slug || suggestedSlug);
    const next: Record<string, string> = {};
    if (!draft.site.displayName.trim()) next.displayName = 'Informe o nome que aparecerá na página.';
    if (!isValidSlugFormat(slug)) next.slug = 'Use 3 a 32 caracteres, sem espaços, iniciando por letra.';
    else if (!isSlugAvailable(slug)) next.slug = 'Este endereço já está em uso.';
    if (draft.site.contactPhone && !isValidPhone(draft.site.contactPhone)) {
      next.contactPhone = 'Telefone de contato inválido.';
    }
    if (draft.site.contactEmail && !isValidEmail(draft.site.contactEmail)) {
      next.contactEmail = 'E-mail de contato inválido.';
    }
    setErrors(next);
    if (!next.slug) {
      setDraft((current) => ({
        ...current,
        site: {
          ...current.site,
          slug,
          displayName: current.site.displayName.trim() || current.office.name.trim(),
          contactPhone: current.site.contactPhone || current.office.phone,
          contactEmail: current.site.contactEmail || current.owner.email,
        },
      }));
    }
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    setFormError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((current) => Math.min(current + 1, 6));
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
        setActivatedSlug(draft.site.slug);
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

  const addServiceField = () => {
    updateSite({ services: [...draft.site.services, ''] });
  };

  const updateServiceField = (index: number, value: string) => {
    const services = [...draft.site.services];
    services[index] = value;
    updateSite({ services });
  };

  const removeServiceField = (index: number) => {
    if (draft.site.services.length <= 1) {
      updateSite({ services: [''] });
      return;
    }
    updateSite({ services: draft.site.services.filter((_, itemIndex) => itemIndex !== index) });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0B1E36] text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Cadastro da oficina</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">
            Configure o acesso, a oficina e o site em poucos passos.
          </h1>
          <p className="text-sm text-slate-600">
            Plano escolhido: <strong>{planLabel(draft.modality)}</strong>.
            {planPreselected ? ' Você poderá revisar tudo antes do pagamento.' : null}
          </p>
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map((item) => {
            const active = item.id === step;
            const done = item.id < step;
            return (
              <li
                key={item.id}
                className={`flex min-h-11 items-center justify-center rounded-vebook border px-2 py-2 text-center text-[11px] font-semibold leading-tight tracking-wide ${
                  active
                    ? 'border-vebook-mustard bg-vebook-navy text-vebook-mustard'
                    : done
                      ? 'border-vebook-mustard/65 bg-vebook-mustard-soft text-vebook-navy'
                      : 'border-vebook-mustard/40 bg-vebook-white text-vebook-muted'
                }`}
              >
                <span className="block w-full text-center">{item.label}</span>
              </li>
            );
          })}
        </ol>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Dados pessoais para acesso</h2>
              <p className="text-sm text-slate-600">
                Estes dados identificam o responsável pelo login no painel da oficina.
              </p>
              <Field label="Nome completo" error={errors.fullName}>
                <input
                  className={inputClass}
                  value={draft.owner.fullName}
                  onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, fullName: e.target.value } })}
                />
              </Field>
              <Field label="CPF" hint="O CPF será o identificador principal para o login." error={errors.cpf}>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={formatCpf(draft.owner.cpf)}
                  onChange={(e) => setDraft({ ...draft, owner: { ...draft.owner, cpf: onlyDigits(e.target.value) } })}
                />
              </Field>
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
                <Field label="Confirme a senha" error={errors.confirmPassword}>
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
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Dados da oficina</h2>
              <p className="text-sm text-slate-600">
                Informações cadastrais da oficina. O endereço também aparecerá na página pública.
              </p>
              <Field label="Nome da oficina" error={errors.officeName}>
                <input
                  className={inputClass}
                  value={draft.office.name}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, name: e.target.value } })}
                />
              </Field>
              <Field label="CNPJ" optional hint="Não é obrigatório." error={errors.cnpj}>
                <input
                  className={inputClass}
                  value={formatCnpj(draft.office.cnpj)}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, cnpj: onlyDigits(e.target.value) } })}
                />
              </Field>
              <Field label="Endereço" hint="Rua, número, bairro, cidade/UF." error={errors.address}>
                <input
                  className={inputClass}
                  value={draft.office.address}
                  onChange={(e) => setDraft({ ...draft, office: { ...draft.office, address: e.target.value } })}
                />
              </Field>
              <Field label="Telefone" error={errors.officePhone}>
                <input
                  className={inputClass}
                  value={formatPhone(draft.office.phone)}
                  onChange={(e) =>
                    setDraft({ ...draft, office: { ...draft.office, phone: onlyDigits(e.target.value) } })
                  }
                />
              </Field>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-[#0B1E36]">Dados do site da oficina</h2>
                <p className="text-sm text-slate-600">
                  Personalize a página pública. A prévia ao lado é atualizada em tempo real.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-5">
                  <Field label="Nome do domínio" error={errors.slug}>
                    <div className="flex items-center gap-2">
                      <input
                        className={`${inputClass} font-mono`}
                        value={draft.site.slug}
                        onChange={(e) => updateSite({ slug: normalizeSlug(e.target.value) })}
                        placeholder={suggestedSlug}
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">.vebook.com.br</span>
                    </div>
                  </Field>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-mono text-[#0B1E36]">
                    {workshopHost(draft.site.slug || suggestedSlug)}
                  </div>
                  {draft.site.slug && isSlugAvailable(draft.site.slug) ? (
                    <p className="text-xs font-bold text-emerald-700">Endereço disponível.</p>
                  ) : null}
                  {draft.site.slug && !isSlugAvailable(draft.site.slug) ? (
                    <div className="space-y-2">
                      <p className="text-xs text-rose-700 font-bold">Indisponível. Sugestões:</p>
                      <div className="flex flex-wrap gap-2">
                        {alternatives.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => updateSite({ slug: item })}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold cursor-pointer"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <Field label="Nome que aparecerá na página" error={errors.displayName}>
                    <input
                      className={inputClass}
                      value={draft.site.displayName}
                      onChange={(e) => updateSite({ displayName: e.target.value })}
                      placeholder={draft.office.name}
                    />
                  </Field>
                  <Field label="Descrição (subtítulo)">
                    <textarea
                      className={inputClass}
                      rows={2}
                      value={draft.site.subtitle}
                      onChange={(e) => updateSite({ subtitle: e.target.value })}
                      placeholder="Ex.: Especialistas em manutenção preventiva e revisões completas."
                    />
                  </Field>
                  <Field label="Link da foto" hint="URL da imagem de capa do site.">
                    <input
                      className={inputClass}
                      value={draft.site.photoUrl}
                      onChange={(e) => updateSite({ photoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Telefone de contato" error={errors.contactPhone}>
                      <input
                        className={inputClass}
                        value={formatPhone(draft.site.contactPhone || draft.office.phone)}
                        onChange={(e) => updateSite({ contactPhone: onlyDigits(e.target.value) })}
                      />
                    </Field>
                    <Field label="E-mail de contato" error={errors.contactEmail}>
                      <input
                        className={inputClass}
                        type="email"
                        value={draft.site.contactEmail || draft.owner.email}
                        onChange={(e) => updateSite({ contactEmail: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <p className="text-xs font-bold text-[#0B1E36]">Horário de funcionamento</p>
                    {WEEKDAY_FIELDS.map((day) => (
                      <Field key={day.key} label={day.label}>
                        <input
                          className={inputClass}
                          value={draft.site.hours[day.key]}
                          onChange={(e) =>
                            updateSite({
                              hours: { ...draft.site.hours, [day.key]: e.target.value },
                            })
                          }
                          placeholder="08:00 — 18:00 ou Fechado"
                        />
                      </Field>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <p className="text-xs font-bold text-[#0B1E36]">Redes sociais e links</p>
                    <Field label="Instagram" optional>
                      <input
                        className={inputClass}
                        value={draft.site.socialLinks.instagram || ''}
                        onChange={(e) => updateSocial('instagram', e.target.value)}
                      />
                    </Field>
                    <Field label="Facebook" optional>
                      <input
                        className={inputClass}
                        value={draft.site.socialLinks.facebook || ''}
                        onChange={(e) => updateSocial('facebook', e.target.value)}
                      />
                    </Field>
                    <Field label="YouTube" optional>
                      <input
                        className={inputClass}
                        value={draft.site.socialLinks.youtube || ''}
                        onChange={(e) => updateSocial('youtube', e.target.value)}
                      />
                    </Field>
                    <Field label="TikTok" optional>
                      <input
                        className={inputClass}
                        value={draft.site.socialLinks.tiktok || ''}
                        onChange={(e) => updateSocial('tiktok', e.target.value)}
                      />
                    </Field>
                    <Field label="Site" optional>
                      <input
                        className={inputClass}
                        value={draft.site.socialLinks.website || ''}
                        onChange={(e) => updateSocial('website', e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-[#0B1E36]">Serviços</p>
                      <button
                        type="button"
                        onClick={addServiceField}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar serviço
                      </button>
                    </div>
                    {draft.site.services.map((service, index) => (
                      <div key={`service-${index}`} className="flex items-center gap-2">
                        <input
                          className={inputClass}
                          value={service}
                          onChange={(e) => updateServiceField(index, e.target.value)}
                          placeholder={`Serviço ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeServiceField(index)}
                          className="shrink-0 p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700 cursor-pointer"
                          aria-label={`Remover serviço ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <ThemeColorPicker
                    id="signup-theme-color"
                    value={draft.site.themeColor}
                    onChange={(themeColor) => updateSite({ themeColor })}
                  />
                </div>

                <div className="xl:sticky xl:top-6">
                  <WorkshopSitePreview draft={draft} suggestedSlug={suggestedSlug} />
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-5">
              <h2 className="text-xl font-extrabold text-[#0B1E36]">Revisão e aceite dos termos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Responsável</p>
                  <p><strong>{draft.owner.fullName}</strong></p>
                  <p>CPF {formatCpf(draft.owner.cpf)}</p>
                  <p>{draft.owner.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Oficina</p>
                  <p><strong>{draft.office.name}</strong></p>
                  <p>{draft.office.address}</p>
                  <p>{formatPhone(draft.office.phone)}</p>
                  {draft.office.cnpj ? <p>CNPJ {formatCnpj(draft.office.cnpj)}</p> : null}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 space-y-1 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Site público</p>
                <p className="font-mono font-bold text-[#0B1E36]">{workshopHost(draft.site.slug || suggestedSlug)}</p>
                <p><strong>{draft.site.displayName || draft.office.name}</strong></p>
                <p className="text-slate-600">{draft.site.subtitle || 'Sem descrição informada.'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 w-full">Cor principal</p>
                <span
                  className="inline-block h-8 w-8 rounded-lg border border-slate-200"
                  style={{ backgroundColor: normalizeThemeColor(draft.site.themeColor) }}
                  aria-hidden
                />
                <span className="font-mono font-bold text-[#0B1E36]">
                  {normalizeThemeColor(draft.site.themeColor)}
                </span>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 space-y-2 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Resumo da contratação</p>
                <p><strong>Plano escolhido:</strong> {contractSummary.planTitle}</p>
                <p><strong>{contractSummary.firstYearLabel}:</strong> {contractSummary.firstYearAmount}</p>
                <p className="text-slate-600">
                  <strong>{contractSummary.renewalLabel}:</strong> {contractSummary.renewalAmount}
                </p>
              </div>
              <div className="space-y-3 text-xs text-slate-700">
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.terms} onChange={(e) => setConsent({ ...consent, terms: e.target.checked })} />
                  <span>
                    Li e aceito os{' '}
                    <button type="button" className="font-bold underline cursor-pointer" onClick={() => onOpenLegal('termos')}>
                      Termos de Uso
                    </button>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.privacy} onChange={(e) => setConsent({ ...consent, privacy: e.target.checked })} />
                  <span>
                    Li e aceito a{' '}
                    <button type="button" className="font-bold underline cursor-pointer" onClick={() => onOpenLegal('privacidade')}>
                      Política de Privacidade
                    </button>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.commercial} onChange={(e) => setConsent({ ...consent, commercial: e.target.checked })} />
                  <span>
                    Aceito as{' '}
                    <button type="button" className="font-bold underline cursor-pointer" onClick={() => onOpenLegal('comercial')}>
                      condições comerciais
                    </button>{' '}
                    da adesão da oficina.
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={consent.priceChange} onChange={(e) => setConsent({ ...consent, priceChange: e.target.checked })} />
                  <span>
                    Estou ciente de que o primeiro ano custa {formatBRL(PLAN_OFFERS.monthly.firstYear)}/mês
                    {draft.modality === 'annual' ? ` (${formatBRL(PLAN_OFFERS.annual.firstYear)} no anual)` : ''} e que, a partir do segundo ano, o valor vigente passa a {formatBRL(PLAN_OFFERS.monthly.renewal)}/mês
                    {draft.modality === 'annual' ? ` (${formatBRL(PLAN_OFFERS.annual.renewal)} no anual)` : ''}.
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
                <p className="font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Ambiente de demonstração
                </p>
                <p>
                  Nenhum gateway de pagamento real está configurado. A oficina só é ativada após a confirmação do pagamento.
                </p>
                {isDemoPaymentsEnvironment() ? (
                  <p className="text-xs">Neste ambiente, use a simulação abaixo para confirmar ou recusar o pagamento.</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <p className="text-sm font-bold text-[#0B1E36] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {contractSummary.planTitle}
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-2xl font-black text-[#0B1E36]">{contractSummary.firstYearAmount}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{contractSummary.firstYearLabel}</p>
                </div>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  Renovação: {contractSummary.renewalAmount} {contractSummary.renewalLabel.toLowerCase()}
                </p>
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
                Você poderá completar horários, serviços, imagens e demais informações no painel.
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Login do painel: CPF + senha cadastrados.
              </p>
            </section>
          )}

          {formError ? <p className="text-sm font-medium text-rose-700">{formError}</p> : null}

          {step < 6 && step !== 5 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  if (step === 1) {
                    onBackToOficinas();
                  } else {
                    setStep((current) => current - 1);
                  }
                }}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              {step >= 1 && step <= 3 && (
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
