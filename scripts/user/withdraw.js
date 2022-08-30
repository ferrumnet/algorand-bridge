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

// ADMIN
    let creatorMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
// // Staker 1 
// let creatorMnemonic = "bulk narrow warrior rally table smoke return pyramid drink sphere picnic rice manage village purse illegal problem trim arrange urban theme nerve dragon abstract chalk";
// let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
// let sender = creatorAccount.addr;

// // Staker 2
// let creatorMnemonic = "tackle illegal poverty push label proof vessel trial fee stem naive fatal muffin smart wink equip frost remove cup radar pilot awake flip above negative";
// let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
// let sender = creatorAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee = ALGORAND_MIN_TX_FEE * 12;
suggestedParams.flatFee = true;

let index = 107308165;
let taxIndex = 107194846;
let token_address = 81317600;

// GAJPADR5Y3ESQMP2LRGYKEADLBW6HXS5E3MDTQ7PCQS76EZTFJ4ZYH2VIE
// RPWOPFEMNLC3H3KMU7W6T2FJ637RD5TF4X46DM5ECZPQRECUTGXM57YEIE
// OADKEO5L3QGMWWSIZJTVOZ64PVDMYK2ETIP65ESH22YSCEFTAE5B5IAKAQ
// IP2SEOTPZR3E6MVUD7MW4JJND7EPKVWTLCYA3ZOJ55PC6RXCKJ3KT2DMQ4
// UWD26UD3SFGGLSHGEFEZFD7A5GFYCJNR36O6OSI3LB5XPCGQWWKL6YVDHI

account = ["OADKEO5L3QGMWWSIZJTVOZ64PVDMYK2ETIP65ESH22YSCEFTAE5B5IAKAQ", "RPWOPFEMNLC3H3KMU7W6T2FJ637RD5TF4X46DM5ECZPQRECUTGXM57YEIE", "GAJPADR5Y3ESQMP2LRGYKEADLBW6HXS5E3MDTQ7PCQS76EZTFJ4ZYH2VIE", "L6QDYEA4FKKB23YDOFCKI6DK3BJYFYGWXMYUXR3B3MT6MCLG222J3IJGLY"];
foreignApp = [];
foreignApp.push(taxIndex);
foreignAssets = [];
foreignAssets.push(token_address);

// withdraw_token(_token,_amount, _receiver, salt, signature),
let action = "withdraw";
let payee = "0x0Bdb79846e8331A19A65430363f240Ec8aCC2A52";
let amount = 5;

// 53,022 VIE - 125 --> 53147
// 2,314 EIE - 125
// 2,250 AQ - 250

let signature = "104477af5625a433e22adbbb449cad475f181bd6b49681fdb1a31890a834fa5945a03008f5fd9b36ed2943f74a0109bce2d01f62a34dcef672963f76cf6d26121b";
let signByte = ByteBuffer.fromHex(signature, true, undefined);
signature = signByte.buffer;

// Message (hash) to be used for verification of arguments
let msg = "7396f0b1e79efb58160018f1663d1503d7f96508ca60aa2970e8280b5c9f497c"
let msgByte = ByteBuffer.fromHex(msg, true, undefined);
msg = msgByte.buffer;

// Message Hash (hash) to be used along with signature for recovery of signer
let msgHash = "8ff8bcfd169416dd06de3debb703ec52cdda72d3e612d259e894839111ea0595"
let msgHashByte = ByteBuffer.fromHex(msgHash, true, undefined);
msgHash = msgHashByte.buffer;

let salt = "fa393a47b05c66a643f56a3caeda7d03b950ae0c";
let algoChainID = 26261;

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)))
appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(new Uint8Array(Buffer.from(payee)))
appArgs.push(algosdk.encodeUint64(amount));
appArgs.push(new Uint8Array(Buffer.from(salt)));
appArgs.push(new Uint8Array(signature));
appArgs.push(algosdk.encodeUint64(algoChainID));
appArgs.push(new Uint8Array(msg));
appArgs.push(new Uint8Array(msgHash));

// create unsigned transaction
let txn = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);
/*
    ./sandbox goal app update --app-id=107308165 --from V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY --approval-prog bridge.teal --clear-prog clear.teal

    ./sandbox copyTo clear.teal

    ./sandbox goal app call --app-id 101467464 --from V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY --out=dryrun.json --dryrun-dump
*/
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