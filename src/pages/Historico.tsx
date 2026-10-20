import React, { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { readerOutline, statsChartOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { StatusComandaBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import { dataCurta, hora, mesmoDia, moeda, nomeMesa, numeroComanda } from '../utils/format';

type Filtro = 'todas' | 'aberta' | 'encerrada';

const Historico: React.FC = () => {
  const { dados, mesa, totalComanda } = useApp();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busca, setBusca] = useState('');

  const comandas = useMemo(
    () =>
      [...dados.comandas].sort((a, b) => b.abertaEm.localeCompare(a.abertaEm)),
    [dados.comandas]
  );

  const doDia = comandas.filter((c) => mesmoDia(c.abertaEm));
  const totalDoDia = doDia.reduce((s, c) => s + totalComanda(c.id) - c.desconto, 0);
  const ticketMedio = doDia.length > 0 ? totalDoDia / doDia.length : 0;

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase().replace('#', '');
    return comandas
      .filter((c) => (filtro === 'todas' ? true : c.status === filtro))
      .filter((c) => {
        if (!termo) return true;
        const m = mesa(c.mesaId);
        return (
          numeroComanda(c.numero).replace('#', '').includes(termo) ||
          (m ? nomeMesa(m.numero).toLowerCase().includes(termo) : false)
        );
      });
  }, [comandas, filtro, busca, mesa]);

  const abas: { id: Filtro; rotulo: string; total: number }[] = [
    { id: 'todas', rotulo: 'Todas', total: comandas.length },
    { id: 'aberta', rotulo: 'Abertas', total: comandas.filter((c) => c.status === 'aberta').length },
    {
      id: 'encerrada',
      rotulo: 'Encerradas',
      total: comandas.filter((c) => c.status === 'encerrada').length
    }
  ];

  return (
    <IonPage>
      <BrandHeader
        titulo="Histórico"
        subtitulo="Últimos 30 dias"
        busca={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar comanda ou mesa' }}
        acao={
          <button
            className="dl-icon-btn"
            type="button"
            aria-label="Relatórios"
            onClick={() => navigate('/relatorios')}
          >
            <IonIcon icon={statsChartOutline} />
          </button>
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-kpi">
            <div>
              <p className="dl-kpi__label">HOJE</p>
              <p className="dl-kpi__valor">{moeda(totalDoDia)}</p>
            </div>
            <div className="dl-kpi__extra">
              {doDia.length} comandas
              <br />
              Ticket médio {moeda(ticketMedio)}
            </div>
          </div>

          <div className="dl-tabs" style={{ marginTop: 14 }}>
            {abas.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`dl-tabs__item ${filtro === a.id ? 'dl-tabs__item--active' : ''}`}
                onClick={() => setFiltro(a.id)}
              >
                {a.rotulo}
                {a.id !== 'todas' && <span className="dl-tabs__count">{a.total}</span>}
              </button>
            ))}
          </div>

          <div className="dl-stack" style={{ marginTop: 14 }}>
            {visiveis.length === 0 && <p className="dl-empty">Nenhuma comanda encontrada.</p>}

            {visiveis.map((c) => {
              const m = mesa(c.mesaId);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="dl-row"
                  onClick={() => navigate(`/comandas/${c.id}`)}
                >
                  <span className="dl-row__icone">
                    <IonIcon icon={readerOutline} />
                  </span>
                  <div className="dl-row__main">
                    <p className="dl-row__title">
                      Comanda {numeroComanda(c.numero)} · {m ? nomeMesa(m.numero) : 'Mesa'}
                    </p>
                    <p className="dl-row__sub">
                      {dataCurta(c.abertaEm)} · {hora(c.abertaEm)}
                      {c.encerradaEm ? ` – ${hora(c.encerradaEm)}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="dl-row__valor">
                      {moeda(totalComanda(c.id) - c.desconto)}
                    </span>
                    <StatusComandaBadge status={c.status} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Historico;
