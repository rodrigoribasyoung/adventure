import { IconType } from 'react-icons'
import { 
  FiHome, 
  FiBriefcase, 
  FiSettings, 
  FiLayers, 
  FiUsers, 
  FiCheckSquare, 
  FiBarChart2, 
  FiTrendingUp,
  FiUser,
  FiBell,
  FiCreditCard,
  FiFolder,
  FiLogOut,
  FiTarget,
  FiEdit3,
  FiLink,
  FiDownload
} from 'react-icons/fi'

export const Icons = {
  home: FiHome,
  deals: FiBriefcase,
  services: FiSettings,
  companies: FiLayers,
  contacts: FiUsers,
  tasks: FiCheckSquare,
  reports: FiBarChart2,
  marketing: FiTrendingUp,
  user: FiUser,
  notifications: FiBell,
  plan: FiCreditCard,
  folder: FiFolder,
  logout: FiLogOut,
  target: FiTarget,
  edit: FiEdit3,
  link: FiLink,
  download: FiDownload,
  project: FiFolder,
}

interface IconProps {
  name: keyof typeof Icons
  className?: string
  size?: number
}

export const Icon = ({ name, className = '', size = 20 }: IconProps) => {
  const IconComponent: IconType = Icons[name]
  return <IconComponent className={className} size={size} />
}

