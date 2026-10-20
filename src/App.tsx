import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { AppProvider, useApp } from './context/AppContext';
import AppMenu from './components/AppMenu';

import Login from './pages/Login';
import Mesas from './pages/Mesas';
import MesaDetalhe from './pages/MesaDetalhe';
import ComandaDetalhe from './pages/ComandaDetalhe';
import NovoPedido from './pages/NovoPedido';
import EscolherComanda from './pages/EscolherComanda';
import Fila from './pages/Fila';
import Historico from './pages/Historico';
import Produtos from './pages/Produtos';
import ProdutoEditar from './pages/ProdutoEditar';
import Usuarios from './pages/Usuarios';
import UsuarioEditar from './pages/UsuarioEditar';
import Relatorios from './pages/Relatorios';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/app.css';

setupIonicReact();

/** Bloqueia as telas internas quando ninguém está logado. */
const Protegido: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sessao } = useApp();
  if (!sessao) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const p = (tela: React.ReactNode) => <Protegido>{tela}</Protegido>;

const App: React.FC = () => (
  <IonApp>
    <AppProvider>
      <IonReactRouter>
        <AppMenu />
        <IonRouterOutlet id="conteudo-principal">
          <Route path="/login" element={<Login />} />

          <Route path="/mesas" element={p(<Mesas />)} />
          <Route path="/mesas/:mesaId" element={p(<MesaDetalhe />)} />

          <Route path="/comandas/:comandaId" element={p(<ComandaDetalhe />)} />
          <Route path="/comandas/:comandaId/novo-pedido" element={p(<NovoPedido />)} />
          <Route path="/novo-pedido" element={p(<EscolherComanda />)} />

          <Route path="/cozinha" element={p(<Fila setor="cozinha" />)} />
          <Route path="/salao" element={p(<Fila setor="salao" />)} />

          <Route path="/historico" element={p(<Historico />)} />

          <Route path="/produtos" element={p(<Produtos />)} />
          <Route path="/produtos/:produtoId" element={p(<ProdutoEditar />)} />

          <Route path="/usuarios" element={p(<Usuarios />)} />
          <Route path="/usuarios/:usuarioId" element={p(<UsuarioEditar />)} />

          <Route path="/relatorios" element={p(<Relatorios />)} />

          <Route path="/" element={<Navigate to="/mesas" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </AppProvider>
  </IonApp>
);

export default App;
