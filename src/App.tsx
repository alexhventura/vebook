import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

import { HomeView } from './components/views/HomeView';
import { DiarioVeicularView } from './components/views/DiarioVeicularView';
import { ComoFuncionaView } from './components/views/ComoFuncionaView';
import { CertidaoView } from './components/views/CertidaoView';
import { ParaOficinasView } from './components/views/ParaOficinasView';
import { CadastroOficinaView } from './components/views/CadastroOficinaView';
import { ValidacaoSimuladorView } from './components/views/ValidacaoSimuladorView';
import { ValidarCertidaoView } from './components/views/ValidarCertidaoView';
import { WorkshopSiteView } from './components/workshop/WorkshopSiteView';
import { TransparenciaView } from './components/views/TransparenciaView';
import { OfficePanelView } from './components/panel/OfficePanelView';

import { LegalModal } from './components/modals/LegalModal';
import { CookieBanner } from './components/cookies/CookieBanner';
import { MinhaPrivacidadeModal } from './components/privacy/MinhaPrivacidadeModal';
import { ContestacaoModal } from './components/contestation/ContestacaoModal';
import { AppView, PlanModality, ServiceRecord, TransparenciaSection } from './types';
import { applyHash, parseHash, PanelSection } from './lib/navigation';
import { initOfficeStore, loginDemoOffice } from './data/officeStore';
import {
  initOfficeReputationStore,
  ingestContestationFact,
} from './data/officeReputationStore';
import { dueDateFromContestedAt } from './lib/officeRegularityIndex';

