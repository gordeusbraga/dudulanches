import React from 'react';
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
  checkmarkCircleOutline,
  createOutline,
  listOutline,
  readerOutline,
  settingsOutline,
  gitMergeOutline
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ItemLinha from '../components/ItemLinha';
import { StatusComandaBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import { hora, mesmoDia, moeda, nomeMesa, numeroComanda } from '../utils/format';

const MesaDetalhe: React.FC = () => {
  const { mesaId = '' } = useParams();
  const navigate = useNavigate();
  const {
    mesa,
    comandasDaMesa,
    itensDaComanda,
    totalComanda,
    totalMesa,
    mesaOcupada,
    abrirComanda,
    encerrarMesa,
    sessao
  } = useApp();
  const [confirmar] = useIonAlert();
  const [abrirAcoes] = useIonActionSheet();
  const [mostrarToast] = useIonToast();

  const m = mesa(mesaId);
  if (!m) {
    return (
      <IonPage>
        <PageHeader titulo="Mesa não encontrada" />
        <IonContent>
          <p className="dl-empty">Essa mesa não existe mais.</p>
        </IonContent>
      </IonPage>
    );
  }

  const abertas = comandasDaMesa(m.id, 'aberta');
  const ocupada = mesaOcupada(m.id);
  const encerradas = comandasDaMesa(m.id, 'encerrada');
  const ultima = encerradas[encerradas.length - 1];
  const totalDoDia = encerradas
    .filter((c) => mesmoDia(c.abertaEm))
    .reduce((s, c) => s + totalComanda(c.id), 0);

  const novaComanda = () => {
    const c = abrirComanda(m.id);
    navigate(`/comandas/${c.id}`);
  };

  const confirmarEncerramento = () =>
    confirmar({
      header: 'Encerrar mesa',
      message: `Todas as comandas abertas da ${nomeMesa(m.numero)} serão encerradas.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Encerrar',
          role: 'destructive',
          handler: () => {
            encerrarMesa(m.id);
            mostrarToast({
              message: `${nomeMesa(m.numero)} liberada.`,
              duration: 1800,
              position: 'top',
              color: 'success'
            });
            navigate('/mesas');
          }
        }
      ]
    });

  const menuDaMesa = () =>
    abrirAcoes({
      header: nomeMesa(m.numero),
      buttons: [
        { text: 'Ver histórico da mesa', handler: () => navigate('/historico') },
        { text: 'Ver cardápio', handler: () => navigate('/produtos') },
        ...(ocupada
          ? [
              {
                text: 'Encerrar mesa',
                role: 'destructive' as const,
                handler: confirmarEncerramento
              }
            ]
          : []),
        { text: 'Cancelar', role: 'cancel' as const }
      ]
    });

  /* ----------------------------- mesa ocupada ---------------------------- */

  if (ocupada) {
    return (
      <IonPage>
        <PageHeader
          titulo={nomeMesa(m.numero)}
          subtitulo={`${abertas.length} ${
            abertas.length === 1 ? 'comanda aberta' : 'comandas abertas'
          }`}
          acoes={
            <button
              className="dl-icon-btn dl-icon-btn--light"
              type="button"
              aria-label="Ações da mesa"
              onClick={menuDaMesa}
            >
              <IonIcon icon={createOutline} />
            </button>
          }
        />

        <IonContent>
          <div className="dl-page dl-stack">
            {abertas.map((comanda) => {
              const itens = itensDaComanda(comanda.id);
              return (
                <div
                  key={comanda.id}
                  className="dl-comanda-card"
                  onClick={() => navigate(`/comandas/${comanda.id}`)}
                >
                  <div className="dl-comanda-card__head">
                    <span className="dl-tag">Comanda {numeroComanda(comanda.numero)}</span>
                    <span className="dl-comanda-card__hora">{hora(comanda.abertaEm)}</span>
                    <StatusComandaBadge status={comanda.status} />
                  </div>

                  <div className="dl-comanda-card__body">
                    {itens.length === 0 ? (
                      <p className="dl-item__obs" style={{ padding: '4px 2px' }}>
                        Nenhum item lançado ainda.
                      </p>
                    ) : (
                      itens.map((item) => <ItemLinha key={item.id} item={item} />)
                    )}
                  </div>

                  <div className="dl-comanda-card__foot">
                    Subtotal <strong>{moeda(totalComanda(comanda.id))}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </IonContent>

        <IonFooter className="ion-no-border">
          <div className="dl-footer">
            <div className="dl-footer__total">
              <span>Total da mesa</span>
              <strong>{moeda(totalMesa(m.id))}</strong>
            </div>
            <div className="dl-footer__acoes">
              <button className="dl-btn dl-btn--primario" type="button" onClick={novaComanda}>
                <IonIcon icon={addOutline} />
                Nova Comanda
              </button>
              <button
                className="dl-btn dl-btn--contorno"
                type="button"
                onClick={confirmarEncerramento}
              >
                Encerrar mesa
              </button>
            </div>
          </div>
        </IonFooter>
      </IonPage>
    );
  }

  /* ------------------------------ mesa livre ----------------------------- */

  return (
    <IonPage>
      <PageHeader
        titulo={nomeMesa(m.numero)}
        subtitulo={`${m.local} · ${m.lugares} lugares`}
        acoes={
          <button
            className="dl-icon-btn dl-icon-btn--light"
            type="button"
            aria-label="Ações da mesa"
            onClick={menuDaMesa}
          >
            <IonIcon icon={settingsOutline} />
          </button>
        }
      />

      <IonContent>
        <div className="dl-page dl-stack">
          <div className="dl-livre-card">
            <div className="dl-livre-card__icone">
              <IonIcon icon={checkmarkCircleOutline} />
            </div>
            <h2 className="dl-livre-card__titulo">Mesa livre</h2>
            <p className="dl-livre-card__texto">
              Nenhuma comanda aberta no momento.
              <br />
              Abra uma comanda para iniciar o atendimento.
            </p>
          </div>

          <div className="dl-card dl-info-list" style={{ paddingTop: 4, paddingBottom: 4 }}>
            <div className="dl-info-list__linha">
              Último atendimento
              <strong>
                {ultima?.encerradaEm
                  ? `${mesmoDia(ultima.encerradaEm) ? 'Hoje' : 'Anterior'} · ${hora(
                      ultima.encerradaEm
                    )}`
                  : '—'}
              </strong>
            </div>
            <div className="dl-info-list__linha">
              Total do dia nesta mesa
              <strong>{moeda(totalDoDia)}</strong>
            </div>
            <div className="dl-info-list__linha">
              Responsável
              <strong>{ultima?.atendenteNome ?? sessao?.nome ?? '—'}</strong>
            </div>
          </div>

          <p className="dl-section-label">Ações rápidas</p>
          <div className="dl-acoes-rapidas">
            <button
              className="dl-acao-rapida"
              type="button"
              onClick={() =>
                mostrarToast({
                  message: 'Unir mesas ainda não está disponível.',
                  duration: 1800,
                  position: 'top'
                })
              }
            >
              <IonIcon icon={gitMergeOutline} />
              Unir mesas
            </button>
            <button
              className="dl-acao-rapida"
              type="button"
              onClick={() => navigate('/historico')}
            >
              <IonIcon icon={listOutline} />
              Ver histórico
            </button>
            <button
              className="dl-acao-rapida"
              type="button"
              onClick={() => navigate('/produtos')}
            >
              <IonIcon icon={readerOutline} />
              Cardápio
            </button>
          </div>
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="dl-footer">
          <button className="dl-btn dl-btn--acento dl-btn--bloco" type="button" onClick={novaComanda}>
            <IonIcon icon={addOutline} />
            Abrir Comanda
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default MesaDetalhe;
