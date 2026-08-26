import React, { useEffect, useState } from 'react';
import {
  defaultPermissionsForJobRole,
  getConsent,
  getSubscription,
  listPayments,
  listTeamMembers,
  removeTeamMemberAccess,
  updateOfficeProfile,
  upsertTeamMember,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { formatCpf } from '../../lib/cpf';
import { formatPhone } from '../../lib/phone';
import { normalizeThemeColor } from '../../lib/themeColor';
import { workshopHost } from '../../lib/slug';
import { planLabel, planPricingFootnote, planSummaryLines } from '../../data/officePlans';
import { Office, OfficeUser, PanelModule, TeamJobRole } from '../../types';
import { Field, inputClass } from '../ui/Field';
import { ThemeColorPicker } from '../ui/ThemeColorPicker';
import { SectionTitle, formatIsoDate } from './shared';

type ConfigTab = 'conta' | 'equipe' | 'assinatura' | 'privacidade' | 'pagina-publica';

const TAB_LABELS: Record<ConfigTab, string> = {
  conta: 'Conta',
  equipe: 'Equipe e permissões',
  assinatura: 'Assinatura',
  privacidade: 'Privacidade',
  'pagina-publica': 'Página pública',
};

const JOB_ROLE_LABEL: Record<TeamJobRole, string> = {
  owner: 'Proprietário',
  manager: 'Gerente',
  attendant: 'Atendente',
  mechanic: 'Mecânico',
  custom: 'Personalizado',
};

const MODULE_LABEL: Partial<Record<PanelModule, string>> = {
  inicio: 'Início',
  atendimentos: 'Atendimentos',
  agenda: 'Agenda',
  clientes: 'Clientes',
  veiculos: 'Veículos',
  servicos: 'Serviços',
  produtos: 'Produtos',
  financeiro: 'Financeiro',
  'minha-oficina': 'Minha oficina',
  perfil: 'Perfil',
  configuracoes: 'Configurações',
};

export const ConfiguracoesSection: React.FC<{
  office: Office;
  user: OfficeUser;
  initialTab?: ConfigTab;
}> = ({ office, user, initialTab = 'conta' }) => {
  useOfficeStore();
  const [tab, setTab] = useState<ConfigTab>(initialTab);
  const subscription = getSubscription(office.officeId);
  const consent = getConsent(office.officeId);
  const payments = listPayments(office.officeId);
  const team = listTeamMembers(office.officeId);

  const [formError, setFormError] = useState('');
  const [formBusy, setFormBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobRole, setJobRole] = useState<TeamJobRole>('attendant');
  const [jobTitle, setJobTitle] = useState('');
  const [memberStatus, setMemberStatus] = useState<'active' | 'inactive'>('active');
  const [themeColor, setThemeColor] = useState(() => normalizeThemeColor(office.themeColor));
  const [themeSaved, setThemeSaved] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setThemeColor(normalizeThemeColor(office.themeColor));
    setThemeSaved(false);
  }, [office.officeId, office.themeColor]);

  const resetForm = () => {
    setEditingId(null);
    setFullName('');
    setCpf('');
    setPhone('');
    setEmail('');
    setJobRole('attendant');
    setJobTitle('');
    setMemberStatus('active');
    setFormError('');
  };

  const startEdit = (member: OfficeUser) => {
    setEditingId(member.id);
    setFullName(member.fullName);
    setCpf(member.cpf);
    setPhone(member.phone);
    setEmail(member.email);
    setJobRole(member.jobRole ?? 'custom');
    setJobTitle(member.jobTitle || '');
    setMemberStatus(member.status ?? 'active');
    setFormError('');
  };

  const submitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormBusy(true);
    setFormError('');
    try {
      await upsertTeamMember(office.officeId, {
        id: editingId || undefined,
        fullName,
        cpf: editingId ? undefined : cpf,
        phone,
        email,
        jobRole,
        jobTitle,
        status: memberStatus,
        permissions: defaultPermissionsForJobRole(jobRole),
      });
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o membro.');
    } finally {
      setFormBusy(false);
    }
  };

  const isOwner = user.role === 'owner';

  return (
    <section className="space-y-4">
      <SectionTitle title="Configurações" subtitle="Conta, equipe, assinatura, privacidade e página pública." />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as ConfigTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              tab === key ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200'
            }`}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {tab === 'conta' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Conta</h3>
          <p>Usuário: {user.fullName}</p>
          <p>E-mail: {user.email}</p>
          <p>Oficina: {office.name} (office_id: {office.officeId})</p>
          <p>Segurança: senha gerenciada em Perfil. Sessão local do protótipo com validade de 12 horas.</p>
          <p className="text-xs text-slate-500">Alterações críticas de proprietário e assinatura exigem autorização do administrador principal.</p>
        </div>
      ) : null}

      {tab === 'equipe' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
            <h3 className="font-extrabold text-[#0B1E36]">Equipe e permissões</h3>
            <p className="text-slate-600">
              Função administrativa dentro de Configurações. Membros vinculados ao office_id da oficina. Permissões granulares por módulo conforme a função.
            </p>
            {!isOwner ? (
              <p className="text-amber-800 text-xs">Somente o proprietário pode administrar a equipe neste protótipo.</p>
            ) : null}
          </div>

          {isOwner ? (
            <form className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={(e) => void submitMember(e)}>
              <Field label="Nome">
                <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Field>
              <Field label="CPF" optional={Boolean(editingId)}>
                <input className={inputClass} value={formatCpf(cpf)} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} disabled={Boolean(editingId)} required={!editingId} />
              </Field>
              <Field label="E-mail"><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Telefone"><input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="Função">
                <select className={inputClass} value={jobRole} onChange={(e) => setJobRole(e.target.value as TeamJobRole)}>
                  {(Object.keys(JOB_ROLE_LABEL) as TeamJobRole[]).filter((role) => role !== 'owner').map((role) => (
                    <option key={role} value={role}>{JOB_ROLE_LABEL[role]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Título exibido" optional><input className={inputClass} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Ex.: Mecânico sênior" /></Field>
              <Field label="Status">
                <select className={inputClass} value={memberStatus} onChange={(e) => setMemberStatus(e.target.value as 'active' | 'inactive')}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </Field>
              {formError ? <p className="sm:col-span-2 text-sm text-rose-700">{formError}</p> : null}
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <button type="submit" disabled={formBusy} className="rounded-xl bg-[#0B1E36] text-white font-bold text-sm px-4 py-2.5 cursor-pointer disabled:opacity-60">
                  {editingId ? 'Salvar membro' : 'Adicionar membro'}
                </button>
                {editingId ? (
                  <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 font-bold text-sm px-4 py-2.5 cursor-pointer">Cancelar</button>
                ) : null}
              </div>
            </form>
          ) : null}

          <div className="bg-white rounded-2xl border border-slate-200 divide-y">
            {team.map((member) => (
              <article key={member.id} className="px-4 py-4 text-sm space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#0B1E36]">{member.fullName}</p>
                    <p className="text-slate-600">{member.jobTitle || JOB_ROLE_LABEL[member.jobRole ?? 'custom']}</p>
                    <p className="text-slate-500">{member.email} · {member.phone ? formatPhone(member.phone) : '—'}</p>
                    <p className="text-xs text-slate-500">CPF: {formatCpf(member.cpf)} · Status: {member.status === 'inactive' ? 'Inativo' : 'Ativo'}</p>
                  </div>
                  {isOwner && member.role !== 'owner' ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(member)} className="text-xs font-bold text-sky-800 cursor-pointer">Editar</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remover acesso de ${member.fullName}?`)) {
                            removeTeamMemberAccess(office.officeId, member.id);
                          }
                        }}
                        className="text-xs font-bold text-rose-700 cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(member.permissions ?? defaultPermissionsForJobRole(member.jobRole ?? 'custom')).map(([mod, allowed]) => (
                    <span
                      key={mod}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${allowed ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {MODULE_LABEL[mod as PanelModule] ?? mod}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'assinatura' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Assinatura</h3>
          {subscription ? (
            <>
              <p className="font-bold">{planLabel(subscription.modality)}</p>
              {planSummaryLines(subscription.modality).map((line) => <p key={line} className="text-slate-600">{line}</p>)}
              <p>Valor contratado nesta adesão: {formatBRL(subscription.contractedAmount)}</p>
              <p>Status: {subscription.status}</p>
              <p>Contratação: {formatIsoDate(subscription.createdAt)}</p>
              <p>Próxima renovação: {subscription.renewsAt ? formatIsoDate(subscription.renewsAt) : 'conforme ciclo do plano'}</p>
              <p className="text-xs text-slate-500">{planPricingFootnote()}</p>
            </>
          ) : (
            <p className="text-slate-600">Nenhuma assinatura local registrada para esta oficina seed.</p>
          )}
          {payments.length > 0 ? (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <p className="font-bold">Pagamentos (mock)</p>
              {payments.map((payment) => (
                <p key={payment.id}>{formatIsoDate(payment.createdAt)} · {formatBRL(payment.amount)} · {payment.status}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'privacidade' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Privacidade</h3>
          {consent ? (
            <>
              <p>Termos aceitos em {formatIsoDate(consent.termsAcceptedAt)}</p>
              <p>Política de privacidade aceita em {formatIsoDate(consent.privacyAcceptedAt)}</p>
              <p>Condições comerciais aceitas em {formatIsoDate(consent.commercialAcceptedAt)}</p>
            </>
          ) : (
            <p className="text-slate-600">Consentimentos do fluxo de adesão aparecerão aqui quando a oficina tiver sido cadastrada pelo portal.</p>
          )}
        </div>
      ) : null}

      {tab === 'pagina-publica' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-4">
          <h3 className="font-extrabold text-[#0B1E36]">Página pública</h3>
          <p className="font-mono">{workshopHost(office.slug)}</p>
          <p>Visibilidade: {office.status === 'active' && office.publicVisible ? 'ativa' : 'indisponível'}</p>
          <p>Slug: {office.slug}</p>
          <ThemeColorPicker
            id="config-theme-color"
            value={themeColor}
            onChange={(next) => {
              setThemeColor(next);
              setThemeSaved(false);
            }}
            hint="Cor da tarja, botões e bordas do site público. Escolha no espectro; a alteração vale após salvar."
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-[#0B1E36] text-white font-bold text-sm px-4 py-2.5 cursor-pointer"
              onClick={() => {
                updateOfficeProfile(office.officeId, { themeColor: normalizeThemeColor(themeColor) });
                setThemeSaved(true);
              }}
            >
              Salvar cor da página
            </button>
            {themeSaved ? <p className="text-sm text-emerald-700 font-bold">Cor atualizada.</p> : null}
          </div>
          <p className="text-xs text-slate-500">Demais dados de identidade e serviços públicos ficam em Minha oficina.</p>
        </div>
      ) : null}
    </section>
  );
};
