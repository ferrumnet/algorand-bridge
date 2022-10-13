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

let action = "allow-target";
let _chain_id = 81;
let _target_token = "0xb521DCe1C2352664caa56eFD9Fe4cD9FB624E267";

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));d

appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(_chain_id));
appArgs.push(new Uint8Array(Buffer.from(_target_token)));

// create unsigned transaction
let txn = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);

// get tx ID
let txId = txn.txID().toString();
console.log("target set Tx ID: ", txId);

// sign transaction 
let signedTxn = txn.signTxn(creatorAccount.sk);
console.log("target set signed Txn: ", signedTxn);

// submit the transaction 
let response = await algodClient.sendRawTransaction(signedTxn).do();
console.log("Raw transaction submitted: ", response);

// wait for the transaction confirmation 
let timeout = 4; 
await waitForConfirmation(algodClient, txId, timeout);

// response display 
let txResponse = await algodClient.pendingTransactionInformation(txId).do();
console.log("Allowed Target is added to the Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}