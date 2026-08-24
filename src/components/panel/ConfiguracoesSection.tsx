import React from 'react';
import { getConsent, getSubscription, listPayments } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { workshopHost } from '../../lib/slug';
import { planLabel, planSummaryLines } from '../../data/officePlans';
import { Office, OfficeUser } from '../../types';
import { SectionTitle, formatIsoDate } from './shared';

export const ConfiguracoesSection: React.FC<{ office: Office; user: OfficeUser }> = ({ office, user }) => {
  useOfficeStore();
  const subscription = getSubscription(office.officeId);
  const consent = getConsent(office.officeId);
  const payments = listPayments(office.officeId);

  return (
    <section className="space-y-4">
      <SectionTitle title="Configurações" subtitle="Área administrativa da conta. Sem depósito de funcionalidades laterais." />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
        <h3 className="font-extrabold text-[#0B1E36]">Conta</h3>
        <p>Usuário: {user.fullName}</p>
        <p>E-mail: {user.email}</p>
        <p>Segurança: senha gerenciada em Perfil. Sessão local do protótipo com validade de 12 horas.</p>
      </div>

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
            <p className="text-xs text-slate-500">O painel não altera valores comerciais arbitrariamente.</p>
          </>
        ) : (
          <p className="text-slate-600">Nenhuma assinatura local registrada para esta oficina seed. Oficinas cadastradas pelo fluxo de adesão exibem o plano contratado.</p>
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

      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
        <h3 className="font-extrabold text-[#0B1E36]">Página pública</h3>
        <p className="font-mono">{workshopHost(office.slug)}</p>
        <p>Visibilidade: {office.status === 'active' && office.publicVisible ? 'ativa' : 'indisponível'}</p>
        <p>Slug: {office.slug}</p>
      </div>
    </section>
  );
};
