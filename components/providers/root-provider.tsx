"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StateMachineProvider, createStore } from "little-state-machine";
import { ThemeProvider } from "next-themes";
import { ModalProvider } from "react-modal-hook";
import { Provider as RWBProvider } from "react-wrap-balancer";
import { SWRConfig } from "swr";

import { RainbowKit } from "@/components/providers/rainbow-kit";
import { Apollo } from "@/components/providers/apollo";
import { useIsMounted } from "@/lib/hooks/use-is-mounted";
import fetchJson from "@/lib/utils/fetch-json";

const queryClient = new QueryClient();
interface RootProviderProps {
  children: React.ReactNode;
}

createStore({});

export default function RootProvider({ children }: RootProviderProps) {
  const isMounted = useIsMounted();

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      {isMounted && (
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RWBProvider>
              <ModalProvider>
                <RainbowKit>
                  <Apollo>
                    <StateMachineProvider>{children}</StateMachineProvider>
                  </Apollo>
                </RainbowKit>
              </ModalProvider>
            </RWBProvider>
          </QueryClientProvider>
        </ThemeProvider>
      )}
    </SWRConfig>
  );
}
