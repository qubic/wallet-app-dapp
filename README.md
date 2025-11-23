# WalletConnect Angular Example

This example demonstrates how a dApp can interact with the Qubic Wallet via WalletConnect.  It provides a practical implementation for connecting to the wallet and interacting with its exposed methods.

**Live Demo:** https://qubic.github.io/wallet-app-dapp/

## ⚠️ Important Notice

This is a **basic testing interface** for demonstrating available WalletConnect methods. It is **not a production-ready application** and does not represent best practices or guidelines for building production dApps.

Specifically, this example:
- Does not dictate how to properly handle errors in a production environment
- Does not implement comprehensive session management as recommended by Reown (session restoration, expiry handling, multi-session support, etc.)
- Does not include production features such as:
  - Input validation and sanitization
  - User-friendly error messages and loading states
  - Proper state management solutions
  - Retry logic and network error handling
  - Comprehensive testing (unit, integration, E2E)
  - Analytics and error monitoring
- Is intended solely for demonstrating method calls and events triggered by the wallet

For production implementations, please refer to:
- **Qubic Wallet WalletConnect Integration**: [https://github.com/qubic/wallet-app/blob/main/walletconnect.md](https://github.com/qubic/wallet-app/blob/main/walletconnect.md)
- **Reown (WalletConnect) Documentation**: [https://docs.reown.com/](https://docs.reown.com/)

## Installation

- Install dependencies with: `npm install`
- Run with: `ng serve`

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by the GitHub Actions workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
