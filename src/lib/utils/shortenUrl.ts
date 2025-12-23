// Função para encurtar URL usando API pública (ou você pode usar sua própria)
// Por enquanto, apenas retorna a URL original
// Futuramente pode integrar com serviços como bit.ly, tinyurl, etc.

export const shortenUrl = async (url: string): Promise<string> => {
  if (!url) return ''
  
  // Se já for uma URL curta, retorna como está
  if (url.length < 50) return url
  
  try {
    // Usando is.gd como exemplo (API pública gratuita)
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`)
    const data = await response.json()
    
    if (data.shorturl) {
      return data.shorturl
    }
  } catch (error) {
    console.warn('Erro ao encurtar URL:', error)
  }
  
  // Se falhar, retorna URL original
  return url
}

