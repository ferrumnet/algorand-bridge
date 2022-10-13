const { waitForConfirmation, ALGORAND_MIN_TX_FEE } = require('algosdk');
const algosdk = require('algosdk');
const { readApprovalTeal, readClearTeal } = require('./compile');


// Node must have EnableDeveloperAPI set to true in its config 

deployContract();

async function deployContract(){

// ADMIN
    creatorMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;

        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://18.220.61.102';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
    let token_address = 81317600;    
            
// python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(93217615).to_bytes(8, 'big'))))"
    // let _len = 2;
    // let _totalW = 3;
    // let _weights = 2;

    let _global_len = 3;
    let _global_totalW = 3;
    // let _global_weights = 3;

    // let _target_type = "address";

            let appArgs = [];

            appArgs.push(algosdk.encodeUint64(token_address));
            appArgs.push(algosdk.encodeUint64(_global_len));
            appArgs.push(algosdk.encodeUint64(_global_totalW));
            // appArgs.push(algosdk.encodeUint64(_global_weights));

            accounts = [];
            foreignApps = [];
            foreignAssets = [];
            foreignAssets.push(token_address);

    // declare application state storage (immutable)
    localInts = 2;
    localBytes = 2;
    globalInts = 30;
    globalBytes = 30;


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