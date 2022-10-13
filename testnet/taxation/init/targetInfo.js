const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');

setup();

async function setup() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://18.220.61.102';
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
// GAJPADR5Y3ESQMP2LRGYKEADLBW6HXS5E3MDTQ7PCQS76EZTFJ4ZYH2VIE
// RPWOPFEMNLC3H3KMU7W6T2FJ637RD5TF4X46DM5ECZPQRECUTGXM57YEIE
// OADKEO5L3QGMWWSIZJTVOZ64PVDMYK2ETIP65ESH22YSCEFTAE5B5IAKAQ
// IP2SEOTPZR3E6MVUD7MW4JJND7EPKVWTLCYA3ZOJ55PC6RXCKJ3KT2DMQ4
// UWD26UD3SFGGLSHGEFEZFD7A5GFYCJNR36O6OSI3LB5XPCGQWWKL6YVDHI
let _target = "OADKEO5L3QGMWWSIZJTVOZ64PVDMYK2ETIP65ESH22YSCEFTAE5B5IAKAQ";
account = [_target];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "target-info";
let _target_type = "address";
let _count = 2;

        let appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from(action)));
        appArgs.push(new Uint8Array(Buffer.from(_target_type)));
        // appArgs.push(algosdk.encodeUint64(_target_weights));
        appArgs.push(algosdk.encodeUint64(_count));

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
console.log("Target Info Added [App-ID]: ", txResponse['txn']['txn']['apid'] );

}