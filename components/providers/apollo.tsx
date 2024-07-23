"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useNetwork } from "wagmi";

interface Props {
  children: React.ReactNode;
}

const SUBGRAPH_URLS: { [key: string]: string } = {
  100: "https://subgraph-endpoints.superfluid.dev/xdai-mainnet/protocol-v1",
  11155420:
    "https://subgraph-endpoints.superfluid.dev/optimism-sepolia/protocol-v1",
};

export function Apollo(props: Props) {
  const { children } = props;

  const network = useNetwork();

  const apolloClient = new ApolloClient({
    uri: network?.chain?.id
      ? SUBGRAPH_URLS[network.chain.id]
      : SUBGRAPH_URLS["100"],
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
