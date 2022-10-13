const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
const token = { 'X-API-key': 'QgOcdLWZn84sAfFfIK6SN2h3FR7P8TgY9E8YlEAI' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// // ADMIN
//     let creatorMnemonic = "pink faint about build crime cause gossip leopard chat utility network mansion tunnel armed blue clean much claim switch unfold saddle victory know absent legend";
//     let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
//     let sender = creatorAccount.addr;
    
// Owner 
let creatorMnemonic = "oven visual long lunar bubble supply ozone coast gown auction service comic pink hockey scorpion announce bind cradle unfold siege play long vacuum absorb win";
let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
let sender = creatorAccount.addr;

 
// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(79584368).to_bytes(8, 'big'))))"

let index = 885277315;
let token_address = 885201687;

// SmartContract address of FeeDistributro
account = ["Q6YCKI5SG7ZFLJ3BS6WGRJ5PJPAD3XCG4GRPYL3Y5U7QPAF4UOJYDRBNLE"];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "set-fee-distributor";

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));
// appArgs.push(new Uint8Array(Buffer.from(feeDistributor)));

console.log(account[0]);
// create unsigned transaction
let txn = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);

// get tx ID
let txId = txn.txID().toString();
console.log("setup Tx ID: ", txId);

// sign transaction 
let signedTxn = txn.signTxn(creatorAccount.sk);
console.log("setup signed Txn: ", signedTxn);

// submit the transaction 
let response = await algodClient.sendRawTransaction(signedTxn).do();
console.log("Raw transaction submitted: ", response);

// wait for the transaction confirmation 
let timeout = 4; 
await waitForConfirmation(algodClient, txId, timeout);

// response display 
let txResponse = await algodClient.pendingTransactionInformation(txId).do();
console.log(txResponse);
console.log("FeeDistributor is added to the BridgePool Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}