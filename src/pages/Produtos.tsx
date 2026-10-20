import React, { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { addOutline, chevronForwardOutline, pricetagsOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { useApp } from '../context/AppContext';
import { CATEGORIAS } from '../data/seed';
import { moeda } from '../utils/format';

const Produtos: React.FC = () => {
  const { dados } = useApp();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState('Todos');
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return dados.produtos
      .filter((p) => (categoria === 'Todos' ? true : p.categoria === categoria))
      .filter((p) => !termo || p.nome.toLowerCase().includes(termo));
  }, [dados.produtos, categoria, busca]);

  return (
    <IonPage>
      <BrandHeader
        titulo="Produtos"
        subtitulo={`${dados.produtos.length} itens no cardápio`}
        busca={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar produto' }}
        acao={
          <button className="dl-icon-btn" type="button" aria-label="Cardápio">
            <IonIcon icon={pricetagsOutline} />
          </button>
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-chips">
            {['Todos', ...CATEGORIAS].map((c) => (
              <button
                key={c}
                type="button"
                className={`dl-chip ${categoria === c ? 'dl-chip--active' : ''}`}
                onClick={() => setCategoria(c)}
              >
                {c}
                {c === 'Todos' && <span className="dl-chip__count">{dados.produtos.length}</span>}
              </button>
            ))}
          </div>

          <div className="dl-stack" style={{ marginTop: 14 }}>
            {visiveis.length === 0 && <p className="dl-empty">Nenhum produto encontrado.</p>}

            {visiveis.map((p) => (
              <button
                key={p.id}
                type="button"
                className="dl-row"
                onClick={() => navigate(`/produtos/${p.id}`)}
              >
                <div className="dl-upload__thumb" style={{ width: 42, height: 42, fontSize: 17 }}>
                  {p.foto ? <img src={p.foto} alt={p.nome} /> : p.nome.charAt(0)}
                </div>
                <div className="dl-row__main">
                  <p className="dl-row__title">{p.nome}</p>
                  <span className="dl-badge dl-badge--amarelo dl-badge--sem-ponto">
                    {p.categoria} · {p.setor === 'cozinha' ? 'Cozinha' : 'Salão'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="dl-row__valor">{moeda(p.preco)}</span>
                  <span className="dl-row__right" style={{ justifyContent: 'flex-end' }}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                    <IonIcon icon={chevronForwardOutline} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="dl-fab"
          type="button"
          aria-label="Novo produto"
          onClick={() => navigate('/produtos/novo')}
        >
          <IonIcon icon={addOutline} />
        </button>
      </IonContent>
    </IonPage>
  );
};

export default Produtos;
