const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');
const { readApprovalTeal, readClearTeal } = require('./compile');

setup();

async function setup() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        // const algodServer = 'http://18.220.61.102';
        const algodServer = 'http://18.220.61.102';
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
let index = 114299206;
let token_address = 81317600;  

account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);  
let bridge_fee = 0.0025 * 10000; // bridge_fee
let token_buffer = 500;

let appArgs = [];
appArgs.push(algosdk.encodeUint64(bridge_fee));
appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(token_buffer));

        // Get ByteCode of Approval Program
        let approvalProgram = await readApprovalTeal();
        // console.log("Approval Program ByteCode: ",approvalProgram);    
    
            // Get ByteCode of ClearState Program
        let clearProgram = await readClearTeal();
        // console.log("Clear Program ByteCode: ",clearProgram);

// create unsigned transaction
let txn = algosdk.makeApplicationUpdateTxn(sender, suggestedParams, index, approvalProgram, clearProgram);

// get tx ID
let txId = txn.txID().toString();
console.log("Update Tx ID: ", txId);

// sign transaction 
let signedTxn = txn.signTxn(creatorAccount.sk);
console.log("Update signed Txn: ", signedTxn);

// submit the transaction 
let response = await algodClient.sendRawTransaction(signedTxn).do();
console.log("Raw transaction submitted: ", response);

// wait for the transaction confirmation 
let timeout = 4; 
await waitForConfirmation(algodClient, txId, timeout);

// response display 
let appId = response['txn']['txn'].apid;
console.log("Updated app-id: ",appId);

}