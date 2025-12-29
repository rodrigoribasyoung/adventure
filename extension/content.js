// Content script para injetar sidebar no WhatsApp Web

// URL das Firebase Functions - ATUALIZE APÓS DEPLOY
const FIREBASE_FUNCTIONS_URL = 'https://us-central1-adv-labs.cloudfunctions.net'

let sidebarContainer = null
let isSidebarVisible = false

// Função para criar e injetar a sidebar
function createSidebar() {
  if (sidebarContainer) return sidebarContainer

  // Criar container da sidebar
  sidebarContainer = document.createElement('div')
  sidebarContainer.id = 'adventure-crm-sidebar'
  sidebarContainer.innerHTML = `
    <div class="adventure-sidebar-toggle" id="adventure-toggle-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </div>
    <div class="adventure-sidebar-content" id="adventure-sidebar-content">
      <div class="adventure-sidebar-header">
        <h3>Adventure CRM</h3>
        <button class="adventure-close-btn" id="adventure-close-btn">×</button>
      </div>
      <div class="adventure-sidebar-body" id="adventure-sidebar-body">
        <div class="adventure-loading">Carregando...</div>
      </div>
    </div>
  `

  document.body.appendChild(sidebarContainer)

  // Event listeners
  document.getElementById('adventure-toggle-btn')?.addEventListener('click', toggleSidebar)
  document.getElementById('adventure-close-btn')?.addEventListener('click', toggleSidebar)

  return sidebarContainer
}

// Função para mostrar/ocultar sidebar
function toggleSidebar() {
  isSidebarVisible = !isSidebarVisible
  const sidebar = document.getElementById('adventure-crm-sidebar')
  if (sidebar) {
    sidebar.classList.toggle('adventure-sidebar-visible', isSidebarVisible)
  }
  
  if (isSidebarVisible) {
    loadSidebarContent()
  }
}

// Função para detectar número de telefone da conversa atual
function getCurrentPhoneNumber() {
  // WhatsApp Web usa vários seletores possíveis para o número
  const selectors = [
    '[data-testid="conversation-header"] span[title]',
    'header span[title]',
    '[data-testid="chat"] header span',
    'header [data-testid="conversation-header"] span',
    'div[data-testid="conversation-header"] span'
  ]

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const title = element.getAttribute('title') || element.textContent
      if (title) {
        // Extrair número de telefone
        // Remove espaços, parênteses, hífens e outros caracteres
        let phone = title.replace(/[\s()\-]/g, '')
        
        // Se contém apenas números ou números com +, é provavelmente um telefone
        if (/^\+?\d+$/.test(phone)) {
          // Se não começa com +, adiciona código do Brasil
          if (!phone.startsWith('+')) {
            // Remove zeros à esquerda
            phone = phone.replace(/^0+/, '')
            // Se não começa com 55, adiciona
            if (!phone.startsWith('55')) {
              phone = '55' + phone
            }
          }
          return phone.replace(/\+/g, '')
        }
      }
    }
  }

  // Tentar extrair da URL
  const urlMatch = window.location.href.match(/chat\/(\d+)/)
  if (urlMatch && urlMatch[1]) {
    let phone = urlMatch[1]
    if (!phone.startsWith('55')) {
      phone = '55' + phone
    }
    return phone
  }

  return null
}

// Função para carregar conteúdo da sidebar
async function loadSidebarContent() {
  const body = document.getElementById('adventure-sidebar-body')
  if (!body) return

  const phoneNumber = getCurrentPhoneNumber()
  
  // Buscar token do storage
  chrome.storage.local.get(['firebaseToken', 'userId'], async (result) => {
    if (!result.firebaseToken) {
      body.innerHTML = `
        <div class="adventure-error">
          <p>Você precisa fazer login na extensão.</p>
          <button class="adventure-btn adventure-btn-primary" onclick="chrome.runtime.openOptionsPage()">
            Abrir Configurações
          </button>
        </div>
      `
      return
    }

    if (phoneNumber) {
      body.innerHTML = `
        <div class="adventure-phone-display">
          <p><strong>Número detectado:</strong></p>
          <p class="adventure-phone-number">${formatPhoneNumber(phoneNumber)}</p>
        </div>
        <div class="adventure-section">
          <h4>Contato</h4>
          <div id="adventure-contact-section">
            <button class="adventure-btn adventure-btn-primary" id="adventure-create-contact">
              Criar Contato
            </button>
            <button class="adventure-btn adventure-btn-secondary" id="adventure-link-contact">
              Vincular Contato Existente
            </button>
          </div>
        </div>
        <div class="adventure-section">
          <h4>Negociação</h4>
          <div id="adventure-deal-section">
            <button class="adventure-btn adventure-btn-primary" id="adventure-create-deal">
              Criar Negociação
            </button>
            <button class="adventure-btn adventure-btn-secondary" id="adventure-link-deal">
              Vincular Negociação Existente
            </button>
          </div>
        </div>
        <div class="adventure-section">
          <h4>Mensagens</h4>
          <button class="adventure-btn adventure-btn-primary" id="adventure-select-messages">
            Selecionar Mensagens
          </button>
          <button class="adventure-btn adventure-btn-success" id="adventure-save-messages" style="display: none;">
            Salvar Mensagens Selecionadas
          </button>
        </div>
      `

      // Adicionar event listeners
      setupSidebarEventListeners(phoneNumber, result.firebaseToken, result.userId)
    } else {
      body.innerHTML = `
        <div class="adventure-info">
          <p>Abra uma conversa no WhatsApp para começar.</p>
        </div>
      `
    }
  })
}

