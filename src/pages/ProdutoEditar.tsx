import React, { useRef, useState } from 'react';
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
  checkmarkOutline,
  chevronDownOutline,
  trashOutline
} from 'ionicons/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { CATEGORIAS } from '../data/seed';
import type { Produto, Setor } from '../types';
import { novoId } from '../services/storage';

const LIMITE_FOTO = 2 * 1024 * 1024;

const ProdutoEditar: React.FC = () => {
  const { produtoId = '' } = useParams();
  const navigate = useNavigate();
  const { produto, salvarProduto, excluirProduto } = useApp();
  const [confirmar] = useIonAlert();
  const [mostrarToast] = useIonToast();
  const inputFoto = useRef<HTMLInputElement>(null);

  const existente = produto(produtoId);
  const novo = produtoId === 'novo';

  const [form, setForm] = useState<Produto>(
    existente ?? {
      id: novoId('p'),
      nome: '',
      preco: 0,
      categoria: CATEGORIAS[0],
      setor: 'cozinha',
      descricao: '',
      ativo: true,
      foto: null
    }
  );
  const [precoTexto, setPrecoTexto] = useState(
    existente ? existente.preco.toFixed(2).replace('.', ',') : ''
  );

  if (!existente && !novo) {
    return (
      <IonPage>
        <PageHeader titulo="Produto não encontrado" />
        <IonContent>
          <p className="dl-empty">Esse produto não existe mais.</p>
        </IonContent>
      </IonPage>
    );
  }

  const mudar = <K extends keyof Produto>(campo: K, valor: Produto[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const escolherFoto = (arquivo?: File) => {
    if (!arquivo) return;
    if (arquivo.size > LIMITE_FOTO) {
      mostrarToast({
        message: 'A imagem precisa ter até 2 MB.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => mudar('foto', String(leitor.result));
    leitor.readAsDataURL(arquivo);
  };

  const salvar = () => {
    const preco = Number(precoTexto.replace(/\./g, '').replace(',', '.'));
    if (!form.nome.trim() || !Number.isFinite(preco) || preco <= 0) {
      mostrarToast({
        message: 'Informe o nome e um valor válido.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      return;
    }
    salvarProduto({ ...form, nome: form.nome.trim(), preco });
    mostrarToast({
      message: novo ? 'Produto cadastrado.' : 'Produto atualizado.',
      duration: 1800,
      position: 'top',
      color: 'success'
    });
    navigate('/produtos', { replace: true });
  };

  const excluir = () =>
    confirmar({
      header: 'Excluir produto',
      message: `${form.nome || 'Este produto'} sairá do cardápio. Os pedidos já lançados continuam com o valor registrado.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            excluirProduto(form.id);
            navigate('/produtos', { replace: true });
          }
        }
      ]
    });

  return (
    <IonPage>
      <PageHeader
        titulo={novo ? 'Novo Produto' : 'Editar Produto'}
        subtitulo={novo ? 'Cadastro no cardápio' : form.nome}
        acoes={
          !novo ? (
            <button
              className="dl-icon-btn dl-icon-btn--danger"
              type="button"
              aria-label="Excluir produto"
              onClick={excluir}
            >
              <IonIcon icon={trashOutline} />
            </button>
          ) : undefined
        }
      />

      <IonContent>
        <div className="dl-page">
          <div className="dl-upload">
            <div className="dl-upload__thumb">
              {form.foto ? <img src={form.foto} alt={form.nome} /> : form.nome.charAt(0) || 'X'}
            </div>
            <div className="dl-upload__main">
              <p className="dl-upload__titulo">Foto do produto</p>
              <p className="dl-upload__sub">PNG ou JPG · até 2 MB</p>
            </div>
            <button
              className="dl-upload__btn"
              type="button"
              onClick={() => inputFoto.current?.click()}
            >
              <IonIcon icon={cameraOutline} />
              Enviar
            </button>
            <input
              ref={inputFoto}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) => escolherFoto(e.target.files?.[0])}
            />
          </div>

          <div className="dl-field" style={{ marginTop: 16 }}>
            <label className="dl-field__label" htmlFor="nome-produto">
              Nome do produto
            </label>
            <div className="dl-input">
              <input
                id="nome-produto"
                value={form.nome}
                placeholder="Ex.: X-Burguer"
                onChange={(e) => mudar('nome', e.target.value)}
              />
            </div>
          </div>

          <div className="dl-field-row">
            <div className="dl-field">
              <label className="dl-field__label" htmlFor="preco">
                Valor unitário
              </label>
              <div className="dl-input">
                <span style={{ color: 'var(--dl-text-3)', fontSize: 14 }}>R$</span>
                <input
                  id="preco"
                  inputMode="decimal"
                  value={precoTexto}
                  placeholder="0,00"
                  onChange={(e) => setPrecoTexto(e.target.value)}
                />
              </div>
            </div>

            <div className="dl-field">
              <label className="dl-field__label" htmlFor="categoria">
                Categoria
              </label>
              <div className="dl-input dl-input--select">
                <select
                  id="categoria"
                  value={form.categoria}
                  onChange={(e) => mudar('categoria', e.target.value)}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <IonIcon icon={chevronDownOutline} className="dl-input__caret" />
              </div>
            </div>
          </div>

          <div className="dl-field">
            <label className="dl-field__label" htmlFor="setor">
              Setor responsável
            </label>
            <div className="dl-input dl-input--select">
              <select
                id="setor"
                value={form.setor}
                onChange={(e) => mudar('setor', e.target.value as Setor)}
              >
                <option value="cozinha">Cozinha</option>
                <option value="salao">Salão</option>
              </select>
              <IonIcon icon={chevronDownOutline} className="dl-input__caret" />
            </div>
          </div>

          <div className="dl-field">
            <label className="dl-field__label" htmlFor="descricao">
              Descrição
            </label>
            <div className="dl-input dl-input--area">
              <textarea
                id="descricao"
                value={form.descricao}
                placeholder="Pão brioche, hambúrguer 150g, queijo, alface e tomate"
                onChange={(e) => mudar('descricao', e.target.value)}
              />
            </div>
          </div>

          <div className="dl-switch-row">
            <div>
              <p className="dl-switch-row__title">Produto ativo</p>
              <p className="dl-switch-row__sub">Visível para os garçons</p>
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
            Salvar Produto
          </button>
          {!novo && (
            <button
              className="dl-btn dl-btn--perigo dl-btn--bloco"
              type="button"
              style={{ marginTop: 10 }}
              onClick={excluir}
            >
              <IonIcon icon={trashOutline} />
              Excluir Produto
            </button>
          )}
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ProdutoEditar;
