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


    /*

    1. Mainnet Account (Admin)

    Public Key: YOGAST2V4TKCQMNAVEJYIUNZDH5PKHWYED7QX6WLAE5PNTMNCIEESYY3SQ
    Mnemonics: Enter your Mnemonics here to execute the script

    2. UserA 

    Public Key: LQOQ5NJTFGV6Z7O6TD5JCODOUJZUGJ43OLZ4IVZHJGQKPODS5EMP7JVKJ4
    Mnemonics: Enter your Mnemonics here to execute the script

    3. UserB
    
    Public key: 247QELZSSP4IODWTIOS4GM7LSCLKFPVB3XR6BBUXG3VC45IDF2EJ3HW43E
    Mnemonics: Enter your Mnemonics here to execute the script
    */

// // Account 2
// let creatorMnemonic = "Enter your Mnemonics here to execute the script";
// let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
// let sender = creatorAccount.addr;

// https://mainnet-algorand.api.purestake.io/ps2

// curl -X GET "https://mainnet-algorand.api.purestake.io/ps2/v2/status" -H "x-api-key:Enter your PureStake API key here.."

        // Setup AlgodClient Connection

        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        // const algodServer = 'http://18.220.61.102';
        const algodServer = 'http://18.220.61.102';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
            let token_address = 81317600;
            let bridge_fee = 0.0025 * 10000; // bridge_fee
            let token_buffer = 500;
            
// python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(93217615).to_bytes(8, 'big'))))"
            let appArgs = [];
            appArgs.push(algosdk.encodeUint64(bridge_fee));
            appArgs.push(algosdk.encodeUint64(token_address));
            appArgs.push(algosdk.encodeUint64(token_buffer));

            let owner = "Enter owner wallet address here";
            accounts = [owner];
            foreignApps = [];
            foreignAssets = [];
            foreignAssets.push(token_address);

    // declare application state storage (immutable)
    localInts = 1;
    localBytes = 1;
    globalInts = 35;
    globalBytes = 26;

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
    let timeout = 45;
    let check = await waitForConfirmation(algodClient, txId, timeout);
    console.log(check);
    // display results 
    let txResponse = await algodClient.pendingTransactionInformation(txId).do();

    let appID = txResponse['application-index'];

    console.log("Deployed a smartContract on Algorand: ", appID);
}