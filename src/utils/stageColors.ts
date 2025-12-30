/**
 * Utilitário para gerar cores de estágios baseado em gradiente automático
 * Gradiente: branco > azul > roxo > rosa > vermelho
 */

// Cores do gradiente (do frio ao quente)
const GRADIENT_COLORS = [
  '#FFFFFF', // Branco (gelado)
  '#E3F2FD', // Azul muito claro
  '#BBDEFB', // Azul claro
  '#90CAF9', // Azul
  '#64B5F6', // Azul médio
  '#42A5F5', // Azul padrão
  '#2196F3', // Azul vibrante
  '#1E88E5', // Azul escuro
  '#5C6BC0', // Índigo (transição azul-roxo)
  '#7986CB', // Roxo claro
  '#9FA8DA', // Roxo médio
  '#7E57C2', // Roxo
  '#9575CD', // Roxo vibrante
  '#B39DDB', // Roxo claro
  '#CE93D8', // Rosa-roxo
  '#F48FB1', // Rosa claro
  '#F06292', // Rosa médio
  '#EC407A', // Rosa vibrante
  '#E91E63', // Rosa-vermelho
  '#F44336', // Vermelho claro
  '#E53935', // Vermelho médio
  '#D32F2F', // Vermelho
  '#C62828', // Vermelho escuro
]

/**
 * Gera uma cor para um estágio baseado na sua ordem no funil
 * @param order - Ordem do estágio (1-based)
 * @param totalStages - Total de estágios no funil
 * @returns Cor hexadecimal
 */
export const getStageColor = (order: number, totalStages: number): string => {
  if (totalStages <= 1) {
    return GRADIENT_COLORS[Math.floor(GRADIENT_COLORS.length / 2)]
  }

  // Mapear a ordem para o índice do gradiente (0 a total-1)
  // Distribuir uniformemente pelo gradiente
  const position = (order - 1) / (totalStages - 1)
  const colorIndex = Math.round(position * (GRADIENT_COLORS.length - 1))
  
  return GRADIENT_COLORS[colorIndex]
}

/**
 * Gera cores para todos os estágios de um funil
 * @param totalStages - Total de estágios
 * @returns Array de cores na ordem dos estágios
 */
export const generateStageColors = (totalStages: number): string[] => {
  return Array.from({ length: totalStages }, (_, index) => 
    getStageColor(index + 1, totalStages)
  )
}

/**
 * Atualiza as cores dos estágios baseado na ordem atual
 * @param stages - Array de estágios (será ordenado por order)
 * @returns Array de estágios com cores atualizadas
 */
export const updateStagesColors = <T extends { order: number; color?: string }>(
  stages: T[]
): T[] => {
  const sortedStages = [...stages].sort((a, b) => a.order - b.order)
  const totalStages = sortedStages.length
  
  return sortedStages.map((stage, index) => ({
    ...stage,
    color: getStageColor(index + 1, totalStages),
  }))
}

