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
        const algodServer = 'http://18.220.61.102';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// // ADMIN
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

let index = 114299206;
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
let amount = 1;

// 53,022 VIE - 125 --> 53147
// 2,314 EIE - 125
// 2,250 AQ - 250

let signature = "0af95695e7de495f392bee8543d6aadee9a4ec45a7c5b89d6244be6f0567d0df3bc827bc20821600b8e6bb109807a71a4a0a146e879bb3cffab4e7c0ec1b74e41c";
let signByte = ByteBuffer.fromHex(signature, true, undefined);
signature = signByte.buffer;

// Message (hash) to be used for verification of arguments
let msg = "87b26aae9ff7bbe5832761d030c965177e8e1d98c3f501995206817252483830"
let msgByte = ByteBuffer.fromHex(msg, true, undefined);
msg = msgByte.buffer;

// Message Hash (hash) to be used along with signature for recovery of signer
let msgHash = "512c962c006415fc56a0b57528000dbeca690fd9eb878a64c7d5493fcfc4f3eb"
let msgHashByte = ByteBuffer.fromHex(msgHash, true, undefined);
msgHash = msgHashByte.buffer;

let salt = "a41409ef606df1278cb3b2b72886f753c50a4cd7";
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

let recipient = sender; 
let revocationTarget = undefined;
let note = undefined;
// CloseReaminerTo is set to undefined as
// we are not closing out an asset
let closeRemainderTo = undefined;
amount = 0;
// signing and sending "txn" allows sender to begin accepting asset specified by creator and index
let txnOptin = algosdk.makeAssetTransferTxnWithSuggestedParams(
    sender, 
    recipient, 
    closeRemainderTo, 
    revocationTarget,
    amount, 
    note, 
    token_address, 
    suggestedParams);

// create unsigned transaction
let txnWithdraw = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);
/*
    ./sandbox goal app update --app-id=114299206 --from V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY --approval-prog bridge.teal --clear-prog clear.teal

    ./sandbox copyTo clear.teal

    ./sandbox goal app call --app-id 101467464 --from V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY --out=dryrun.json --dryrun-dump
*/
// Group the paymntTransferStakte Txn and AppCall
let txnGroup = [txnOptin, txnWithdraw];

// Group them
let txGroup = algosdk.assignGroupID(txnGroup);
console.log(txGroup);
// Sign each transaction
// Sign each transaction in the group 
signedTx1 = txnOptin.signTxn( creatorAccount.sk)
signedTx2 = txnWithdraw.signTxn( creatorAccount.sk )

// Assemble transaction group

let signed = []
signed.push( signedTx1 )
signed.push( signedTx2 )


// submit transaction
let tx = (await algodClient.sendRawTransaction(signed).do());
// let txId = tx.txId;
console.log("Transaction : " + tx.txId);

// Wait for transaction to be confirmed
await waitForConfirmation(algodClient, tx.txId,10)

// response display 
let transactionResponse = await algodClient.pendingTransactionInformation(tx.txId).do();
console.log(transactionResponse);
console.log("Withdrawed to the Algorand Network [AssetID]: ", transactionResponse['txn']['txn']['xaid'] );

    if (transactionResponse['global-state-delta'] !== undefined ) {
        console.log("Global State updated:",transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined ) {
        console.log("Local State updated:",transactionResponse['local-state-delta']);
    }


}