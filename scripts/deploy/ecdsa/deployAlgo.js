const { waitForConfirmation, ALGORAND_MIN_TX_FEE } = require('algosdk');
const algosdk = require('algosdk');
const { readApprovalTeal, readClearTeal } = require('./compile');
var ByteBuffer = require('bytebuffer');

// Node must have EnableDeveloperAPI set to true in its config 

deployContract();

async function deployContract(){

// ADMIN
    creatorMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;

        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://3.145.206.208';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = 50000;
    suggestedParams.flatFee = true;
            
// python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(93217615).to_bytes(8, 'big'))))"
            // let signature = "5272dc4f0e7fdb721d08bce261b3e3fb7fc0315b7ddc8fd4b46e8ca0298c705d5077c1a1ccc488f4f4516eaf0f149f713caba91b9e7e1e9d9d0788d0298577751c";
            let hash = "fc0b3a47ab582027c585043ccaa62b0800f38f061cd454ae7e28897a7cf4397b";
            
            // let signByte = ByteBuffer.fromHex(signature, undefined, undefined);
            // let signBuffer = signByte.buffer;

            // let hashByte = ByteBuffer.fromHex(hash, undefined, undefined);
            // let hashBuffer = hashByte.buffer;

            let appArgs = [];

            // appArgs.push(new Uint8Array(Buffer.from(hash)));
            // appArgs.push(new Uint8Array(Buffer.from(signBuffer)));
 
            accounts = [];
            foreignApps = [];
            foreignAssets = [];

    // declare application state storage (immutable)
    localInts = 0;
    localBytes = 0;
    globalInts = 20;
    globalBytes = 20;

        // Get ByteCode of Approval Program
    let approvalProgram = await readApprovalTeal();
    // console.log("Approval Program ByteCode: ",approvalProgram);    

        // Get ByteCode of ClearState Program
    let clearProgram = await readClearTeal();
    // console.log("Clear Program ByteCode: ",clearProgram);    
    

    // declare onComplete as NoOp to execute the SmartContract
    onComplete = algosdk.OnApplicationComplete.NoOpOC;

    // create unsigned transaction
    let txn = algosdk.makeApplicationCreateTxn(
        sender, suggestedParams, onComplete, approvalProgram, clearProgram,
        localInts, localBytes, globalInts, globalBytes, appArgs, accounts, foreignApps, foreignAssets
        );

    // console.log(txn);

    // to fetch the txn ID
    let txId = txn.txID().toString();
        console.log(txId);

    // Sign Transaction
    let signedTxn = txn.signTxn(creatorAccount.sk);
    console.log("Signed Transaction with txID: ", signedTxn);

    // submit the transaction 
    let response = await algodClient.sendRawTransaction(signedTxn).do();
    console.log(response);

    // wait for confirmation
    let timeout = 30;
    let check = await waitForConfirmation(algodClient, txId, timeout);
    console.log(check);
    // display results 
    let txResponse = await algodClient.pendingTransactionInformation(txId).do();

    let appID = txResponse['application-index'];

    console.log("Deployed a smartContract on Algorand: ", appID);
}