import React from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { chevronForwardOutline, readerOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { useApp } from '../context/AppContext';
import { hora, moeda, nomeMesa, numeroComanda } from '../utils/format';

/** Entrada do menu "Novo Pedido": escolhe em qual comanda aberta lançar. */
const EscolherComanda: React.FC = () => {
  const { dados, mesa, itensDaComanda, totalComanda } = useApp();
  const navigate = useNavigate();

  const abertas = dados.comandas
    .filter((c) => c.status === 'aberta')
    .sort((a, b) => a.numero - b.numero);

  return (
    <IonPage>
      <BrandHeader
        titulo="Novo Pedido"
        subtitulo={`${abertas.length} ${
          abertas.length === 1 ? 'comanda aberta' : 'comandas abertas'
        }`}
      />

      <IonContent>
        <div className="dl-page dl-stack">
          {abertas.length === 0 ? (
            <>
              <p className="dl-empty">Nenhuma comanda aberta no momento.</p>
              <button
                className="dl-btn dl-btn--primario dl-btn--bloco"
                type="button"
                onClick={() => navigate('/mesas')}
              >
                Ir para as mesas
              </button>
            </>
          ) : (
            abertas.map((c) => {
              const m = mesa(c.mesaId);
              const qtd = itensDaComanda(c.id).reduce((s, i) => s + i.quantidade, 0);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="dl-row"
                  onClick={() => navigate(`/comandas/${c.id}/novo-pedido`)}
                >
                  <span className="dl-row__icone">
                    <IonIcon icon={readerOutline} />
                  </span>
                  <div className="dl-row__main">
                    <p className="dl-row__title">
                      Comanda {numeroComanda(c.numero)} · {m ? nomeMesa(m.numero) : 'Mesa'}
                    </p>
                    <p className="dl-row__sub">
                      Aberta às {hora(c.abertaEm)} · {qtd} {qtd === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                  <div className="dl-row__right">
                    <span>
                      <span className="dl-row__valor">{moeda(totalComanda(c.id))}</span>
                    </span>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EscolherComanda;
