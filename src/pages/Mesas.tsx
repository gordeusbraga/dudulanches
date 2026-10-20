import React, { useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { StatusMesaBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import { hora, minutosDesde, moeda, nomeMesa, numeroComanda } from '../utils/format';

type Filtro = 'todas' | 'livres' | 'ocupadas';

const Mesas: React.FC = () => {
  const { dados, comandasDaMesa, itensDaComanda, totalMesa, mesaOcupada } = useApp();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busca, setBusca] = useState('');

  /** Monta o resumo de cada mesa a partir das comandas abertas. */
  const mesas = useMemo(
    () =>
      dados.mesas.map((mesa) => {
        const abertas = comandasDaMesa(mesa.id, 'aberta');
        const itens = abertas.flatMap((c) => itensDaComanda(c.id));
        const pendenteAntigo = itens.some(
          (i) => i.status === 'pendente' || i.status === 'preparo'
        );
        return {
          mesa,
          ocupada: abertas.length > 0,
          comandas: abertas,
          qtdItens: itens.reduce((s, i) => s + i.quantidade, 0),
          total: totalMesa(mesa.id),
          desde: abertas[0]?.abertaEm,
          atrasada:
            pendenteAntigo && abertas.some((c) => minutosDesde(c.abertaEm) > 30)
        };
      }),
    [dados.mesas, comandasDaMesa, itensDaComanda, totalMesa]
  );

  const ocupadas = mesas.filter((m) => m.ocupada).length;

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return mesas
      .filter((m) =>
        filtro === 'todas' ? true : filtro === 'livres' ? !m.ocupada : m.ocupada
      )
      .filter((m) => {
        if (!termo) return true;
        const porMesa = nomeMesa(m.mesa.numero).toLowerCase().includes(termo);
        const porComanda = m.comandas.some((c) =>
          numeroComanda(c.numero).toLowerCase().includes(termo.replace('#', ''))
        );
        return porMesa || porComanda;
      });
  }, [mesas, filtro, busca]);

  const chips: { id: Filtro; rotulo: string; total: number }[] = [
    { id: 'todas', rotulo: 'Todas', total: mesas.length },
    { id: 'livres', rotulo: 'Livres', total: mesas.length - ocupadas },
    { id: 'ocupadas', rotulo: 'Ocupadas', total: ocupadas }
  ];

  return (
    <IonPage>
      <BrandHeader
        titulo="Mesas"
        subtitulo={`${dados.mesas.length} mesas · ${ocupadas} ocupadas`}
        busca={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar mesa ou comanda' }}
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-chips">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`dl-chip ${filtro === c.id ? 'dl-chip--active' : ''}`}
                onClick={() => setFiltro(c.id)}
              >
                {c.rotulo}
                <span className="dl-chip__count">{c.total}</span>
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <p className="dl-empty">Nenhuma mesa encontrada.</p>
          ) : (
            <div className="dl-mesas-grid">
              {visiveis.map(({ mesa, ocupada, qtdItens, total, desde, atrasada }) => (
                <button
                  key={mesa.id}
                  type="button"
                  className={[
                    'dl-mesa-card',
                    ocupada ? 'dl-mesa-card--ocupada' : '',
                    atrasada ? 'dl-mesa-card--alerta' : ''
                  ].join(' ')}
                  onClick={() => navigate(`/mesas/${mesa.id}`)}
                >
                  <div className="dl-mesa-card__top">
                    <span className="dl-mesa-card__numero">
                      {String(mesa.numero).padStart(2, '0')}
                    </span>
                    <StatusMesaBadge ocupada={ocupada} />
                  </div>

                  <p className="dl-mesa-card__nome">{nomeMesa(mesa.numero)}</p>
                  <p className="dl-mesa-card__info">
                    {ocupada && desde
                      ? `${qtdItens} ${qtdItens === 1 ? 'item' : 'itens'} · ${hora(desde)}`
                      : 'Toque para abrir'}
                  </p>
                  <p
                    className={`dl-mesa-card__valor ${
                      ocupada ? '' : 'dl-mesa-card__valor--vazio'
                    }`}
                  >
                    {ocupada ? moeda(total) : '—'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Mesas;
