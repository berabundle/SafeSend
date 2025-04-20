import { TokenList } from '../types';
import { ethers } from 'ethers';

const TOKENS_URL = 'https://raw.githubusercontent.com/berachain/metadata/refs/heads/main/src/tokens/mainnet.json';

export const fetchTokenList = async (): Promise<TokenList> => {
  try {
    const response = await fetch(TOKENS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching token list:', error);
    throw error;
  }
};

export const getTokenBalance = async (
  tokenAddress: string, 
  userAddress: string,
  provider: any
): Promise<string> => {
  try {
    // ERC20 Token ABI (minimal for balanceOf)
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    
    return balance.toString();
  } catch (error) {
    console.error(`Error getting balance for token ${tokenAddress}:`, error);
    return '0';
  }
};

// Helper to format token amounts for display
export const formatTokenAmount = (amount: string, decimals: number): string => {
  if (!amount) return '0';
  
  const formatted = ethers.formatUnits(amount, decimals);
  // Remove trailing zeros
  return formatted.replace(/\.?0+$/, '');
};