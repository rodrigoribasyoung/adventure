// Service Worker da extensão

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    chrome.storage.local.get(['firebaseToken'], (result) => {
      sendResponse({ token: result.firebaseToken })
    })
    return true // Mantém o canal aberto para resposta assíncrona
  }
})

// Listener para quando a extensão é instalada
chrome.runtime.onInstalled.addListener(() => {
  console.log('Adventure CRM WhatsApp Extension instalada')
})


