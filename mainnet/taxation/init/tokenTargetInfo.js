const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');

setup();

async function setup() {
        // Setup AlgodClient Connection
const token = { 'X-API-key': 'Enter your PureStake API key here..' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// ADMIN
    let creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee = ALGORAND_MIN_TX_FEE;
suggestedParams.flatFee = true;
let index = 885279530;
let token_address = 885201687;  
/*
LQOQ5NJTFGV6Z7O6TD5JCODOUJZUGJ43OLZ4IVZHJGQKPODS5EMP7JVKJ4
247QELZSSP4IODWTIOS4GM7LSCLKFPVB3XR6BBUXG3VC45IDF2EJ3HW43E
SQWK3FEQ2ENAXZV2PPPSQSOW2QVNDDQHW2L2E5O7SMTDYVHR7Q7RMXZXK4
*/
let _target = "SQWK3FEQ2ENAXZV2PPPSQSOW2QVNDDQHW2L2E5O7SMTDYVHR7Q7RMXZXK4";
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