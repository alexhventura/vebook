import React, { useCallback, useState } from 'react';
import { formatPlate, isValidPlateFormat, getPlateStandard } from '../lib/utils';
import { VEHICLES_MOCK } from '../data/mockData';

export type ConsultaOutcome = 'idle' | 'loading' | 'found' | 'not_found' | 'invalid';

export function useConsulta(initialPlate = '') {
  const [plate, setPlate] = useState(formatPlate(initialPlate));
  const [searchedPlate, setSearchedPlate] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ConsultaOutcome>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlateChange = useCallback((value: string) => {
    const formatted = formatPlate(value);
    setPlate(formatted);
    setErrorMessage('');
    if (outcome !== 'idle' && outcome !== 'loading') {
      setOutcome('idle');
      setSearchedPlate(null);
    }
  }, [outcome]);

  const runLookup = useCallback((rawPlate: string, onFound?: (clean: string) => void) => {
    const clean = formatPlate(rawPlate);

    if (!clean) {
      setOutcome('invalid');
      setErrorMessage('Informe a placa do veículo para consultar.');
      setSearchedPlate(null);
      return;
    }

    if (!isValidPlateFormat(clean)) {
      setOutcome('invalid');
      setErrorMessage('Formato de placa inválido. Use Mercosul (ABC1D23) ou tradicional (ABC1234).');
      setSearchedPlate(null);
      return;
    }

    setIsLoading(true);
    setOutcome('loading');
    setErrorMessage('');

    window.setTimeout(() => {
      setIsLoading(false);
      setSearchedPlate(clean);
      if (VEHICLES_MOCK[clean]) {
        setOutcome('found');
        onFound?.(clean);
      } else {
        setOutcome('not_found');
      }
    }, 450);
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent, onFound?: (clean: string) => void) => {
    if (e) e.preventDefault();
    runLookup(plate, onFound);
  }, [plate, runLookup]);

  const resetConsulta = useCallback(() => {
    setPlate('');
    setSearchedPlate(null);
    setOutcome('idle');
    setErrorMessage('');
    setIsLoading(false);
  }, []);

  return {
    plate,
    searchedPlate,
    outcome,
    hasError: outcome === 'invalid',
    errorMessage,
    isLoading,
    plateStandard: getPlateStandard(plate),
    handlePlateChange,
    handleSubmit,
    runLookup,
    resetConsulta,
  };
}
