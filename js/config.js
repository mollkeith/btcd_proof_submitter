export const NETWORKS = {
  staging: {
    key: "staging",
    label: "staging",
    rpcUrl: "https://api2.elastos.cc/esc",
    chainId: 20,
    chainIdHex: "0x14",
    chainName: "Elastos Smart Chain",
    explorer: "https://esc.elastos.io",
    issuer: "0x3990427F5C2F27193D5a81cF960d0A6c93fc21D6",
    nativeCurrency: {
      name: "ELA",
      symbol: "ELA",
      decimals: 18,
    },
  },
  pg: {
    key: "pg",
    label: "pg",
    rpcUrl: "https://api2.elastos.cc/pgp",
    chainId: 860621,
    chainIdHex: "0xd21cd",
    chainName: "PGP Chain",
    explorer: "https://pgp.elastos.io",
    issuer: "0x91cf47c5d2b44Da124d4B54E9207aE6FB63D5Fa7",
    nativeCurrency: {
      name: "PGA",
      symbol: "PGA",
      decimals: 18,
    },
  },
};

export const BTC_APIS = {
  rpc: "https://nownodes-btc.bel2.org",
  explorer: "https://nownodes-btcbook.bel2.org/api/v2",
  fallback: "https://blockstream.info/api",
};

export const MIN_CONFIRMATIONS = 3;