// Função para formatar número de telefone
function formatPhoneNumber(phone) {
  // Formatar como (XX) XXXXX-XXXX ou similar
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  return phone
}

// Função para configurar event listeners da sidebar
function setupSidebarEventListeners(phoneNumber, token, userId) {
  // Criar contato
  document.getElementById('adventure-create-contact')?.addEventListener('click', () => {
    showContactForm(phoneNumber, token, userId, true)
  })

  // Vincular contato
  document.getElementById('adventure-link-contact')?.addEventListener('click', () => {
    showContactForm(phoneNumber, token, userId, false)
  })

  // Criar negociação
  document.getElementById('adventure-create-deal')?.addEventListener('click', () => {
    showDealForm(phoneNumber, token, userId, true)
  })

  // Vincular negociação
  document.getElementById('adventure-link-deal')?.addEventListener('click', () => {
    showDealForm(phoneNumber, token, userId, false)
  })

  // Selecionar mensagens
  document.getElementById('adventure-select-messages')?.addEventListener('click', () => {
    enableMessageSelection()
  })

  // Salvar mensagens
  document.getElementById('adventure-save-messages')?.addEventListener('click', () => {
    saveSelectedMessages(phoneNumber, token, userId)
  })
}

// Função para mostrar formulário de contato
function showContactForm(phoneNumber, token, userId, isNew) {
  const body = document.getElementById('adventure-sidebar-body')
  if (!body) return

  body.innerHTML = `
    <div class="adventure-form">
      <h4>${isNew ? 'Criar' : 'Vincular'} Contato</h4>
      <form id="adventure-contact-form">
        <div class="adventure-form-group">
          <label>Nome *</label>
          <input type="text" id="contact-name" required>
        </div>
        <div class="adventure-form-group">
          <label>Email</label>
          <input type="email" id="contact-email">
        </div>
        <div class="adventure-form-group">
          <label>Telefone</label>
          <input type="tel" id="contact-phone" value="${phoneNumber}" readonly>
        </div>
        <div class="adventure-form-actions">
          <button type="button" class="adventure-btn adventure-btn-secondary" onclick="location.reload()">
            Cancelar
          </button>
          <button type="submit" class="adventure-btn adventure-btn-primary">
            ${isNew ? 'Criar' : 'Vincular'}
          </button>
        </div>
      </form>
    </div>
  `

  document.getElementById('adventure-contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleContactSubmit(phoneNumber, token, userId, isNew)
  })
}

// Função para mostrar formulário de negociação
function showDealForm(phoneNumber, token, userId, isNew) {
  const body = document.getElementById('adventure-sidebar-body')
  if (!body) return

  body.innerHTML = `
    <div class="adventure-form">
      <h4>${isNew ? 'Criar' : 'Vincular'} Negociação</h4>
      <form id="adventure-deal-form">
        <div class="adventure-form-group">
          <label>Título *</label>
          <input type="text" id="deal-title" required>
        </div>
        <div class="adventure-form-group">
          <label>Valor (R$)</label>
          <input type="number" id="deal-value" step="0.01" min="0">
        </div>
        <div class="adventure-form-group">
          <label>Contato ID</label>
          <input type="text" id="deal-contact-id" placeholder="ID do contato (opcional)">
        </div>
        <div class="adventure-form-actions">
          <button type="button" class="adventure-btn adventure-btn-secondary" onclick="location.reload()">
            Cancelar
          </button>
          <button type="submit" class="adventure-btn adventure-btn-primary">
            ${isNew ? 'Criar' : 'Vincular'}
          </button>
        </div>
      </form>
    </div>
  `

  document.getElementById('adventure-deal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleDealSubmit(phoneNumber, token, userId, isNew)
  })
}

