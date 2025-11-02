import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { AppKitNetwork } from '@reown/appkit-common';
import { filecoinCalibration } from 'wagmi/chains';

// 1. Get projectId from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || 'a69043ecf4dca5c34a5e70fdfeac4558';

// 2. Create a metadata object
const metadata = {
  name: 'FileScope AI',
  description: 'FileScope AI - Smart Contract Analysis Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://filescope.ai',
  icons: [],
};

// 3. Set the networks - WagmiAdapter accepts wagmi chains directly
const networks = [filecoinCalibration] as [AppKitNetwork, ...AppKitNetwork[]];

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true, // Enable SSR for Next.js
});

// 5. Create AppKit instance (called outside React component)
createAppKit({
  adapters: [wagmiAdapter],
  networks, // Required parameter
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

// Export the wagmi config from the adapter
export const config = wagmiAdapter.wagmiConfig; 