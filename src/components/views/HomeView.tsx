import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Search } from 'lucide-react';
import { SAMPLE_PLATES } from '../../lib/copy';
import { PATHS } from '../../lib/paths';
import { formatPlate } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Section, SectionHeader } from '../ui/Section';

interface HomeViewProps {
  onSearchPlate: (plate: string) => void;
  onOpenCredenciamento: () => void;
  onOpenJaCredenciado: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSearchPlate,
  onOpenCredenciamento,
  onOpenJaCredenciado,
}) => {
  const [inputPlate, setInputPlate] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchPlate(formatPlate(inputPlate));
  };

  return (
    <div>
      <section className="bg-[#071526] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
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
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300">
              O VEBOOK permite consultar informações relacionadas ao histórico de manutenção de um veículo.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-xl rounded-2xl border border-slate-700 bg-white p-3 text-left shadow-sm sm:p-4"
          >
            <label htmlFor="home-placa" className="mb-1.5 block text-sm font-semibold text-[#0B1E36]">
              Consultar veículo
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
                Consultar
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Placa Mercosul (ABC1D23) ou tradicional (ABC1234).
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
            <span>Exemplos:</span>
            {SAMPLE_PLATES.map((item) => (
              <button
                key={item.plate}
                type="button"
                onClick={() => onSearchPlate(item.plate)}
                className="rounded-md border border-slate-600 px-2.5 py-1 font-medium text-white hover:border-slate-400"
              >
                {item.label} · {item.plate}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <SectionHeader
          align="center"
          title="Como o histórico é construído"
          description="Três papéis claros. Um registro por serviço. O histórico fica no veículo."
        />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          <li className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-slate-500">1</p>
            <h2 className="mt-2 text-lg font-bold text-[#0B1E36]">A oficina registra</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Lança o serviço, a quilometragem e os produtos aplicados.
            </p>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-slate-500">2</p>
            <h2 className="mt-2 text-lg font-bold text-[#0B1E36]">O cliente valida</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Confere o registro e confirma ou aponta divergência.
            </p>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-slate-500">3</p>
            <h2 className="mt-2 text-lg font-bold text-[#0B1E36]">A VEBOOK preserva</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              O histórico permanece no veículo, mesmo após troca de dono ou oficina.
            </p>
          </li>
        </ol>
        <p className="mt-8 text-center">
          <Link
            to={PATHS.comoFunciona}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1E36] hover:underline"
          >
            Ver o funcionamento completo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </Section>

      <Section tone="muted" id="para-oficinas">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <SectionHeader
            eyebrow="Para oficinas"
            title="Por que a oficina usa o VEBOOK"
            description="O registro sai do papel e do WhatsApp. O cliente acompanha. O histórico do veículo fica organizado — e a oficina deixa de ser a única a guardar a memória do serviço."
          />
          <div className="space-y-6">
            <ul className="space-y-3">
              {[
                'Cada serviço entra com data, quilometragem e produtos',
                'O cliente valida ou contesta, com a situação visível no histórico',
                'A oficina ganha página própria, com identidade e contato',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1E36]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={PATHS.cadastroOficina}>
                <Button>Cadastrar oficina</Button>
              </Link>
              <Link to={PATHS.entrarOficina}>
                <Button variant="secondary">Entrar</Button>
              </Link>
            </div>
            <Link
              to={PATHS.oficinas}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1E36] hover:underline"
            >
              Conhecer a solução para oficinas
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
};
