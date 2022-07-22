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
let index = 100326542;
let token_address = 81317600;  
let _target = "HFYC6SVT5MJIR7A5JFA5EIINDS43RX4RU4WXMJPKLLALNMKAI4HIDRED3I";
account = [_target];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "token-target-info";
let _target_type = "address";
let _target_weights = 1;
let _count = 2;

        let appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from(action)));
        appArgs.push(algosdk.encodeUint64(token_address));
        appArgs.push(new Uint8Array(Buffer.from(_target_type)));
        appArgs.push(algosdk.encodeUint64(_count));
        appArgs.push(algosdk.encodeUint64(_target_weights));
        

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
console.log("TokenTargetInfo Added [App-ID]: ", txResponse['txn']['txn']['apid'] );

}