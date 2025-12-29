// Carregador do Firebase SDK para a extensão
// Este script carrega o Firebase SDK via CDN e disponibiliza globalmente

(function() {
  // Verificar se já foi carregado
  if (window.firebaseLoaded) return
  
  // Carregar Firebase SDK via CDN
  const scripts = [
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
  ]
  
  let loaded = 0
  const total = scripts.length
  
  scripts.forEach((src, index) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      loaded++
      if (loaded === total) {
        window.firebaseLoaded = true
        if (window.firebaseReady) window.firebaseReady()
      }
    }
    script.onerror = () => {
      console.error('Erro ao carregar Firebase SDK:', src)
    }
    document.head.appendChild(script)
  })
})()

