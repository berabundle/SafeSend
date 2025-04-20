import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { ethers } from 'ethers';

import { TokenAmount } from '../types';

interface TransferFormProps {
  selectedTokens: TokenAmount[];
  recipient: string;
  onRecipientChange: (address: string) => void;
  onRemoveToken: (tokenAddress: string) => void;
  onSubmit: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({
  selectedTokens,
  recipient,
  onRecipientChange,
  onRemoveToken,
  onSubmit
}) => {
  const isValidAddress = recipient ? ethers.isAddress(recipient) : true;
  const hasTokens = selectedTokens.length > 0;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Transfer Tokens
      </Typography>
      
      <TextField
        fullWidth
        label="Recipient Address"
        placeholder="0x..."
        value={recipient}
        onChange={(e) => onRecipientChange(e.target.value)}
        error={!isValidAddress}
        helperText={!isValidAddress ? 'Invalid address format' : ''}
        margin="normal"
        variant="outlined"
      />
      
      {hasTokens ? (
        <Paper variant="outlined" sx={{ mt: 3, mb: 3 }}>
          <List>
            <ListItem>
              <Typography variant="subtitle2" sx={{ flex: 2 }}>
                Token
              </Typography>
              <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'right' }}>
                Amount
              </Typography>
              <Box sx={{ width: 40 }}></Box>
            </ListItem>
            <Divider />
            
            {selectedTokens.map(({ token, amount, isMax }) => (
              <ListItem key={token.address}>
                <ListItemAvatar>
                  <Avatar src={token.logoURI} alt={token.symbol}>
                    {token.symbol.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={token.symbol}
                  secondary={token.name}
                />
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {amount} {isMax && '(Max)'}
                </Typography>
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => onRemoveToken(token.address)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Box my={4} textAlign="center">
          <Typography color="textSecondary">
            No tokens selected
          </Typography>
        </Box>
      )}
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={!hasTokens || !recipient || !isValidAddress}
        onClick={onSubmit}
      >
        Send Tokens
      </Button>
    </Box>
  );
};

export default TransferForm;