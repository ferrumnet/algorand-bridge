const { waitForConfirmation, ALGORAND_MIN_TX_FEE } = require('algosdk');
const algosdk = require('algosdk');
const { readApprovalTeal, readClearTeal } = require('./compile');


// Node must have EnableDeveloperAPI set to true in its config 

deployContract();

async function deployContract(){

// ADMIN
    creatorMnemonic = "pink faint about build crime cause gossip leopard chat utility network mansion tunnel armed blue clean much claim switch unfold saddle victory know absent legend";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;

    /*

    1. Mainnet Account (Admin)

    Public Key: YOGAST2V4TKCQMNAVEJYIUNZDH5PKHWYED7QX6WLAE5PNTMNCIEESYY3SQ
    Mnemonics: pink faint about build crime cause gossip leopard chat utility network mansion tunnel armed blue clean much claim switch unfold saddle victory know absent legend

    2. UserA 

    Public Key: LQOQ5NJTFGV6Z7O6TD5JCODOUJZUGJ43OLZ4IVZHJGQKPODS5EMP7JVKJ4
    Mnemonics: oven visual long lunar bubble supply ozone coast gown auction service comic pink hockey scorpion announce bind cradle unfold siege play long vacuum absorb win

    3. UserB
    
    Public key: 247QELZSSP4IODWTIOS4GM7LSCLKFPVB3XR6BBUXG3VC45IDF2EJ3HW43E
    Mnemonics: exclude cute joy nest rebel food amazing ship monster gift deny master rare chef ice length raccoon capable hair hamster genre gun style abandon daughter
    
    4. UserC

    Public key: SQWK3FEQ2ENAXZV2PPPSQSOW2QVNDDQHW2L2E5O7SMTDYVHR7Q7RMXZXK4
    Mnemonics: purse wrestle drive crouch admit level gloom banner junior depart belt utility else anchor hero lumber involve imitate uncover wide duck sense sniff absent filter
    */

    // Setup AlgodClient Connection
    const token = { 'X-API-key': 'QgOcdLWZn84sAfFfIK6SN2h3FR7P8TgY9E8YlEAI' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

    // get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
            let token_address = 885201687;
            let bridge_fee = 0.0025 * 10000; // bridge_fee
            let token_buffer = 500;
            
// python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(93217615).to_bytes(8, 'big'))))"
            let appArgs = [];
            appArgs.push(algosdk.encodeUint64(bridge_fee));
            appArgs.push(algosdk.encodeUint64(token_address));
            appArgs.push(algosdk.encodeUint64(token_buffer));

            let owner = "LQOQ5NJTFGV6Z7O6TD5JCODOUJZUGJ43OLZ4IVZHJGQKPODS5EMP7JVKJ4";
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