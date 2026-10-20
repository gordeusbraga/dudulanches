import React, { useState } from 'react';
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
  useIonActionSheet,
  useIonAlert,
  useIonToast
} from '@ionic/react';
import {
  addOutline,
  closeOutline,
  createOutline,
  gridOutline,
  listOutline
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ItemLinha from '../components/ItemLinha';
import { useApp } from '../context/AppContext';
import { dataHora, hora, moeda, nomeMesa, numeroComanda } from '../utils/format';

const ComandaDetalhe: React.FC = () => {
  const { comandaId = '' } = useParams();
  const navigate = useNavigate();
  const {
    comanda,
    mesa,
    pedidosDaComanda,
    itensDaComanda,
    totalComanda,
    encerrarComanda
  } = useApp();
  const [confirmar] = useIonAlert();
  const [abrirAcoes] = useIonActionSheet();
  const [mostrarToast] = useIonToast();
  const [porPedido, setPorPedido] = useState(false);

  const c = comanda(comandaId);
  if (!c) {
    return (
      <IonPage>
        <PageHeader titulo="Comanda não encontrada" />
        <IonContent>
          <p className="dl-empty">Essa comanda não existe mais.</p>
        </IonContent>
      </IonPage>
    );
  }

  const m = mesa(c.mesaId);
  const pedidos = pedidosDaComanda(c.id);
  const itens = itensDaComanda(c.id);
  const qtdItens = itens.reduce((s, i) => s + i.quantidade, 0);
  const subtotal = totalComanda(c.id);
  const total = subtotal - c.desconto;

  /* ---------------------------- comanda encerrada ------------------------ */

  if (c.status === 'encerrada') {
    return (
      <IonPage>
        <PageHeader
          titulo={`Comanda ${numeroComanda(c.numero)}`}
          subtitulo="Encerrada"
          acoes={
            <>
              <button
                className="dl-icon-btn dl-icon-btn--light"
                type="button"
                aria-label="Ver a mesa"
                onClick={() => navigate(`/mesas/${c.mesaId}`)}
              >
                <IonIcon icon={gridOutline} />
              </button>
              <button
                className="dl-icon-btn dl-icon-btn--light"
                type="button"
                aria-label="Ir para o histórico"
                onClick={() => navigate('/historico')}
              >
                <IonIcon icon={listOutline} />
              </button>
            </>
          }
        />

        <IonContent>
          <div className="dl-page dl-stack">
            <div className="dl-recibo-topo">
              <p className="dl-recibo-topo__mesa">
                {m ? nomeMesa(m.numero).toUpperCase() : 'MESA'}
              </p>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <p className="dl-recibo-topo__valor">{moeda(total)}</p>
                <span className="dl-badge dl-badge--cinza">Encerrada</span>
              </div>

              <div className="dl-recibo-topo__grid">
                <div>
                  <span>Abertura</span>
                  {dataHora(c.abertaEm)}
                </div>
                <div>
                  <span>Encerramento</span>
                  {c.encerradaEm ? dataHora(c.encerradaEm) : '—'}
                </div>
                <div>
                  <span>Atendente</span>
                  {c.atendenteNome.split(' ')[0]}
                </div>
              </div>
            </div>

            {pedidos.map((p) => (
              <div key={p.id} className="dl-card">
                <div className="dl-recibo-pedido__titulo">
                  <span>PEDIDO {numeroComanda(p.numero)}</span>
                  <span>{hora(p.criadoEm)}</span>
                </div>
                {p.itens.map((item) => (
                  <div key={item.id} className="dl-recibo-linha">
                    <span className="dl-recibo-linha__qtd">{item.quantidade}x</span>
                    <span className="dl-recibo-linha__nome">
                      {item.nome}
                      <span className="dl-recibo-linha__unit">
                        {moeda(item.precoUnitario)}/un.
                      </span>
                    </span>
                    <span className="dl-recibo-linha__total">
                      {moeda(item.precoUnitario * item.quantidade)}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <div className="dl-card">
              <div className="dl-total-linha">
                Subtotal <span>{moeda(subtotal)}</span>
              </div>
              <div className="dl-total-linha">
                Desconto <span>{c.desconto > 0 ? `- ${moeda(c.desconto)}` : '—'}</span>
              </div>
              <div className="dl-total-linha dl-total-linha--final">
                Total <strong>{moeda(total)}</strong>
              </div>
              <p className="dl-nota">Itens e valores registrados no momento do pedido.</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  /* ------------------------------ comanda aberta ------------------------- */

  const confirmarEncerramento = () =>
    confirmar({
      header: `Encerrar comanda ${numeroComanda(c.numero)}`,
      message: `Total de ${moeda(total)}. Depois de encerrada, a comanda não recebe novos pedidos.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Encerrar',
          role: 'destructive',
          handler: () => {
            encerrarComanda(c.id);
            mostrarToast({
              message: `Comanda ${numeroComanda(c.numero)} encerrada.`,
              duration: 1800,
              position: 'top',
              color: 'success'
            });
          }
        }
      ]
    });

  return (
    <IonPage>
      <PageHeader
        titulo={m ? nomeMesa(m.numero) : 'Comanda'}
        subtitulo={`Comanda ${numeroComanda(c.numero)}`}
        acoes={
          <>
            <button
              className="dl-icon-btn dl-icon-btn--light"
              type="button"
              aria-label="Ações da comanda"
              onClick={() =>
                abrirAcoes({
                  header: `Comanda ${numeroComanda(c.numero)}`,
                  buttons: [
                    {
                      text: 'Adicionar pedido',
                      handler: () => navigate(`/comandas/${c.id}/novo-pedido`)
                    },
                    { text: 'Ver a mesa', handler: () => navigate(`/mesas/${c.mesaId}`) },
                    {
                      text: 'Encerrar comanda',
                      role: 'destructive',
                      handler: confirmarEncerramento
                    },
                    { text: 'Cancelar', role: 'cancel' }
                  ]
                })
              }
            >
              <IonIcon icon={createOutline} />
            </button>
            <button
              className="dl-icon-btn dl-icon-btn--light"
              type="button"
              aria-label="Encerrar comanda"
              onClick={confirmarEncerramento}
            >
              <IonIcon icon={closeOutline} />
            </button>
          </>
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-card dl-resumo">
            <div>
              <p className="dl-resumo__label">
                Aberta às {hora(c.abertaEm)} · {c.atendenteNome.split(' ')[0]}
              </p>
              <p className="dl-resumo__valor">
                {qtdItens} {qtdItens === 1 ? 'item no pedido' : 'itens no pedido'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="dl-resumo__label">Total parcial</p>
              <p className="dl-resumo__total">{moeda(total)}</p>
            </div>
          </div>

          <div className="dl-section-label">
            Itens da comanda
            <button type="button" className="dl-link" onClick={() => setPorPedido((v) => !v)}>
              {porPedido ? 'Ver lista completa' : 'Ver por pedido'}
            </button>
          </div>

          {itens.length === 0 ? (
            <p className="dl-empty">Nenhum item lançado. Toque em “Novo Pedido”.</p>
          ) : porPedido ? (
            <div className="dl-stack">
              {pedidos.map((p) => (
                <div key={p.id} className="dl-comanda-card">
                  <div className="dl-comanda-card__head">
                    <span className="dl-tag">Pedido {numeroComanda(p.numero)}</span>
                    <span className="dl-comanda-card__hora">{hora(p.criadoEm)}</span>
                  </div>
                  <div className="dl-comanda-card__body">
                    {p.itens.map((item) => (
                      <ItemLinha key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dl-stack">
              {itens.map((item) => (
                <ItemLinha key={item.id} item={item} plano />
              ))}
            </div>
          )}
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="dl-footer">
          <div className="dl-footer__total">
            <span>Total da comanda</span>
            <strong>{moeda(total)}</strong>
          </div>
          <div className="dl-footer__acoes">
            <button
              className="dl-btn dl-btn--primario"
              type="button"
              onClick={() => navigate(`/comandas/${c.id}/novo-pedido`)}
            >
              <IonIcon icon={addOutline} />
              Novo Pedido
            </button>
            <button
              className="dl-btn dl-btn--contorno"
              type="button"
              onClick={confirmarEncerramento}
            >
              Encerrar
            </button>
          </div>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ComandaDetalhe;
