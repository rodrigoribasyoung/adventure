import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import cors from 'cors'

// Inicializar Firebase Admin
admin.initializeApp()

const corsHandler = cors({ origin: true })

// Função auxiliar para verificar token
async function verifyToken(token: string): Promise<string> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken.uid
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Token inválido')
  }
}

// Função auxiliar para extrair token do header
function getTokenFromHeader(req: functions.Request): string {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new functions.https.HttpsError('unauthenticated', 'Token não fornecido')
  }
  return authHeader.split('Bearer ')[1]
}

// Endpoint: Criar contato
export const createContact = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    try {
      const token = getTokenFromHeader(req)
      const userId = await verifyToken(token)

      const { name, email, phone } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' })
      }

      const contactData = {
        name,
        email: email || undefined,
        phone: phone || undefined,
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      const docRef = await admin.firestore().collection('contacts').add(contactData)

      return res.status(201).json({
        success: true,
        id: docRef.id,
        message: 'Contato criado com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao criar contato:', error)
      return res.status(500).json({ error: error.message || 'Erro ao criar contato' })
    }
  })
})

// Endpoint: Criar negociação
export const createDeal = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    try {
      const token = getTokenFromHeader(req)
      const userId = await verifyToken(token)

      const { title, value, contactId, phoneNumber } = req.body

      if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' })
      }

      // Buscar funil ativo
      const funnelsSnapshot = await admin.firestore()
        .collection('funnels')
        .where('active', '==', true)
        .limit(1)
        .get()

      if (funnelsSnapshot.empty) {
        return res.status(400).json({ error: 'Nenhum funil ativo encontrado' })
      }

      const activeFunnel = funnelsSnapshot.docs[0].data()
      const firstStage = activeFunnel.stages?.[0]

      if (!firstStage) {
        return res.status(400).json({ error: 'Funil não possui estágios' })
      }

      // Se phoneNumber fornecido, buscar ou criar contato
      let finalContactId = contactId
      if (phoneNumber && !contactId) {
        // Buscar contato existente pelo telefone
        const contactsSnapshot = await admin.firestore()
          .collection('contacts')
          .where('phone', '==', phoneNumber)
          .limit(1)
          .get()

        if (!contactsSnapshot.empty) {
          finalContactId = contactsSnapshot.docs[0].id
        } else {
          // Criar contato automaticamente
          const newContactRef = await admin.firestore().collection('contacts').add({
            name: `Contato ${phoneNumber}`,
            phone: phoneNumber,
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          finalContactId = newContactRef.id
        }
      }

      const dealData = {
        title,
        contactId: finalContactId || '',
        stage: firstStage.id,
        value: value || 0,
        currency: 'BRL',
        probability: 50,
        serviceIds: [],
        status: 'active',
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      const docRef = await admin.firestore().collection('deals').add(dealData)

      return res.status(201).json({
        success: true,
        id: docRef.id,
        contactId: finalContactId,
        message: 'Negociação criada com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao criar negociação:', error)
      return res.status(500).json({ error: error.message || 'Erro ao criar negociação' })
    }
  })
})

// Endpoint: Salvar mensagens
export const saveMessages = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    try {
      const token = getTokenFromHeader(req)
      const userId = await verifyToken(token)

      const { phoneNumber, messages, dealId } = req.body

      if (!phoneNumber || !messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'phoneNumber e messages são obrigatórios' })
      }

      // Buscar conversa existente
      let conversationRef: admin.firestore.DocumentReference
      const existingConversations = await admin.firestore()
        .collection('whatsappConversations')
        .where('phoneNumber', '==', phoneNumber)
        .where('dealId', '==', dealId || '')
        .limit(1)
        .get()

      const messageData = messages.map((msg: any) => ({
        timestamp: admin.firestore.Timestamp.fromDate(new Date(msg.timestamp || Date.now())),
        from: phoneNumber,
        to: userId, // Assumindo que o usuário logado é o destinatário
        body: msg.text || msg.body || '',
      }))

      if (!existingConversations.empty) {
        // Atualizar conversa existente
        conversationRef = existingConversations.docs[0].ref
        await conversationRef.update({
          messages: admin.firestore.FieldValue.arrayUnion(...messageData),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        // Criar nova conversa
        const conversationData = {
          dealId: dealId || '',
          phoneNumber,
          messages: messageData,
          saved: true,
          createdBy: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }
        conversationRef = await admin.firestore().collection('whatsappConversations').add(conversationData)
      }

      return res.status(200).json({
        success: true,
        conversationId: conversationRef.id,
        message: `${messages.length} mensagem(ns) salva(s) com sucesso`
      })
    } catch (error: any) {
      console.error('Erro ao salvar mensagens:', error)
      return res.status(500).json({ error: error.message || 'Erro ao salvar mensagens' })
    }
  })
})

// Endpoint: Buscar contatos
export const getContacts = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    try {
      const token = getTokenFromHeader(req)
      await verifyToken(token)

      const { phone, search } = req.query

      let query: admin.firestore.Query = admin.firestore().collection('contacts')

      if (phone) {
        query = query.where('phone', '==', phone)
      }

      const snapshot = await query.limit(50).get()
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Se search fornecido, filtrar localmente
      let filteredContacts = contacts
      if (search) {
        const searchLower = (search as string).toLowerCase()
        filteredContacts = contacts.filter((c: any) =>
          c.name?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(searchLower)
        )
      }

      return res.status(200).json({
        success: true,
        contacts: filteredContacts
      })
    } catch (error: any) {
      console.error('Erro ao buscar contatos:', error)
      return res.status(500).json({ error: error.message || 'Erro ao buscar contatos' })
    }
  })
})

// Endpoint: Buscar negociações
export const getDeals = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    try {
      const token = getTokenFromHeader(req)
      await verifyToken(token)

      const { phoneNumber, contactId, search } = req.query

      let query: admin.firestore.Query = admin.firestore().collection('deals')

      if (contactId) {
        query = query.where('contactId', '==', contactId)
      }

      const snapshot = await query.limit(50).get()
      let deals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Se phoneNumber fornecido, buscar via contato
      if (phoneNumber) {
        const contactsSnapshot = await admin.firestore()
          .collection('contacts')
          .where('phone', '==', phoneNumber)
          .limit(1)
          .get()

        if (!contactsSnapshot.empty) {
          const contactId = contactsSnapshot.docs[0].id
          deals = deals.filter((d: any) => d.contactId === contactId)
        } else {
          deals = []
        }
      }

      // Se search fornecido, filtrar localmente
      if (search) {
        const searchLower = (search as string).toLowerCase()
        deals = deals.filter((d: any) =>
          d.title?.toLowerCase().includes(searchLower)
        )
      }

      return res.status(200).json({
        success: true,
        deals
      })
    } catch (error: any) {
      console.error('Erro ao buscar negociações:', error)
      return res.status(500).json({ error: error.message || 'Erro ao buscar negociações' })
    }
  })
})

