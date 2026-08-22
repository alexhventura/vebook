import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/views/HomeView';
import { DiarioVeicularView } from './components/views/DiarioVeicularView';
import { ComoFuncionaView } from './components/views/ComoFuncionaView';
import { CertidaoView } from './components/views/CertidaoView';
import { ParaOficinasView } from './components/views/ParaOficinasView';
import { ValidacaoSimuladorView } from './components/views/ValidacaoSimuladorView';
import { WorkshopSiteView } from './components/workshop/WorkshopSiteView';
import { TransparenciaView } from './components/views/TransparenciaView';
import { CredenciamentoModal } from './components/modals/CredenciamentoModal';
import { LegalModal } from './components/modals/LegalModal';
import { CookieBanner } from './components/cookies/CookieBanner';
import { MinhaPrivacidadeModal } from './components/privacy/MinhaPrivacidadeModal';
import { ContestacaoModal } from './components/contestation/ContestacaoModal';
import { AppView, TransparenciaSection, ServiceRecord } from './types';
import { PAGE_TITLES } from './lib/copy';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [transparenciaSection, setTransparenciaSection] = useState<TransparenciaSection>('como-tratamos');
  const [selectedPlate, setSelectedPlate] = useState<string | undefined>(undefined);
  const [credenciamentoMode, setCredenciamentoMode] = useState<'cadastro' | 'login' | null>(null);
  const [legalModalType, setLegalModalType] = useState<'termos' | 'privacidade' | 'contato' | null>(null);
  const [isCookieConfigModalOpen, setIsCookieConfigModalOpen] = useState(false);
  const [isPrivacidadeModalOpen, setIsPrivacidadeModalOpen] = useState(false);
  const [isContestacaoModalOpen, setIsContestacaoModalOpen] = useState(false);
  const [targetContestationRecord, setTargetContestationRecord] = useState<ServiceRecord | null>(null);

  const consultaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.title = PAGE_TITLES[currentView] ?? PAGE_TITLES.home;
  }, [currentView]);

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
    setSelectedPlate(plate || undefined);
    setCurrentView('diario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocusConsulta = () => {
    if (currentView !== 'diario') {
      setCurrentView('diario');
    }
    window.setTimeout(() => {
      const input = consultaInputRef.current;
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    }, 100);
  };

  const handleEmitirCertidaoForPlate = (plate: string) => {
    setSelectedPlate(plate);
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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#071A33]">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>

      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onFocusConsulta={handleFocusConsulta}
        onOpenEntrar={() => setCredenciamentoMode('login')}
      />

      <main id="conteudo-principal" className="flex-1" tabIndex={-1}>
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSearchPlate={handleSearchPlateFromHome}
            onOpenCredenciamento={() => setCredenciamentoMode('cadastro')}
            onOpenJaCredenciado={() => setCredenciamentoMode('login')}
            onNavigateTransparencia={handleNavigateTransparencia}
          />
        )}

        {currentView === 'diario' && (
          <DiarioVeicularView
            onNavigate={handleNavigate}
            onEmitirCertidaoForPlate={handleEmitirCertidaoForPlate}
            onOpenContestacaoModalForRecord={handleOpenContestacaoForRecord}
            onNavigateTransparencia={handleNavigateTransparencia}
            searchInputRef={consultaInputRef}
            initialPlate={selectedPlate}
          />
        )}

        {currentView === 'como-funciona' && (
          <ComoFuncionaView onNavigate={handleNavigate} />
        )}

        {currentView === 'certidao' && (
          <CertidaoView initialPlate={selectedPlate ?? 'BRA2E19'} onNavigate={handleNavigate} />
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
          <ValidacaoSimuladorView onNavigate={handleNavigate} />
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

      <Footer
        onNavigate={handleNavigate}
        onNavigateTransparencia={handleNavigateTransparencia}
        onOpenCookiesConfig={() => setIsCookieConfigModalOpen(true)}
        onOpenPrivacidadeModal={() => setIsPrivacidadeModalOpen(true)}
        onOpenContestacaoModal={handleOpenContestacaoGeneric}
        onOpenContato={() => setLegalModalType('contato')}
      />

      <CookieBanner
        isOpenModalExternally={isCookieConfigModalOpen}
        onCloseExternalModal={() => setIsCookieConfigModalOpen(false)}
      />

      <MinhaPrivacidadeModal
        isOpen={isPrivacidadeModalOpen}
        onClose={() => setIsPrivacidadeModalOpen(false)}
        onOpenCookiesConfig={() => {
          setIsPrivacidadeModalOpen(false);
          setIsCookieConfigModalOpen(true);
        }}
      />

      <ContestacaoModal
        isOpen={isContestacaoModalOpen}
        onClose={() => {
          setIsContestacaoModalOpen(false);
          setTargetContestationRecord(null);
        }}
        targetRecord={targetContestationRecord}
      />

      {credenciamentoMode && (
        <CredenciamentoModal
          mode={credenciamentoMode}
          onClose={() => setCredenciamentoMode(null)}
        />
      )}

      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}
