const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://18.220.61.102';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// ADMIN
    let creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
    // Contract Address
    let smartContract = "RDA7XTT6DSVQFUHKBYED4UBCRARFROMKQMLKEGISTC2FYYJ67XXJXHK3IM";
// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
   

let index = 114299206;
let token_address = 81317600;
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