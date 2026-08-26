import React, { useMemo, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  searchOfficesWithReputation,
  type PublicOfficeSearchHit,
} from '../../data/officeReputationStore';
import { formatOfficeIndexLine } from '../../lib/officeRegularityIndex';
import type { OfficeSearchSort } from '../../types';

type FindOfficeSearchProps = {
  onOpenWorkshop: (slug: string) => void;
  onOpenIndexExplainer?: () => void;
};

/**
 * Busca pública de oficinas credenciadas — seção “Para quem consulta”.
 * Não ordena por ranking de índice.
 */
export const FindOfficeSearch: React.FC<FindOfficeSearchProps> = ({
  onOpenWorkshop,
  onOpenIndexExplainer,
}) => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [sort, setSort] = useState<OfficeSearchSort>('relevance');
  const [searched, setSearched] = useState(false);

  const results: PublicOfficeSearchHit[] = useMemo(() => {
    if (!searched) return [];
    return searchOfficesWithReputation(submitted, { sort });
  }, [searched, submitted, sort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim());
    setSearched(true);
  };

  return (
    <div className="rounded-vebook-lg border border-vebook-mustard/60 bg-vebook-white p-5 sm:p-7 shadow-vebook space-y-5">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-vebook-mustard-deep">
          <Building2 className="h-4 w-4" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-[0.16em]">Encontrar uma oficina</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-vebook-navy">
          Oficinas credenciadas VEBOOK
        </h3>
        <p className="text-sm text-vebook-muted leading-relaxed">
          Encontre oficinas credenciadas VEBOOK e consulte informações públicas sobre sua atuação
          na plataforma.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="find-office-query">
          Nome da oficina, cidade ou bairro
        </label>
        <Input
          id="find-office-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome da oficina, cidade ou bairro"
          className="flex-1"
        />
        <Button type="submit" variant="accent" className="shrink-0">
          <Search className="h-4 w-4" aria-hidden />
          Buscar oficina
        </Button>
      </form>

      {searched ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-vebook-muted">
              {results.length === 0
                ? 'Nenhuma oficina encontrada com esses termos.'
                : `${results.length} oficina${results.length === 1 ? '' : 's'} encontrada${results.length === 1 ? '' : 's'}.`}
            </p>
            {results.length > 0 ? (
              <label className="flex items-center gap-2 text-xs text-vebook-muted">
                <span>Ordenar por</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as OfficeSearchSort)}
                  className="rounded-vebook-sm border border-vebook-border bg-vebook-white px-2 py-1.5 text-xs font-semibold text-vebook-navy cursor-pointer"
                >
                  <option value="relevance">Relevância</option>
                  <option value="location">Localização</option>
                  <option value="name">Nome</option>
                </select>
              </label>
            ) : null}
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map(({ office, reputation }) => (
              <li
                key={office.officeId || office.id}
                className="rounded-vebook border border-vebook-border bg-vebook-blue-soft/30 p-4 space-y-2.5"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-vebook-mustard-deep">
                    Oficina credenciada VEBOOK
                  </p>
                  <h4 className="text-base font-bold text-vebook-navy tracking-tight">{office.name}</h4>
                  <p className="text-xs text-vebook-muted">
                    {office.city} — {office.state}
                    {office.neighborhood ? ` · ${office.neighborhood}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-xs font-bold text-vebook-navy">
                    {formatOfficeIndexLine(reputation)}
                  </span>
                  {!reputation.inFormation ? (
                    <span className="text-[11px] font-semibold text-vebook-mustard-deep">
                      {reputation.classificationLabel}
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-vebook-muted">
                  <strong className="text-vebook-navy">
                    {reputation.totalAttendances.toLocaleString('pt-BR')}
                  </strong>{' '}
                  atendimento{reputation.totalAttendances === 1 ? '' : 's'} registrado
                  {reputation.totalAttendances === 1 ? '' : 's'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenWorkshop(office.slug)}
                    className="text-xs font-bold text-vebook-mustard-deep hover:text-vebook-mustard cursor-pointer"
                  >
                    Ver oficina →
                  </button>
                  {onOpenIndexExplainer ? (
                    <button
                      type="button"
                      onClick={onOpenIndexExplainer}
                      className="text-[11px] font-semibold text-vebook-muted hover:text-vebook-navy underline underline-offset-2 cursor-pointer"
                    >
                      Sobre o índice
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
