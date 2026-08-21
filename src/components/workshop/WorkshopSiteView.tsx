import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Car, 
  Check, 
  Share2, 
  Layers, 
  Info, 
  X, 
  Send,
  Building,
  FileCheck2,
  ChevronRight,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { Workshop, WorkshopServiceItem } from '../../types';
import { WORKSHOPS_MOCK } from '../../data/mockData';
import { AppView } from '../../types';
import { Logo } from '../layout/Logo';

interface WorkshopSiteViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate?: (plate: string) => void;
  initialWorkshopId?: string;
}

export const WorkshopSiteView: React.FC<WorkshopSiteViewProps> = ({
  onNavigate,
  onSearchPlate,
  initialWorkshopId = 'ws-prisma',
}) => {
  const [currentWorkshopId, setCurrentWorkshopId] = useState<string>(initialWorkshopId);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('todos');
  const [activeTabNav, setActiveTabNav] = useState<'inicio' | 'servicos' | 'sobre' | 'localizacao' | 'vebook' | 'contato'>('inicio');
  
  // Custom Color Theme Switcher state (Allows real-time demo preview of different brand colors)
  const [customColor, setCustomColor] = useState<'amber' | 'blue' | 'emerald' | 'rose' | 'indigo'>('amber');

  // Modals inside workshop site
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedServiceForSchedule, setSelectedServiceForSchedule] = useState<WorkshopServiceItem | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);
  const [scheduleSuccessToast, setScheduleSuccessToast] = useState(false);

  // Scheduling Form State
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    phone: '',
    plate: '',
    service: '',
    date: '',
    period: 'manha',
    notes: '',
  });

  const workshop = WORKSHOPS_MOCK.find(w => w.id === currentWorkshopId) || WORKSHOPS_MOCK[0];

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
    const selected = WORKSHOPS_MOCK.find(w => w.id === id);
    if (selected?.themeColor) {
      setCustomColor(selected.themeColor);
    }
  };

  const handleOpenSchedule = (service?: WorkshopServiceItem) => {
    setSelectedServiceForSchedule(service || null);
    if (service) {
      setScheduleForm(prev => ({ ...prev, service: service.title }));
    }
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleModalOpen(false);
    setScheduleSuccessToast(true);
    setTimeout(() => {
      setScheduleSuccessToast(false);
    }, 5000);
  };

  const scrollToSection = (sectionId: string, tabName: typeof activeTabNav) => {
    setActiveTabNav(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered Services List
  const allServices = workshop.servicesList || [
    {
      id: 'srv-gen1',
      title: 'Manutenção Preventiva & Revisão',
      category: 'Revisão',
      shortDescription: 'Checklist completo de 32 itens de segurança e funcionamento mecânico.',
      estimatedTime: '2h',
      warrantyPeriod: '90 dias',
      featured: true,
    },
    {
      id: 'srv-gen2',
      title: 'Troca de Óleo e Filtros Homologados',
      category: 'Lubrificação',
      shortDescription: 'Substituição com lubrificantes e filtros com especificação original.',
      estimatedTime: '40 min',
      warrantyPeriod: '10.000 km',
      featured: true,
    },
    {
      id: 'srv-gen3',
      title: 'Sistema de Freios & ABS',
      category: 'Freios',
      shortDescription: 'Substituição de pastilhas, sangria e verificação dos discos.',
      estimatedTime: '1h30',
      warrantyPeriod: '6 meses',
      featured: true,
    },
  ];

  const categories = ['todos', ...Array.from(new Set(allServices.map(s => s.category)))];

  const filteredServices = selectedServiceCategory === 'todos' 
    ? allServices 
    : allServices.filter(s => s.category === selectedServiceCategory);

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
                {WORKSHOPS_MOCK.map((w) => (
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

      {/* TOAST DE AGENDAMENTO SIMULADO */}
      {scheduleSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1E36] text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-xs">
            <strong className="block text-white font-bold text-sm">Solicitação de Agendamento Enviada!</strong>
            <p className="text-slate-300">A equipe da <strong>{workshop.name}</strong> entrará em contato via WhatsApp para confirmar seu horário.</p>
          </div>
          <button 
            onClick={() => setScheduleSuccessToast(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          
          {/* 1. CABEÇALHO DO SITE DA OFICINA */}
          <header className="bg-white border-b border-slate-100 sticky top-10 z-40 px-6 sm:px-8 py-4 backdrop-blur-md bg-white/95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Identidade da Oficina + Endosso VEBOOK */}
              <div className="flex items-center gap-3.5">
                {/* Logo / Emblema da Oficina com a cor própria */}
                <div className={`w-12 h-12 rounded-2xl ${themeClasses.primarySolid} flex items-center justify-center font-black text-xl shadow-md shrink-0`}>
                  {workshop.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {workshop.name}
                    </h1>
                  </div>

                  {/* Badge Elegante de Relação com VEBOOK */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B1E36] text-white text-[10px] font-bold tracking-wide">
                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                      <span>Oficina credenciada VEBOOK</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                      · {workshop.city}/{workshop.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões Rápidos de Ação / Contato */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenSchedule()}
                  className={`px-4 py-2.5 rounded-xl ${themeClasses.primary} font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar Serviço</span>
                </button>

                <a
                  href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>

            </div>

            {/* Menu de Navegação Institucional do Site da Oficina */}
            <nav className="flex items-center gap-1 sm:gap-2 pt-4 mt-2 border-t border-slate-100 overflow-x-auto no-scrollbar text-xs font-bold text-slate-600">
              <button
                onClick={() => scrollToSection('sec-hero', 'inicio')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${activeTabNav === 'inicio' ? `${themeClasses.badge} font-extrabold` : 'hover:bg-slate-50'}`}
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('sec-servicos', 'servicos')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${activeTabNav === 'servicos' ? `${themeClasses.badge} font-extrabold` : 'hover:bg-slate-50'}`}
              >
                Serviços & Peças
              </button>
              <button
                onClick={() => scrollToSection('sec-sobre', 'sobre')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${activeTabNav === 'sobre' ? `${themeClasses.badge} font-extrabold` : 'hover:bg-slate-50'}`}
              >
                Sobre a Oficina
              </button>
              <button
                onClick={() => scrollToSection('sec-localizacao', 'localizacao')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${activeTabNav === 'localizacao' ? `${themeClasses.badge} font-extrabold` : 'hover:bg-slate-50'}`}
              >
                Localização & Horário
              </button>
              <button
                onClick={() => scrollToSection('sec-vebook', 'vebook')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${activeTabNav === 'vebook' ? 'bg-[#0B1E36] text-white font-extrabold' : 'text-[#0B1E36] bg-slate-100 hover:bg-slate-200'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Diário VEBOOK</span>
              </button>
            </nav>
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
              
              {/* Badge "Oficina Verificada" sobre a imagem exatamente como na referência */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${themeClasses.heroTag} font-black text-xs shadow-lg uppercase tracking-wider`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Oficina verificada</span>
                </span>
              </div>

              {/* Gradiente sutil inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between text-xs font-medium">
                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {workshop.neighborhood || 'Centro'} · {workshop.city} - {workshop.state}
                </span>
                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 hidden sm:inline">
                  Ambiente Auditado VEBOOK
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

              {/* 3 Botões de Ação Imediata */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setHowItWorksModalOpen(true)}
                  className={`px-6 py-3.5 rounded-xl ${themeClasses.primary} font-extrabold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Como funciona</span>
                </button>

                <button
                  onClick={() => scrollToSection('sec-sobre', 'sobre')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>Perguntas frequentes</span>
                </button>

                <a
                  href={`https://wa.me/55${workshop.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20gostaria%20de%20um%20or%C3%A7amento%20na%20${encodeURIComponent(workshop.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Falar com a oficina</span>
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
                  <ArrowRight className="w-3.5 h-3.5" />
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

          {/* 4. SEÇÃO DE SERVIÇOS ESPECIALIZADOS DA OFICINA */}
          <section id="sec-servicos" className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText} block`}>
                  Catálogo Técnico
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Serviços Realizados na {workshop.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Todos os serviços são executados com peças homologadas e lançados com especificação técnica.
                </p>
              </div>

              {/* Botão de Agendamento Geral */}
              <button
                onClick={() => handleOpenSchedule()}
                className={`px-5 py-2.5 rounded-xl ${themeClasses.primary} font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer`}
              >
                <Calendar className="w-4 h-4" />
                <span>Solicitar Orçamento Geral</span>
              </button>
            </div>

            {/* Abas de Categorias de Serviços */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                    selectedServiceCategory === cat
                      ? `${themeClasses.primarySolid} shadow-2xs`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de Cards de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {service.category}
                      </span>
                      {service.warrantyPeriod && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Garantia: {service.warrantyPeriod}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">
                      {service.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    {service.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {service.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {service.estimatedTime ? `Tempo estimado: ${service.estimatedTime}` : 'Consulte disponibilidade'}
                    </span>
                    <button
                      onClick={() => handleOpenSchedule(service)}
                      className={`text-xs font-bold ${themeClasses.accentText} hover:underline flex items-center gap-1 cursor-pointer`}
                    >
                      <span>Agendar este</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. SEÇÃO SOBRE A OFICINA & INFRAESTRUTURA TÉCNICA */}
          <section id="sec-sobre" className="p-6 sm:p-8 bg-slate-50/70 border-t border-slate-100 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              <div className="space-y-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText} block`}>
                  Nossa Estrutura & História
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Compromisso com precisão mecânica e transparência
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {workshop.aboutHistory || workshop.description}
                </p>

                {workshop.infrastructure && workshop.infrastructure.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                      Infraestrutura do Centro Automotivo:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {workshop.infrastructure.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Resumo de Qualidade */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${themeClasses.iconBg} flex items-center justify-center font-bold`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Padrão de Atendimento {workshop.name}
                    </h4>
                    <span className="text-xs text-slate-500">Credenciada VEBOOK desde {new Date(workshop.certifiedSince).getFullYear()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-2xl font-black text-slate-900">+{workshop.totalServicesRegistered}</span>
                    <span className="text-[11px] text-slate-500 block">Serviços no Diário</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                    <span className="text-2xl font-black text-emerald-700">{workshop.validationRate}%</span>
                    <span className="text-[11px] text-emerald-700 block">Aprovação de Clientes</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-100 pt-3">
                  "Nossa prioridade é cuidar do seu veículo com as melhores peças do mercado, assegurando que o histórico oficial preserve o valor real do seu patrimônio."
                </p>
              </div>

            </div>
          </section>

          {/* 6. BLOCO DE INTEGRAÇÃO & CONFIANÇA VEBOOK (ELEGANTE, SEM DOMINAR) */}
          <section id="sec-vebook" className="p-6 sm:p-8 bg-[#0B1E36] text-white space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/90 text-sky-300 text-xs font-bold uppercase border border-sky-600/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Histórico Permanente por VEBOOK</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Todo serviço feito aqui fica registrado no Diário Veicular
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  A <strong>{workshop.name}</strong> integra a rede nacional VEBOOK. Ao retirar seu carro, você recebe o resumo digital no WhatsApp para validar marcas, modelos de peças e quilometragem real.
                </p>
              </div>

              <button
                onClick={() => {
                  if (onSearchPlate) {
                    onSearchPlate('BRA2E19');
                  } else {
                    onNavigate('diario');
                  }
                }}
                className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-black text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Conhecer o Diário Veicular</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Os 3 Pilares da Confiança VEBOOK na Oficina */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <span className="font-bold text-sky-400 text-sm">1. A Oficina Registra</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Lançamos óleo, filtros, correias e peças aplicadas com código e especificação da montadora.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <span className="font-bold text-sky-400 text-sm">2. O Cliente Valida</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Você confere os dados diretamente no seu celular e confirma com total segurança e transparência.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <span className="font-bold text-sky-400 text-sm">3. A VEBOOK Preserva</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  O histórico acompanha o chassi do carro, gerando certidão com QR Code e valorizando a revenda.
                </p>
              </div>
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
                  <span className="text-[11px] text-slate-400">Oficina parceira da rede VEBOOK</span>
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
              <div className="flex items-center gap-2">
                <span>Powered by</span>
                <span className="text-white font-bold tracking-wider">VEBOOK</span>
                <span className="text-slate-600">· Infraestrutura Nacional de Histórico Veicular</span>
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

            {/* Bloco Certificação VEBOOK */}
            <div className="p-4 rounded-2xl bg-sky-950 text-white shadow-md text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-sky-400 mx-auto" />
              <span className="text-[11px] font-bold block text-sky-200">
                Rede Credenciada
              </span>
              <p className="text-[10px] text-slate-300 leading-tight">
                Oficinas que honram a verdade técnica em cada manutenção.
              </p>
            </div>

          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* MODAIS INTERATIVOS DENTRO DA EXPERIÊNCIA DA OFICINA */}
      {/* ========================================================================= */}

      {/* 1. MODAL DE AGENDAMENTO DE SERVIÇO */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText}`}>
                  Agendamento Online
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Agendar na {workshop.name}
                </h3>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={scheduleForm.phone}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BRA2E19"
                    maxLength={7}
                    value={scheduleForm.plate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, plate: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm font-bold uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Serviço Desejado</label>
                <select
                  value={scheduleForm.service}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, service: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-xs font-semibold"
                >
                  <option value="">Selecione um serviço ou revisão geral</option>
                  {allServices.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Data Preferencial</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Período</label>
                  <select
                    value={scheduleForm.period}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-xs font-medium"
                  >
                    <option value="manha">Manhã (08h às 12h)</option>
                    <option value="tarde">Tarde (13h às 18h)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Observações adicionais (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Barulho na roda dianteira ao frear, luz de injeção acesa..."
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-xs font-normal"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Garantia VEBOOK de Transparência</span>
                </div>
                <p>
                  Ao realizar o serviço na {workshop.name}, as peças aplicadas serão documentadas e enviadas para o seu Diário Veicular.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl ${themeClasses.primary} font-extrabold shadow-md cursor-pointer flex items-center gap-2`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirmar Solicitação</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 2. MODAL DE LOCALIZAÇÃO / MAPA INTERATIVO */}
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
                onClick={() => setMapModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mockup visual de Mapa */}
            <div className="h-56 bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 relative flex items-center justify-center">
              {/* Visual de Mapa Cartográfico */}
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 space-y-2">
                <div className={`w-10 h-10 rounded-full ${themeClasses.primarySolid} flex items-center justify-center shadow-lg animate-bounce`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800">
                  {workshop.name}
                  <span className="block text-[10px] text-slate-500 font-normal">{workshop.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><strong>Endereço:</strong> {workshop.address} — {workshop.neighborhood}</div>
              <div><strong>Cidade/UF:</strong> {workshop.city} - {workshop.state} · CEP {workshop.zipCode}</div>
              <div><strong>Ponto de Referência:</strong> Próximo à avenida principal da região com fácil estacionamento para clientes.</div>
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

      {/* 3. MODAL "COMO FUNCIONA NA OFICINA" */}
      {howItWorksModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className={`w-5 h-5 ${themeClasses.accentText}`} />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Como Funciona o Atendimento
                </h3>
              </div>
              <button
                onClick={() => setHowItWorksModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <strong className="text-slate-900 font-bold text-sm block">Recepção & Diagnóstico Técnico</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Seu veículo é inspecionado com equipamentos de diagnóstico e você recebe o orçamento detalhado com peças e mão de obra antes da aprovação.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <strong className="text-slate-900 font-bold text-sm block">Execução com Peças Homologadas</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Aplicamos apenas lubrificantes e componentes de marcas certificadas com garantia comprovada e respeito às especificações da montadora.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0B1E36] text-white flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <strong className="text-slate-900 font-bold text-sm block">Registro Oficial no Diário VEBOOK</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Você recebe o comprovante digital no WhatsApp. O serviço passa a integrar o histórico permanente do chassi do seu veículo para sempre.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setHowItWorksModalOpen(false);
                  handleOpenSchedule();
                }}
                className={`w-full py-3 rounded-xl ${themeClasses.primary} font-extrabold text-xs shadow-md cursor-pointer`}
              >
                Agendar Meu Atendimento Agora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
