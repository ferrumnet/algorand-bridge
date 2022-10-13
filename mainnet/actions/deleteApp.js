const { waitForConfirmation } = require('algosdk');
const algosdk = require('algosdk');


// Node must have EnableDeveloperAPI set to true in its config 

deleteContract();

async function deleteContract(){
   // ADMIN
    creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;


        // Setup AlgodClient Connection
const token = { 'X-API-key': 'Enter your PureStake API key here..' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

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