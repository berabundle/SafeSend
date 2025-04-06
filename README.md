# SafeSend

A Safe App for easily sending multiple tokens from your Safe wallet.

## Features

- View all tokens in your Safe wallet (using the Berachain token allowlist)
- Select multiple tokens to send
- Specify exact amounts or use "Max" for each token
- Send all selected tokens in a single transaction
- Supports any ERC20 token

## Development

To start the development server:

```bash
npm install
npm start
```

## Building for Production

```bash
npm run build
```

## Technologies Used

- React
- TypeScript
- Safe Apps SDK
- Material UI
- ethers.js

## Token Allowlist

This app uses the Berachain mainnet token list from: https://raw.githubusercontent.com/berachain/metadata/refs/heads/main/src/tokens/mainnet.json