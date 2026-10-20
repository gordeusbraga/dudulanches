import type { AppData, Comanda, ItemPedido, Pedido, Produto, Usuario } from '../types';

/** Data de X minutos atrás, em ISO. Usado para os contadores das filas. */
const minAtras = (min: number) => new Date(Date.now() - min * 60000).toISOString();
/** Data de X dias atrás, em um horário fixo do dia. */
const diasAtras = (dias: number, hora: number, minuto: number) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, minuto, 0, 0);
  return d.toISOString();
};

export const CATEGORIAS = ['Lanches', 'Bebidas', 'Açaí', 'Porções'];

export const usuarios: Usuario[] = [
  {
    id: 'u1',
    nome: 'Carlos Silva',
    usuario: 'carlos.silva',
    senha: '123456',
    perfil: 'garcom',
    ativo: true,
    criadoEm: '2025-03-12',
    cor: '#6114BE'
  },
  {
    id: 'u2',
    nome: 'Ana Souza',
    usuario: 'ana.souza',
    senha: '123456',
    perfil: 'cozinha',
    ativo: true,
    criadoEm: '2025-03-20',
    cor: '#E8A317'
  },
  {
    id: 'u3',
    nome: 'Bruno Lima',
    usuario: 'bruno.lima',
    senha: '123456',
    perfil: 'salao',
    ativo: true,
    criadoEm: '2025-04-02',
    cor: '#1FA97A'
  },
  {
    id: 'u4',
    nome: 'Marina Costa',
    usuario: 'marina.costa',
    senha: '123456',
    perfil: 'admin',
    ativo: true,
    criadoEm: '2025-01-08',
    cor: '#D4574E'
  },
  {
    id: 'u5',
    nome: 'Eduardo Dias',
    usuario: 'eduardo.dias',
    senha: '123456',
    perfil: 'garcom',
    ativo: false,
    criadoEm: '2025-05-19',
    cor: '#8B5CF6'
  },
  {
    id: 'u6',
    nome: 'Juliana Reis',
    usuario: 'juliana.reis',
    senha: '123456',
    perfil: 'cozinha',
    ativo: true,
    criadoEm: '2025-06-01',
    cor: '#2E7FD4'
  }
];

export const produtos: Produto[] = [
  { id: 'p1', nome: 'X-Burguer', preco: 25, categoria: 'Lanches', setor: 'cozinha', descricao: 'Pão brioche, hambúrguer 150g, queijo, alface e tomate', ativo: true, foto: null },
  { id: 'p2', nome: 'X-Bacon', preco: 30, categoria: 'Lanches', setor: 'cozinha', descricao: 'Pão brioche, hambúrguer 150g, queijo e bacon crocante', ativo: true, foto: null },
  { id: 'p3', nome: 'X-Tudo', preco: 34, categoria: 'Lanches', setor: 'cozinha', descricao: 'Hambúrguer, ovo, bacon, presunto, queijo e salada', ativo: true, foto: null },
  { id: 'p4', nome: 'X-Salada', preco: 27, categoria: 'Lanches', setor: 'cozinha', descricao: 'Hambúrguer, queijo, alface, tomate e milho', ativo: true, foto: null },
  { id: 'p5', nome: 'Batata Frita M', preco: 22, categoria: 'Porções', setor: 'cozinha', descricao: 'Porção média de batata frita', ativo: true, foto: null },
  { id: 'p6', nome: 'Batata Frita G', preco: 30, categoria: 'Porções', setor: 'cozinha', descricao: 'Porção grande de batata frita', ativo: true, foto: null },
  { id: 'p7', nome: 'Frango a Passarinho', preco: 38, categoria: 'Porções', setor: 'cozinha', descricao: 'Porção de frango frito com alho', ativo: true, foto: null },
  { id: 'p8', nome: 'Coca-Cola Lata', preco: 8, categoria: 'Bebidas', setor: 'salao', descricao: 'Lata 350ml', ativo: true, foto: null },
  { id: 'p9', nome: 'Guaraná Lata', preco: 8, categoria: 'Bebidas', setor: 'salao', descricao: 'Lata 350ml', ativo: true, foto: null },
  { id: 'p10', nome: 'Água sem gás', preco: 5, categoria: 'Bebidas', setor: 'salao', descricao: 'Garrafa 500ml', ativo: true, foto: null },
  { id: 'p11', nome: 'Suco de Laranja', preco: 12, categoria: 'Bebidas', setor: 'salao', descricao: 'Copo 400ml natural', ativo: true, foto: null },
  { id: 'p12', nome: 'Açaí 300ml', preco: 16, categoria: 'Açaí', setor: 'salao', descricao: 'Açaí batido com 2 acompanhamentos', ativo: true, foto: null },
  { id: 'p13', nome: 'Açaí 500ml', preco: 22, categoria: 'Açaí', setor: 'salao', descricao: 'Açaí batido com 3 acompanhamentos', ativo: true, foto: null },
  { id: 'p14', nome: 'Açaí 700ml', preco: 28, categoria: 'Açaí', setor: 'salao', descricao: 'Açaí batido com 4 acompanhamentos', ativo: true, foto: null },
  { id: 'p15', nome: 'Milkshake 400ml', preco: 18, categoria: 'Açaí', setor: 'salao', descricao: 'Milkshake de morango, chocolate ou baunilha', ativo: false, foto: null }
];

