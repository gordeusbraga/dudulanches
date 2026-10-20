import React from 'react';
import { IonHeader, IonIcon, IonMenuToggle } from '@ionic/react';
import { menuOutline, notificationsOutline, searchOutline } from 'ionicons/icons';

interface Props {
  titulo: string;
  subtitulo?: string;
  busca?: {
    valor: string;
    aoMudar: (v: string) => void;
    placeholder: string;
  };
  acao?: React.ReactNode;
  temNotificacao?: boolean;
}

/** Cabeçalho roxo das telas principais (Mesas, Cozinha, Salão, Histórico, Usuários). */
const BrandHeader: React.FC<Props> = ({ titulo, subtitulo, busca, acao, temNotificacao = true }) => (
  <IonHeader className="ion-no-border">
    <div className="dl-brand-header">
      <div className="dl-brand-header__row">
        <IonMenuToggle>
          <button className="dl-icon-btn" type="button" aria-label="Abrir menu">
            <IonIcon icon={menuOutline} />
          </button>
        </IonMenuToggle>

        <div className="dl-brand-header__titles">
          <h1 className="dl-brand-header__title">{titulo}</h1>
          {subtitulo && <p className="dl-brand-header__subtitle">{subtitulo}</p>}
        </div>

        {acao ?? (
          <button className="dl-icon-btn" type="button" aria-label="Notificações">
            <IonIcon icon={notificationsOutline} />
            {temNotificacao && <span className="dl-icon-btn__dot" />}
          </button>
        )}
      </div>

      {busca && (
        <div className="dl-search">
          <IonIcon icon={searchOutline} />
          <input
            value={busca.valor}
            placeholder={busca.placeholder}
            onChange={(e) => busca.aoMudar(e.target.value)}
          />
        </div>
      )}
    </div>
  </IonHeader>
);

export default BrandHeader;
