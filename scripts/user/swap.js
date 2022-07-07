const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://3.145.206.208';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// // ADMIN
    // let creatorMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
    // let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    // let sender = creatorAccount.addr;
    
// Staker 1 
let userMnemonic = "bulk narrow warrior rally table smoke return pyramid drink sphere picnic rice manage village purse illegal problem trim arrange urban theme nerve dragon abstract chalk";
let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
let sender = userAccount.addr;

// // Staker 2
// let userMnemonic = "tackle illegal poverty push label proof vessel trial fee stem naive fatal muffin smart wink equip frost remove cup radar pilot awake flip above negative";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;

    // Contract Address
    let smartContract = "YW77XHZMM5OMA6IJZ45S6J6NNWN7KXHWEPLJVMUS37BY4WAPG45OOWZW2E";

// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 98492040;
let token_address = 81317600;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let note = undefined;
account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "swap";
let amount = 50;
let target_token = "0xA719b8aB7EA7AF0DDb4358719a34631bb79d15Dc";
let target_network = 56;
let target_address = "0xA719b8aB7EXYZDDb4358719a34631b930X39Ax";

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));

appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(algosdk.encodeUint64(amount));
appArgs.push(algosdk.encodeUint64(target_network));
appArgs.push(new Uint8Array(Buffer.from(target_token)));
appArgs.push(new Uint8Array(Buffer.from(target_address)));

// Transaction to stake token 
let txnStake = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, smartContract, closeRemainderTo, revocationTarget, amount, note, token_address, suggestedParams);  
// console.log(txnStake)
// create unsigned transaction
let txnCall = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs);
// console.log(txn)
// Group the paymntTransferStakte Txn and AppCall
let txnGroup = [txnStake, txnCall];

// Group them
let txGroup = algosdk.assignGroupID(txnGroup);
console.log(txGroup);
// Sign each transaction
// Sign each transaction in the group 
signedTx1 = txnStake.signTxn( userAccount.sk)
signedTx2 = txnCall.signTxn( userAccount.sk )

// Assemble transaction group

let signed = []
signed.push( signedTx1 )
signed.push( signedTx2 )


// submit transaction
let tx = (await algodClient.sendRawTransaction(signed).do());
// let txId = tx.txId;
console.log("Transaction : " + tx.txId);

// Wait for transaction to be confirmed
await waitForConfirmation(algodClient, tx.txId, 5)

// response display 
let transactionResponse = await algodClient.pendingTransactionInformation(tx.txId).do();
console.log(transactionResponse);
console.log("Swapped to the BSC Network [AssetID]: ", transactionResponse['txn']['txn']['xaid'] );

    if (transactionResponse['global-state-delta'] !== undefined ) {
        console.log("Global State updated:",transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined ) {
        console.log("Local State updated:",transactionResponse['local-state-delta']);
    }
}