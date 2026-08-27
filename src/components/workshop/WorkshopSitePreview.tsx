import React from 'react';
import { Clock, Globe, MapPin, MessageSquare, Phone, Share2 } from 'lucide-react';
import { SignupDraft } from '../../types';
import { contrastTextOn, normalizeThemeColor } from '../../lib/themeColor';
import { workshopHost } from '../../lib/slug';
import { formatPhone } from '../../lib/phone';

const WEEKDAY_LABELS: Array<{ key: keyof SignupDraft['site']['hours']; label: string }> = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1400&q=80';

interface WorkshopSitePreviewProps {
  draft: SignupDraft;
  suggestedSlug: string;
}

export const WorkshopSitePreview: React.FC<WorkshopSitePreviewProps> = ({ draft, suggestedSlug }) => {
  const slug = draft.site.slug || suggestedSlug;
  const displayName = draft.site.displayName.trim() || draft.office.name.trim() || 'Nome da oficina';
  const subtitle =
    draft.site.subtitle.trim() || 'Descrição curta que aparece abaixo do nome no site da oficina.';
  const themeHex = normalizeThemeColor(draft.site.themeColor);
  const themeOn = contrastTextOn(themeHex);
  const themeSolid = { backgroundColor: themeHex, color: themeOn } as const;
  const themeAccent = { color: themeHex } as const;
  const themeBorder = { borderColor: themeHex } as const;
  const themeDot = { backgroundColor: themeHex } as const;
  const services = draft.site.services.map((item) => item.trim()).filter(Boolean);
  const contactPhone = draft.site.contactPhone || draft.office.phone;
  const contactEmail = draft.site.contactEmail || draft.owner.email;
  const socialEntries = [
    { label: 'Instagram', value: draft.site.socialLinks.instagram },
    { label: 'Facebook', value: draft.site.socialLinks.facebook },
    { label: 'YouTube', value: draft.site.socialLinks.youtube },
    { label: 'TikTok', value: draft.site.socialLinks.tiktok },
    { label: 'Site', value: draft.site.socialLinks.website },
  ].filter((item) => item.value?.trim());

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F1F5F9] overflow-hidden shadow-inner">
      <div className="bg-[#071526] text-white text-[10px] px-3 py-2 flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-sky-300 truncate">{workshopHost(slug)}</span>
        <span className="text-slate-400 shrink-0">Prévia ao vivo</span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-900">
            <img
              src={draft.site.photoUrl.trim() || DEFAULT_COVER}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_COVER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3" style={themeSolid}>
              <h3 className="text-lg sm:text-xl font-black leading-tight">{displayName}</h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{subtitle}</p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm"
              style={themeSolid}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Contato
            </button>

            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl border-2 bg-white p-3 space-y-2" style={themeBorder}>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide" style={themeAccent}>
                  <MapPin className="w-4 h-4" />
                  Endereço
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {draft.office.address.trim() || 'Endereço da oficina'}
                </p>
              </div>

              <div className="rounded-xl border-2 bg-white p-3 space-y-2" style={themeBorder}>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide" style={themeAccent}>
                  <Phone className="w-4 h-4" />
                  Contato
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-extrabold" style={themeAccent}>Telefone: </span>
                    <span className="font-bold text-slate-900">
                      {contactPhone ? formatPhone(contactPhone) : '—'}
                    </span>
                  </p>
                  <p>
                    <span className="font-extrabold" style={themeAccent}>E-mail: </span>
                    <span className="font-bold text-slate-900 break-all">{contactEmail || '—'}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border-2 bg-white p-3 space-y-2" style={themeBorder}>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide" style={themeAccent}>
                  <Clock className="w-4 h-4" />
                  Horário
                </div>
                <div className="space-y-1 text-xs">
                  {WEEKDAY_LABELS.map((day) => (
                    <div key={day.key} className="flex justify-between gap-2">
                      <span className="font-extrabold text-slate-800">{day.label}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {draft.site.hours[day.key] || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {socialEntries.length > 0 ? (
                <div className="rounded-xl border-2 bg-white p-3 space-y-2" style={themeBorder}>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide" style={themeAccent}>
                    <Share2 className="w-4 h-4" />
                    Redes
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {socialEntries.map((item) => (
                      <span
                        key={item.label}
                        className="px-2 py-1 rounded-md border text-[10px] font-extrabold text-slate-900"
                        style={themeBorder}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border-2 bg-white p-3 space-y-2" style={themeBorder}>
              <div className="text-xs font-extrabold uppercase tracking-wide" style={themeAccent}>
                Serviços
              </div>
              {services.length > 0 ? (
                <ul className="space-y-2">
                  {services.map((item) => (
                    <li key={item} className="flex gap-2 text-sm font-extrabold text-slate-900">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={themeDot} aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-bold text-slate-500">Adicione os serviços oferecidos pela oficina.</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Powered by VEBOOK
              </span>
              <span className="font-mono">{themeHex}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
