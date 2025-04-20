import React, { useEffect, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { ethers } from 'ethers';

import TokenSelector from './components/TokenSelector';
import TransferForm from './components/TransferForm';
import { fetchTokenList } from './services/tokenService';
import { Token, TokenAmount } from './types';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#12FF80',
    },
    secondary: {
      main: '#303030',
    },
  },
});

const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<TokenAmount[]>([]);
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Note: We need to create a provider but are not currently using it in the App component 
  // It will be needed for future functionality
  useMemo(() => {
    const safeProvider = new SafeAppProvider(safe, sdk);
    return new ethers.BrowserProvider(safeProvider);
  }, [sdk, safe]);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        const tokenList = await fetchTokenList();
        // Filter tokens for the current chain if needed
        const filteredTokens = tokenList.tokens.filter(
          token => token.chainId === safe.chainId
        );
        setTokens(filteredTokens);
        setError(null);
      } catch (err) {
        setError('Failed to load tokens. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, [safe.chainId]);

  const handleTokenSelection = (token: Token, amount: string, isMax: boolean) => {
    setSelectedTokens(prev => {
      // Check if token is already selected
      const existingIndex = prev.findIndex(item => item.token.address === token.address);
      
      if (existingIndex >= 0) {
        // Update existing token
        const updated = [...prev];
        updated[existingIndex] = { token, amount, isMax };
        return updated;
      } else {
        // Add new token
        return [...prev, { token, amount, isMax }];
      }
    });
  };

  const handleRemoveToken = (tokenAddress: string) => {
    setSelectedTokens(prev => prev.filter(item => item.token.address !== tokenAddress));
  };

  const handleSubmit = async () => {
    if (!recipient || selectedTokens.length === 0) {
      setError('Please select at least one token and enter a recipient address');
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }

    try {
      const transactions = selectedTokens.map(({ token, amount }) => {
        // ERC20 transfer data
        const erc20Interface = new ethers.Interface([
          'function transfer(address to, uint256 value) returns (bool)'
        ]);
        
        const data = erc20Interface.encodeFunctionData('transfer', [
          recipient,
          ethers.parseUnits(amount, token.decimals)
        ]);

        return {
          to: token.address,
          value: '0',
          data
        };
      });

      // Submit transaction to Safe
      await sdk.txs.send({ txs: transactions });
      
      // Reset form after successful submission
      setSelectedTokens([]);
      setRecipient('');
      setError(null);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError('Failed to submit transaction');
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            SafeSend
          </Typography>
          
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          
          <TokenSelector 
            tokens={tokens} 
            onSelect={handleTokenSelection}
            selectedTokens={selectedTokens}
          />
          
          <TransferForm
            selectedTokens={selectedTokens}
            recipient={recipient}
            onRecipientChange={setRecipient}
            onRemoveToken={handleRemoveToken}
            onSubmit={handleSubmit}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;