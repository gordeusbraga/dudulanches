import React, { useEffect, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { checkmarkDoneOutline, checkmarkOutline, playOutline } from 'ionicons/icons';
import BrandHeader from '../components/BrandHeader';
import { TempoBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import type { Setor, StatusItem } from '../types';
import { minutosDesde, nomeMesa, numeroComanda, tempoDecorrido } from '../utils/format';

interface Props {
  setor: Setor;
}

const TITULO: Record<Setor, string> = { cozinha: 'Cozinha', salao: 'Salão' };

/** Rótulos e ações mudam conforme o setor. */
const ABAS: Record<Setor, { status: StatusItem; rotulo: string }[]> = {
  cozinha: [
    { status: 'pendente', rotulo: 'Pendentes' },
    { status: 'preparo', rotulo: 'Em preparo' },
    { status: 'pronto', rotulo: 'Prontos' }
  ],
  salao: [
    { status: 'pendente', rotulo: 'Pendentes' },
    { status: 'preparo', rotulo: 'Atendendo' },
    { status: 'pronto', rotulo: 'Prontos' }
  ]
};

const ACAO: Record<Setor, Partial<Record<StatusItem, { texto: string; icone: string }>>> = {
  cozinha: {
    pendente: { texto: 'Iniciar preparo', icone: playOutline },
    preparo: { texto: 'Marcar como pronto', icone: checkmarkOutline },
    pronto: { texto: 'Marcar como entregue', icone: checkmarkDoneOutline }
  },
  salao: {
    pendente: { texto: 'Iniciar atendimento', icone: playOutline },
    preparo: { texto: 'Marcar como pronto', icone: checkmarkOutline },
    pronto: { texto: 'Marcar como entregue', icone: checkmarkDoneOutline }
  }
};

/** Tela usada pela Cozinha e pelo Salão — muda apenas o setor. */
const Fila: React.FC<Props> = ({ setor }) => {
  const { filaDoSetor, avancarItem } = useApp();
  const [aba, setAba] = useState<StatusItem>('pendente');
  const [, forcarRender] = useState(0);

  // Mantém os contadores de tempo atualizados.
  useEffect(() => {
    const t = setInterval(() => forcarRender((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const fila = filaDoSetor(setor);
  const contar = (s: StatusItem) => fila.filter((f) => f.item.status === s).length;
  const visiveis = fila.filter((f) => f.item.status === aba);

  return (
    <IonPage>
      <BrandHeader
        titulo={TITULO[setor]}
        subtitulo={`${contar('pendente')} ${
          contar('pendente') === 1 ? 'pedido na fila' : 'pedidos na fila'
        }`}
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-tabs">
            {ABAS[setor].map((a) => (
              <button
                key={a.status}
                type="button"
                className={`dl-tabs__item ${aba === a.status ? 'dl-tabs__item--active' : ''}`}
                onClick={() => setAba(a.status)}
              >
                {a.rotulo}
                <span className="dl-tabs__count">{contar(a.status)}</span>
              </button>
            ))}
          </div>

          <div className="dl-stack" style={{ marginTop: 14 }}>
            {visiveis.length === 0 && <p className="dl-empty">Nada por aqui no momento.</p>}

            {visiveis.map(({ pedido, item, mesa }) => {
              const acao = ACAO[setor][item.status];
              const minutos = minutosDesde(pedido.criadoEm);
              return (
                <div key={item.id} className="dl-fila-card">
                  <div className="dl-fila-card__head">
                    <span className="dl-tag dl-tag--escura">
                      {mesa ? nomeMesa(mesa.numero) : 'Mesa'}
                    </span>
                    <span className="dl-fila-card__pedido">
                      Pedido {numeroComanda(pedido.numero)}
                    </span>
                    <TempoBadge minutos={minutos} texto={tempoDecorrido(pedido.criadoEm)} />
                  </div>

                  <div className="dl-item" style={{ border: 'none', padding: 0 }}>
                    <span className="dl-item__qtd dl-item__qtd--amarela">{item.quantidade}x</span>
                    <div className="dl-item__main">
                      <p className="dl-item__nome">{item.nome}</p>
                      {item.observacao && <p className="dl-item__obs">{item.observacao}</p>}
                    </div>
                  </div>

                  {acao && (
                    <button
                      type="button"
                      className="dl-fila-card__acao"
                      onClick={() => avancarItem(item.id)}
                    >
                      <IonIcon icon={acao.icone} />
                      {acao.texto}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Fila;
