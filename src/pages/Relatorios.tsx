import React, { useMemo } from 'react';
import { IonContent, IonIcon, IonPage, useIonAlert, useIonToast } from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import BrandHeader from '../components/BrandHeader';
import { useApp } from '../context/AppContext';
import { mesmoDia, moeda } from '../utils/format';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Relatorios: React.FC = () => {
  const { dados, totalComanda, restaurarExemplo } = useApp();
  const [confirmar] = useIonAlert();
  const [mostrarToast] = useIonToast();

  const encerradas = dados.comandas.filter((c) => c.status === 'encerrada');

  const totalGeral = encerradas.reduce((s, c) => s + totalComanda(c.id) - c.desconto, 0);
  const hoje = encerradas.filter((c) => mesmoDia(c.abertaEm));
  const totalHoje = hoje.reduce((s, c) => s + totalComanda(c.id) - c.desconto, 0);
  const ticket = encerradas.length > 0 ? totalGeral / encerradas.length : 0;

  /** Faturamento dos últimos 7 dias. */
  const porDia = useMemo(() => {
    const base = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { rotulo: DIAS[d.getDay()], data: d, total: 0 };
    });
    encerradas.forEach((c) => {
      const alvo = base.find((b) => mesmoDia(c.abertaEm, b.data));
      if (alvo) alvo.total += totalComanda(c.id) - c.desconto;
    });
    return base;
  }, [encerradas, totalComanda]);

  const maiorDia = Math.max(1, ...porDia.map((d) => d.total));

  /** Produtos mais vendidos (todas as comandas). */
  const topProdutos = useMemo(() => {
    const mapa = new Map<string, { nome: string; qtd: number; valor: number }>();
    dados.pedidos.forEach((p) =>
      p.itens.forEach((i) => {
        const atual = mapa.get(i.produtoId) ?? { nome: i.nome, qtd: 0, valor: 0 };
        atual.qtd += i.quantidade;
        atual.valor += i.quantidade * i.precoUnitario;
        mapa.set(i.produtoId, atual);
      })
    );
    return [...mapa.values()].sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  }, [dados.pedidos]);

  const maiorProduto = Math.max(1, ...topProdutos.map((p) => p.qtd));

  /** Vendas por atendente. */
  const porAtendente = useMemo(() => {
    const mapa = new Map<string, number>();
    encerradas.forEach((c) => {
      mapa.set(c.atendenteNome, (mapa.get(c.atendenteNome) ?? 0) + totalComanda(c.id) - c.desconto);
    });
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [encerradas, totalComanda]);

  const maiorAtendente = Math.max(1, ...porAtendente.map(([, v]) => v));

  const restaurar = () =>
    confirmar({
      header: 'Restaurar dados de exemplo',
      message: 'Todas as alterações feitas no app voltam ao estado inicial.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restaurar',
          role: 'destructive',
          handler: () => {
            restaurarExemplo();
            mostrarToast({
              message: 'Dados de exemplo restaurados.',
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
      <BrandHeader
        titulo="Relatórios"
        subtitulo={`${encerradas.length} comandas encerradas`}
        acao={
          <button
            className="dl-icon-btn"
            type="button"
            aria-label="Restaurar dados de exemplo"
            onClick={restaurar}
          >
            <IonIcon icon={refreshOutline} />
          </button>
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-kpi">
            <div>
              <p className="dl-kpi__label">FATURAMENTO DE HOJE</p>
              <p className="dl-kpi__valor">{moeda(totalHoje)}</p>
            </div>
            <div className="dl-kpi__extra">
              {hoje.length} comandas
              <br />
              Total geral {moeda(totalGeral)}
            </div>
          </div>

          <div className="dl-mini-grid" style={{ marginTop: 12 }}>
            <div className="dl-mini-card">
              <p className="dl-mini-card__valor">{moeda(ticket)}</p>
              <p className="dl-mini-card__label">Ticket médio</p>
            </div>
            <div className="dl-mini-card">
              <p className="dl-mini-card__valor">
                {dados.comandas.filter((c) => c.status === 'aberta').length}
              </p>
              <p className="dl-mini-card__label">Comandas abertas</p>
            </div>
          </div>

          <p className="dl-section-label">Últimos 7 dias</p>
          <div className="dl-card">
            {porDia.map((d, i) => (
              <div key={`${d.rotulo}-${i}`} className="dl-barra">
                <div className="dl-barra__topo">
                  {d.rotulo}
                  <strong>{moeda(d.total)}</strong>
                </div>
                <div className="dl-barra__trilho">
                  <div
                    className="dl-barra__preenchimento"
                    style={{ width: `${(d.total / maiorDia) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="dl-section-label">Mais vendidos</p>
          <div className="dl-card">
            {topProdutos.length === 0 && <p className="dl-empty">Sem pedidos registrados.</p>}
            {topProdutos.map((p) => (
              <div key={p.nome} className="dl-barra">
                <div className="dl-barra__topo">
                  {p.nome} · {p.qtd}x<strong>{moeda(p.valor)}</strong>
                </div>
                <div className="dl-barra__trilho">
                  <div
                    className="dl-barra__preenchimento"
                    style={{ width: `${(p.qtd / maiorProduto) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="dl-section-label">Por atendente</p>
          <div className="dl-card">
            {porAtendente.length === 0 && <p className="dl-empty">Sem comandas encerradas.</p>}
            {porAtendente.map(([nome, valor]) => (
              <div key={nome} className="dl-barra">
                <div className="dl-barra__topo">
                  {nome}
                  <strong>{moeda(valor)}</strong>
                </div>
                <div className="dl-barra__trilho">
                  <div
                    className="dl-barra__preenchimento"
                    style={{ width: `${(valor / maiorAtendente) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Relatorios;
