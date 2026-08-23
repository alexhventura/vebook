import { defaultOfficeHours, SERVICE_CATALOG } from './constants';
import { OnboardingDraft } from './types';

export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    identification: {
      legalName: '',
      tradeName: '',
      cnpj: '',
      responsibleName: '',
      responsibleCpf: '',
      email: '',
      phone: '',
      secondaryPhone: '',
    },
    address: {
      zipCode: '',
      state: 'SP',
      city: '',
      neighborhood: '',
      street: '',
      number: '',
      complement: '',
      reference: '',
    },
    identity: {
      publicName: '',
      slogan: '',
      description: '',
    },
    services: SERVICE_CATALOG.map((item) => ({
      catalogKey: item.key,
      name: item.name,
      description: '',
      price: '',
      durationMinutes: '',
      active: ['oleo', 'freios', 'suspensao', 'revisao'].includes(item.key),
      custom: false,
    })),
    hours: defaultOfficeHours(),
    acceptsOnlineBooking: true,
    minAdvanceHours: 4,
    slotIntervalMinutes: 30,
    hostname: '',
    access: {
      email: '',
      cpf: '',
      password: '',
      confirmPassword: '',
    },
    termsAccepted: false,
  };
}
