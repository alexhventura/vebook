import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
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
import { ContatoView } from './components/views/ContatoView';
import { CredenciamentoModal } from './components/modals/CredenciamentoModal';
import { CookieBanner } from './components/cookies/CookieBanner';
import { MinhaPrivacidadeModal } from './components/privacy/MinhaPrivacidadeModal';
import { ContestacaoModal } from './components/contestation/ContestacaoModal';
import { AppView, ServiceRecord, TransparenciaSection } from './types';
import { PATHS, pathForSection, pathForView, sectionFromPath, titleForPath } from './lib/paths';
import { WORKSHOPS_MOCK } from './data/mockData';

type ShellContext = {
  openCadastro: () => void;
  openLogin: () => void;
  openCookies: () => void;
  openPrivacidade: () => void;
  openContestacao: (record?: ServiceRecord | null) => void;
};

function AppShell() {
  const location = useLocation();
  const [credenciamentoMode, setCredenciamentoMode] = useState<'cadastro' | 'login' | null>(null);
  const [isCookieConfigModalOpen, setIsCookieConfigModalOpen] = useState(false);
  const [isPrivacidadeModalOpen, setIsPrivacidadeModalOpen] = useState(false);
  const [isContestacaoModalOpen, setIsContestacaoModalOpen] = useState(false);
  const [targetContestationRecord, setTargetContestationRecord] = useState<ServiceRecord | null>(null);

  useEffect(() => {
    document.title = titleForPath(location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const ctx: ShellContext = {
    openCadastro: () => setCredenciamentoMode('cadastro'),
    openLogin: () => setCredenciamentoMode('login'),
    openCookies: () => setIsCookieConfigModalOpen(true),
    openPrivacidade: () => setIsPrivacidadeModalOpen(true),
    openContestacao: (record) => {
      setTargetContestationRecord(record ?? null);
      setIsContestacaoModalOpen(true);
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#071A33]">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>
      <Header onOpenEntrar={ctx.openLogin} />
      <main id="conteudo-principal" className="flex-1" tabIndex={-1}>
        <Outlet context={ctx} />
      </main>
      <Footer
        onOpenCookiesConfig={ctx.openCookies}
        onOpenPrivacidadeModal={ctx.openPrivacidade}
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
        <CredenciamentoModal mode={credenciamentoMode} onClose={() => setCredenciamentoMode(null)} />
      )}
    </div>
  );
}

function useShell() {
  return useOutletContext<ShellContext>();
}

function useViewNav() {
  const navigate = useNavigate();
  return {
    onNavigate: (view: AppView) => navigate(pathForView(view)),
    onNavigateTransparencia: (section: TransparenciaSection) => navigate(pathForSection(section)),
  };
}

function HomePage() {
  const navigate = useNavigate();
  const ctx = useShell();
  return (
    <HomeView
      onSearchPlate={(plate) => navigate(plate ? PATHS.historico(plate) : PATHS.consultar)}
      onOpenCredenciamento={ctx.openCadastro}
      onOpenJaCredenciado={ctx.openLogin}
    />
  );
}

function ConsultarPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ctx = useShell();
  const { onNavigate, onNavigateTransparencia } = useViewNav();
  const consultaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    consultaInputRef.current?.focus();
  }, []);

  return (
    <DiarioVeicularView
      initialPlate={params.get('placa') ?? undefined}
      searchInputRef={consultaInputRef}
      onNavigate={onNavigate}
      onNavigateTransparencia={onNavigateTransparencia}
      onEmitirCertidaoForPlate={(plate) => navigate(PATHS.certidao(plate))}
      onOpenContestacaoModalForRecord={ctx.openContestacao}
      onPlateFound={(plate) => navigate(PATHS.historico(plate))}
    />
  );
}

