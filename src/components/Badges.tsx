import React from 'react';
import type { Setor, StatusComanda, StatusItem } from '../types';

const CORES_ITEM: Record<StatusItem, { cor: string; rotulo: string }> = {
  pendente: { cor: 'amarelo', rotulo: 'Pendente' },
  preparo: { cor: 'laranja', rotulo: 'Em preparo' },
  pronto: { cor: 'roxo', rotulo: 'Pronto' },
  entregue: { cor: 'verde', rotulo: 'Entregue' }
};

/** No salão, "em preparo" é chamado de "atendendo". */
export const rotuloStatus = (status: StatusItem, setor?: Setor) => {
  if (setor === 'salao' && status === 'preparo') return 'Atendendo';
  return CORES_ITEM[status].rotulo;
};

export const StatusItemBadge: React.FC<{ status: StatusItem; setor?: Setor }> = ({
  status,
  setor
}) => (
  <span className={`dl-badge dl-badge--${CORES_ITEM[status].cor}`}>
    {rotuloStatus(status, setor)}
  </span>
);

export const StatusComandaBadge: React.FC<{ status: StatusComanda }> = ({ status }) => (
  <span className={`dl-badge dl-badge--${status === 'aberta' ? 'roxo' : 'cinza'}`}>
    {status === 'aberta' ? 'Em aberto' : 'Encerrada'}
  </span>
);

export const StatusMesaBadge: React.FC<{ ocupada: boolean }> = ({ ocupada }) => (
  <span className={`dl-badge dl-badge--${ocupada ? 'roxo' : 'verde'}`}>
    {ocupada ? 'Ocupada' : 'Livre'}
  </span>
);

/** Badge de tempo na fila: verde até 5 min, amarelo até 10, vermelho acima. */
export const TempoBadge: React.FC<{ minutos: number; texto: string }> = ({ minutos, texto }) => {
  const cor = minutos <= 5 ? 'verde' : minutos <= 10 ? 'amarelo' : 'vermelho';
  return <span className={`dl-badge dl-badge--${cor}`}>{texto}</span>;
};
