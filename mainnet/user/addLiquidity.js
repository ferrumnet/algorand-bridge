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
    
// // User 1 
// let creatorMnemonic = "oven visual long lunar bubble supply ozone coast gown auction service comic pink hockey scorpion announce bind cradle unfold siege play long vacuum absorb win";
// let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
// let sender = creatorAccount.addr;

// // User 2
// let userMnemonic = "exclude cute joy nest rebel food amazing ship monster gift deny master rare chef ice length raccoon capable hair hamster genre gun style abandon daughter";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;
 
    // Contract Address
    let smartContract = "J33N47IN4O6UXTJ5FGYCW4VZYAUILO264ZAC3BIR3UETN3O2XVSUU2ZKVI";
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

let action = "add-liquidity";
let amount = 2000;

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));
appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(amount));

console.log(appArgs)

// Transaction to stake token 
let txnStake = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, smartContract, closeRemainderTo, revocationTarget, amount, note, token_address, suggestedParams);  
// console.log(txnStake)
// create unsigned transaction
let txnCall = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs);
// console.log(txn)
// Group the paymntTransferStakte Txn and AppCall
let txnGroup = [txnStake, txnCall];

// Group them

let txGroup = algosdk.assignGroupID(txnGroup);
console.log(txGroup);
// Sign each transaction
// Sign each transaction in the group 
signedTx1 = txnStake.signTxn( creatorAccount.sk)
signedTx2 = txnCall.signTxn( creatorAccount.sk )

// Assemble transaction group

let signed = []
signed.push( signedTx1 )
signed.push( signedTx2 )


// submit transaction
let tx = (await algodClient.sendRawTransaction(signed).do());
// let txId = tx.txId;
console.log("Transaction : " + tx.txId);

// Wait for transaction to be confirmed
await waitForConfirmation(algodClient, tx.txId, 5)

// response display 
let transactionResponse = await algodClient.pendingTransactionInformation(tx.txId).do();
console.log(transactionResponse);
console.log("Liquidity Added to the BridgePool for this Token [AssetID]: ", transactionResponse['txn']['txn']['xaid'] );

    if (transactionResponse['global-state-delta'] !== undefined ) {
        console.log("Global State updated:",transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined ) {
        console.log("Local State updated:",transactionResponse['local-state-delta']);
    }
}