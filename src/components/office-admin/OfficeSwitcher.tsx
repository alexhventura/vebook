import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { PATHS } from '../../lib/paths';
import { displayOfficeHost } from '../../office/constants';
import { getDemoSession, listOfficesForUser } from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { Office } from '../../office/types';

type Props = {
  currentOfficeId: string;
  tenantMode?: boolean;
  onSwitched: (office: Office) => void;
};

export const OfficeSwitcher: React.FC<Props> = ({ currentOfficeId, tenantMode = false, onSwitched }) => {
  useOfficeSnapshot();
  const session = getDemoSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const offices = session ? listOfficesForUser(session.userId).map((item) => item.office) : [];
  const current = offices.find((item) => item.id === currentOfficeId) ?? offices[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!current) return null;

  const select = (office: Office) => {
    if (office.id === currentOfficeId) {
      setOpen(false);
      return;
    }
    setOpen(false);
    // Navega primeiro; o AdminShell sincroniza a sessão a partir do hostname (office_users).
    onSwitched(office);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex max-w-[16rem] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-left text-sm font-semibold text-[#0B1E36] hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{current.identity.publicName}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Minhas oficinas</p>
          <ul className="max-h-64 space-y-1 overflow-y-auto" role="listbox">
            {offices.map((office) => {
              const active = office.id === currentOfficeId;
              return (
                <li key={office.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => select(office)}
                    className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                      active ? 'bg-slate-100 font-semibold text-[#0B1E36]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="mt-0.5 w-4 shrink-0">{active ? <Check className="h-4 w-4" /> : null}</span>
                    <span>
                      <span className="block">{office.identity.publicName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{displayOfficeHost(office.currentHostname)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="my-2 border-t border-slate-100" />
          <Link
            to={`${PATHS.cadastroOficina}?nova=1`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#0B1E36] hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Cadastrar nova oficina
          </Link>
          {tenantMode && (
            <p className="px-2 pb-1 text-[11px] text-slate-500">No subdomínio, a troca navega para o endereço canônico da oficina no portal.</p>
          )}
        </div>
      )}
    </div>
  );
};
