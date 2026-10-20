/**
 * Modelos de dados do sistema de comandas.
 * Cada interface aqui vira uma coleção no Firestore na próxima etapa.
 */

export type PerfilUsuario = 'garcom' | 'cozinha' | 'salao' | 'admin';

export interface Usuario {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
  cor: string;
}

/** Setor que prepara/atende o item. Define em qual fila o pedido aparece. */
export type Setor = 'cozinha' | 'salao';

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  setor: Setor;
  descricao: string;
  ativo: boolean;
  foto: string | null;
}

export type StatusItem = 'pendente' | 'preparo' | 'pronto' | 'entregue';

export interface ItemPedido {
  id: string;
  produtoId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  observacao: string;
  setor: Setor;
  status: StatusItem;
}

export interface Pedido {
  id: string;
  numero: number;
  comandaId: string;
  mesaId: string;
  criadoEm: string;
  itens: ItemPedido[];
}

export type StatusComanda = 'aberta' | 'encerrada';

export interface Comanda {
  id: string;
  numero: number;
  mesaId: string;
  status: StatusComanda;
  abertaEm: string;
  encerradaEm: string | null;
  atendenteId: string;
  atendenteNome: string;
  desconto: number;
}

export interface Mesa {
  id: string;
  numero: number;
  local: string;
  lugares: number;
}

/** Estado completo da aplicação — o que hoje mora no localStorage. */
export interface AppData {
  usuarios: Usuario[];
  produtos: Produto[];
  mesas: Mesa[];
  comandas: Comanda[];
  pedidos: Pedido[];
}
