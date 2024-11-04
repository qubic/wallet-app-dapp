# WalletConnect Angular example

This example provides a kitchen-sink example on how a dAPP can interact with Qubic Wallet via WalletConnect.

## Installation

- Install dependencies with :`npm install`
- Run with `ng serve`

# What is WalletConnect

WalletConnect is an open source technology that makes it easy to connect any supported mobile or hardware wallets to dApp using QR codes and secure links, allowing users to sign transactions needed for these applications from their wallets.

## Terminology

| Term    | Explanation                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------- |
| dApp    | A (web3) application which needs access to the Qubic Wallet                                        |
| session | A connection between a dAPP and the Qubic Wallet                                                   |
| method  | Functionality that is exposed by the Qubic Wallet and can be invoked by the dAPP                   |
| event   | Information that can be pushed from the Qubic Wallet to a dAPP without the later making any action |

## Session establishment

A dAPP initializes a connection to the WC servers and generates a connection URL. This URL contains info about the dAPP and the required _methods_ and _events_ that are going to be used in the connection. This URL is passed to the wallet (via copy - past / QR code scanning ).The wallet prompts its user to accept or reject the connection.
If rejected, the client receives
`{code: 5000, message: 'User rejected.'}`
If accepted, the client receives a
`session connected` event. This event contains various info, most importantly the _expiration time_(when the session dies) and _topic_(which is an ID)
Once accepted, the connection is established as a session. The session can be active for a few hours to a few days.

## Exposed methods

### qubic_requestAccounts

Requests all accounts in wallet.
Method parameters: _None_

On success, an array of `RequestAccountsResult` is objects is received:

| Property | Type   | Value                                 |
| -------- | ------ | ------------------------------------- |
| address  | String | The public ID of the account          |
| name     | String | The name of the account in the wallet |
| amount   | number | The number of Qubic in the wallet     |

### qubic_sendQubic

Asks the wallet to send Qubic to a specific address (upon confirmation of the user)

Method parameters:
|Param |Type | Info
|--|--|--|
|fromID | String | The ID to send Qubic from |
|toID | String |The ID to send Qubic to |
|amount| int| The number of Qubic to send|

On success, an `ApproveTokenTransferResult` object is received:
|Property| Type | Value |
|--|--|
|tick| Number | The tick that the transfer was scheduled for |

On error a standard `JsonRpcError` is received. Its the `errorMessage` and `errorCode` properties for details

### qubic_signTransaction

Asks the wallet sign a transaction. The signed value can be used with Qubic RPC to send Qubic to a specific address

Method parameters:
|Param |Type | Info
|--|--|--|
|fromID | String | The ID to send Qubic from |
|toID | String |The ID to send Qubic to |
|amount| int| The number of Qubic to send|
|tick| int (optional) | If defined, indicates the tick for the transaction. Otherwise the transaction will be signed for CurrentTick + 5 |

On success, an `ApproveSignTransactionResult` object is received:
|Property| Type | Value |
|--|--|
|signedTransaction| String | The signed transaction payload |
|tick| Number | The tick that the transfer was signed for |

On error a standard `JsonRpcError` is received. Its the `errorMessage` and `errorCode` properties for details

### qubic_sign

Asks the wallet sign a message.

Method parameters:
|Param |Type | Info
|--|--|--|
|fromID | String | The ID to sign the message from |
|message | String |The message to be signed |

On success, an `ApproveSignGenericResult` object is received:
|Property| Type | Value |
|--|--|
|signedMessage| String | The signed message |

On error a standard `JsonRpcError` is received. Its the `errorMessage` and `errorCode` properties for details

### sendAsset

To be implemented

# Exposed events

## accountsChanged

Fires when the accounts in the wallet are changed (added/ removed/ renamed / deleted / wallet is launched)

Payload
`[{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJB","name":"QH","amount":17483927320},{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJBBUUBGJGM","name":"QH2","amount":0}]`
|Field |Type |Info |
|--|--|--|
|address | String| The public ID of the account |
|name | String| The human readable name of the wallet account|
|amount| int| The number of Qubics in the account. Can be -1 if wallet has no amount information for this account

## amountChanged

Fires when the Qubic amount in one or more wallet accounts is changed

Payload
`[{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJB","name":"QH","amount":17483927320},{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJBBUUBGJGM","name":"QH2","amount":0}]`
|Field |Type |Info |
|--|--|--|
|address | String| The public ID of the account |
|name | String| The human readable name of the wallet account|
|amount| int| The number of Qubics in the account
