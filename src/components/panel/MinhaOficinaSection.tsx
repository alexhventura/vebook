import React, { useState } from 'react';
import { listServiceCatalog, updateOfficeProfile, upsertServiceCatalog } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { workshopHost } from '../../lib/slug';
import { Office } from '../../types';
import { Field, inputClass } from '../ui/Field';
import { SectionTitle } from './shared';

export const MinhaOficinaSection: React.FC<{ office: Office; onViewPublicPage: (slug: string) => void }> = ({
  office,
  onViewPublicPage,
}) => {
  useOfficeStore();
  const catalog = listServiceCatalog(office.officeId);
  const [form, setForm] = useState({
    name: office.name,
    tradeName: office.tradeName ?? office.name,
    description: office.description,
    phone: office.phone,
    whatsapp: office.whatsapp,
    email: office.email ?? '',
    street: office.street,
    streetNumber: office.streetNumber,
    complement: office.complement ?? '',
    neighborhood: office.neighborhood ?? '',
    city: office.city,
    state: office.state,
    zipCode: office.zipCode ?? '',
    instagram: office.socialLinks?.instagram ?? '',
    facebook: office.socialLinks?.facebook ?? '',
    website: office.socialLinks?.website ?? '',
    weekdays: office.businessHoursDetail?.weekdays ?? '08:00 — 18:00',
    saturday: office.businessHoursDetail?.saturday ?? '08:00 — 13:00',
    sunday: office.businessHoursDetail?.sunday ?? 'Fechado',
    logoUrl: office.logoUrl ?? '',
    coverImageUrl: office.coverImageUrl ?? '',
  });
  const [saved, setSaved] = useState(false);

  return (
    <section className="space-y-4">
      <SectionTitle title="Minha oficina" subtitle="Identidade e conteúdo da página pública." />
      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[#0B1E36] font-bold">{workshopHost(office.slug)}</p>
          <p className={office.status === 'active' && office.publicVisible ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
            {office.status === 'active' && office.publicVisible ? 'Página pública ativa' : 'Página pública indisponível'}
          </p>
        </div>
        <button type="button" onClick={() => onViewPublicPage(office.slug)} className="px-4 py-2 rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer">
          Ver página pública
        </button>
      </div>

      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const publicServices = catalog
            .filter((row) => row.status === 'active' && row.publicVisible)
            .map((row, index) => ({
              id: row.id,
              title: row.name,
              category: row.category || 'Serviços',
              shortDescription: row.description || row.name,
              estimatedTime: row.durationMinutes ? `${row.durationMinutes} min` : undefined,
              featured: index < 3,
            }));
          updateOfficeProfile(office.officeId, {
            name: form.name,
            tradeName: form.tradeName,
            description: form.description,
            phone: form.phone,
            whatsapp: form.whatsapp,
            email: form.email || undefined,
            street: form.street,
            streetNumber: form.streetNumber,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
            logoUrl: form.logoUrl || undefined,
            coverImageUrl: form.coverImageUrl || undefined,
            socialLinks: {
              ...office.socialLinks,
              instagram: form.instagram || undefined,
              facebook: form.facebook || undefined,
              website: form.website || undefined,
            },
            businessHoursDetail: {
              weekdays: form.weekdays,
              saturday: form.saturday,
              sunday: form.sunday,
            },
            businessHours: `Seg–Sex ${form.weekdays} · Sáb ${form.saturday}`,
            servicesList: publicServices.length ? publicServices : office.servicesList,
          });
          setSaved(true);
        }}
      >
        <Field label="Nome"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Nome fantasia"><input className={inputClass} value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} /></Field>
        <Field label="Logo (URL)" optional><input className={inputClass} value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} /></Field>
        <Field label="Capa (URL)" optional><input className={inputClass} value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} /></Field>
        <Field label="Descrição">
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <Field label="Telefone"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
          <Field label="E-mail público" optional><input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        </div>
        <Field label="Rua"><input className={inputClass} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></Field>
        <Field label="Número"><input className={inputClass} value={form.streetNumber} onChange={(e) => setForm({ ...form, streetNumber: e.target.value })} /></Field>
        <Field label="Bairro"><input className={inputClass} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></Field>
        <Field label="Cidade"><input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="UF"><input className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
        <Field label="CEP"><input className={inputClass} value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} /></Field>
        <Field label="Seg–Sex"><input className={inputClass} value={form.weekdays} onChange={(e) => setForm({ ...form, weekdays: e.target.value })} /></Field>
        <Field label="Sábado"><input className={inputClass} value={form.saturday} onChange={(e) => setForm({ ...form, saturday: e.target.value })} /></Field>
        <Field label="Domingo"><input className={inputClass} value={form.sunday} onChange={(e) => setForm({ ...form, sunday: e.target.value })} /></Field>
        <Field label="Instagram" optional><input className={inputClass} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></Field>
        <Field label="Facebook" optional><input className={inputClass} value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></Field>
        <Field label="Site" optional><input className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Salvar alterações</button>
        {saved ? <p className="sm:col-span-2 text-sm text-emerald-700 font-bold">Página pública atualizada.</p> : null}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="font-extrabold text-[#0B1E36]">Serviços na página pública</h3>
        <p className="text-sm text-slate-600">Selecione quais serviços do catálogo aparecem publicamente.</p>
        {catalog.length === 0 ? <p className="text-sm text-slate-500">Cadastre serviços na aba Serviços.</p> : null}
        {catalog.map((row) => (
          <label key={row.id} className="flex items-center justify-between gap-3 text-sm border-b border-slate-100 pb-2">
            <span>{row.name}</span>
            <input
              type="checkbox"
              checked={row.publicVisible && row.status === 'active'}
              onChange={(e) => upsertServiceCatalog(office.officeId, {
                ...row,
                publicVisible: e.target.checked,
                status: e.target.checked ? 'active' : row.status,
              })}
            />
          </label>
        ))}
      </div>
    </section>
  );
};
