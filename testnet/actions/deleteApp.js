const { waitForConfirmation } = require('algosdk');
const algosdk = require('algosdk');


// Node must have EnableDeveloperAPI set to true in its config 

deleteContract();

async function deleteContract(){
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
    let index = 99590757;
    // create unsigned transaction
    let txn = algosdk.makeApplicationDeleteTxn(sender, suggestedParams, index);

    let txId = txn.txID().toString();
    console.log("NoOp Tx ID: ", txId);

    // sign transaction 
    let signedTxn = txn.signTxn(creatorAccount.sk);
    console.log("NoOp signed Txn: ", signedTxn);

    // submit the transaction 
    let response = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Raw transaction submitted: ", response);

    // wait for the transaction confirmation 
    let timeout = 20; 
    await waitForConfirmation(algodClient, txId, timeout);
    // sign, send, await

    // display results
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;

    console.log("Deleted app-id: ",appId);
}