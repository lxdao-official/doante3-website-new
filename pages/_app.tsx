import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DefaultSeo } from 'next-seo';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, sepolia, WagmiConfig } from 'wagmi';
import { mainnet, polygon, polygonMumbai, goerli, optimism, arbitrum, zora, arbitrumGoerli, optimismGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Script from 'next/script';
import { DONATE_SDK_URL } from '@/utils/const';
import { Linea } from '@/utils/linea';
import React, { FC, useMemo } from 'react';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

const { chains, publicClient } = configureChains(
  [mainnet, optimism, Linea, polygon, arbitrum, goerli, polygonMumbai, sepolia, optimismGoerli],
  [
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Donate3',
  projectId: '489bba152ca535ae826ee62070ffcdfc',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const theme = createTheme({
  typography: {
    fontFamily: ['inter', 'sans-serif'].join(','),
    /*Arial, sans-serif', */
  },

  components: {
    MuiContainer: {
      styleOverrides: {
        // maxWidthMd: {
        //   maxWidth: 320,
        // },
        maxWidthLg: {
          maxWidth: '1300px',
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ThemeProvider theme={theme}>
              <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains}>
                  <DefaultSeo
                    title="Donate3 - Make donate in web3 so easy"
                    description="Donate3 is a web3 donation tool. It enables public goods and creators to set up donations in just 5 minutes."
                    canonical="https://www.donate3.xyz/"
                    openGraph={{
                      url: 'https://www.donate3.xyz/',
                      siteName: 'Donate3',
                      images: [
                        {
                          url: ' https://www.donate3.xyz/logo.svg',
                          alt: 'Donate3 logo',
                          width: 46,
                          height: 46,
                        },
                      ],
                    }}
                    twitter={{
                      handle: '@donate3official',
                      site: '@Donate3',
                      cardType: 'summary_large_image',
                    }}
                  />
                  <Component {...pageProps} />
                  <Script src={DONATE_SDK_URL} />
                </RainbowKitProvider>
              </WagmiConfig>
            </ThemeProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