export const mesas = Array.from({ length: 8 }, (_, i) => ({
  id: `m${i + 1}`,
  numero: i + 1,
  local: i < 6 ? 'Salão principal' : 'Área externa',
  lugares: i % 3 === 0 ? 4 : i % 3 === 1 ? 2 : 6
}));

const item = (
  id: string,
  produtoId: string,
  quantidade: number,
  observacao: string,
  status: ItemPedido['status']
): ItemPedido => {
  const p = produtos.find((x) => x.id === produtoId)!;
  return {
    id,
    produtoId,
    nome: p.nome,
    precoUnitario: p.preco,
    quantidade,
    observacao,
    setor: p.setor,
    status
  };
};

const comandaAberta = (
  id: string,
  numero: number,
  mesaId: string,
  minutos: number,
  atendente: Usuario
): Comanda => ({
  id,
  numero,
  mesaId,
  status: 'aberta',
  abertaEm: minAtras(minutos),
  encerradaEm: null,
  atendenteId: atendente.id,
  atendenteNome: atendente.nome,
  desconto: 0
});

const carlos = usuarios[0];

export const comandas: Comanda[] = [
  // Mesas ocupadas hoje
  comandaAberta('c1', 1, 'm2', 62, carlos),
  comandaAberta('c2', 2, 'm2', 48, carlos),
  comandaAberta('c3', 3, 'm4', 35, carlos),
  comandaAberta('c4', 4, 'm5', 27, carlos),
  comandaAberta('c5', 5, 'm7', 18, carlos),
  // Histórico
  {
    id: 'c6', numero: 6, mesaId: 'm1', status: 'encerrada',
    abertaEm: diasAtras(0, 17, 20), encerradaEm: diasAtras(0, 18, 40),
    atendenteId: 'u1', atendenteNome: 'Carlos Silva', desconto: 0
  },
  {
    id: 'c7', numero: 7, mesaId: 'm3', status: 'encerrada',
    abertaEm: diasAtras(1, 19, 10), encerradaEm: diasAtras(1, 20, 5),
    atendenteId: 'u1', atendenteNome: 'Carlos Silva', desconto: 0
  },
  {
    id: 'c8', numero: 8, mesaId: 'm6', status: 'encerrada',
    abertaEm: diasAtras(1, 21, 3), encerradaEm: diasAtras(1, 22, 10),
    atendenteId: 'u5', atendenteNome: 'Eduardo Dias', desconto: 0
  },
  {
    id: 'c9', numero: 9, mesaId: 'm8', status: 'encerrada',
    abertaEm: diasAtras(2, 18, 14), encerradaEm: diasAtras(2, 19, 41),
    atendenteId: 'u1', atendenteNome: 'Carlos Silva', desconto: 5
  },
  {
    id: 'c10', numero: 10, mesaId: 'm2', status: 'encerrada',
    abertaEm: diasAtras(3, 20, 0), encerradaEm: diasAtras(3, 21, 12),
    atendenteId: 'u5', atendenteNome: 'Eduardo Dias', desconto: 0
  }
];

