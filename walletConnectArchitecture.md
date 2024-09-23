# WalletConnect integration guide

This document outlines the integration between Qubic Wallet and dApps via WalletConnect.

## What is WalletConnect

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

### wallet_requestAccounts

Requests all accounts in wallet.
Method parameters: _None_
Receives an _accountsChanged_ event with all the accounts in wallet

### sendQubic

Asks the user to send Qubic to a specific address

Method parameters:
|Param |Type | Info
|--|--|--|
|fromID | String | The ID to send Qubic from |
|toID | String |The ID to send Qubic to |
|amount| int| The number of Qubic to send|
|nonce| string| A single use value to identify the request

On error, a _methodResult_ event is received:
`{"nonce":"1727074222481","error":"Invalid argument(s): fromID and toID are the same","success":false}`
or
`{"nonce":"1727074351852","error":"user rejected","success":false}`

On success a "methodResult" event is received:
`{nonce":"1727074374562","success":true,"data":{"tick":16051219}}`
_The tick field contains the tick where the transfer was scheduled for_

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

## tokenAmountChanged

To be implemented

## methodResult

Is a generic result for various methods invocations

Payload
{"nonce":"1727074351852","error":"user rejected","success":false, data: {}}
|Field|Type |Info
|--|--|--|
|nonce | String? | The nonce of the method invocation |
|error | String? | If not empty, contains any error info |
|success| bool | Defines if methodResult describes an error or successful result|
|data | Object | Data for successful calls
