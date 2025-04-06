export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: {
    coingeckoId?: string;
    pythPriceId?: string;
  };
}

export interface TokenList {
  name: string;
  logoURI?: string;
  tags?: Record<string, {
    name: string;
    description: string;
  }>;
  tokens: Token[];
}

export interface TokenAmount {
  token: Token;
  amount: string;
  isMax: boolean;
}