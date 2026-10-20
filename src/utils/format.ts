export const moeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** "19:32" */
export const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** "30/08" */
export const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

/** "30/08 · 19:32" */
export const dataHora = (iso: string) => `${dataCurta(iso)} · ${hora(iso)}`;

export const minutosDesde = (iso: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));

/** "05 min" */
export const tempoDecorrido = (iso: string) => {
  const min = minutosDesde(iso);
  if (min < 60) return `${String(min).padStart(2, '0')} min`;
  const h = Math.floor(min / 60);
  return `${h}h ${String(min % 60).padStart(2, '0')}min`;
};

export const iniciais = (nome: string) => nome.trim().charAt(0).toUpperCase();

export const mesmoDia = (iso: string, ref = new Date()) => {
  const d = new Date(iso);
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  );
};

/** Data de hoje no fuso local, no formato "2025-03-12". */
export const hojeLocal = () => {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
};

/**
 * "2025-03-12" → "12/03/2025".
 * Não passa por `new Date()`, que leria a data como meia-noite UTC
 * e mostraria o dia anterior no horário de Brasília.
 */
export const dataCadastro = (data: string) => data.slice(0, 10).split('-').reverse().join('/');

export const nomeMesa = (numero: number) => `Mesa ${String(numero).padStart(2, '0')}`;
export const numeroComanda = (numero: number) => `#${String(numero).padStart(3, '0')}`;
