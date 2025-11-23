# WalletConnect Angular Example

This example demonstrates how a dApp can interact with the Qubic Wallet via WalletConnect.  It provides a practical implementation for connecting to the wallet and interacting with its exposed methods.

**Live Demo:** https://qubic.github.io/wallet-app-dapp/

## ⚠️ Important Notice

This is a **basic testing interface** for demonstrating available WalletConnect methods. It is **not a production-ready application** and does not represent best practices or guidelines for building production dApps.

Specifically, this example:
- Uses simplified code structure with all logic in a single component for demonstration clarity
- Does not follow production Angular architectural patterns (no services, proper state management, dependency injection patterns, etc.)
- Does not use strict TypeScript typing or comprehensive type safety
- Does not dictate how to properly handle errors in a production environment
- Does not implement comprehensive session management as recommended by Reown (session restoration, expiry handling, multi-session support, etc.)
- **Does not connect to Qubic RPC endpoints**, which production dApps usually would integrate for:
  - Getting current tick information
  - Fetching account balances
  - Verifying transaction status
- Does not include production features such as:
  - Input validation and sanitization
  - User-friendly error messages and loading states
  - Retry logic and network error handling
  - Comprehensive testing (unit, integration, E2E)
  - Analytics and error monitoring
- Is intended solely for demonstrating method calls and events available for Wallet connect integration

For production implementations, please refer to:
- **Qubic Wallet WalletConnect Integration**: [https://github.com/qubic/wallet-app/blob/main/walletconnect.md](https://github.com/qubic/wallet-app/blob/main/walletconnect.md)
- **Reown (WalletConnect) Documentation**: [https://docs.reown.com/](https://docs.reown.com/)

## Understanding the Relay Server

WalletConnect uses a **relay server** to facilitate communication between dApps and wallets. The relay acts as a message broker that:

- **Enables peer-to-peer communication**: The relay server forwards encrypted messages between the dApp and wallet without being able to read their contents
- **Maintains connection state**: Keeps track of active sessions and ensures messages are delivered even if one peer is temporarily offline
- **Provides real-time updates**: Uses WebSocket connections to enable instant communication between connected peers

In this demo, you'll see two connection indicators:
- **Relay**: Shows whether the dApp is connected to the WalletConnect relay server
- **Session**: Shows whether a wallet has paired with the dApp and established an active session

Both connections must be active for the dApp to communicate with the wallet. The relay connection is typically established automatically when the SignClient initializes.

## Installation

- Install dependencies with: `npm install`
- Run with: `ng serve`

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by the GitHub Actions workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
