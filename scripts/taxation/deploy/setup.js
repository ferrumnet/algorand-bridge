const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');

setup();

async function setup() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://3.145.206.208';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// ADMIN
    let creatorMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
suggestedParams.flatFee = true;
let index = 107194846;
let token_address = 81317600;  

account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "setup";
let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));

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
let txResponse = await algodClient.pendingTransactionInformation(txId).do();
console.log("Setup Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}