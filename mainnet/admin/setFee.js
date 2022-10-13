const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
const token = { 'X-API-key': 'QgOcdLWZn84sAfFfIK6SN2h3FR7P8TgY9E8YlEAI' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// ADMIN
    let creatorMnemonic = "pink faint about build crime cause gossip leopard chat utility network mansion tunnel armed blue clean much claim switch unfold saddle victory know absent legend";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
// // Staker 1 
// let userMnemonic = "oven visual long lunar bubble supply ozone coast gown auction service comic pink hockey scorpion announce bind cradle unfold siege play long vacuum absorb win";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;

// // Staker 2
// let userMnemonic = "exclude cute joy nest rebel food amazing ship monster gift deny master rare chef ice length raccoon capable hair hamster genre gun style abandon daughter";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;
 
// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 885277315;
let token_address = 885201687;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let note = undefined;
account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "set-fee";

let _fee10000 = 0.0023 * 10000;

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));

appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(_fee10000));

// create unsigned transaction
let txn = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);

// get tx ID
let txId = txn.txID().toString();
console.log("setup Tx ID: ", txId);

// sign transaction 
let signedTxn = txn.signTxn(creatorAccount.sk);
console.log("setup signed Txn: ", signedTxn);

// submit the transaction 
let response = await algodClient.sendRawTransaction(signedTxn).do();
console.log("Raw transaction submitted: ", response);

// wait for the transaction confirmation 
let timeout = 4; 
await waitForConfirmation(algodClient, txId, timeout);

// response display 
let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
console.log(transactionResponse);
console.log("Token Fee is set for the BridgePool Contract [App-ID]: ", transactionResponse['txn']['txn']['apid'] );

}