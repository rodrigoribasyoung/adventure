import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiFileText, FiUsers, FiBriefcase, FiTarget, FiSettings, FiPackage, FiCheckCircle, FiTrendingDown, FiList, FiFile, FiClock, FiHome, FiGrid, FiBox, FiUsers as FiTeam, FiUser, FiFolder, FiRadio, FiFlag, FiKey, FiCode } from 'react-icons/fi'

interface DocumentationSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
}

const DocumentationPage = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const sections: DocumentationSection[] = [
    {
      id: 'notes',
      title: 'Anotações',
      icon: FiFileText,
      items: [
        'É possível adicionar anotações à negociação para registrar informações relevantes de contato ou feedback durante a negociação.',
        'As anotações registradas podem ser visualizadas por outros usuários que acessarem a negociação, na aba histórico. Além disso, caso outro usuário adicione uma anotação em uma negociação em que você é o responsável, você receberá uma notificação.',
      ],
    },
    {
      id: 'contacts',
      title: 'Contatos',
      icon: FiUsers,
      items: [
        'O contato é uma das três entidades chaves do CRM: Contato, Empresa e Negociação.',
        'É a pessoa que você irá se relacionar em uma empresa ou diretamente em uma negociação. Em seu cadastro, são informados dados como nome, telefone, email e outras informações complementares.',
        'Um contato pode ou não estar associado a uma empresa e/ou negociação.',
      ],
    },
    {
      id: 'custom-fields',
      title: 'Campos Personalizados',
      icon: FiSettings,
      items: [
        'São campos criados para registrar informações nas três entidades: negociação, contato e empresa.',
        'Cada categoria de campos possui algumas opções (preferências) específicas:',
        '**Visível**: campo de preenchimento opcional, indicado para informações que não sejam essenciais para o cadastro ou negociação, como cargo que ocupa, formação, etc.',
        '**Obrigatório**: campo de preenchimento obrigatório, indicado para informações imprescindíveis para o cadastro ou negociação.',
        '  - **Sempre**: não será possível criar a negociação sem que o campo seja preenchido.',
        '  - **Etapa**: obrigatório para entrar naquela etapa do funil de vendas. Poderão avançar para a etapa selecionada apenas negociações que estejam com o campo preenchido.',
        '**Único**: campo ideal para informações como CNPJ ou CPF, por exemplo, pois não permite que existam duas entidades com a mesma resposta.',
      ],
    },
    {
      id: 'funnels',
      title: 'Funis',
      icon: FiTarget,
      items: [
        'É possível criar diferentes funis de vendas e mover as negociações entre eles. Ao criar ou utilizar mais de um funil de vendas na mesma conta, é possível organizar e visualizar as negociações de acordo com o funil de venda selecionado.',
        'Cada funil de venda pode ter até 10 etapas.',
      ],
    },
    {
      id: 'stages',
      title: 'Etapas do Funil',
      icon: FiList,
      items: [
        'As etapas do funil de vendas representam os estágios do andamento de oportunidades criadas na plataforma.',
        'O plano Free possui 5 etapas predefinidas. Já no plano Basic, é possível ter até 12 etapas editáveis e criar diferentes funis de vendas.',
        'Ao criar ou utilizar mais de um funil de vendas na mesma conta, é possível organizar e visualizar as negociações de acordo com o funil de vendas e etapa selecionados.',
      ],
    },
    {
      id: 'deal-status',
      title: 'Estágios da Negociação',
      icon: FiCheckCircle,
      items: [
        '**Em andamento**: negociação ativa e em processo.',
        '**Pausada**: negociação temporariamente pausada.',
        '**Vendida**: negociação concluída com sucesso.',
        '**Perdida**: negociação que não foi convertida.',
      ],
    },
    {
      id: 'close-reasons',
      title: 'Motivos de Perda',
      icon: FiTrendingDown,
      items: [
        'O motivo de perda representa a razão de uma determinada negociação não ter sido ganha. Sempre que uma negociação é marcada como perdida, é solicitado o motivo de perda.',
      ],
    },
    {
      id: 'deals',
      title: 'Negociações',
      icon: FiBriefcase,
      items: [
        'A negociação é uma das três entidades chaves do CRM: Negociação, Contato e Empresa.',
        'Ela representa a possibilidade de negociar uma venda e contém todas as fases do processo de negociação.',
        'Toda negociação cadastrada percorre o funil de vendas e, a cada atualização, as informações referentes ao avanço da negociação podem ser registradas em campos específicos.',
        'Assim, todo o histórico de negociações, sejam elas ganhas (venda realizada) ou perdidas, fica armazenado no cadastro da empresa à qual pertencem, independente do vendedor responsável e do tipo de produto ou serviço negociado.',
      ],
    },
    {
      id: 'products-services',
      title: 'Produtos e Serviços na Negociação',
      icon: FiPackage,
      items: [
        'Os produtos e serviços são os itens que sua empresa oferece aos clientes, ou seja, o que é vendido. Os produtos nas negociações são os itens negociados naquela negociação de venda.',
        'Com esses end-points é possível gerenciar os produtos e serviços vinculados a uma negociação.',
      ],
    },
    {
      id: 'tasks',
      title: 'Tarefas',
      icon: FiClock,
      items: [
        'A criação de tarefas funciona como um agendamento de interações com o contato que possui uma negociação não fechada.',
        'Cada tarefa precisará, obrigatoriamente, estar vinculada a uma negociação. Se os alertas automáticos estiverem devidamente configurados, um email será enviado ao usuário, avisando-o de suas tarefas do dia e atrasadas, caso haja.',
        'As Tarefas possuem os seguintes tipos: Ligação (call), Email (email), Visita (visit), Reunião (meeting), Tarefa (task), Almoço (lunch), WhatsApp (whatsapp).',
      ],
    },
    {
      id: 'activity-history',
      title: 'Histórico de Ações',
      icon: FiFile,
      items: [
        'Histórico de cada ação relevante realizada na negociação, mostrando responsável, data, horário.',
      ],
    },
    {
      id: 'companies',
      title: 'Empresas',
      icon: FiHome,
      items: [
        'A empresa é uma das três entidades chaves do Adventure Labs CRM: Empresa, Negociação e Contato.',
        'A empresa é a entidade jurídica que pode ser vinculada a uma negociação.',
      ],
    },
    {
      id: 'segments',
      title: 'Segmentos',
      icon: FiGrid,
      items: [
        'Os segmentos são utilizados para categorizar ou classificar as empresas com base em critérios de negócio, como seu setor de atuação, porte ou região. A segmentação é uma ferramenta poderosa para organizar a base de clientes e aplicar estratégias de vendas e marketing mais direcionadas.',
      ],
    },
    {
      id: 'products',
      title: 'Produtos',
      icon: FiBox,
      items: [
        'Os produtos e serviços são os itens que são oferecidos aos clientes, ou seja, o que é vendido.',
        'É importante cadastrar todos os produtos oferecidos, para que eles possam ser adicionados às negociações de venda e constem nos devidos relatórios.',
        'Os produtos e serviços cadastrados na plataforma não podem ser excluídos, pois isso poderia afetar relatórios gerados anteriormente e causar diversos impactos. Caso um item esteja indisponível ou tenha deixado de ser vendido por sua empresa, basta ocultá-lo.',
      ],
    },
    {
      id: 'teams',
      title: 'Equipes',
      icon: FiTeam,
      items: [
        'As equipes utilizadas para gerenciar seus colaboradores em equipes no Adventure Labs CRM, com suas determinadas permissões dentro da equipe.',
        'É possível adicionar um mesmo usuário a mais de uma equipe e, caso seja realizada uma análise dos resultados de cada equipe, esse usuário aparecerá nos relatórios de todas as equipes das quais fizer parte.',
        'O nível de visibilidade de cada usuário pode ser ajustado separadamente, de modo que ele possa, por exemplo, visualizar negociações e empresas de todo o grupo em uma equipe e ter visibilidade restrita em outra.',
      ],
    },
    {
      id: 'users',
      title: 'Usuários',
      icon: FiUser,
      items: [
        'Usuários são os colaboradores da sua empresa que ingressaram ao Adventure Labs CRM mediante o envio e aceite de um convite para criarem seu perfil de usuário. Cada usuário com status ativo preenche uma licença contratada no Adventure Labs CRM.',
        'Com esse end-point é possível visualizar todos os usuários da conta, conferir as principais informações como seu status, e equipes que ele faz parte.',
      ],
    },
    {
      id: 'projects',
      title: 'Projetos',
      icon: FiFolder,
      items: [
        'Projetos são os empreendimentos e áreas de trabalho da empresa que podem ser organizados por cidades, unidades ou setores diferentes.',
      ],
    },
    {
      id: 'sources',
      title: 'Fontes',
      icon: FiRadio,
      items: [
        'As fontes tem como finalidade rastrear a origem das negociações.',
        'Essa informação é fundamental para o direcionamento do marketing, pois, permite medir o retorno de cada ação e saber qual fonte está trazendo melhores resultados.',
        'A fonte refere-se à origem de entrada da negociação.',
      ],
    },
    {
      id: 'campaigns',
      title: 'Campanhas',
      icon: FiFlag,
      items: [
        'As campanhas tem como finalidade rastrearem a origem das negociações adicionadas ao CRM.',
        'Essa informação é fundamental para o direcionamento do marketing, pois, permite medir o retorno de cada ação e saber qual fonte está trazendo melhores resultados.',
        'A campanha refere-se à entrada de negociações por meio de campanhas de marketing específicas.',
      ],
    },
    {
      id: 'authentication',
      title: 'Autenticação',
      icon: FiKey,
      items: [
        'As credenciais de autenticação dão acesso a apenas um produto Adventure Labs escolhido. Para cada produto deverá ter suas próprias credenciais de acesso. Isso é válido para todas as credenciais, como client_id, client_secret e access_token.',
        'A autenticação da API do Adventure Labs CRM é baseada no protocolo de segurança OAuth2. Para essa integração, optamos por definir um prazo de expiração de 2 horas (7200 segundos) para os tokens.',
        'End-point de autenticação OAuth2: https://api.adventurelabs.services/oauth2/',
      ],
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      icon: FiCode,
      items: [
        'O webhook é a funcionalidade da API que possibilita a automatização do envio de dados e atividades do Adventure Labs CRM para sistemas externos. Assim, é possível que você utilize ou desenvolva o seu próprio aplicativo personalizado para receber, salvar e realizar ações com esses dados. Esta é uma opção poderosa que permite manter todos os seus dados em sincronia e abre a possibilidade para todos os tipos de integração.',
        'Sempre que o evento configurado como gatilho no webhook é acionado, o Adventure Labs CRM fará o disparo dos dados (negociação, fontes, campanhas, motivos de perda, etc) para integrações externas, contendo o payload padrão em JSON único e imutável para a URL de destino. O payload enviado conterá todas as informações disponíveis referentes à entidade alvo do webhook, o que inclui todos os campos padrões e customizados, caso possuam, que foram preenchidos.',
      ],
    },
    {
      id: 'token',
      title: 'Token',
      icon: FiKey,
      items: [
        'O Token é um código de autenticação, utilizado para validar a conta do usuário e autorizar a integração com outras ferramentas.',
        'Cada usuário do Adventure Labs CRM possui um token único e imutável, cujas permissões de uso da API são definidas pelo nível de visibilidade do usuário.',
        'A visibilidade define quais informações referentes a negociações, empresas e contatos cada usuário poderá visualizar.',
      ],
    },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const mainContent = element.closest('main')
      if (mainContent) {
        const headerOffset = 20
        const elementPosition = element.getBoundingClientRect().top
        const mainScrollTop = mainContent.scrollTop
        const offsetPosition = mainScrollTop + elementPosition - headerOffset

        mainContent.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
        setActiveSection(sectionId)
      }
    }
  }

  useEffect(() => {
    const mainContent = document.querySelector('main')
    if (!mainContent) return

    const handleScroll = () => {
      const scrollPosition = mainContent.scrollTop + 100

      for (const section of sections) {
        const element = sectionRefs.current[section.id]
        if (element) {
          const elementOffset = element.offsetTop
          const elementHeight = element.offsetHeight
          
          if (scrollPosition >= elementOffset && scrollPosition < elementOffset + elementHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    mainContent.addEventListener('scroll', handleScroll)
    return () => mainContent.removeEventListener('scroll', handleScroll)
  }, [])

  const formatText = (text: string) => {
    // Converter markdown básico para HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    
    return formatted
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a2f4a 30%, #0f1b2e 70%, #051018 100%)' }}>
      {/* Simplified Header */}
      <header className="h-16 bg-black/20 border-b border-white/5 flex items-center justify-between px-8 shadow-lg relative z-20">
        <div className="flex items-center gap-8">
          <span className="text-white/90 font-medium">Ajuda</span>
          <span className="text-white/40">|</span>
          <button 
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white/90 cursor-pointer transition-colors"
          >
            CRM
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 bg-black/10 border-r border-white/5 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wider">
              Índice
            </h3>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-all
                      ${
                        activeSection === section.id
                          ? 'bg-white/10 text-white border-l-2 border-white/30'
                          : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="mb-12 pb-8 border-b border-white/10">
              <h1 className="text-4xl font-bold text-white mb-3">Documentação Adventure Labs CRM</h1>
              <p className="text-white/70 text-lg">Guia completo das funcionalidades e conceitos do sistema</p>
            </div>

          <div className="space-y-16">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el as HTMLDivElement | null)}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary-red/20 border border-primary-red/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-red" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item, index) => {
                      const isListItem = item.trim().startsWith('  -')
                      const content = isListItem ? item.trim().substring(3) : item
                      
                      return (
                        <div
                          key={index}
                          className={`text-base text-white/80 leading-relaxed ${isListItem ? 'ml-6' : ''}`}
                          dangerouslySetInnerHTML={{ 
                            __html: isListItem ? `• ${formatText(content)}` : formatText(item) 
                          }}
                        />
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DocumentationPage
