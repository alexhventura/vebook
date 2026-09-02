import React, { useEffect, useState } from 'react';
import { listAppointments, updateAppointment } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { AppointmentStatus } from '../../types';
import { formatPhone } from '../../lib/phone';
import { RetornosPanel } from './RetornosSection';
import { SectionTitle, APPOINTMENT_STATUS_LABEL, formatIsoDate } from './shared';

const ACTIONS: AppointmentStatus[] = ['requested', 'confirmed', 'reschedule', 'cancelled', 'completed'];

type AgendaTab = 'agendamentos' | 'retornos';

export const AgendaSection: React.FC<{ officeId: string; initialTab?: AgendaTab }> = ({ officeId, initialTab = 'agendamentos' }) => {
  useOfficeStore();
  const [tab, setTab] = useState<AgendaTab>(initialTab);
  const rows = listAppointments(officeId).slice().sort((a, b) => (b.date || b.createdAt).localeCompare(a.date || a.createdAt));
  const [filter, setFilter] = useState<AppointmentStatus | ''>('');

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const visible = filter ? rows.filter((row) => row.status === filter) : rows;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Agenda"
        subtitle="Agendamentos e retornos internos."
      />

      <div className="flex flex-wrap gap-2">
        {([
          ['agendamentos', 'Agendamentos'],
          ['retornos', 'Retornos'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${
              tab === key ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'retornos' ? (
        <RetornosPanel officeId={officeId} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${!filter ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200'}`}>Todos</button>
            {ACTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filter === status ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200'}`}
              >
                {APPOINTMENT_STATUS_LABEL[status]}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y">
            {visible.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhuma solicitação.</p> : null}
            {visible.map((row) => (
              <article key={row.id} className="px-4 py-4 text-sm space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#0B1E36]">{row.customerName}</p>
                    <p className="text-slate-600">{row.service || 'Serviço não informado'}</p>
                    <p className="text-slate-500">
                      {formatIsoDate(row.date)}
                      {row.time ? ` — ${row.time}` : row.period ? ` — ${row.period}` : ''}
                      {row.plate ? ` · ${row.plate}` : ''}
                    </p>
                    <p className="text-xs text-slate-500">Contato cadastrado: {formatPhone(row.phone)} · a oficina usa seus próprios meios</p>
                    {row.notes ? <p className="text-xs text-slate-500">{row.notes}</p> : null}
                  </div>
                  <span className="text-xs font-bold">{APPOINTMENT_STATUS_LABEL[row.status]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACTIONS.filter((status) => status !== row.status).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateAppointment(officeId, row.id, { status })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold cursor-pointer"
                    >
                      {APPOINTMENT_STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
