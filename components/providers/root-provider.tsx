'use client'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StateMachineProvider, createStore } from 'little-state-machine'
import { ThemeProvider } from 'next-themes'
import { ModalProvider } from 'react-modal-hook'
import { Provider as RWBProvider } from 'react-wrap-balancer'
import { SWRConfig } from 'swr'
import { useNetwork } from 'wagmi'

import { RainbowKit } from '@/components/providers/rainbow-kit'
import { useIsMounted } from '@/lib/hooks/use-is-mounted'
import fetchJson from '@/lib/utils/fetch-json'

const queryClient = new QueryClient()
interface RootProviderProps {
  children: React.ReactNode
}

createStore({})

const SUBGRAPH_URLS: { [key: string]: string } = {
  100: 'https://subgraph-endpoints.superfluid.dev/xdai-mainnet/protocol-v1',
}

export default function RootProvider({ children }: RootProviderProps) {
  const isMounted = useIsMounted()
  const network = useNetwork()

  const apolloClient = new ApolloClient({
    uri: network?.chain?.id ? SUBGRAPH_URLS[network.chain.id] : SUBGRAPH_URLS['100'],
    cache: new InMemoryCache(),
  })

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error(err)
        },
      }}>
      {isMounted && (
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RWBProvider>
              <ModalProvider>
                <RainbowKit>
                  <ApolloProvider client={apolloClient}>
                    <StateMachineProvider>{children}</StateMachineProvider>
                  </ApolloProvider>
                </RainbowKit>
              </ModalProvider>
            </RWBProvider>
          </QueryClientProvider>
        </ThemeProvider>
      )}
    </SWRConfig>
  )
}
