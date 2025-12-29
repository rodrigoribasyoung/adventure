import { IconType } from 'react-icons'
import { 
  FiHome, 
  FiBriefcase, 
  FiSettings, 
  FiMapPin, 
  FiUsers, 
  FiCheckSquare, 
  FiBarChart2, 
  FiTrendingUp,
  FiUser,
  FiBell,
  FiCreditCard,
  FiFolder,
  FiLogOut
} from 'react-icons/fi'

export const Icons = {
  home: FiHome,
  deals: FiBriefcase,
  services: FiSettings,
  companies: FiBuilding,
  contacts: FiUsers,
  tasks: FiCheckSquare,
  reports: FiBarChart2,
  marketing: FiTrendingUp,
  user: FiUser,
  notifications: FiBell,
  plan: FiCreditCard,
  folder: FiFolder,
  logout: FiLogOut,
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

