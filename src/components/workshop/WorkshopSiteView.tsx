import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Globe, 
  ExternalLink, 
  Share2, 
  X, 
  ChevronRight,
} from 'lucide-react';
import { Logo } from '../layout/Logo';
import { getOfficeBySlug, listWorkshopsForPublicSite, toPublicWorkshop } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { contrastTextOn, normalizeThemeColor } from '../../lib/themeColor';
import { AppView } from '../../types';

interface WorkshopSiteViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate?: (plate: string) => void;
  initialWorkshopId?: string;
  workshopSlug?: string;
  onOpenPanel?: (slug: string) => void;
}

export const WorkshopSiteView: React.FC<WorkshopSiteViewProps> = ({
  onNavigate,
  onSearchPlate: _onSearchPlate,
  initialWorkshopId = 'ws-prisma',
  workshopSlug,
  onOpenPanel,
}) => {
  useOfficeStore();
  const publicWorkshops = listWorkshopsForPublicSite();
  const officeFromSlug = workshopSlug ? getOfficeBySlug(workshopSlug) : undefined;
  const [currentWorkshopId, setCurrentWorkshopId] = useState<string>(
    officeFromSlug?.id || initialWorkshopId,
  );
  const [activeTabNav, setActiveTabNav] = useState<'inicio' | 'servicos' | 'localizacao' | 'contato'>('inicio');

  const [mapModalOpen, setMapModalOpen] = useState(false);

  const workshop =
    (officeFromSlug ? toPublicWorkshop(officeFromSlug) : undefined) ||
    publicWorkshops.find((item) => item.id === currentWorkshopId) ||
    publicWorkshops[0];

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">
        Oficina não encontrada ou ainda não publicada.
      </div>
    );
  }

  const themeHex = normalizeThemeColor(workshop.themeColor);
  const themeOn = contrastTextOn(themeHex);
  const themeAccent = { color: themeHex } as const;
  const themeBorder = { borderColor: themeHex } as const;
  const themeSolid = { backgroundColor: themeHex, color: themeOn } as const;
  const themeDot = { backgroundColor: themeHex } as const;

  const handleWorkshopChange = (id: string) => {
    setCurrentWorkshopId(id);
  };

  const scrollToSection = (sectionId: string, tabName: typeof activeTabNav) => {
    setActiveTabNav(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /** Texto dos serviços — sem cards de catálogo */
  const serviceTextItems =
    workshop.servicesList && workshop.servicesList.length > 0
      ? workshop.servicesList.map((item) => item.title)
      : workshop.specialties && workshop.specialties.length > 0
        ? workshop.specialties
        : [];

  const cardShell = 'bg-white p-5 sm:p-6 rounded-2xl border-2 shadow-2xs space-y-3';
  const cardTitle = 'flex items-center gap-2.5 text-sm sm:text-base font-extrabold uppercase tracking-wider';
  const cardBody = 'text-base sm:text-lg font-bold text-slate-900 leading-snug';
  const cardMeta = 'text-sm font-bold text-slate-700';

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Cabeçalho VEBOOK — rente ao topo */}
      <header className="sticky top-0 z-50 bg-[#0B1E36] border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40 rounded-vebook-sm"
            aria-label="VEBOOK Início"
          >
            <Logo size="md" variant="light" />
          </button>
        </div>
      </header>

      {/* Controles de demonstração (abaixo do cabeçalho, sem empurrar a foto) */}
      <div className="bg-[#071526] text-white text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-sky-300">
              https://{workshop.subdomain}
            </span>
            <span className="hidden sm:inline text-slate-400 font-light">
              — Demonstração do site da oficina
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
              <span className="text-[11px] text-slate-300 hidden md:inline">Oficina Demo:</span>
              <select
                value={currentWorkshopId}
                onChange={(e) => handleWorkshopChange(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {publicWorkshops.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#0B1E36] text-white">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700"
              title={`Cor cadastrada: ${themeHex}`}
            >
              <span className="text-[11px] text-slate-400 hidden lg:inline">Cor da oficina:</span>
              <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white/80 shrink-0" style={themeDot} />
              <span className="font-mono text-[11px] text-slate-300">{themeHex}</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-[11px] font-bold text-sky-300 hover:text-white flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 px-2.5 py-1 rounded border border-sky-800 transition-colors cursor-pointer"
            >
              <span>Portal VEBOOK</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        <main className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">

          {/* Foto da oficina — nome na tarja personalizada sobre a imagem */}
          <section id="sec-hero" className="relative">
            <div className="relative aspect-[16/9] sm:aspect-[2.2/1] bg-slate-900 overflow-hidden">
              <img
                src={workshop.coverImageUrl || 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1400&q=80'}
                alt={workshop.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Tarja personalizada com o nome da oficina */}
              <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 py-4 sm:py-5" style={themeSolid}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  {workshop.name}
                </h1>
              </div>
            </div>
          </section>

          {/* Dados da oficina — abaixo da foto */}
          <section className="p-6 sm:p-8 space-y-5 border-b border-slate-100">
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              {workshop.description}
            </p>
            <a
              href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20${encodeURIComponent(workshop.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-md cursor-pointer hover:opacity-90"
              style={themeSolid}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contato</span>
            </a>
          </section>

          {/* 3. GRID ESTRUTURADO DE INFORMAÇÕES (ENDEREÇO, CONTATO, REDES, HORÁRIO) */}
          <section id="sec-localizacao" className="p-6 sm:p-8 bg-slate-50/70 border-y border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Endereço */}
              <div className={cardShell} style={themeBorder}>
                <div className={cardTitle} style={themeAccent}>
                  <MapPin className="w-5 h-5" />
                  <span>Endereço</span>
                </div>

                <div className="space-y-1">
                  <p className={cardBody}>
                    {workshop.address} {workshop.neighborhood ? `— ${workshop.neighborhood}` : ''}
                  </p>
                  <p className={cardMeta}>
                    {workshop.city}/{workshop.state} {workshop.zipCode ? `· CEP ${workshop.zipCode}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMapModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-extrabold hover:underline cursor-pointer pt-1"
                  style={themeAccent}
                >
                  <span>Ver no mapa e rotas</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Contato */}
              <div className={cardShell} style={themeBorder}>
                <div className={cardTitle} style={themeAccent}>
                  <Phone className="w-5 h-5" />
                  <span>Contato Direto</span>
                </div>

                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center justify-between gap-3 py-1 border-b border-slate-100">
                    <span className="font-extrabold shrink-0" style={themeAccent}>Telefone:</span>
                    <a href={`tel:${workshop.phone.replace(/\D/g, '')}`} className="font-extrabold text-slate-900 hover:opacity-80 text-right">
                      {workshop.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1 border-b border-slate-100">
                    <span className="font-extrabold shrink-0" style={themeAccent}>WhatsApp:</span>
                    <a 
                      href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold hover:underline flex items-center gap-1.5 text-right"
                      style={themeAccent}
                    >
                      <span>{workshop.whatsapp}</span>
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                  {workshop.email && (
                    <div className="flex items-center justify-between gap-3 py-1">
                      <span className="font-extrabold shrink-0" style={themeAccent}>E-mail:</span>
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base text-right break-all">{workshop.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Redes da Oficina */}
              <div className={cardShell} style={themeBorder}>
                <div className={cardTitle} style={themeAccent}>
                  <Share2 className="w-5 h-5" />
                  <span>Redes da Oficina</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {workshop.socialLinks?.instagram && (
                    <a
                      href={workshop.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-white hover:opacity-90 border-2 text-slate-900 text-sm font-extrabold flex items-center gap-1.5 transition-colors"
                      style={themeBorder}
                    >
                      <span>Instagram</span>
                    </a>
                  )}
                  {workshop.socialLinks?.facebook && (
                    <a
                      href={workshop.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-white hover:opacity-90 border-2 text-slate-900 text-sm font-extrabold flex items-center gap-1.5 transition-colors"
                      style={themeBorder}
                    >
                      <span>Facebook</span>
                    </a>
                  )}
                  {workshop.socialLinks?.youtube && (
                    <a
                      href={workshop.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-white hover:opacity-90 border-2 text-slate-900 text-sm font-extrabold flex items-center gap-1.5 transition-colors"
                      style={themeBorder}
                    >
                      <span>YouTube</span>
                    </a>
                  )}
                  {workshop.socialLinks?.tiktok && (
                    <a
                      href={workshop.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-white hover:opacity-90 border-2 text-slate-900 text-sm font-extrabold flex items-center gap-1.5 transition-colors"
                      style={themeBorder}
                    >
                      <span>TikTok</span>
                    </a>
                  )}
                  <a
                    href={`https://${workshop.subdomain}`}
                    className="px-3.5 py-2 rounded-lg bg-white hover:opacity-90 border-2 text-slate-900 text-sm font-extrabold flex items-center gap-1.5 transition-colors"
                    style={themeBorder}
                  >
                    <Globe className="w-4 h-4" style={themeAccent} />
                    <span>Site Oficial</span>
                  </a>
                </div>
              </div>

              {/* Card 4: Horário de Funcionamento */}
              <div className={cardShell} style={themeBorder}>
                <div className={cardTitle} style={themeAccent}>
                  <Clock className="w-5 h-5" />
                  <span>Horário de Funcionamento</span>
                </div>

                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between items-center gap-3 py-0.5">
                    <span className="font-extrabold text-slate-800">Segunda — Sexta</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {workshop.businessHoursDetail?.weekdays || '08:00 — 18:00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 py-0.5">
                    <span className="font-extrabold text-slate-800">Sábado</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {workshop.businessHoursDetail?.saturday || '08:00 — 13:00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 py-0.5">
                    <span className="font-extrabold text-slate-800">Domingo</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {workshop.businessHoursDetail?.sunday || 'Fechado'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 4. SERVIÇOS — texto dos itens realizados */}
          <section id="sec-servicos" className="p-6 sm:p-8 space-y-5">
            <div className="space-y-2">
              <span className="text-sm font-extrabold uppercase tracking-wider block" style={themeAccent}>
                Serviços
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Serviços realizados pela oficina
              </h3>
            </div>

            <div className="rounded-2xl border-2 bg-white p-5 sm:p-6 shadow-2xs" style={themeBorder}>
              {serviceTextItems.length > 0 ? (
                <ul className="space-y-3">
                  {serviceTextItems.map((item) => (
                    <li key={item} className="flex gap-3 text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full" style={themeDot} aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base font-bold text-slate-600 leading-relaxed">
                  A oficina ainda não publicou a lista de serviços. Em breve os itens realizados aparecerão neste espaço.
                </p>
              )}
            </div>
          </section>

          {/* 7. RODAPÉ INSTITUCIONAL DO SITE DA OFICINA */}
          <footer className="bg-slate-900 text-slate-400 p-6 sm:p-8 space-y-6 text-xs border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={themeSolid}>
                  {workshop.name.charAt(0)}
                </div>
                <div>
                  <strong className="text-white block font-bold text-sm">{workshop.name}</strong>
                  <span className="text-[11px] text-slate-400">{workshop.city}/{workshop.state}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <button
                  onClick={() => scrollToSection('sec-hero', 'inicio')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('sec-servicos', 'servicos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Serviços
                </button>
                <button
                  onClick={() => scrollToSection('sec-localizacao', 'localizacao')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Localização
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
                >
                  Plataforma VEBOOK
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div>
                © {new Date().getFullYear()} {workshop.name}. Todos os direitos reservados.
              </div>
              <div className="flex items-center gap-3">
                <span>Powered by</span>
                <span className="text-white font-bold tracking-wider">VEBOOK</span>
                <button
                  type="button"
                  onClick={() => onOpenPanel?.(workshop.subdomain.split('.')[0] || '')}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Área restrita
                </button>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAIS INTERATIVOS DENTRO DA EXPERIÊNCIA DA OFICINA */}
      {/* ========================================================================= */}

      {mapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={themeAccent} />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Localização da {workshop.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMapModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-56 bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 space-y-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={themeSolid}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800">
                  {workshop.name}
                  <span className="block text-[10px] text-slate-500 font-normal">{workshop.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <strong>Endereço:</strong> {workshop.address}
                {workshop.neighborhood ? ` — ${workshop.neighborhood}` : ''}
              </div>
              <div>
                <strong>Cidade/UF:</strong> {workshop.city} - {workshop.state}
                {workshop.zipCode ? ` · CEP ${workshop.zipCode}` : ''}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${workshop.name} ${workshop.address} ${workshop.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no Google Maps</span>
              </a>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(`${workshop.name} ${workshop.address} ${workshop.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-sky-500 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Traçar Rota no Waze</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
