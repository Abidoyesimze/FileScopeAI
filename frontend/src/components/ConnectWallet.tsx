'use client';

import React, { useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export function ConnectWallet() {
  const { isConnected, isConnecting, address } = useAccount();
  const { open } = useAppKit();
  const { isConnected: appKitConnected } = useAppKitAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    if (isConnected && appKitConnected) {
      toast.success('Wallet connected successfully!', {
        icon: '🎉',
      });
    }
  }, [isConnected, appKitConnected]);

  if (!isConnected) {
    return (
      <button
        onClick={() => {
          open();
          if (!isConnecting) {
            toast.loading('Opening wallet connection...', { id: 'connect' });
          }
        }}
        type="button"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium flex items-center space-x-2"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => open({ view: 'Networks' })}
        type="button"
        className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Chain {chainId}
        </span>
      </button>

      <button
        onClick={() => open({ view: 'Account' })}
        type="button"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium text-sm"
      >
        {address ? formatAddress(address) : 'Account'}
        {balance?.formatted
          ? ` (${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol})`
          : ''}
      </button>
    </div>
  );
} 