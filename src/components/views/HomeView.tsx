import React, { useState } from 'react';
import { ArrowRight, Check, Search } from 'lucide-react';
import { AppView, TransparenciaSection } from '../../types';
import { SAMPLE_PLATES } from '../../lib/copy';
import { formatPlate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Section, SectionHeader } from '../ui/Section';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate: (plate: string) => void;
  onOpenCredenciamento: () => void;
  onOpenJaCredenciado: () => void;
  onNavigateTransparencia: (section: TransparenciaSection) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSearchPlate,
  onOpenCredenciamento,
  onOpenJaCredenciado,
  onNavigateTransparencia,
}) => {
  const [inputPlate, setInputPlate] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    onSearchPlate(clean);
  };

  return (
    <div>
      {/* PARTE 1 — VEBOOK */}
      <section className="bg-[#071526] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">
            Histórico de manutenção veicular
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              O histórico que acompanha o veículo.
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
          </div>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300">
            Manutenções ficam espalhadas em notas, conversas e pastas da oficina.
            O VEBOOK reúne esses registros em um histórico único, vinculado ao veículo,
            para consulta pelo proprietário e emissão de certidão quando necessário.
          </p>
          <ol className="grid gap-4 text-left sm:grid-cols-3">
            <li className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
              <span className="text-sm font-semibold text-sky-300">1. Registro</span>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                A oficina lança o serviço, a quilometragem e os produtos aplicados.
              </p>
            </li>
            <li className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
              <span className="text-sm font-semibold text-sky-300">2. Validação</span>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                O cliente confere o registro e confirma ou aponta divergência.
              </p>
            </li>
            <li className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
              <span className="text-sm font-semibold text-sky-300">3. Preservação</span>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                O histórico permanece no veículo, mesmo após troca de dono ou oficina.
              </p>
            </li>
          </ol>
          <button
            type="button"
            onClick={() => onNavigate('como-funciona')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-white"
          >
            Ver como funciona
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </section>

      {/* PARTE 2 — USUÁRIO E VEÍCULO */}
      <Section id="consultar-veiculo" tone="muted">
        <div className="mx-auto max-w-2xl space-y-8">
          <SectionHeader
            align="center"
            title="Consultar veículo"
            description="Informe a placa para ver o histórico de manutenção registrado na plataforma. A partir do resultado, você acessa os detalhes do veículo, os registros e a certidão."
          />

          <form
            onSubmit={handleSearchSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgb(7_26_51_/_0.06)] sm:p-5"
          >
            <label htmlFor="home-placa" className="sr-only">
              Placa do veículo
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="home-placa"
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(formatPlate(e.target.value))}
                placeholder="ABC1D23"
                maxLength={7}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-lg font-semibold uppercase tracking-widest text-[#0B1E36] placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
              />
              <Button type="submit" size="lg" className="sm:shrink-0">
                <Search className="h-4 w-4" aria-hidden />
                Consultar veículo
              </Button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Aceita placa Mercosul (ABC1D23) ou tradicional (ABC1234).
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
            <span>Placas de exemplo:</span>
            {SAMPLE_PLATES.map((item) => (
              <button
                key={item.plate}
                type="button"
                onClick={() => onSearchPlate(item.plate)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium text-[#0B1E36] hover:border-slate-400"
              >
                {item.label} · {item.plate}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* PARTE 3 — OFICINAS */}
      <Section id="para-oficinas">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <SectionHeader
            eyebrow="Para oficinas"
            title="Registre o serviço. O histórico fica com o veículo."
            description="A oficina organiza clientes, lança registros com quilometragem e produtos, e envia o resumo para o cliente validar. O resultado é um histórico profissional, sem depender de papel ou conversa perdida."
          />
          <div className="space-y-6">
            <ul className="space-y-3">
              {[
                'Registro de serviços com data, quilometragem e produtos aplicados',
                'Histórico do veículo disponível para o cliente consultar',
                'Relacionamento claro: o cliente valida ou aponta divergência',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1E36]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={onOpenCredenciamento}>Cadastrar oficina</Button>
              <Button variant="secondary" onClick={onOpenJaCredenciado}>
                Entrar
              </Button>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('oficinas')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1E36] hover:underline"
            >
              Ver como a oficina usa o VEBOOK
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </Section>

      {/* PARTE 4 — INFORMAÇÕES */}
      <Section id="informacoes" tone="muted">
        <SectionHeader
          title="Informações"
          description="Documentos e canais institucionais. O conteúdo completo está nestas páginas — não se repete em outros blocos do site."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'FAQ', action: () => onNavigateTransparencia('faq') },
            { label: 'Como funciona', action: () => onNavigate('como-funciona') },
            { label: 'Segurança', action: () => onNavigateTransparencia('seguranca') },
            { label: 'Privacidade', action: () => onNavigateTransparencia('privacidade') },
            { label: 'Termos de Uso', action: () => onNavigateTransparencia('termos') },
            { label: 'Cookies', action: () => onNavigateTransparencia('cookies') },
            { label: 'Direitos do titular', action: () => onNavigateTransparencia('direitos-titular') },
            { label: 'Central de Ajuda', action: () => onNavigateTransparencia('faq') },
          ].map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={item.action}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-[#0B1E36] hover:border-slate-400"
              >
                {item.label}
                <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};
