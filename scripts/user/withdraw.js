const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
const { ToBytes } = require('casper-js-sdk');
// require('./deploy.js');
var ByteBuffer = require('bytebuffer');
var convertStringBytes = require('convert-string-bytes');
const { stringToBytes } = require('convert-string');

setup();

async function setup() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://3.145.206.208';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// // ADMIN
//     let creatorMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
//     let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
//     let sender = creatorAccount.addr;
    
// Staker 1 
let creatorMnemonic = "bulk narrow warrior rally table smoke return pyramid drink sphere picnic rice manage village purse illegal problem trim arrange urban theme nerve dragon abstract chalk";
let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
let sender = creatorAccount.addr;

// // Staker 2
// let userMnemonic = "tackle illegal poverty push label proof vessel trial fee stem naive fatal muffin smart wink equip frost remove cup radar pilot awake flip above negative";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee = 50000;
// suggestedParams.flatFee = true;

let index = 98492040;
let token_address = 81317600;
account = ["GAJPADR5Y3ESQMP2LRGYKEADLBW6HXS5E3MDTQ7PCQS76EZTFJ4ZYH2VIE"];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

// withdraw_token(_token,_amount, _receiver, salt, signature),
let action = "withdraw";
let amount = 100;
let message = "OpenZeppelin1";
let signature = "5d99b6f7f6d1f73d1a26497f2b1c89b24c0993913f86e9a2d02cd69887d9c94f3c880358579d811b21dd1b7fd9bb01c1d81d10e69f0384e675c32b39643be8921b";
let signByte = ByteBuffer.fromHex(signature, undefined, undefined);
let signBuffer = signByte.buffer;

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)))
appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(amount));
appArgs.push(new Uint8Array(Buffer.from(message)));
appArgs.push(new Uint8Array(Buffer.from(signBuffer)));

// create unsigned transaction
let txn = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);

// get tx ID
let txId = txn.txID().toString();
console.log("Withdraw Tx ID: ", txId);

// sign transaction 
let signedTxn = txn.signTxn(creatorAccount.sk);
console.log("Withdraw signed Txn: ", signedTxn);

// submit the transaction 
let response = await algodClient.sendRawTransaction(signedTxn).do();
console.log("Raw transaction submitted: ", response);

// wait for the transaction confirmation 
let timeout = 4; 
await waitForConfirmation(algodClient, txId, timeout);

// response display 
let txResponse = await algodClient.pendingTransactionInformation(txId).do();
console.log("Withdraw from the BridgePool Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}