export default function App() {
  const initial = parseHash();
  const [currentView, setCurrentView] = useState<AppView>(initial.view);
  const [transparenciaSection, setTransparenciaSection] = useState<TransparenciaSection>(
    initial.transparenciaSection || 'como-tratamos',
  );
  const [selectedPlateForCertidao, setSelectedPlateForCertidao] = useState<string>('BRA2E19');
  const [certificateCode, setCertificateCode] = useState<string | undefined>(initial.certificateCode);
  const [certificatePage, setCertificatePage] = useState<number | undefined>(initial.certificatePage);
  const [legalModalType, setLegalModalType] = useState<'termos' | 'privacidade' | 'contato' | 'comercial' | null>(null);
  const [workshopSlug, setWorkshopSlug] = useState<string | undefined>(initial.workshopSlug);
  const [panelSection, setPanelSection] = useState<PanelSection>(initial.panelSection || 'inicio');
  const [panelTab, setPanelTab] = useState<string | undefined>(initial.panelTab);
  const [signupModality, setSignupModality] = useState<PlanModality>('monthly');
  const [signupPlanPreselected, setSignupPlanPreselected] = useState(false);

  const [isCookieConfigModalOpen, setIsCookieConfigModalOpen] = useState(false);
  const [isPrivacidadeModalOpen, setIsPrivacidadeModalOpen] = useState(false);
  const [isContestacaoModalOpen, setIsContestacaoModalOpen] = useState(false);
  const [targetContestationRecord, setTargetContestationRecord] = useState<ServiceRecord | null>(null);

  const consultaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void initOfficeStore();
    initOfficeReputationStore();
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = parseHash();
      setCurrentView(next.view);
      if (next.workshopSlug) setWorkshopSlug(next.workshopSlug);
      if (next.panelSection) setPanelSection(next.panelSection);
      setPanelTab(next.panelTab);
      if (next.transparenciaSection) setTransparenciaSection(next.transparenciaSection);
      if (next.certificateCode) setCertificateCode(next.certificateCode);
      else if (next.view !== 'validar-certidao') setCertificateCode(undefined);
      if (next.certificatePage) setCertificatePage(next.certificatePage);
      else if (next.view !== 'validar-certidao') setCertificatePage(undefined);
    };
    window.addEventListener('hashchange', sync);
    if (!window.location.hash) {
      applyHash({ view: 'home' });
    }
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const handleNavigate = (view: AppView, extra?: { workshopSlug?: string; panelSection?: PanelSection; panelTab?: string; certificateCode?: string; certificatePage?: number }) => {
    if (extra && 'workshopSlug' in extra) {
      setWorkshopSlug(extra.workshopSlug);
    }
    if (extra?.panelSection) setPanelSection(extra.panelSection);
    if (extra && 'panelTab' in extra) {
      setPanelTab(extra.panelTab);
    } else if (extra?.panelSection) {
      setPanelTab(undefined);
    }
    if (extra && 'certificateCode' in extra) {
      setCertificateCode(extra.certificateCode);
    }
    if (extra && 'certificatePage' in extra) {
      setCertificatePage(extra.certificatePage);
    }
    setCurrentView(view);
    const slug = extra && 'workshopSlug' in extra ? extra.workshopSlug : workshopSlug;
    const nextTab = extra && 'panelTab' in extra ? extra.panelTab : extra?.panelSection ? undefined : panelTab;
    const code = extra && 'certificateCode' in extra ? extra.certificateCode : certificateCode;
    const page = extra && 'certificatePage' in extra ? extra.certificatePage : certificatePage;
    applyHash({
      view,
      workshopSlug: view === 'site-oficina' ? slug || 'prisma' : view === 'painel-oficina' ? slug : undefined,
      panelSection: extra?.panelSection ?? (view === 'painel-oficina' ? panelSection : undefined),
      panelTab: view === 'painel-oficina' ? nextTab : undefined,
      certificateCode: view === 'validar-certidao' ? code : undefined,
      certificatePage: view === 'validar-certidao' ? page : undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTransparencia = (section: TransparenciaSection) => {
    setTransparenciaSection(section);
    setCurrentView('transparencia');
    applyHash({ view: 'transparencia', transparenciaSection: section });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchPlateFromHome = (plate: string) => {
    setSelectedPlateForCertidao(plate);
    handleNavigate('diario');
  };

  const handleEmitirCertidaoForPlate = (plate: string) => {
    setSelectedPlateForCertidao(plate);
    handleNavigate('certidao');
  };

  const handleOpenContestacaoForRecord = (record: ServiceRecord) => {
    setTargetContestationRecord(record);
    setIsContestacaoModalOpen(true);
  };

  const handleOpenContestacaoGeneric = () => {
    setTargetContestationRecord(null);
    setIsContestacaoModalOpen(true);
  };

  const immersive = currentView === 'site-oficina' || currentView === 'painel-oficina' || currentView === 'cadastro-oficina';

  return (
    <div className="min-h-screen flex flex-col bg-vebook-surface text-vebook-text font-sans">
      {!immersive && (
        <Header onNavigate={handleNavigate} />
      )}

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSearchPlate={handleSearchPlateFromHome}
            onOpenCredenciamento={() => {
              setSignupPlanPreselected(false);
              handleNavigate('cadastro-oficina');
            }}
            onOpenJaCredenciado={() => handleNavigate('painel-oficina', { workshopSlug: undefined })}
            onStartCadastro={(modality) => {
              setSignupModality(modality);
              setSignupPlanPreselected(true);
              handleNavigate('cadastro-oficina');
            }}
            onOpenContato={() => setLegalModalType('contato')}
            onOpenWorkshop={(slug) => handleNavigate('site-oficina', { workshopSlug: slug })}
            onNavigateTransparencia={handleNavigateTransparencia}
          />
        )}

        {currentView === 'diario' && (
          <DiarioVeicularView
            initialPlate={selectedPlateForCertidao}
            onNavigate={handleNavigate}
            onEmitirCertidaoForPlate={handleEmitirCertidaoForPlate}
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
            onValidateCertificate={(code) =>
              handleNavigate('validar-certidao', { certificateCode: code })
            }
          />
        )}

        {currentView === 'validar-certidao' && (
          <ValidarCertidaoView
            initialCode={certificateCode}
            initialPage={certificatePage}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'oficinas' && (
          <ParaOficinasView
            onNavigate={handleNavigate}
            onStartCadastro={(modality) => {
              setSignupModality(modality);
              setSignupPlanPreselected(true);
              handleNavigate('cadastro-oficina');
            }}
            onOpenPainel={() => handleNavigate('painel-oficina', { workshopSlug: undefined })}
            onOpenWorkshop={(slug) => handleNavigate('site-oficina', { workshopSlug: slug })}
          />
        )}

        {currentView === 'cadastro-oficina' && (
          <CadastroOficinaView
            initialModality={signupModality}
            planPreselected={signupPlanPreselected}
            onBackToOficinas={() => handleNavigate('oficinas')}
            onOpenLegal={(type) => setLegalModalType(type)}
            onViewPublicPage={(slug) => handleNavigate('site-oficina', { workshopSlug: slug })}
            onOpenPanel={(slug) => handleNavigate('painel-oficina', { workshopSlug: slug })}
          />
        )}

        {currentView === 'site-oficina' && (
          <WorkshopSiteView
            onNavigate={handleNavigate}
            onSearchPlate={handleSearchPlateFromHome}
            workshopSlug={workshopSlug || 'prisma'}
            onOpenPanel={(slug) => handleNavigate('painel-oficina', { workshopSlug: slug })}
            onNavigateTransparencia={handleNavigateTransparencia}
          />
        )}

        {currentView === 'painel-oficina' && (
          <OfficePanelView
            requestedSlug={workshopSlug}
            section={panelSection}
            panelTab={panelTab}
            onSectionChange={(section, tab) => handleNavigate('painel-oficina', { workshopSlug, panelSection: section, panelTab: tab })}
            onViewPublicPage={(slug) => handleNavigate('site-oficina', { workshopSlug: slug })}
            onGoHome={() => handleNavigate('home')}
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

      {!immersive && (
        <Footer
          onNavigate={handleNavigate}
          onNavigateTransparencia={handleNavigateTransparencia}
          onOpenCookiesConfig={() => setIsCookieConfigModalOpen(true)}
          onOpenPrivacidadeModal={() => setIsPrivacidadeModalOpen(true)}
          onOpenContestacaoModal={handleOpenContestacaoGeneric}
          onOpenContato={() => setLegalModalType('contato')}
          onOpenDemoWorkshopSite={() => {
            handleNavigate('site-oficina', { workshopSlug: 'prisma' });
          }}
          onOpenDemoPanel={async () => {
            await loginDemoOffice('prisma');
            handleNavigate('painel-oficina', { workshopSlug: 'prisma' });
          }}
        />
      )}

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
        onSuccessContestation={(submission) => {
          const officeId = submission.officeId || targetContestationRecord?.workshopId;
          if (!officeId) return;
          const contestedAt = submission.createdAt;
          ingestContestationFact({
            id: submission.id,
            officeId,
            attendanceId: submission.serviceRecordId,
            contestedAt,
            responseDueAt: submission.responseDueAt || dueDateFromContestedAt(contestedAt),
            respondedAt: submission.resolvedAt,
          });
        }}
      />

      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}
