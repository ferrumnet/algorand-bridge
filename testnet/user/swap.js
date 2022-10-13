const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://18.220.61.102';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// // ADMIN
//     let userMnemonic = "flight permit skill quick enforce strong hobby cloud letter foot can fee affair buddy exact link glare amused drama rain airport casual shoe abstract puppy";
//     let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
//     let sender = userAccount.addr;
    
// User 1 
let userMnemonic = "bulk narrow warrior rally table smoke return pyramid drink sphere picnic rice manage village purse illegal problem trim arrange urban theme nerve dragon abstract chalk";
let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
let sender = userAccount.addr;

// // // User 2
// let userMnemonic = "tackle illegal poverty push label proof vessel trial fee stem naive fatal muffin smart wink equip frost remove cup radar pilot awake flip above negative";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;

    // Contract Address
    let smartContract = "RDA7XTT6DSVQFUHKBYED4UBCRARFROMKQMLKEGISTC2FYYJ67XXJXHK3IM";

// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 114299206;
let token_address = 81317600;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let note = undefined;
account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "swap";
let amount = 500000;
let target_token = "0xb521DCe1C2352664caa56eFD9Fe4cD9FB624E269";
let target_network = 56;
let target_address = "0x0Bdb79846e8331A19A65430363f240Ec8aCC2A52";

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
await waitForConfirmation(algodClient, tx.txId,20)

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