// Função para habilitar seleção de mensagens
function enableMessageSelection() {
  // Adicionar checkboxes nas mensagens
  // WhatsApp Web usa vários seletores para mensagens
  const messageSelectors = [
    '[data-testid="msg-container"]',
    '[data-testid="conversation-turn"]',
    'div[data-testid="msg-container"]',
    'div.message',
    'span[data-testid="msg-text"]'
  ]
  
  let messages = []
  for (const selector of messageSelectors) {
    const found = document.querySelectorAll(selector)
    if (found.length > 0) {
      messages = Array.from(found)
      break
    }
  }
  
  // Se não encontrou, tentar buscar por estrutura comum
  if (messages.length === 0) {
    const chatContainer = document.querySelector('[data-testid="conversation-panel-messages"]') || 
                         document.querySelector('div[role="log"]')
    if (chatContainer) {
      messages = Array.from(chatContainer.querySelectorAll('div[role="row"]'))
    }
  }
  
  messages.forEach((msg, index) => {
    if (msg.querySelector('.adventure-msg-checkbox')) return // Já tem checkbox

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'adventure-msg-checkbox'
    checkbox.dataset.msgIndex = index.toString()
    
    // Tentar extrair texto da mensagem
    const msgTextElement = msg.querySelector('[data-testid="msg-text"]') || 
                          msg.querySelector('span.selectable-text') ||
                          msg.querySelector('span[dir="ltr"]')
    const msgText = msgTextElement?.textContent || msg.textContent || ''
    checkbox.dataset.msgText = msgText.trim()

    // Aplicar estilos
    const msgStyle = window.getComputedStyle(msg)
    if (msgStyle.position === 'static') {
      msg.style.position = 'relative'
    }
    msg.style.paddingLeft = (parseInt(msgStyle.paddingLeft) || 0) + 30 + 'px'
    
    checkbox.style.position = 'absolute'
    checkbox.style.left = '5px'
    checkbox.style.top = '5px'
    checkbox.style.zIndex = '10000'
    checkbox.style.width = '18px'
    checkbox.style.height = '18px'
    checkbox.style.cursor = 'pointer'
    
    msg.appendChild(checkbox)
  })

  // Mostrar botão de salvar
  const saveBtn = document.getElementById('adventure-save-messages')
  if (saveBtn) {
    saveBtn.style.display = 'block'
  }
  
  if (messages.length === 0) {
    alert('Nenhuma mensagem encontrada. Certifique-se de estar em uma conversa.')
  }
}

// Função para salvar mensagens selecionadas
async function saveSelectedMessages(phoneNumber, token, userId) {
  const checkboxes = document.querySelectorAll('.adventure-msg-checkbox:checked')
  const messages = Array.from(checkboxes).map(cb => ({
    text: cb.dataset.msgText || '',
    timestamp: new Date().toISOString()
  }))

  if (messages.length === 0) {
    alert('Selecione pelo menos uma mensagem')
    return
  }

  try {
    // Buscar dealId vinculado (se houver)
    const dealId = await getLinkedDealId(phoneNumber, token)
    
    const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/api/whatsapp/saveMessages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phoneNumber,
        messages,
        dealId: dealId || null,
        userId
      })
    })

    if (response.ok) {
      alert(`${messages.length} mensagem(ns) salva(s) com sucesso!`)
      // Remover checkboxes
      document.querySelectorAll('.adventure-msg-checkbox').forEach(cb => cb.remove())
      document.getElementById('adventure-save-messages').style.display = 'none'
    } else {
      throw new Error('Erro ao salvar mensagens')
    }
  } catch (error) {
    console.error('Erro ao salvar mensagens:', error)
    alert('Erro ao salvar mensagens. Verifique o console.')
  }
}

// Funções auxiliares para API
async function handleContactSubmit(phoneNumber, token, userId, isNew) {
  const name = document.getElementById('contact-name').value
  const email = document.getElementById('contact-email').value

  try {
    const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/api/whatsapp/createContact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        email: email || undefined,
        phone: phoneNumber,
        userId
      })
    })

    if (response.ok) {
      alert('Contato criado/vincular com sucesso!')
      loadSidebarContent()
    } else {
      throw new Error('Erro ao criar contato')
    }
  } catch (error) {
    console.error('Erro ao criar contato:', error)
    alert('Erro ao criar contato. Verifique o console.')
  }
}

async function handleDealSubmit(phoneNumber, token, userId, isNew) {
  const title = document.getElementById('deal-title').value
  const value = parseFloat(document.getElementById('deal-value').value) || 0
  const contactId = document.getElementById('deal-contact-id').value || undefined

  try {
    const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/api/whatsapp/createDeal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        value,
        contactId,
        phoneNumber,
        userId
      })
    })

    if (response.ok) {
      alert('Negociação criada/vincular com sucesso!')
      loadSidebarContent()
    } else {
      throw new Error('Erro ao criar negociação')
    }
  } catch (error) {
    console.error('Erro ao criar negociação:', error)
    alert('Erro ao criar negociação. Verifique o console.')
  }
}

async function getLinkedDealId(phoneNumber, token) {
  // Buscar deal vinculado a este número
  try {
    const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/api/whatsapp/getDeals?phoneNumber=${encodeURIComponent(phoneNumber)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.deals && data.deals.length > 0) {
        return data.deals[0].id
      }
    }
  } catch (error) {
    console.error('Erro ao buscar deal:', error)
  }
  return null
}

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSidebar)
} else {
  createSidebar()
}

// Observar mudanças na URL (quando muda de conversa)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    if (isSidebarVisible) {
      loadSidebarContent()
    }
  }
}).observe(document, { subtree: true, childList: true })

