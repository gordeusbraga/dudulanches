import React, { useState } from 'react';
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
  IonToggle,
  useIonAlert,
  useIonToast
} from '@ionic/react';
import {
  cameraOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  chevronDownOutline,
  closeOutline,
  personOutline,
  trashOutline
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { PERFIS, PERMISSOES, useApp } from '../context/AppContext';
import type { PerfilUsuario, Usuario } from '../types';
import { novoId } from '../services/storage';
import { iniciais } from '../utils/format';

const CORES = ['#6114BE', '#E8A317', '#1FA97A', '#D4574E', '#8B5CF6', '#2E7FD4'];

const UsuarioEditar: React.FC = () => {
  const { usuarioId = '' } = useParams();
  const navigate = useNavigate();
  const { usuario, salvarUsuario, excluirUsuario, sessao } = useApp();
  const [confirmar] = useIonAlert();
  const [mostrarToast] = useIonToast();

  const existente = usuario(usuarioId);
  const novo = usuarioId === 'novo';

  const [form, setForm] = useState<Usuario>(
    existente ?? {
      id: novoId('u'),
      nome: '',
      usuario: '',
      senha: '123456',
      perfil: 'garcom',
      ativo: true,
      criadoEm: new Date().toISOString().slice(0, 10),
      cor: CORES[Math.floor(Math.random() * CORES.length)]
    }
  );

  if (!existente && !novo) {
    return (
      <IonPage>
        <PageHeader titulo="Usuário não encontrado" />
        <IonContent>
          <p className="dl-empty">Esse usuário não existe mais.</p>
        </IonContent>
      </IonPage>
    );
  }

  const mudar = <K extends keyof Usuario>(campo: K, valor: Usuario[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = () => {
    if (!form.nome.trim() || !form.usuario.trim()) {
      mostrarToast({
        message: 'Preencha o nome e o usuário de acesso.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      return;
    }
    salvarUsuario({ ...form, nome: form.nome.trim(), usuario: form.usuario.trim() });
    mostrarToast({
      message: novo ? 'Usuário cadastrado.' : 'Usuário atualizado.',
      duration: 1800,
      position: 'top',
      color: 'success'
    });
    navigate('/usuarios', { replace: true });
  };

  const excluir = () =>
    confirmar({
      header: 'Excluir usuário',
      message: `${form.nome || 'Este usuário'} será removido do sistema.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            excluirUsuario(form.id);
            navigate('/usuarios', { replace: true });
          }
        }
      ]
    });

  const ehEuMesmo = sessao?.id === form.id;

  return (
    <IonPage>
      <PageHeader
        titulo={novo ? 'Novo Usuário' : 'Editar Usuário'}
        subtitulo={novo ? 'Cadastro de acesso' : form.nome}
        acoes={
          !novo && !ehEuMesmo ? (
            <button
              className="dl-icon-btn dl-icon-btn--danger"
              type="button"
              aria-label="Excluir usuário"
              onClick={excluir}
            >
              <IonIcon icon={trashOutline} />
            </button>
          ) : undefined
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-avatar-edit">
            <div className="dl-avatar dl-avatar--lg" style={{ background: form.cor }}>
              {iniciais(form.nome || '?')}
            </div>
            <button
              className="dl-avatar-edit__cam"
              type="button"
              aria-label="Trocar a cor do avatar"
              onClick={() =>
                mudar('cor', CORES[(CORES.indexOf(form.cor) + 1) % CORES.length])
              }
            >
              <IonIcon icon={cameraOutline} />
            </button>
          </div>

          <div className="dl-centro">
            <p className="dl-centro__nome">{form.nome || 'Novo usuário'}</p>
            <p className="dl-centro__sub">
              {novo
                ? 'Senha inicial: 123456'
                : `Cadastrado em ${new Date(form.criadoEm).toLocaleDateString('pt-BR')}`}
            </p>
          </div>

          <div className="dl-field">
            <label className="dl-field__label" htmlFor="nome">
              Nome completo
            </label>
            <div className="dl-input">
              <input
                id="nome"
                value={form.nome}
                placeholder="Ex.: Carlos Silva"
                onChange={(e) => mudar('nome', e.target.value)}
              />
            </div>
          </div>

          <div className="dl-field">
            <label className="dl-field__label" htmlFor="acesso">
              Usuário de acesso
            </label>
            <div className="dl-input">
              <IonIcon icon={personOutline} />
              <input
                id="acesso"
                value={form.usuario}
                autoCapitalize="none"
                placeholder="carlos.silva"
                onChange={(e) => mudar('usuario', e.target.value)}
              />
            </div>
          </div>

          <div className="dl-field">
            <label className="dl-field__label" htmlFor="perfil">
              Perfil de acesso
            </label>
            <div className="dl-input dl-input--select">
              <select
                id="perfil"
                value={form.perfil}
                onChange={(e) => mudar('perfil', e.target.value as PerfilUsuario)}
              >
                {Object.entries(PERFIS).map(([id, rotulo]) => (
                  <option key={id} value={id}>
                    {rotulo}
                  </option>
                ))}
              </select>
              <IonIcon icon={chevronDownOutline} className="dl-input__caret" />
            </div>
          </div>

          <div className="dl-permissoes">
            <p className="dl-permissoes__titulo">PERMISSÕES DESTE PERFIL</p>
            {PERMISSOES[form.perfil].map((p) => (
              <div
                key={p.texto}
                className={`dl-permissoes__item ${
                  p.permitido ? 'dl-permissoes__item--ok' : 'dl-permissoes__item--nao'
                }`}
              >
                <IonIcon icon={p.permitido ? checkmarkCircleOutline : closeOutline} />
                {p.texto}
              </div>
            ))}
          </div>

          <div className="dl-switch-row" style={{ marginTop: 14 }}>
            <div>
              <p className="dl-switch-row__title">Usuário ativo</p>
              <p className="dl-switch-row__sub">Pode entrar no sistema</p>
            </div>
            <IonToggle
              checked={form.ativo}
              onIonChange={(e) => mudar('ativo', e.detail.checked)}
            />
          </div>
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="dl-footer">
          <button className="dl-btn dl-btn--primario dl-btn--bloco" type="button" onClick={salvar}>
            <IonIcon icon={checkmarkOutline} />
            Salvar Usuário
          </button>
          {!novo && !ehEuMesmo && (
            <button
              className="dl-btn dl-btn--perigo dl-btn--bloco"
              type="button"
              style={{ marginTop: 10 }}
              onClick={excluir}
            >
              <IonIcon icon={trashOutline} />
              Excluir Usuário
            </button>
          )}
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default UsuarioEditar;
