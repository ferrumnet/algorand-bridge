const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');
var ByteBuffer = require('bytebuffer');
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
let index = 100441558       
let signature = "5272dc4f0e7fdb721d08bce261b3e3fb7fc0315b7ddc8fd4b46e8ca0298c705d5077c1a1ccc488f4f4516eaf0f149f713caba91b9e7e1e9d9d0788d0298577751c";
let hash = "fc0b3a47ab582027c585043ccaa62b0800f38f061cd454ae7e28897a7cf4397b";

 signature = ByteBuffer.fromHex(signature, undefined, undefined);

// let hashByte = ByteBuffer.fromHex(hash, undefined, undefined);
// let hashBuffer = hashByte.buffer;

let appArgs = [];


account = [];
foreignApp = [];
foreignAssets = [];

let action = "ecdsa-recover";
appArgs.push(new Uint8Array(Buffer.from(action)));
// appArgs.push(new Uint8Array(hash));
// appArgs.push(new Uint8Array(signature));

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
console.log("Setup Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}