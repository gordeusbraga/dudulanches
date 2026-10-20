import React from 'react';
import { IonContent, IonIcon, IonMenu, IonMenuToggle } from '@ionic/react';
import {
  chevronForwardOutline,
  closeOutline,
  flameOutline,
  gridOutline,
  listOutline,
  logOutOutline,
  peopleOutline,
  pricetagsOutline,
  readerOutline,
  restaurantOutline,
  statsChartOutline
} from 'ionicons/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { iniciais, moeda } from '../utils/format';

const ITENS = [
  { rota: '/mesas', rotulo: 'Mesas', icone: gridOutline },
  { rota: '/novo-pedido', rotulo: 'Novo Pedido', icone: readerOutline },
  { rota: '/historico', rotulo: 'Histórico', icone: listOutline },
  { rota: '/cozinha', rotulo: 'Cozinha', icone: flameOutline },
  { rota: '/salao', rotulo: 'Salão', icone: restaurantOutline },
  { rota: '/produtos', rotulo: 'Produtos', icone: pricetagsOutline },
  { rota: '/usuarios', rotulo: 'Usuários', icone: peopleOutline },
  { rota: '/relatorios', rotulo: 'Relatórios', icone: statsChartOutline }
];

const turnoAtual = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Turno manhã';
  if (h < 18) return 'Turno tarde';
  return 'Turno noite';
};

const cargoCurto: Record<string, string> = {
  garcom: 'Garçom',
  cozinha: 'Cozinha',
  salao: 'Salão',
  admin: 'Administrador'
};

const AppMenu: React.FC = () => {
  const { sessao, resumoDoTurno, sair } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!sessao) return null;

  const turno = resumoDoTurno();

  const encerrarSessao = () => {
    sair();
    navigate('/login', { replace: true });
  };

  return (
    <IonMenu
      menuId="menu-principal"
      contentId="conteudo-principal"
      type="overlay"
      className="dl-menu"
    >
      <IonContent scrollY>
        <div className="dl-menu__wrap">
          <div className="dl-menu__perfil">
            <div className="dl-avatar dl-avatar--sm" style={{ background: sessao.cor }}>
              {iniciais(sessao.nome)}
            </div>
            <div style={{ flex: 1 }}>
              <p className="dl-menu__nome">{sessao.nome}</p>
              <p className="dl-menu__cargo">
                {cargoCurto[sessao.perfil]} · {turnoAtual()}
              </p>
            </div>
            <IonMenuToggle>
              <button className="dl-icon-btn" type="button" aria-label="Fechar menu">
                <IonIcon icon={closeOutline} />
              </button>
            </IonMenuToggle>
          </div>

          <nav className="dl-menu__nav">
            {ITENS.map((item) => {
              const ativo = pathname.startsWith(item.rota);
              return (
                <IonMenuToggle key={item.rota} autoHide={false}>
                  <button
                    type="button"
                    className={`dl-menu__item ${ativo ? 'dl-menu__item--ativo' : ''}`}
                    onClick={() => navigate(item.rota)}
                  >
                    <IonIcon icon={item.icone} />
                    {item.rotulo}
                    {ativo && (
                      <IonIcon icon={chevronForwardOutline} className="dl-menu__item-seta" />
                    )}
                  </button>
                </IonMenuToggle>
              );
            })}
          </nav>

          <div className="dl-menu__turno">
            <p className="dl-menu__turno-label">MEU TURNO</p>
            <div className="dl-menu__turno-grid">
              <div>
                <p className="dl-menu__turno-valor">{turno.comandas}</p>
                <p className="dl-menu__turno-desc">comandas</p>
              </div>
              <div>
                <p className="dl-menu__turno-valor">{moeda(turno.vendido)}</p>
                <p className="dl-menu__turno-desc">vendido</p>
              </div>
              <div>
                <p className="dl-menu__turno-valor">{turno.abertas}</p>
                <p className="dl-menu__turno-desc">abertas</p>
              </div>
            </div>
          </div>

          <IonMenuToggle autoHide={false}>
            <button className="dl-menu__sair" type="button" onClick={encerrarSessao}>
              <IonIcon icon={logOutOutline} />
              Sair
            </button>
          </IonMenuToggle>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu;
