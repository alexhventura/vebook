import React, { useState, useCallback } from 'react';
import { formatPlate, isValidPlateFormat, getPlateStandard } from '../lib/utils';

export function useConsulta() {
  const [plate, setPlate] = useState('');
  const [searchedPlate, setSearchedPlate] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlateChange = useCallback((value: string) => {
    const formatted = formatPlate(value);
    setPlate(formatted);
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
    if (searchedPlate) {
      setSearchedPlate(null);
    }
  }, [hasError, searchedPlate]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const clean = plate.trim();
    if (!clean) {
      setHasError(true);
      setErrorMessage('Por favor, informe a placa do veículo para consultar.');
      return;
    }

    if (!isValidPlateFormat(clean)) {
      setHasError(true);
      setErrorMessage('Formato de placa inválido. Digite no padrão Mercosul (ex: ABC1D23) ou Tradicional (ex: ABC1234).');
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      setSearchedPlate(clean);
    }, 250);
  }, [plate]);

  const resetConsulta = useCallback(() => {
    setPlate('');
    setSearchedPlate(null);
    setHasError(false);
    setErrorMessage('');
  }, []);

  const plateStandard = getPlateStandard(plate);

  return {
    plate,
    searchedPlate,
    hasError,
    errorMessage,
    isLoading,
    plateStandard,
    handlePlateChange,
    handleSubmit,
    resetConsulta,
  };
}
