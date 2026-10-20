import React, { useState } from 'react';
import { IonContent, IonIcon, IonPage, useIonAlert, useIonToast } from '@ionic/react';
import { eyeOffOutline, eyeOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const { entrar } = useApp();
  const navigate = useNavigate();
  const [mostrarToast] = useIonToast();
  const [mostrarAlerta] = useIonAlert();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    const r = entrar(usuario, senha);
    if (r.ok) {
      navigate('/mesas', { replace: true });
      return;
    }
    mostrarToast({
      message: r.erro ?? 'Não foi possível entrar.',
      duration: 2200,
      position: 'top',
      color: 'danger'
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <form className="dl-login" onSubmit={submeter}>
          <div className="dl-login__topo">
            <img className="dl-login__logo" src="/logo.svg" alt="Dudu Lanches" />
            <h1 className="dl-login__marca">Dudu Lanches</h1>
            <p className="dl-login__slogan">O POINT DO AÇAÍ</p>
          </div>

          <div className="dl-login__card">
            <h2 className="dl-login__titulo">Bem-vindo de volta</h2>
            <p className="dl-login__sub">Entre para gerenciar as comandas</p>

            <div className="dl-field">
              <label className="dl-field__label" htmlFor="usuario">
                Usuário
              </label>
              <div className="dl-input">
                <IonIcon icon={personOutline} />
                <input
                  id="usuario"
                  value={usuario}
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="carlos.silva"
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
            </div>

            <div className="dl-field">
              <label className="dl-field__label" htmlFor="senha">
                Senha
              </label>
              <div className="dl-input">
                <IonIcon icon={lockClosedOutline} />
                <input
                  id="senha"
                  type={verSenha ? 'text' : 'password'}
                  value={senha}
                  placeholder="••••••••"
                  onChange={(e) => setSenha(e.target.value)}
                />
                <IonIcon
                  icon={verSenha ? eyeOffOutline : eyeOutline}
                  style={{ color: 'var(--dl-text-3)' }}
                  onClick={() => setVerSenha((v) => !v)}
                />
              </div>
            </div>

            <button
              type="button"
              className="dl-login__esqueci"
              onClick={() =>
                mostrarAlerta({
                  header: 'Esqueci minha senha',
                  message: 'Procure o administrador do sistema para redefinir sua senha.',
                  buttons: ['Entendi']
                })
              }
            >
              Esqueci minha senha
            </button>

            <button className="dl-btn dl-btn--primario dl-btn--bloco" type="submit">
              Entrar
            </button>

            <p className="dl-login__dica">Dados de teste: carlos.silva · senha 123456</p>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Login;
