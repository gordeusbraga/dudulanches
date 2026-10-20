import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AppData,
  Comanda,
  ItemPedido,
  Mesa,
  Pedido,
  PerfilUsuario,
  Produto,
  Setor,
  StatusItem,
  Usuario
} from '../types';
import {
  carregarDados,
  carregarSessao,
  limparDados,
  novoId,
  salvarDados,
  salvarSessao
} from '../services/storage';
import { mesmoDia } from '../utils/format';

export const PERFIS: Record<PerfilUsuario, string> = {
  garcom: 'Garçom / Atendente',
  cozinha: 'Funcionário da Cozinha',
  salao: 'Funcionário do Salão',
  admin: 'Administrador'
};

/** Usado na tela de edição de usuário. */
export const PERMISSOES: Record<PerfilUsuario, { texto: string; permitido: boolean }[]> = {
  garcom: [
    { texto: 'Abrir e encerrar comandas', permitido: true },
    { texto: 'Registrar pedidos nas mesas', permitido: true },
    { texto: 'Ver histórico do próprio turno', permitido: true },
    { texto: 'Editar produtos e usuários', permitido: false }
  ],
  cozinha: [
    { texto: 'Ver a fila da cozinha', permitido: true },
    { texto: 'Atualizar o preparo dos itens', permitido: true },
    { texto: 'Abrir e encerrar comandas', permitido: false },
    { texto: 'Editar produtos e usuários', permitido: false }
  ],
  salao: [
    { texto: 'Ver a fila do salão', permitido: true },
    { texto: 'Atualizar o atendimento dos itens', permitido: true },
    { texto: 'Abrir e encerrar comandas', permitido: false },
    { texto: 'Editar produtos e usuários', permitido: false }
  ],
  admin: [
    { texto: 'Abrir e encerrar comandas', permitido: true },
    { texto: 'Gerenciar produtos e cardápio', permitido: true },
    { texto: 'Gerenciar usuários e perfis', permitido: true },
    { texto: 'Ver relatórios de todo o período', permitido: true }
  ]
};

/** Ordem em que o item avança nas filas. */
export const PROXIMO_STATUS: Record<StatusItem, StatusItem | null> = {
  pendente: 'preparo',
  preparo: 'pronto',
  pronto: 'entregue',
  entregue: null
};

export interface ItemDaFila {
  pedido: Pedido;
  item: ItemPedido;
  mesa: Mesa | undefined;
}

interface AppContextValor {
  dados: AppData;
  sessao: Usuario | null;
  carregando: boolean;

  // autenticação
  entrar: (usuario: string, senha: string) => { ok: boolean; erro?: string };
  sair: () => void;

  // consultas
  mesa: (mesaId: string) => Mesa | undefined;
  comanda: (comandaId: string) => Comanda | undefined;
  produto: (produtoId: string) => Produto | undefined;
  usuario: (usuarioId: string) => Usuario | undefined;
  comandasDaMesa: (mesaId: string, status?: Comanda['status']) => Comanda[];
  pedidosDaComanda: (comandaId: string) => Pedido[];
  itensDaComanda: (comandaId: string) => ItemPedido[];
  totalComanda: (comandaId: string) => number;
  totalMesa: (mesaId: string) => number;
  mesaOcupada: (mesaId: string) => boolean;
  filaDoSetor: (setor: Setor) => ItemDaFila[];
  resumoDoTurno: () => { comandas: number; vendido: number; abertas: number };

  // comandas e pedidos
  abrirComanda: (mesaId: string) => Comanda;
  encerrarComanda: (comandaId: string) => void;
  encerrarMesa: (mesaId: string) => void;
  registrarPedido: (
    comandaId: string,
    itens: { produtoId: string; quantidade: number }[],
    observacao: string
  ) => Pedido | null;
  avancarItem: (itemId: string) => void;

  // cadastros
  salvarProduto: (produto: Produto) => void;
  excluirProduto: (produtoId: string) => void;
  salvarUsuario: (usuario: Usuario) => void;
  excluirUsuario: (usuarioId: string) => void;

  restaurarExemplo: () => void;
}