function HistoricoPage() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const ctx = useShell();
  const { onNavigate, onNavigateTransparencia } = useViewNav();

  if (!placa) return <Navigate to={PATHS.consultar} replace />;

  return (
    <DiarioVeicularView
      initialPlate={placa}
      onNavigate={onNavigate}
      onNavigateTransparencia={onNavigateTransparencia}
      onEmitirCertidaoForPlate={(p) => navigate(PATHS.certidao(p))}
      onOpenContestacaoModalForRecord={ctx.openContestacao}
      onPlateFound={(p) => {
        if (p.toUpperCase() !== placa.toUpperCase()) navigate(PATHS.historico(p), { replace: true });
      }}
    />
  );
}

function CertidaoPage() {
  const { placa } = useParams();
  const { onNavigate } = useViewNav();
  return <CertidaoView initialPlate={placa} onNavigate={onNavigate} />;
}

function OficinasPage() {
  const ctx = useShell();
  const { onNavigate } = useViewNav();
  return (
    <ParaOficinasView
      onNavigate={onNavigate}
      onOpenCredenciamentoModal={ctx.openCadastro}
      onOpenJaCredenciadoModal={ctx.openLogin}
    />
  );
}

function OficinaPage() {
  const { slug } = useParams();
  const { onNavigate } = useViewNav();
  const navigate = useNavigate();
  const workshop = WORKSHOPS_MOCK.find((w) => w.subdomain.startsWith(`${slug}.`) || w.id === `ws-${slug}`);
  return (
    <WorkshopSiteView
      onNavigate={onNavigate}
      onSearchPlate={(plate) => navigate(plate ? PATHS.historico(plate) : PATHS.consultar)}
      initialWorkshopId={workshop?.id ?? 'ws-prisma'}
    />
  );
}

function ComoFuncionaPage() {
  const { onNavigate } = useViewNav();
  return <ComoFuncionaView onNavigate={onNavigate} />;
}

function ValidarPage() {
  const { onNavigate } = useViewNav();
  return <ValidacaoSimuladorView onNavigate={onNavigate} />;
}

function TransparenciaPage({ section }: { section?: TransparenciaSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const ctx = useShell();
  const fromPath = section ?? sectionFromPath(location.pathname) ?? 'como-tratamos';
  const { section: paramSection } = useParams();
  const initial = (paramSection as TransparenciaSection | undefined) ?? fromPath;

  return (
    <TransparenciaView
      initialSection={initial}
      onOpenCookiesConfig={ctx.openCookies}
      onOpenContestacaoModal={() => ctx.openContestacao(null)}
      onOpenPrivacidadeModal={ctx.openPrivacidade}
      onNavigateToDiario={() => navigate(PATHS.consultar)}
      onNavigateToCertidao={() => navigate(PATHS.certidao())}
      onSectionChange={(next) => navigate(pathForSection(next))}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.consultar} element={<ConsultarPage />} />
        <Route path="/historico" element={<Navigate to={PATHS.consultar} replace />} />
        <Route path="/historico/:placa" element={<HistoricoPage />} />
        <Route path="/certidao" element={<CertidaoPage />} />
        <Route path="/certidao/:placa" element={<CertidaoPage />} />
        <Route path={PATHS.oficinas} element={<OficinasPage />} />
        <Route path="/oficina/:slug" element={<OficinaPage />} />
        <Route path={PATHS.comoFunciona} element={<ComoFuncionaPage />} />
        <Route path={PATHS.validar} element={<ValidarPage />} />
        <Route path={PATHS.contato} element={<ContatoView />} />
        <Route path={PATHS.sobre} element={<TransparenciaPage section="como-tratamos" />} />
        <Route path={PATHS.faq} element={<TransparenciaPage section="faq" />} />
        <Route path={PATHS.termos} element={<TransparenciaPage section="termos" />} />
        <Route path={PATHS.privacidade} element={<TransparenciaPage section="privacidade" />} />
        <Route path={PATHS.cookies} element={<TransparenciaPage section="cookies" />} />
        <Route path={PATHS.seguranca} element={<TransparenciaPage section="seguranca" />} />
        <Route path="/transparencia/:section" element={<TransparenciaPage />} />
        <Route path="*" element={<Navigate to={PATHS.home} replace />} />
      </Route>
    </Routes>
  );
}
