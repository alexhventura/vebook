import { Workshop, WorkshopServiceItem } from '../types';
import { displayOfficeHost } from './constants';
import { WEEKDAY_KEYS, WEEKDAY_LABELS } from './constants';
import { Office, OfficeHours, OfficeService } from './types';

function hoursSummary(hours: OfficeHours): string {
  const weekdaysOn = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].every(
    (key) => hours[key as keyof OfficeHours].enabled
  );
  const weekday = hours.monday;
  const parts: string[] = [];
  if (weekdaysOn && weekday.enabled) {
    parts.push(`Seg — Sex: ${weekday.open} — ${weekday.close}`);
  } else {
    WEEKDAY_KEYS.slice(0, 5).forEach((key) => {
      const day = hours[key];
      if (day.enabled) parts.push(`${WEEKDAY_LABELS[key].slice(0, 3)}: ${day.open} — ${day.close}`);
    });
  }
  if (hours.saturday.enabled) parts.push(`Sábado: ${hours.saturday.open} — ${hours.saturday.close}`);
  if (hours.sunday.enabled) parts.push(`Domingo: ${hours.sunday.open} — ${hours.sunday.close}`);
  return parts.join(' | ') || 'Horário não informado';
}

export function officeToWorkshop(office: Office, services: OfficeService[]): Workshop {
  const active = services.filter((item) => item.active);
  const list: WorkshopServiceItem[] = active.map((item) => ({
    id: item.id,
    title: item.name,
    category: item.name,
    shortDescription: item.description || item.name,
    detailedDescription: item.description,
    estimatedTime: item.durationMinutes ? `${item.durationMinutes} min` : undefined,
    featured: true,
  }));

  return {
    id: office.id,
    name: office.identity.publicName,
    subdomain: displayOfficeHost(office.currentHostname),
    logoUrl: office.identity.logoDataUrl,
    slogan: office.identity.slogan,
    themeColor: 'amber',
    coverImageUrl: office.identity.coverDataUrl,
    city: office.address.city,
    state: office.address.state,
    address: `${office.address.street}, ${office.address.number}`,
    neighborhood: office.address.neighborhood,
    zipCode: office.address.zipCode,
    phone: office.phone,
    whatsapp: office.phone,
    email: office.email,
    businessHours: hoursSummary(office.hours),
    businessHoursDetail: {
      weekdays: office.hours.monday.enabled
        ? `${office.hours.monday.open} — ${office.hours.monday.close}`
        : 'Fechado',
      saturday: office.hours.saturday.enabled
        ? `${office.hours.saturday.open} — ${office.hours.saturday.close}`
        : 'Fechado',
      sunday: office.hours.sunday.enabled
        ? `${office.hours.sunday.open} — ${office.hours.sunday.close}`
        : 'Fechado',
    },
    socialLinks: office.social,
    specialties: active.map((item) => item.name),
    servicesList: list,
    aboutHistory: office.identity.description,
    totalServicesRegistered: 0,
    validationRate: 0,
    certifiedSince: office.publishedAt,
    description: office.identity.description || office.identity.slogan || '',
    credentialStatus: 'credenciada',
  };
}
