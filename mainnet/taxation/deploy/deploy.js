const { waitForConfirmation, ALGORAND_MIN_TX_FEE } = require('algosdk');
const algosdk = require('algosdk');
const { readApprovalTeal, readClearTeal } = require('./compile');


// Node must have EnableDeveloperAPI set to true in its config 

deployContract();

async function deployContract(){

// ADMIN
    creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;

        // Setup AlgodClient Connection
const token = { 'X-API-key': 'Enter your PureStake API key here..' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

    // get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
    let token_address = 885201687;    
     
    let _global_len = 3;
    let _global_totalW = 4;

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