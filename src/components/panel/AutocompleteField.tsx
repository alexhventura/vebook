import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { inputClass } from '../ui/Field';

export type AutocompleteOption = {
  id: string;
  label: string;
  description?: string;
  /** Texto extra usado na filtragem (ex.: telefone, modelo). */
  keywords?: string;
};

type AutocompleteFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  /** Mínimo de caracteres para abrir sugestões. Padrão: 1 */
  minChars?: number;
  /** Quantidade inicial de sugestões. Padrão: 3 */
  initialLimit?: number;
  id?: string;
  autoComplete?: string;
  normalizeValue?: (raw: string) => string;
  /** Quando false, não mostra o aviso de lista vazia (útil em busca livre). Padrão: true */
  showEmptyMessage?: boolean;
  emptyHint?: string;
  /** Quando não houver sugestões, permite usar o texto digitado (ex.: cadastrar novo). */
  onAddWhenEmpty?: (value: string) => void;
  addWhenEmptyLabel?: (value: string) => string;
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function optionMatches(option: AutocompleteOption, query: string): { match: boolean; rank: number } {
  const label = normalizeText(option.label);
  const description = normalizeText(option.description || '');
  const keywords = normalizeText(option.keywords || '');
  const tokens = `${label} ${description} ${keywords}`.split(/\s+/).filter(Boolean);

  if (label.startsWith(query) || tokens.some((token) => token.startsWith(query))) {
    return { match: true, rank: 0 };
  }
  if (label.includes(query) || description.includes(query) || keywords.includes(query)) {
    return { match: true, rank: 1 };
  }
  return { match: false, rank: 2 };
}

type MenuPosition = { top: number; left: number; width: number };

/**
 * Campo de autocomplete do painel: sugere registros existentes conforme a digitação.
 * Mostra as 3 primeiras coincidências e o botão "Mais" quando houver restantes.
 * A lista usa portal (fixed) para não ser cortada pelo overflow do quadro do painel.
 */
export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  value,
  onChange,
  options,
  onSelect,
  placeholder,
  className = '',
  inputClassName = '',
  disabled = false,
  minChars = 1,
  initialLimit = 3,
  id,
  autoComplete = 'off',
  normalizeValue,
  showEmptyMessage = true,
  emptyHint = 'Nenhuma sugestão encontrada.',
  onAddWhenEmpty,
  addWhenEmptyLabel,
}) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

  const query = normalizeText(value);
  const ready = query.length >= minChars;

  const matches = useMemo(() => {
    if (!ready) return [];
    return options
      .map((option) => {
        const result = optionMatches(option, query);
        if (!result.match) return null;
        return { option, rank: result.rank };
      })
      .filter((row): row is { option: AutocompleteOption; rank: number } => Boolean(row))
      .sort((a, b) => a.rank - b.rank || a.option.label.localeCompare(b.option.label, 'pt-BR'))
      .map((row) => row.option);
  }, [options, query, ready]);

  const visible = expanded ? matches : matches.slice(0, initialLimit);
  const remaining = Math.max(0, matches.length - initialLimit);
  const showList = open && ready && matches.length > 0;
  const showEmpty = (showEmptyMessage || onAddWhenEmpty) && open && ready && matches.length === 0;
  const showMenu = showList || showEmpty;
  const canAddWhenEmpty = Boolean(onAddWhenEmpty && value.trim());

  const updateMenuPosition = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!showMenu) {
      setMenuPos(null);
      return;
    }
    updateMenuPosition();
  }, [showMenu, value, expanded, visible.length]);

  useEffect(() => {
    if (!showMenu) return;
    const onReposition = () => updateMenuPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [showMenu]);

  useEffect(() => {
    setExpanded(false);
    setHighlight(0);
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
      setExpanded(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const pick = (option: AutocompleteOption) => {
    onChange(option.label);
    onSelect?.(option);
    setOpen(false);
    setExpanded(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (showEmpty && canAddWhenEmpty && event.key === 'Enter') {
      event.preventDefault();
      onAddWhenEmpty?.(value);
      setOpen(false);
      setExpanded(false);
      return;
    }
    if (!showList) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, visible.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      const option = visible[highlight];
      if (option) {
        event.preventDefault();
        pick(option);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      setExpanded(false);
    }
  };

  const menu =
    showMenu && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={listId}
            role={showList ? 'listbox' : undefined}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              zIndex: 80,
            }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {showList ? (
              <>
                <ul className="max-h-56 overflow-y-auto py-1">
                  {visible.map((option, index) => (
                    <li key={option.id} role="option" aria-selected={index === highlight}>
                      <button
                        type="button"
                        className={`w-full px-3 py-2 text-left cursor-pointer ${
                          index === highlight ? 'bg-sky-50' : 'hover:bg-slate-50'
                        }`}
                        onMouseEnter={() => setHighlight(index)}
                        onClick={() => pick(option)}
                      >
                        <span className="block text-sm font-semibold text-[#0B1E36]">{option.label}</span>
                        {option.description ? (
                          <span className="block text-xs text-slate-500 mt-0.5">{option.description}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
                {!expanded && remaining > 0 ? (
                  <button
                    type="button"
                    className="w-full border-t border-slate-100 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpanded(true)}
                  >
                    Mais ({remaining})
                  </button>
                ) : null}
              </>
            ) : (
              <div className="px-3 py-2 space-y-2">
                {showEmptyMessage && !canAddWhenEmpty ? (
                  <p className="text-xs text-slate-500">{emptyHint}</p>
                ) : null}
                {canAddWhenEmpty ? (
                  <button
                    type="button"
                    className="w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left text-sm font-bold text-sky-900 hover:bg-sky-100 cursor-pointer"
                    onClick={() => {
                      onAddWhenEmpty?.(value);
                      setOpen(false);
                      setExpanded(false);
                    }}
                  >
                    {addWhenEmptyLabel?.(value) ?? `Adicionar "${value}"`}
                  </button>
                ) : showEmptyMessage ? (
                  <p className="text-xs text-slate-500">{emptyHint}</p>
                ) : null}
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        className={`${inputClass} ${inputClassName}`.trim()}
        onFocus={() => {
          setOpen(true);
          updateMenuPosition();
        }}
        onChange={(event) => {
          const next = normalizeValue ? normalizeValue(event.target.value) : event.target.value;
          onChange(next);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {menu}
    </div>
  );
};
