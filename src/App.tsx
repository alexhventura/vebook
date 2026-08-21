import React, { useState, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Views
import { HomeView } from './components/views/HomeView';
import { DiarioVeicularView } from './components/views/DiarioVeicularView';
import { ComoFuncionaView } from './components/views/ComoFuncionaView';
import { CertidaoView } from './components/views/CertidaoView';
import { ParaOficinasView } from './components/views/ParaOficinasView';
import { ValidacaoSimuladorView } from './components/views/ValidacaoSimuladorView';
import { WorkshopSiteView } from './components/workshop/WorkshopSiteView';
import { TransparenciaView } from './components/views/TransparenciaView';

// Modals
import { CredenciamentoModal } from './components/modals/CredenciamentoModal';
import { LegalModal } from './components/modals/LegalModal';
import { CookieBanner } from './components/cookies/CookieBanner';
import { MinhaPrivacidadeModal } from './components/privacy/MinhaPrivacidadeModal';
import { ContestacaoModal } from './components/contestation/ContestacaoModal';
import { AppView, TransparenciaSection, ServiceRecord } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [transparenciaSection, setTransparenciaSection] = useState<TransparenciaSection>('como-tratamos');
  const [selectedPlateForCertidao, setSelectedPlateForCertidao] = useState<string>('BRA2E19');
  const [credenciamentoMode, setCredenciamentoMode] = useState<'cadastro' | 'login' | null>(null);
  const [legalModalType, setLegalModalType] = useState<'termos' | 'privacidade' | 'contato' | null>(null);
  
  // Modais de Governança e Transparência
  const [isCookieConfigModalOpen, setIsCookieConfigModalOpen] = useState(false);
  const [isPrivacidadeModalOpen, setIsPrivacidadeModalOpen] = useState(false);
  const [isContestacaoModalOpen, setIsContestacaoModalOpen] = useState(false);
  const [targetContestationRecord, setTargetContestationRecord] = useState<ServiceRecord | null>(null);

  const consultaInputRef = useRef<HTMLInputElement | null>(null);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTransparencia = (section: TransparenciaSection) => {
    setTransparenciaSection(section);
    setCurrentView('transparencia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchPlateFromHome = (plate: string) => {
    setSelectedPlateForCertidao(plate);
    setCurrentView('diario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocusConsulta = () => {
    if (currentView !== 'diario') {
      setCurrentView('diario');
    }
    setTimeout(() => {
      const input = consultaInputRef.current;
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    }, 100);
  };

  const handleEmitirCertidaoForPlate = (plate: string) => {
    setSelectedPlateForCertidao(plate);
    setCurrentView('certidao');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenContestacaoForRecord = (record: ServiceRecord) => {
    setTargetContestationRecord(record);
    setIsContestacaoModalOpen(true);
  };

  const handleOpenContestacaoGeneric = () => {
    setTargetContestationRecord(null);
    setIsContestacaoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#071A33] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#0B1E36] selection:text-white">
      
      {/* HEADER INSTITUCIONAL COM NAVEGAÇÃO ENTRE VISÕES */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onFocusConsulta={handleFocusConsulta}
      />

      {/* CONTEÚDO DINÂMICO CONFORME A VISÃO SELECIONADA */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSearchPlate={handleSearchPlateFromHome}
            onOpenCredenciamento={() => setCredenciamentoMode('cadastro')}
            onOpenJaCredenciado={() => setCredenciamentoMode('login')}
          />
        )}

        {currentView === 'diario' && (
          <DiarioVeicularView
            onNavigate={handleNavigate}
            onEmitirCertidaoForPlate={handleEmitirCertidaoForPlate}
            onOpenContestacaoModalForRecord={handleOpenContestacaoForRecord}
            onNavigateTransparencia={handleNavigateTransparencia}
            searchInputRef={consultaInputRef}
          />
        )}

        {currentView === 'como-funciona' && (
          <ComoFuncionaView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'certidao' && (
          <CertidaoView
            initialPlate={selectedPlateForCertidao}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'oficinas' && (
          <ParaOficinasView
            onNavigate={handleNavigate}
            onOpenCredenciamentoModal={() => setCredenciamentoMode('cadastro')}
            onOpenJaCredenciadoModal={() => setCredenciamentoMode('login')}
          />
        )}

        {currentView === 'site-oficina' && (
          <WorkshopSiteView
            onNavigate={handleNavigate}
            onSearchPlate={handleSearchPlateFromHome}
            initialWorkshopId="ws-prisma"
          />
        )}

        {currentView === 'validacao' && (
          <ValidacaoSimuladorView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'transparencia' && (
          <TransparenciaView
            initialSection={transparenciaSection}
            onOpenCookiesConfig={() => setIsCookieConfigModalOpen(true)}
            onOpenContestacaoModal={handleOpenContestacaoGeneric}
            onOpenPrivacidadeModal={() => setIsPrivacidadeModalOpen(true)}
            onNavigateToDiario={() => handleNavigate('diario')}
            onNavigateToCertidao={() => handleNavigate('certidao')}
          />
        )}
      </main>

      {/* RODAPÉ INSTITUCIONAL */}
      <Footer
        onNavigate={handleNavigate}
        onNavigateTransparencia={handleNavigateTransparencia}
        onOpenCookiesConfig={() => setIsCookieConfigModalOpen(true)}
        onOpenPrivacidadeModal={() => setIsPrivacidadeModalOpen(true)}
        onOpenContestacaoModal={handleOpenContestacaoGeneric}
        onOpenContato={() => setLegalModalType('contato')}
      />

      {/* BANNER E MODAL DE PREFERÊNCIAS DE COOKIES */}
      <CookieBanner
        isOpenModalExternally={isCookieConfigModalOpen}
        onCloseExternalModal={() => setIsCookieConfigModalOpen(false)}
      />

      {/* PAINEL MINHA PRIVACIDADE (LGPD ART. 18) */}
      <MinhaPrivacidadeModal
        isOpen={isPrivacidadeModalOpen}
        onClose={() => setIsPrivacidadeModalOpen(false)}
        onOpenCookiesConfig={() => {
          setIsPrivacidadeModalOpen(false);
          setIsCookieConfigModalOpen(true);
        }}
      />

      {/* MODAL FORMAL DE CONTESTAÇÃO DE REGISTRO */}
      <ContestacaoModal
        isOpen={isContestacaoModalOpen}
        onClose={() => {
          setIsContestacaoModalOpen(false);
          setTargetContestationRecord(null);
        }}
        targetRecord={targetContestationRecord}
      />

      {/* MODAL DE CREDENCIAMENTO / ACESSO DA OFICINA */}
      {credenciamentoMode && (
        <CredenciamentoModal
          mode={credenciamentoMode}
          onClose={() => setCredenciamentoMode(null)}
        />
      )}

      {/* MODAIS LEGAIS E INSTITUCIONAIS RESUMIDOS */}
      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}

    </div>
  );
}

