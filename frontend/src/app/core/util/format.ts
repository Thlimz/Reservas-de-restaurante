function pad(n: number): string { return String(n).padStart(2, '0'); }

export function isoToday(): string {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

/** 'yyyy-MM-dd' -> 'dd/MM/yyyy' */
export function formatDateBr(iso: string): string {
  if (!iso) { return ''; }
  const [a, m, d] = iso.split('-');
  return d + '/' + m + '/' + a;
}

export function startDateTime(iso: string, hora: string): Date {
  const [Y, M, D] = iso.split('-').map(Number);
  const [h, mi] = hora.split(':').map(Number);
  return new Date(Y, M - 1, D, h, mi, 0);
}

/** true se [aS,aE) e [bS,bE) se sobrepoem (horas 'HH:mm' comparam lexicograficamente). */
export function timeOverlap(aS: string, aE: string, bS: string, bE: string): boolean {
  return aS < bE && bS < aE;
}

/** Cancelamento permitido apenas ate 2h antes do inicio. */
export function dentroJanelaCancelamento(dataReserva: string, horaInicio: string): boolean {
  const diffH = (startDateTime(dataReserva, horaInicio).getTime() - Date.now()) / 3_600_000;
  return diffH >= 2;
}