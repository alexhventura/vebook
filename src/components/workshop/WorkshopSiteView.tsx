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
  ChevronDown
} from 'lucide-react';
import { Logo } from '../layout/Logo';
import { getOfficeBySlug, listWorkshopsForPublicSite, toPublicWorkshop } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
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
  
  // Custom Color Theme Switcher state (Allows real-time demo preview of different brand colors)
  const [customColor, setCustomColor] = useState<'amber' | 'blue' | 'emerald' | 'rose' | 'indigo'>('amber');

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

  // Helper color mappings
  const themeClasses = {
    amber: {
      primary: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
      primarySolid: 'bg-amber-500 text-slate-950',
      primaryBorder: 'border-amber-400',
      primaryRing: 'focus:ring-amber-400',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-800',
      accentText: 'text-amber-600',
      lightBg: 'bg-amber-50/50',
      borderHover: 'hover:border-amber-300',
      heroTag: 'bg-amber-500 text-slate-950',
    },
    blue: {
      primary: 'bg-sky-500 hover:bg-sky-600 text-white',
      primarySolid: 'bg-sky-500 text-white',
      primaryBorder: 'border-sky-400',
      primaryRing: 'focus:ring-sky-400',
      badge: 'bg-sky-50 text-sky-900 border-sky-200',
      iconBg: 'bg-sky-100 text-sky-800',
      accentText: 'text-sky-600',
      lightBg: 'bg-sky-50/50',
      borderHover: 'hover:border-sky-300',
      heroTag: 'bg-sky-500 text-white',
    },
    emerald: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      primarySolid: 'bg-emerald-600 text-white',
      primaryBorder: 'border-emerald-400',
      primaryRing: 'focus:ring-emerald-400',
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-800',
      accentText: 'text-emerald-600',
      lightBg: 'bg-emerald-50/50',
      borderHover: 'hover:border-emerald-300',
      heroTag: 'bg-emerald-600 text-white',
    },
    rose: {
      primary: 'bg-rose-600 hover:bg-rose-700 text-white',
      primarySolid: 'bg-rose-600 text-white',
      primaryBorder: 'border-rose-400',
      primaryRing: 'focus:ring-rose-400',
      badge: 'bg-rose-50 text-rose-900 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-800',
      accentText: 'text-rose-600',
      lightBg: 'bg-rose-50/50',
      borderHover: 'hover:border-rose-300',
      heroTag: 'bg-rose-600 text-white',
    },
    indigo: {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      primarySolid: 'bg-indigo-600 text-white',
      primaryBorder: 'border-indigo-400',
      primaryRing: 'focus:ring-indigo-400',
      badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-800',
      accentText: 'text-indigo-600',
      lightBg: 'bg-indigo-50/50',
      borderHover: 'hover:border-indigo-300',
      heroTag: 'bg-indigo-600 text-white',
    },
  }[customColor];

  const handleWorkshopChange = (id: string) => {
    setCurrentWorkshopId(id);
    const selected = publicWorkshops.find(w => w.id === id);
    if (selected?.themeColor) {
      setCustomColor(selected.themeColor);
    }
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

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 0. TOPO DE SIMULAÇÃO DO ECOSSISTEMA VEBOOK (DEMONSTRAÇÃO DE DOMÍNIO E CONTROLE) */}
      <div className="bg-[#0B1E36] text-white text-xs px-4 py-2 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Subdomínio e Status Oficial */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-sky-300">
              https://{workshop.subdomain}
            </span>
            <span className="hidden sm:inline text-slate-400 font-light">
              — Segunda Camada do Ecossistema VEBOOK
            </span>
          </div>

          {/* Controles de Demonstração: Trocar de Oficina e Trocar Paleta */}
          <div className="flex items-center gap-3">
            {/* Seletor de Oficinas */}
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

            {/* Paleta de Cores */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
              <span className="text-[11px] text-slate-400 hidden lg:inline mr-1">Cor:</span>
              <button
                onClick={() => setCustomColor('amber')}
                title="Laranja / Âmbar"
                className={`w-3.5 h-3.5 rounded-full bg-amber-500 cursor-pointer transition-transform ${customColor === 'amber' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
              <button
                onClick={() => setCustomColor('blue')}
                title="Azul Técnico"
                className={`w-3.5 h-3.5 rounded-full bg-sky-500 cursor-pointer transition-transform ${customColor === 'blue' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
              <button
                onClick={() => setCustomColor('emerald')}
                title="Verde Sustentável"
                className={`w-3.5 h-3.5 rounded-full bg-emerald-500 cursor-pointer transition-transform ${customColor === 'emerald' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
              <button
                onClick={() => setCustomColor('rose')}
                title="Vermelho Esportivo"
                className={`w-3.5 h-3.5 rounded-full bg-rose-500 cursor-pointer transition-transform ${customColor === 'rose' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
              <button
                onClick={() => setCustomColor('indigo')}
                title="Índigo Corporativo"
                className={`w-3.5 h-3.5 rounded-full bg-indigo-500 cursor-pointer transition-transform ${customColor === 'indigo' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
            </div>

            {/* Voltar à Plataforma VEBOOK */}
            <button
              onClick={() => onNavigate('home')}
              className="text-[11px] font-bold text-sky-300 hover:text-white flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 px-2.5 py-1 rounded border border-sky-800 transition-colors cursor-pointer"
            >
              <span>Portal VEBOOK</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
      {/* ========================================================================= */}
      {/* COMPOSIÇÃO DO ECOSSISTEMA: LATERAL ESQUERDA | SITE CENTRAL | LATERAL DIREITA */}
      {/* ========================================================================= */}
      <div className="max-w-[1600px] mx-auto flex justify-center px-2 sm:px-4 lg:px-6 py-6 gap-6">
        
        {/* ---------------------------------------------------- */}
        {/* LATERAL ESQUERDA (DESKTOP): ESPAÇO PARA PARCEIROS VEBOOK */}
        {/* ---------------------------------------------------- */}
        <aside className="hidden xl:block w-56 shrink-0 space-y-4 pt-20">
          
          <div className="sticky top-24 space-y-4">
            
            {/* Bloco 1 de Parceiro */}
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs space-y-3 text-center backdrop-blur-xs">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 block">
                Parceiro Homologado
              </span>
              <div className="h-20 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center p-2 text-center">
                <span className="font-black text-slate-800 text-lg tracking-tight">Mobil 1</span>
                <span className="text-[10px] text-slate-600 font-medium">Lubrificantes Sintéticos</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Produtos oficiais aplicados com rastreabilidade pelo Diário Veicular.
              </p>
            </div>

            {/* Bloco 2 de Parceiro */}
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs space-y-3 text-center backdrop-blur-xs">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 block">
                Parceiro Homologado
              </span>
              <div className="h-20 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center p-2 text-center">
                <span className="font-black text-slate-800 text-lg tracking-tight">MANN+FILTER</span>
                <span className="text-[10px] text-slate-600 font-medium">Filtração Automotiva Original</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Tecnologia alemã de alta retenção para ar, óleo e cabine.
              </p>
            </div>

            {/* Bloco de Anúncio / Espaço para Fabricante */}
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-dashed border-slate-300 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Espaço para Parceiro
              </span>
              <p className="text-[11px] text-slate-600 leading-tight">
                Anuncie para motoristas que cuidam do carro nesta oficina.
              </p>
              <button
                onClick={() => alert('Simulação: Abrir canal de mídia para marcas e fabricantes parceiros do ecossistema VEBOOK.')}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline block mx-auto cursor-pointer"
              >
                Quero anunciar
              </button>
            </div>

          </div>

        </aside>

        {/* ---------------------------------------------------- */}
        {/* CONTEÚDO PRINCIPAL: SITE OFICIAL DA OFICINA PARCEIRA */}
        {/* ---------------------------------------------------- */}
        <main className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
          
          {/* 1. CABEÇALHO VEBOOK — sem identidade da oficina */}
          <header className="bg-[#0B1E36] border-b border-slate-700 sticky top-10 z-40 px-6 sm:px-8 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40 rounded-vebook-sm"
                aria-label="VEBOOK Início"
              >
                <Logo size="md" variant="light" />
              </button>

              <a
                href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-vebook-mustard hover:bg-vebook-mustard-deep text-vebook-navy-deep font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contato</span>
              </a>
            </div>
          </header>

          {/* 2. HERO DA OFICINA COM FOTO REAL DE QUALIDADE & CALL TO ACTIONS */}
          <section id="sec-hero" className="p-6 sm:p-8 space-y-6">
            
            {/* Banner com Imagem da Oficina */}
            <div className="relative rounded-3xl overflow-hidden shadow-md aspect-[21/9] sm:aspect-[2.4/1] bg-slate-900 group">
              <img
                src={workshop.coverImageUrl || 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1400&q=80'}
                alt={workshop.name}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 opacity-90"
              />
              
              {/* Gradiente sutil inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between text-xs font-medium">
                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {workshop.neighborhood || 'Centro'} · {workshop.city} - {workshop.state}
                </span>
              </div>
            </div>

            {/* Apresentação Principal e Slogan */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {workshop.name}
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                  {workshop.description}
                </p>
              </div>

              {/* Contato */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20${encodeURIComponent(workshop.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-6 py-3.5 rounded-xl ${themeClasses.primary} font-extrabold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contato</span>
                </a>
              </div>
            </div>

          </section>

          {/* 3. GRID ESTRUTURADO DE INFORMAÇÕES (ENDEREÇO, CONTATO, REDES, HORÁRIO) */}
          <section id="sec-localizacao" className="p-6 sm:p-8 bg-slate-50/70 border-y border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Endereço */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <MapPin className={`w-4 h-4 ${themeClasses.accentText}`} />
                    <span>Endereço</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {workshop.address} {workshop.neighborhood ? `— ${workshop.neighborhood}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {workshop.city}/{workshop.state} {workshop.zipCode ? `· CEP ${workshop.zipCode}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => setMapModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${themeClasses.accentText} hover:underline cursor-pointer pt-1`}
                >
                  <span>Ver no mapa e rotas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Contato */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Phone className={`w-4 h-4 ${themeClasses.accentText}`} />
                  <span>Contato Direto</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Telefone:</span>
                    <a href={`tel:${workshop.phone.replace(/\D/g, '')}`} className="font-bold text-slate-800 hover:text-slate-900">
                      {workshop.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">WhatsApp:</span>
                    <a 
                      href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>{workshop.whatsapp}</span>
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                    </a>
                  </div>
                  {workshop.email && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">E-mail:</span>
                      <span className="font-medium text-slate-700 text-[11px]">{workshop.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Redes da Oficina */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Share2 className={`w-4 h-4 ${themeClasses.accentText}`} />
                  <span>Redes da Oficina</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {workshop.socialLinks?.instagram && (
                    <a
                      href={workshop.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-rose-600 font-black">📷</span>
                      <span>Instagram</span>
                    </a>
                  )}
                  {workshop.socialLinks?.facebook && (
                    <a
                      href={workshop.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-sky-700 font-black">📘</span>
                      <span>Facebook</span>
                    </a>
                  )}
                  {workshop.socialLinks?.youtube && (
                    <a
                      href={workshop.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-red-600 font-black">▶</span>
                      <span>YouTube</span>
                    </a>
                  )}
                  {workshop.socialLinks?.tiktok && (
                    <a
                      href={workshop.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-slate-900 font-black">🎵</span>
                      <span>TikTok</span>
                    </a>
                  )}
                  <a
                    href={`https://${workshop.subdomain}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Site Oficial</span>
                  </a>
                </div>
              </div>

              {/* Card 4: Horário de Funcionamento */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Clock className={`w-4 h-4 ${themeClasses.accentText}`} />
                  <span>Horário de Funcionamento</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-600 font-medium">Segunda — Sexta</span>
                    <span className="font-mono font-bold text-slate-900">
                      {workshop.businessHoursDetail?.weekdays || '08:00 — 18:00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-600 font-medium">Sábado</span>
                    <span className="font-mono font-bold text-slate-900">
                      {workshop.businessHoursDetail?.saturday || '08:00 — 13:00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-600 font-medium">Domingo</span>
                    <span className="font-mono font-bold text-rose-700">
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
              <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText} block`}>
                Serviços
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Serviços realizados pela oficina
              </h3>
              <p className="text-sm text-slate-500 max-w-2xl">
                Itens e especialidades oferecidos por {workshop.name}. O detalhamento acompanha o cadastro da oficina.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
              {serviceTextItems.length > 0 ? (
                <ul className="space-y-2.5">
                  {serviceTextItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${themeClasses.primarySolid}`} aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 leading-relaxed">
                  A oficina ainda não publicou a lista de serviços. Em breve os itens realizados aparecerão neste espaço.
                </p>
              )}
            </div>
          </section>

          {/* 7. RODAPÉ INSTITUCIONAL DO SITE DA OFICINA */}
          <footer className="bg-slate-900 text-slate-400 p-6 sm:p-8 space-y-6 text-xs border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${themeClasses.primarySolid} flex items-center justify-center font-black text-sm`}>
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

        {/* ---------------------------------------------------- */}
        {/* LATERAL DIREITA (DESKTOP): ESPAÇO PARA PARCEIROS VEBOOK */}
        {/* ---------------------------------------------------- */}
        <aside className="hidden xl:block w-56 shrink-0 space-y-4 pt-20">
          
          <div className="sticky top-24 space-y-4">
            
            {/* Bloco 3 de Parceiro */}
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs space-y-3 text-center backdrop-blur-xs">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 block">
                Parceiro Homologado
              </span>
              <div className="h-20 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center p-2 text-center">
                <span className="font-black text-slate-800 text-lg tracking-tight">Cobreq</span>
                <span className="text-[10px] text-slate-600 font-medium">Pastilhas Cerâmicas & Freios</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Frenagem segura com composto de alta durabilidade e baixo ruído.
              </p>
            </div>

            {/* Bloco 4 de Parceiro */}
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-2xs space-y-3 text-center backdrop-blur-xs">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 block">
                Parceiro Homologado
              </span>
              <div className="h-20 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center p-2 text-center">
                <span className="font-black text-slate-800 text-lg tracking-tight">NAKATA</span>
                <span className="text-[10px] text-slate-600 font-medium">Suspensão & Direção</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Pivôs, bieletas e amortecedores de qualidade original.
              </p>
            </div>

          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* MODAIS INTERATIVOS DENTRO DA EXPERIÊNCIA DA OFICINA */}
      {/* ========================================================================= */}

      {mapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className={`w-5 h-5 ${themeClasses.accentText}`} />
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
                <div className={`w-10 h-10 rounded-full ${themeClasses.primarySolid} flex items-center justify-center shadow-lg`}>
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