export const pedidos: Pedido[] = [
  {
    id: 'ped1', numero: 1, comandaId: 'c1', mesaId: 'm2', criadoEm: minAtras(60),
    itens: [
      item('i1', 'p2', 1, 'Sem bacon', 'entregue'),
      item('i2', 'p1', 2, 'Sem cebola', 'preparo')
    ]
  },
  {
    id: 'ped2', numero: 2, comandaId: 'c1', mesaId: 'm2', criadoEm: minAtras(5),
    itens: [
      item('i3', 'p8', 2, 'Bem gelada', 'pronto'),
      item('i4', 'p13', 1, 'Leite ninho + granola', 'pendente')
    ]
  },
  {
    id: 'ped3', numero: 3, comandaId: 'c2', mesaId: 'm2', criadoEm: minAtras(45),
    itens: [
      item('i5', 'p12', 2, 'Com granola', 'preparo'),
      item('i6', 'p10', 1, 'Sem gelo', 'pendente')
    ]
  },
  {
    id: 'ped4', numero: 4, comandaId: 'c3', mesaId: 'm4', criadoEm: minAtras(30),
    itens: [
      item('i7', 'p3', 1, 'Ponto da carne: ao ponto', 'entregue'),
      item('i8', 'p10', 1, 'Sem gelo', 'pendente')
    ]
  },
  {
    id: 'ped5', numero: 5, comandaId: 'c4', mesaId: 'm5', criadoEm: minAtras(25),
    itens: [
      item('i9', 'p2', 1, 'Ponto da carne: bem passado', 'pendente'),
      item('i10', 'p1', 2, '', 'entregue'),
      item('i11', 'p9', 3, 'Bem gelada', 'entregue')
    ]
  },
  {
    id: 'ped6', numero: 6, comandaId: 'c4', mesaId: 'm5', criadoEm: minAtras(3),
    itens: [item('i12', 'p5', 2, 'Com cheddar e bacon', 'pendente')]
  },
  {
    id: 'ped7', numero: 7, comandaId: 'c5', mesaId: 'm7', criadoEm: minAtras(14),
    itens: [
      item('i13', 'p13', 1, 'Leite ninho + granola', 'pendente'),
      item('i14', 'p4', 1, '', 'preparo'),
      item('i15', 'p11', 1, '', 'entregue')
    ]
  },
  // Pedidos das comandas já encerradas
  {
    id: 'ped8', numero: 8, comandaId: 'c6', mesaId: 'm1', criadoEm: diasAtras(0, 17, 34),
    itens: [item('i16', 'p2', 1, '', 'entregue'), item('i17', 'p1', 2, '', 'entregue')]
  },
  {
    id: 'ped9', numero: 9, comandaId: 'c6', mesaId: 'm1', criadoEm: diasAtras(0, 18, 12),
    itens: [item('i18', 'p8', 1, '', 'entregue'), item('i19', 'p10', 1, '', 'entregue')]
  },
  {
    id: 'ped10', numero: 10, comandaId: 'c7', mesaId: 'm3', criadoEm: diasAtras(1, 19, 22),
    itens: [item('i20', 'p3', 1, '', 'entregue'), item('i21', 'p13', 1, '', 'entregue')]
  },
  {
    id: 'ped11', numero: 11, comandaId: 'c8', mesaId: 'm6', criadoEm: diasAtras(1, 21, 15),
    itens: [item('i22', 'p7', 1, '', 'entregue'), item('i23', 'p9', 2, '', 'entregue')]
  },
  {
    id: 'ped12', numero: 12, comandaId: 'c9', mesaId: 'm8', criadoEm: diasAtras(2, 18, 30),
    itens: [
      item('i24', 'p6', 1, '', 'entregue'),
      item('i25', 'p1', 2, '', 'entregue'),
      item('i26', 'p12', 2, '', 'entregue')
    ]
  },
  {
    id: 'ped13', numero: 13, comandaId: 'c10', mesaId: 'm2', criadoEm: diasAtras(3, 20, 18),
    itens: [item('i27', 'p4', 1, '', 'entregue'), item('i28', 'p11', 2, '', 'entregue')]
  }
];

export const seedData: AppData = { usuarios, produtos, mesas, comandas, pedidos };
