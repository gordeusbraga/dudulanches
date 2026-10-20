import React from 'react';
import { IonHeader, IonIcon } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  titulo: string;
  subtitulo?: string;
  aoVoltar?: () => void;
  acoes?: React.ReactNode;
}

/** Cabeçalho claro das telas de detalhe e formulários. */
const PageHeader: React.FC<Props> = ({ titulo, subtitulo, aoVoltar, acoes }) => {
  const navigate = useNavigate();

  return (
    <IonHeader className="ion-no-border">
      <div className="dl-page-header">
        <button
          className="dl-icon-btn dl-icon-btn--light"
          type="button"
          aria-label="Voltar"
          onClick={() => (aoVoltar ? aoVoltar() : navigate(-1))}
        >
          <IonIcon icon={chevronBackOutline} />
        </button>

        <div className="dl-page-header__titles">
          <h1 className="dl-page-header__title">{titulo}</h1>
          {subtitulo && <p className="dl-page-header__subtitle">{subtitulo}</p>}
        </div>

        {acoes && <div className="dl-page-header__actions">{acoes}</div>}
      </div>
    </IonHeader>
  );
};

export default PageHeader;
