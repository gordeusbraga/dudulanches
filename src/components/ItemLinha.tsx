import React from 'react';
import type { ItemPedido } from '../types';
import { moeda } from '../utils/format';
import { StatusItemBadge } from './Badges';

interface Props {
  item: ItemPedido;
  plano?: boolean;
}

/** Linha de item usada nas telas de mesa e de comanda. */
const ItemLinha: React.FC<Props> = ({ item, plano }) => (
  <div className={`dl-item ${plano ? 'dl-item--plano' : ''}`}>
    <span className="dl-item__qtd">{item.quantidade}x</span>

    <div className="dl-item__main">
      <p className="dl-item__nome">{item.nome}</p>
      <p className="dl-item__obs">
        {item.observacao ? `${item.observacao} · ` : ''}
        {moeda(item.precoUnitario)} un.
      </p>
    </div>

    <div className="dl-item__right">
      <span className="dl-item__preco">{moeda(item.precoUnitario * item.quantidade)}</span>
      <StatusItemBadge status={item.status} setor={item.setor} />
    </div>
  </div>
);

export default ItemLinha;