const AppContext = createContext<AppContextValor | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dados, setDados] = useState<AppData>(() => carregarDados());
  const [sessaoId, setSessaoId] = useState<string | null>(() => carregarSessao());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(false);
  }, []);

  useEffect(() => {
    salvarDados(dados);
  }, [dados]);

  const sessao = useMemo(
    () => dados.usuarios.find((u) => u.id === sessaoId) ?? null,
    [dados.usuarios, sessaoId]
  );

  /* ------------------------------ autenticação --------------------------- */

  const entrar = useCallback(
    (login: string, senha: string) => {
      const encontrado = dados.usuarios.find(
        (u) => u.usuario.toLowerCase() === login.trim().toLowerCase()
      );
      if (!encontrado) return { ok: false, erro: 'Usuário não encontrado.' };
      if (!encontrado.ativo) return { ok: false, erro: 'Este usuário está inativo.' };
      if (encontrado.senha !== senha) return { ok: false, erro: 'Senha incorreta.' };
      setSessaoId(encontrado.id);
      salvarSessao(encontrado.id);
      return { ok: true };
    },
    [dados.usuarios]
  );

  const sair = useCallback(() => {
    setSessaoId(null);
    salvarSessao(null);
  }, []);

  /* -------------------------------- consultas ---------------------------- */

  const mesa = useCallback((id: string) => dados.mesas.find((m) => m.id === id), [dados.mesas]);
  const comanda = useCallback(
    (id: string) => dados.comandas.find((c) => c.id === id),
    [dados.comandas]
  );
  const produto = useCallback(
    (id: string) => dados.produtos.find((p) => p.id === id),
    [dados.produtos]
  );
  const usuario = useCallback(
    (id: string) => dados.usuarios.find((u) => u.id === id),
    [dados.usuarios]
  );

  const comandasDaMesa = useCallback(
    (mesaId: string, status?: Comanda['status']) =>
      dados.comandas
        .filter((c) => c.mesaId === mesaId && (!status || c.status === status))
        .sort((a, b) => a.numero - b.numero),
    [dados.comandas]
  );

  const pedidosDaComanda = useCallback(
    (comandaId: string) =>
      dados.pedidos
        .filter((p) => p.comandaId === comandaId)
        .sort((a, b) => a.numero - b.numero),
    [dados.pedidos]
  );

  const itensDaComanda = useCallback(
    (comandaId: string) => pedidosDaComanda(comandaId).flatMap((p) => p.itens),
    [pedidosDaComanda]
  );

  const totalComanda = useCallback(
    (comandaId: string) =>
      itensDaComanda(comandaId).reduce((s, i) => s + i.precoUnitario * i.quantidade, 0),
    [itensDaComanda]
  );

  const comandasAbertasDaMesa = useCallback(
    (mesaId: string) => dados.comandas.filter((c) => c.mesaId === mesaId && c.status === 'aberta'),
    [dados.comandas]
  );

  const mesaOcupada = useCallback(
    (mesaId: string) => comandasAbertasDaMesa(mesaId).length > 0,
    [comandasAbertasDaMesa]
  );

  const totalMesa = useCallback(
    (mesaId: string) =>
      comandasAbertasDaMesa(mesaId).reduce((s, c) => s + totalComanda(c.id), 0),
    [comandasAbertasDaMesa, totalComanda]
  );

  const filaDoSetor = useCallback(
    (setor: Setor): ItemDaFila[] =>
      dados.pedidos
        .filter((p) => dados.comandas.find((c) => c.id === p.comandaId)?.status === 'aberta')
        .flatMap((pedido) =>
          pedido.itens
            .filter((item) => item.setor === setor)
            .map((item) => ({ pedido, item, mesa: dados.mesas.find((m) => m.id === pedido.mesaId) }))
        )
        .sort((a, b) => a.pedido.criadoEm.localeCompare(b.pedido.criadoEm)),
    [dados.pedidos, dados.comandas, dados.mesas]
  );

  const resumoDoTurno = useCallback(() => {
    const doDia = dados.comandas.filter((c) => mesmoDia(c.abertaEm));
    return {
      comandas: doDia.length,
      vendido: doDia
        .filter((c) => c.status === 'encerrada')
        .reduce((s, c) => s + totalComanda(c.id) - c.desconto, 0),
      abertas: dados.comandas.filter((c) => c.status === 'aberta').length
    };
  }, [dados.comandas, totalComanda]);

  /* --------------------------- comandas e pedidos ------------------------ */

  const abrirComanda = useCallback(
    (mesaId: string) => {
      const nova: Comanda = {
        id: novoId('c'),
        numero: Math.max(0, ...dados.comandas.map((c) => c.numero)) + 1,
        mesaId,
        status: 'aberta',
        abertaEm: new Date().toISOString(),
        encerradaEm: null,
        atendenteId: sessao?.id ?? '',
        atendenteNome: sessao?.nome ?? 'Atendente',
        desconto: 0
      };
      setDados((d) => ({ ...d, comandas: [...d.comandas, nova] }));
      return nova;
    },
    [dados.comandas, sessao]
  );

  const encerrarComanda = useCallback((comandaId: string) => {
    setDados((d) => ({
      ...d,
      comandas: d.comandas.map((c) =>
        c.id === comandaId
          ? { ...c, status: 'encerrada' as const, encerradaEm: new Date().toISOString() }
          : c
      )
    }));
  }, []);

  const encerrarMesa = useCallback((mesaId: string) => {
    setDados((d) => ({
      ...d,
      comandas: d.comandas.map((c) =>
        c.mesaId === mesaId && c.status === 'aberta'
          ? { ...c, status: 'encerrada' as const, encerradaEm: new Date().toISOString() }
          : c
      )
    }));
  }, []);

  const registrarPedido = useCallback(
    (
      comandaId: string,
      selecionados: { produtoId: string; quantidade: number }[],
      observacao: string
    ) => {
      const alvo = dados.comandas.find((c) => c.id === comandaId);
      const itens = selecionados
        .filter((s) => s.quantidade > 0)
        .map((s): ItemPedido | null => {
          const p = dados.produtos.find((x) => x.id === s.produtoId);
          if (!p) return null;
          return {
            id: novoId('i'),
            produtoId: p.id,
            nome: p.nome,
            precoUnitario: p.preco,
            quantidade: s.quantidade,
            observacao,
            setor: p.setor,
            status: 'pendente' as const
          };
        })
        .filter((i): i is ItemPedido => i !== null);

      if (!alvo || itens.length === 0) return null;

      const pedido: Pedido = {
        id: novoId('ped'),
        numero: Math.max(0, ...dados.pedidos.map((p) => p.numero)) + 1,
        comandaId,
        mesaId: alvo.mesaId,
        criadoEm: new Date().toISOString(),
        itens
      };
      setDados((d) => ({ ...d, pedidos: [...d.pedidos, pedido] }));
      return pedido;
    },
    [dados.comandas, dados.produtos, dados.pedidos]
  );

  const avancarItem = useCallback((itemId: string) => {
    setDados((d) => ({
      ...d,
      pedidos: d.pedidos.map((p) => ({
        ...p,
        itens: p.itens.map((i) =>
          i.id === itemId ? { ...i, status: PROXIMO_STATUS[i.status] ?? i.status } : i
        )
      }))
    }));
  }, []);

  /* -------------------------------- cadastros ---------------------------- */

  const salvarProduto = useCallback((p: Produto) => {
    setDados((d) => ({
      ...d,
      produtos: d.produtos.some((x) => x.id === p.id)
        ? d.produtos.map((x) => (x.id === p.id ? p : x))
        : [...d.produtos, p]
    }));
  }, []);

  const excluirProduto = useCallback((produtoId: string) => {
    setDados((d) => ({ ...d, produtos: d.produtos.filter((p) => p.id !== produtoId) }));
  }, []);

  const salvarUsuario = useCallback((u: Usuario) => {
    setDados((d) => ({
      ...d,
      usuarios: d.usuarios.some((x) => x.id === u.id)
        ? d.usuarios.map((x) => (x.id === u.id ? u : x))
        : [...d.usuarios, u]
    }));
  }, []);

  const excluirUsuario = useCallback((usuarioId: string) => {
    setDados((d) => ({ ...d, usuarios: d.usuarios.filter((u) => u.id !== usuarioId) }));
  }, []);

  const restaurarExemplo = useCallback(() => {
    limparDados();
    setDados(carregarDados());
  }, []);

  const valor: AppContextValor = {
    dados,
    sessao,
    carregando,
    entrar,
    sair,
    mesa,
    comanda,
    produto,
    usuario,
    comandasDaMesa,
    pedidosDaComanda,
    itensDaComanda,
    totalComanda,
    totalMesa,
    mesaOcupada,
    filaDoSetor,
    resumoDoTurno,
    abrirComanda,
    encerrarComanda,
    encerrarMesa,
    registrarPedido,
    avancarItem,
    salvarProduto,
    excluirProduto,
    salvarUsuario,
    excluirUsuario,
    restaurarExemplo
  };

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProvider>');
  return ctx;
};
