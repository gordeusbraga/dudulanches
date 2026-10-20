import React, { useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { addOutline, chevronForwardOutline, peopleOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { PERFIS, useApp } from '../context/AppContext';
import type { PerfilUsuario } from '../types';
import { iniciais } from '../utils/format';

type Filtro = 'todos' | PerfilUsuario;

const COR_BADGE: Record<PerfilUsuario, string> = {
  garcom: 'roxo',
  cozinha: 'amarelo',
  salao: 'verde',
  admin: 'vermelho'
};

const CHIPS: { id: Filtro; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'garcom', rotulo: 'Garçom' },
  { id: 'cozinha', rotulo: 'Cozinha' },
  { id: 'salao', rotulo: 'Salão' },
  { id: 'admin', rotulo: 'Admin' }
];

const Usuarios: React.FC = () => {
  const { dados } = useApp();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return dados.usuarios
      .filter((u) => (filtro === 'todos' ? true : u.perfil === filtro))
      .filter(
        (u) =>
          !termo ||
          u.nome.toLowerCase().includes(termo) ||
          u.usuario.toLowerCase().includes(termo)
      );
  }, [dados.usuarios, filtro, busca]);

  return (
    <IonPage>
      <BrandHeader
        titulo="Usuários"
        subtitulo={`${dados.usuarios.length} usuários cadastrados`}
        busca={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar usuário' }}
        acao={
          <button className="dl-icon-btn" type="button" aria-label="Equipe">
            <IonIcon icon={peopleOutline} />
          </button>
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-chips">
            {CHIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`dl-chip ${filtro === c.id ? 'dl-chip--active' : ''}`}
                onClick={() => setFiltro(c.id)}
              >
                {c.rotulo}
                {c.id === 'todos' && (
                  <span className="dl-chip__count">{dados.usuarios.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="dl-stack" style={{ marginTop: 14 }}>
            {visiveis.length === 0 && <p className="dl-empty">Nenhum usuário encontrado.</p>}

            {visiveis.map((u) => (
              <button
                key={u.id}
                type="button"
                className="dl-row"
                onClick={() => navigate(`/usuarios/${u.id}`)}
              >
                <div className="dl-avatar dl-avatar--sm" style={{ background: u.cor }}>
                  {iniciais(u.nome)}
                </div>
                <div className="dl-row__main">
                  <p className="dl-row__title">{u.nome}</p>
                  <span className={`dl-badge dl-badge--${COR_BADGE[u.perfil]} dl-badge--sem-ponto`}>
                    {PERFIS[u.perfil]}
                  </span>
                </div>
                <div className="dl-row__right">
                  {u.ativo ? 'Ativo' : 'Inativo'}
                  <IonIcon icon={chevronForwardOutline} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="dl-fab"
          type="button"
          aria-label="Novo usuário"
          onClick={() => navigate('/usuarios/novo')}
        >
          <IonIcon icon={addOutline} />
        </button>
      </IonContent>
    </IonPage>
  );
};

export default Usuarios;
