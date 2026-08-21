/**
 * Utilitários gerais do VEBOOK
 */

export function formatPlate(value: string): string {
  // Remove caracteres especiais
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return cleaned;
}

export function isValidPlateFormat(plate: string): boolean {
  // Padrão Mercosul (ABC1D23) ou Padrão Tradicional (ABC1234)
  const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const tradicionalRegex = /^[A-Z]{3}[0-9]{4}$/;
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return mercosulRegex.test(clean) || tradicionalRegex.test(clean);
}

export function getPlateStandard(plate: string): 'Mercosul' | 'Tradicional' | 'Incompleta' {
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean)) return 'Mercosul';
  if (/^[A-Z]{3}[0-9]{4}$/.test(clean)) return 'Tradicional';
  return 'Incompleta';
}
