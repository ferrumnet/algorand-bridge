const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
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
// let userMnemonic = "bulk narrow warrior rally table smoke return pyramid drink sphere picnic rice manage village purse illegal problem trim arrange urban theme nerve dragon abstract chalk";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;

// // Staker 2
// let userMnemonic = "tackle illegal poverty push label proof vessel trial fee stem naive fatal muffin smart wink equip frost remove cup radar pilot awake flip above negative";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;
 
// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 98492040;
let token_address = 81317600;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let note = undefined;
account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "allow-target";

let _chain_id = 56;
let _target_token = "A719b8aB7EA7AF0DDb4358719a34631bb79d15Dc";

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));

appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(_chain_id));
appArgs.push(new Uint8Array(Buffer.from(_target_token)));

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
console.log("Allowed Target is added to the Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}