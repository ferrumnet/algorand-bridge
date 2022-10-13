const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');

setup();

async function setup() {
        // Setup AlgodClient Connection
const token = { 'X-API-key': 'QgOcdLWZn84sAfFfIK6SN2h3FR7P8TgY9E8YlEAI' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// ADMIN
    let creatorMnemonic = "pink faint about build crime cause gossip leopard chat utility network mansion tunnel armed blue clean much claim switch unfold saddle victory know absent legend";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;

//     // Staker 1 
// let creatorMnemonic = "oven visual long lunar bubble supply ozone coast gown auction service comic pink hockey scorpion announce bind cradle unfold siege play long vacuum absorb win";
// let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
// let sender = creatorAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee =1000;
suggestedParams.flatFee = false;
let index = 885279530;
let token_address = 885201687;
account = ["V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY","GAJPADR5Y3ESQMP2LRGYKEADLBW6HXS5E3MDTQ7PCQS76EZTFJ4ZYH2VIE", "RPWOPFEMNLC3H3KMU7W6T2FJ637RD5TF4X46DM5ECZPQRECUTGXM57YEIE"];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "distribute-tax";
let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));
// appArgs.push(algosdk.encodeUint64(token_address));

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
console.log("Tax Distributed from Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}