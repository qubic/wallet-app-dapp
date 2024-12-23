# WalletConnect Angular example

This example provides a kitchen-sink example on how a dApp can interact with Qubic Wallet via WalletConnect.

## Installation

- Install dependencies with :`npm install`
- Run with `ng serve`

# What is WalletConnect

WalletConnect is an open source technology that makes it easy to connect any supported mobile or hardware wallets to dApp using QR codes and secure links, allowing users to sign transactions needed for these applications from their wallets.

## Terminology

| Term    | Explanation                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------- |
| dApp    | A (web3) application which needs access to the Qubic Wallet                                        |
| session | A connection between a dApp and the Qubic Wallet                                                   |
| method  | Functionality that is exposed by the Qubic Wallet and can be invoked by the dApp                   |
| event   | Information that can be pushed from the Qubic Wallet to a dApp without the later making any action |

## Session establishment

A dApp initializes a connection to the WC servers and generates a connection URL. 
The URL contains information about the dApp and the required _methods_ and _events_ that are going to be used in the connection. 
The URL is passed to the wallet (via QR code scanning or copy-paste). 
The wallet prompts the user to accept or reject the connection.

If rejected, the dApp receives the following response: 
`{code: 5000, message: 'User rejected.'}`

If accepted, the dApp receives a
`session connected` event. This event contains various information, most importantly the _expiration time_(when the session dies) and _topic_(which is an ID)
Once accepted, the connection is established as a session. The session can be active for a few hours to a few days.

## Exposed methods

### qubic_requestAccounts

Requests all accounts in wallet.
Method parameters: _None_

On success, an array of `RequestAccountsResult` objects is received:

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
|from | String | The public ID of the source account |
|to | String | The public ID of the destination account |
|amount| int| The number of Qubic to send|

On success, the following data is received:
|Property| Type | Value |
|--|--|--|
|txId| String | Transaction unique identifier |
|signedTransaction| String | The signed transaction payload |
|tick| Number | The tick that the transfer was scheduled for. This will be calculated as the tick at the moment of the approval + 5 ticks |

On error, a standard `JsonRpcError` is received. See `JSON-RPC errors` section for more details.

### qubic_signTransaction

Asks the wallet to sign a transaction. The transaction either transfers Qu or invokes a Smart Contract procedure.
The returned signedTransaction value can be broadcasted to the network at a later time (i.e using https://rpc.qubic.org/v1/broadcast-transaction)

Method parameters:
|Param |Type | Info
|--|--|--|
|from | String | The public ID of the source account |
|to | String | The public ID of the destination account |
|amount| int| The number of Qubic to send|
|tick| int (optional) | If defined, indicates the tick for the transaction. Otherwise, this will be calculated as the tick at the moment of the approval + 5 ticks |
|inputType|	Number (optional) | Transaction input type|
|payload| String (optional) | Payload bytes in base64 format |

On success, the following data is received:
|Property| Type | Value |
|--|--|--|
|txId| String | Transaction unique identifier |
|signedTransaction| String | The signed transaction payload|
|tick| Number | The tick that the transfer was signed for|

On error, a standard `JsonRpcError` is received. See `JSON-RPC errors` section for more details.

### qubic_sendTransaction

Asks the wallet to sign and broadcast a transaction. The transaction either transfers Qu or invokes a Smart Contract procedure.
The parameters are equal to those of qubic_signTransaction.

Method parameters:
|Param |Type | Info
|--|--|--|
|from | String | The public ID of the source account |
|to | String | The public ID of the destination account |
|amount| int| The number of Qubic to send|
|tick| int (optional) | If defined, indicates the tick for the transaction. Otherwise, this will be calculated as the tick at the moment of the approval + 5 ticks |
|inputType|	Number (optional) | Transaction input type|
|payload| String (optional) | Payload bytes in base64 format |

On success, the following data is received:
|Property| Type | Value |
|--|--|--|
|txId| String | Transaction unique identifier |
|signedTransaction| String | The signed transaction payload |
|tick| Number | The tick that the transfer was scheduled for |

On error, a standard `JsonRpcError` is received. See `JSON-RPC errors` section for more details.

### qubic_sign

Asks the wallet sign a message.

Method parameters:
|Param |Type | Info
|--|--|--|
|from | String | The public ID of the account to be used for signing the message |
|message | String |The message to be signed |

On success, the following data is received:
|Property| Type | Value |
|--|--|--|
|signedMessage| String | The signed message.</br>Before creating the signature, the string 'Qubic Signed Message:\n' is prepended to the message|

On error, a standard `JsonRpcError` is received. See `JSON-RPC errors` section for more details.

### sendAsset

< WIP >
Asks the wallet to transfer assets to a specific address (upon confirmation of the user)

Method parameters:
|Param |Type | Info
|--|--|--|
|from | String | The public ID of the source account |
|to | String | The public ID of the destination account |
|assetName| String| The name of the asset to transfer|
|amount| int| The amount of tokens to send|

On success, an `ApproveTokenTransferResult` object is received:
|Property| Type | Value |
|--|--|--|
|txId| String | Transaction unique identifier |
|signedTransaction| String | The signed transaction payload |
|tick| Number | The tick that the transfer was scheduled for |

On error, a standard `JsonRpcError` is received. See `JSON-RPC errors` section for more details.


# Exposed events

## accountsChanged

Fires when the accounts in the wallet are changed (added/ renamed / deleted / wallet is launched)

Payload
`[{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJB","name":"QH","amount":17483927320},{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJBBUUBGJGM","name":"QH2","amount":0}]`
|Field |Type |Info |
|--|--|--|
|address | String| The public ID of the account |
|name | String| The human readable name of the wallet account|
|amount| int| The number of Qubics in the account. -1 value indicates the wallet does not have this information for the account

## amountChanged

Fires when the Qubic amount in one or more wallet accounts is changed

Payload
`[{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJB","name":"QH","amount":17483927320},{"address":"ACDRUPXVDMRVDBVYHUEUTBNNIQOCRXLYSLEZZHHXYGQXITDFCEJBBUUBGJGM","name":"QH2","amount":0}]`
|Field |Type |Info |
|--|--|--|
|address | String| The public ID of the account |
|name | String| The human readable name of the wallet account|
|amount| int| The number of Qubics in the account

# JSON-RPC errors
< WIP >