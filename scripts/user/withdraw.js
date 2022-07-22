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

let index = 100446236;
let token_address = 81317600;
account = ["GAJPADR5Y3ESQMP2LRGYKEADLBW6HXS5E3MDTQ7PCQS76EZTFJ4ZYH2VIE"];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

// withdraw_token(_token,_amount, _receiver, salt, signature),
let action = "withdraw";
let amount = 100;
// let message = "OpenZeppelin1";
let signature = "5272dc4f0e7fdb721d08bce261b3e3fb7fc0315b7ddc8fd4b46e8ca0298c705d5077c1a1ccc488f4f4516eaf0f149f713caba91b9e7e1e9d9d0788d0298577751c";
let signByte = ByteBuffer.fromHex(signature, undefined, undefined);
signature = signByte.buffer;
let salt = "f3c0b3a47ab582027c585043ccaa62b0800f38f061cd454ae7e28897a7cf4397";
let saltByte = ByteBuffer.fromHex(salt, undefined, undefined);
salt = saltByte.buffer;
let algoChainID = 1122;

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)))
appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(amount));
appArgs.push(new Uint8Array(Buffer.from(salt)));
appArgs.push(new Uint8Array(Buffer.from(signature)));
appArgs.push(algosdk.encodeUint64(algoChainID));

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