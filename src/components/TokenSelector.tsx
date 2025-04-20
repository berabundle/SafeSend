import React, { useState, useEffect, useMemo } from 'react';
import { 
  Paper, 
  TextField, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  IconButton,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { ethers } from 'ethers';

import { Token, TokenAmount } from '../types';
import { getTokenBalance, formatTokenAmount } from '../services/tokenService';

interface TokenSelectorProps {
  tokens: Token[];
  selectedTokens: TokenAmount[];
  onSelect: (token: Token, amount: string, isMax: boolean) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ tokens, selectedTokens, onSelect }) => {
  const { sdk, safe } = useSafeAppsSDK();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [isMax, setIsMax] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Create ethers provider using Safe provider
  const provider = useMemo(() => {
    const safeProvider = new SafeAppProvider(safe, sdk as any);
    return new ethers.BrowserProvider(safeProvider);
  }, [sdk, safe]);

  // State to control showing zero balances
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  
  // Filter tokens based on search term and balance
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      const nameOrSymbolMatch = 
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      // If we're not showing zero balances, check the balance
      if (!showZeroBalances && !loading) {
        const balance = tokenBalances[token.address] || '0';
        const hasBalance = balance !== '0';
        return nameOrSymbolMatch && hasBalance;
      }
      
      return nameOrSymbolMatch;
    });
  }, [tokens, searchTerm, tokenBalances, showZeroBalances, loading]);

  // Load token balances for the Safe
  useEffect(() => {
    const loadBalances = async () => {
      if (!tokens.length) return;
      
      setLoading(true);
      
      try {
        const balances: Record<string, string> = {};
        
        // Load balances in parallel
        await Promise.all(
          tokens.map(async (token) => {
            const balance = await getTokenBalance(token.address, safe.safeAddress, provider);
            balances[token.address] = balance;
          })
        );
        
        setTokenBalances(balances);
      } catch (error) {
        console.error('Failed to load token balances:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBalances();
  }, [tokens, safe.safeAddress, provider]);

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setAmount('');
    setIsMax(false);
    setDialogOpen(true);
  };

  const handleMaxClick = () => {
    if (!selectedToken) return;
    
    const balance = tokenBalances[selectedToken.address] || '0';
    const formattedBalance = formatTokenAmount(balance, selectedToken.decimals);
    
    setAmount(formattedBalance);
    setIsMax(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setIsMax(false);
  };

  const handleAddToken = () => {
    if (selectedToken && amount) {
      onSelect(selectedToken, amount, isMax);
      setDialogOpen(false);
    }
  };

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        Select Tokens
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search tokens..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        margin="normal"
        variant="outlined"
      />
      
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <FormControlLabel
          control={
            <Switch
              checked={showZeroBalances}
              onChange={(e) => setShowZeroBalances(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={
            <Typography variant="body2" color="textSecondary">
              Show zero balances
            </Typography>
          }
        />
      </Box>
      
      <Paper variant="outlined" sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <List>
          {filteredTokens.map((token) => {
            const balance = tokenBalances[token.address];
            const formattedBalance = balance 
              ? formatTokenAmount(balance, token.decimals)
              : '0';
              
            const isSelected = selectedTokens.some(
              item => item.token.address === token.address
            );
            
            return (
              <ListItem 
                button 
                key={token.address}
                onClick={() => handleTokenClick(token)}
                disabled={isSelected}
                divider
              >
                <ListItemAvatar>
                  <Avatar src={token.logoURI} alt={token.symbol}>
                    {token.symbol.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={token.symbol} 
                  secondary={token.name}
                />
                <Typography variant="body2" color="textSecondary">
                  {loading ? 'Loading...' : `${formattedBalance}`}
                </Typography>
              </ListItem>
            );
          })}
          
          {filteredTokens.length === 0 && (
            <ListItem>
              <ListItemText primary="No tokens found" />
            </ListItem>
          )}
        </List>
      </Paper>
      
      {/* Token Amount Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {selectedToken?.symbol} Amount
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedToken && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={selectedToken.logoURI} sx={{ mr: 1 }}>
                  {selectedToken.symbol.charAt(0)}
                </Avatar>
                <Typography>{selectedToken.name}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Balance: {loading 
                    ? 'Loading...' 
                    : formatTokenAmount(tokenBalances[selectedToken.address] || '0', selectedToken.decimals)
                  }
                </Typography>
              </Box>
              
              <TextField
                label="Amount"
                fullWidth
                type="number"
                value={amount}
                onChange={handleAmountChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography 
                        color="primary" 
                        sx={{ cursor: 'pointer' }}
                        onClick={handleMaxClick}
                      >
                        MAX
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                margin="normal"
              />
              
              <Box 
                display="flex" 
                justifyContent="space-between" 
                mt={3}
              >
                <Typography 
                  variant="button" 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Typography>
                <Typography 
                  variant="button" 
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={handleAddToken}
                >
                  Add Token
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TokenSelector;