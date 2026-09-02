import React, { useEffect, useState } from 'react';
import { contrastTextOn, normalizeThemeColor } from '../../lib/themeColor';
import { Field, inputClass } from './Field';

interface ThemeColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  hint?: string;
  id?: string;
}

/** Seletor de espectro de cores (input nativo + hex editável). */
export const ThemeColorPicker: React.FC<ThemeColorPickerProps> = ({
  value,
  onChange,
  label = 'Cor da página pública',
  hint = 'Usada na tarja do nome, botões e bordas dos cards do site da oficina. Você poderá alterar depois nas configurações.',
  id = 'theme-color',
}) => {
  const hex = normalizeThemeColor(value);
  const [hexDraft, setHexDraft] = useState(hex);

  useEffect(() => {
    setHexDraft(hex);
  }, [hex]);

  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className="relative flex h-12 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-slate-200 shadow-xs"
          title="Abrir espectro de cores"
        >
          <span className="absolute inset-0" style={{ backgroundColor: hex }} aria-hidden />
          <input
            id={id}
            type="color"
            value={hex}
            onChange={(e) => onChange(normalizeThemeColor(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <input
          className={`${inputClass} max-w-[9rem] font-mono uppercase`}
          value={hexDraft}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            setHexDraft(next);
            if (/^#[0-9A-F]{6}$/.test(next)) onChange(next);
          }}
          onBlur={() => {
            const normalized = normalizeThemeColor(hexDraft);
            setHexDraft(normalized);
            onChange(normalized);
          }}
          spellCheck={false}
          maxLength={7}
          aria-label="Código hexadecimal da cor"
        />
        <span
          className="inline-flex items-center rounded-lg px-3 py-2 text-xs font-extrabold"
          style={{ backgroundColor: hex, color: contrastTextOn(hex) }}
        >
          Prévia
        </span>
      </div>
      {hint ? <p className="mt-2 text-xs text-slate-500 leading-relaxed">{hint}</p> : null}
    </Field>
  );
};
