const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
const token = { 'X-API-key': 'QgOcdLWZn84sAfFfIK6SN2h3FR7P8TgY9E8YlEAI' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// ADMIN
    let userMnemonic = "pink faint about build crime cause gossip leopard chat utility network mansion tunnel armed blue clean much claim switch unfold saddle victory know absent legend";
    let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
    let sender = userAccount.addr;
    
// // User 1 
// let userMnemonic = "oven visual long lunar bubble supply ozone coast gown auction service comic pink hockey scorpion announce bind cradle unfold siege play long vacuum absorb win";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;

// // // User 2
// let userMnemonic = "exclude cute joy nest rebel food amazing ship monster gift deny master rare chef ice length raccoon capable hair hamster genre gun style abandon daughter";
// let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);
// let sender = userAccount.addr;

    // Contract Address
    let smartContract = "J33N47IN4O6UXTJ5FGYCW4VZYAUILO264ZAC3BIR3UETN3O2XVSUU2ZKVI";

// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 885277315;
let token_address = 885201687;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let note = undefined;
account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "swap";
let amount = 5;
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