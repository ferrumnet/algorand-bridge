const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');
const { readApprovalTeal, readClearTeal } = require('./compile');

redeploy();

async function redeploy() {
    // Setup AlgodClient Connection
    const token = { 'X-API-key': 'Enter your PureStake API key here..' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// ADMIN
    let creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
suggestedParams.flatFee = true;
let index = 885277315;
let token_address = 885201687;  

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