const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');
var ByteBuffer = require('bytebuffer');
noop();

async function noop() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://18.220.61.102';
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
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 114299206;
let token_address = 81317600;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let note = undefined;
account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "add-signer";
let _signer = "0bdb79846e8331a19a65430363f240ec8acc2a25";
let _signerByte = ByteBuffer.fromHex(_signer, undefined, undefined);
_signer = _signerByte.buffer;
console.log(_signer);
let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));
appArgs.push(new Uint8Array(Buffer.from(_signer)));


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
console.log("Signer is added to the BridePool Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}