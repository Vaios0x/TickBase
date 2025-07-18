import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'TicketSafer',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [baseSepolia],
  ssr: false, // Si tu dApp no es server-side rendered, set to false
}) 