'use client';

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Get projectId at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Configure chains & providers
export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
});

// Initialize Web3Modal
if (typeof window !== 'undefined') {
  import('@web3modal/wagmi/react').then(({ createWeb3Modal }) => {
    try {
      createWeb3Modal({
        wagmiConfig: config,
        projectId,
        defaultChain: mainnet,
        themeMode: 'light',
      });
    } catch (error) {
      console.error('Failed to initialize Web3Modal:', error);
    }
  });
} 