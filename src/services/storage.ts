import { seedData } from '../data/seed';
import type { AppData } from '../types';

/**
 * Camada de persistência.
 *
 * Hoje: localStorage com dados de exemplo (seed).
 * Depois: trocar o corpo destas funções por Firestore
 * (getDocs / onSnapshot / setDoc) sem mexer nas telas.
 */

const CHAVE = 'dudulanches:dados:v1';
const CHAVE_SESSAO = 'dudulanches:sessao';

export const carregarDados = (): AppData => {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return JSON.parse(bruto) as AppData;
  } catch {
    // storage indisponível ou JSON inválido: cai no seed
  }
  return seedData;
};

export const salvarDados = (dados: AppData) => {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // ignora falha de escrita (modo privado, cota, etc.)
  }
};

export const limparDados = () => {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
};

export const carregarSessao = (): string | null => {
  try {
    return localStorage.getItem(CHAVE_SESSAO);
  } catch {
    return null;
  }
};

export const salvarSessao = (usuarioId: string | null) => {
  try {
    if (usuarioId) localStorage.setItem(CHAVE_SESSAO, usuarioId);
    else localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // nada a fazer
  }
};

/** Id simples para os registros criados no app. */
export const novoId = (prefixo: string) =>
  `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
