import React, { useMemo, useState } from 'react';
import { IonContent, IonFooter, IonIcon, IonPage, useIonToast } from '@ionic/react';
import {
  addOutline,
  checkmarkOutline,
  createOutline,
  removeOutline,
  searchOutline
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { CATEGORIAS } from '../data/seed';
import { moeda, nomeMesa, numeroComanda } from '../utils/format';

const NovoPedido: React.FC = () => {
  const { comandaId = '' } = useParams();
  const navigate = useNavigate();
  const { dados, comanda, mesa, registrarPedido } = useApp();
  const [mostrarToast] = useIonToast();

  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [busca, setBusca] = useState('');
  const [buscaVisivel, setBuscaVisivel] = useState(false);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [observacao, setObservacao] = useState('');

  const c = comanda(comandaId);
  const m = c ? mesa(c.mesaId) : undefined;

  const produtos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return dados.produtos
      .filter((p) => p.ativo)
      .filter((p) => (termo ? p.nome.toLowerCase().includes(termo) : p.categoria === categoria));
  }, [dados.produtos, categoria, busca]);

  const selecionados = Object.entries(quantidades).filter(([, q]) => q > 0);
  const qtdTotal = selecionados.reduce((s, [, q]) => s + q, 0);
  const valorTotal = selecionados.reduce((s, [id, q]) => {
    const p = dados.produtos.find((x) => x.id === id);
    return s + (p ? p.preco * q : 0);
  }, 0);

  const alterar = (id: string, delta: number) =>
    setQuantidades((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));

  if (!c) {
    return (
      <IonPage>
        <PageHeader titulo="Novo Pedido" />
        <IonContent>
          <p className="dl-empty">Comanda não encontrada.</p>
        </IonContent>
      </IonPage>
    );
  }

  const registrar = () => {
    const pedido = registrarPedido(
      c.id,
      selecionados.map(([produtoId, quantidade]) => ({ produtoId, quantidade })),
      observacao.trim()
    );
    if (!pedido) return;
    mostrarToast({
      message: `Pedido ${numeroComanda(pedido.numero)} enviado para a fila.`,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    navigate(`/comandas/${c.id}`, { replace: true });
  };

  return (
    <IonPage>
      <PageHeader
        titulo="Novo Pedido"
        subtitulo={`${m ? nomeMesa(m.numero) : 'Mesa'} · Comanda ${numeroComanda(c.numero)}`}
        acoes={
          <button
            className="dl-icon-btn dl-icon-btn--light"
            type="button"
            aria-label="Buscar produto"
            onClick={() => {
              setBuscaVisivel((v) => !v);
              setBusca('');
            }}
          >
            <IonIcon icon={searchOutline} />
          </button>
        }
      />

      <IonContent>
        <div className="dl-page">
          {buscaVisivel && (
            <div className="dl-input" style={{ marginBottom: 14 }}>
              <IonIcon icon={searchOutline} />
              <input
                autoFocus
                value={busca}
                placeholder="Buscar produto no cardápio"
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          )}

          {!busca && (
            <div className="dl-chips">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`dl-chip ${categoria === cat ? 'dl-chip--active' : ''}`}
                  onClick={() => setCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="dl-stack" style={{ marginTop: 14 }}>
            {produtos.length === 0 && <p className="dl-empty">Nenhum produto nesta categoria.</p>}

            {produtos.map((p) => {
              const qtd = quantidades[p.id] ?? 0;
              return (
                <div
                  key={p.id}
                  className={`dl-produto-linha ${
                    qtd > 0 ? 'dl-produto-linha--selecionado' : ''
                  }`}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="dl-produto-linha__nome">
                      {p.nome}
                      <span className="dl-badge dl-badge--amarelo dl-badge--sem-ponto">
                        {p.setor === 'cozinha' ? 'Cozinha' : 'Salão'}
                      </span>
                    </p>
                    <span className="dl-produto-linha__preco">{moeda(p.preco)}</span>
                  </div>

                  <div className="dl-stepper">
                    <button
                      type="button"
                      aria-label={`Remover ${p.nome}`}
                      disabled={qtd === 0}
                      onClick={() => alterar(p.id, -1)}
                    >
                      <IonIcon icon={removeOutline} />
                    </button>
                    <span className="dl-stepper__valor">{qtd}</span>
                    <button
                      type="button"
                      aria-label={`Adicionar ${p.nome}`}
                      onClick={() => alterar(p.id, 1)}
                    >
                      <IonIcon icon={addOutline} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dl-obs-card" style={{ marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <p className="dl-obs-card__label">Observação do pedido</p>
              <textarea
                rows={1}
                value={observacao}
                placeholder="Ex.: sem cebola no X-Burguer"
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
            <IonIcon icon={createOutline} style={{ color: 'var(--dl-brand-500)' }} />
          </div>
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="dl-footer">
          <div className="dl-footer__total">
            <span>
              {qtdTotal} {qtdTotal === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
            <strong>{moeda(valorTotal)}</strong>
          </div>
          <button
            className="dl-btn dl-btn--acento dl-btn--bloco"
            type="button"
            disabled={qtdTotal === 0}
            onClick={registrar}
          >
            <IonIcon icon={checkmarkOutline} />
            Registrar Pedido
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default NovoPedido;
