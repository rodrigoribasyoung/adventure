// Script do popup de configuração

document.addEventListener('DOMContentLoaded', () => {
  const tokenInput = document.getElementById('firebase-token')
  const userIdInput = document.getElementById('user-id')
  const saveBtn = document.getElementById('save-btn')
  const statusDiv = document.getElementById('status')

  // Carregar valores salvos
  chrome.storage.local.get(['firebaseToken', 'userId'], (result) => {
    if (result.firebaseToken) {
      tokenInput.value = result.firebaseToken
    }
    if (result.userId) {
      userIdInput.value = result.userId
    }
  })

  // Salvar configuração
  saveBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim()
    const userId = userIdInput.value.trim()

    if (!token) {
      showStatus('Por favor, insira o token Firebase', 'error')
      return
    }

    chrome.storage.local.set({
      firebaseToken: token,
      userId: userId || null
    }, () => {
      showStatus('Configuração salva com sucesso!', 'success')
    })
  })
})

function showStatus(message, type) {
  const statusDiv = document.getElementById('status')
  statusDiv.textContent = message
  statusDiv.className = `status ${type}`
  
  setTimeout(() => {
    statusDiv.textContent = ''
    statusDiv.className = ''
  }, 3000)
}

