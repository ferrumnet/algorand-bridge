const { waitForConfirmation,ALGORAND_MIN_TX_FEE, default: algosdk } = require('algosdk');
// require('./deploy.js');
const EthCrypto = require('eth-crypto');
setup();

async function setup() {

// ADMIN
creatorMnemonic = "Enter your Mnemonics here to execute the script";
let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
let sender = creatorAccount.addr;

// Setup AlgodClient Connection
const token = { 'X-API-key': 'Enter your PureStake API key here..' }
let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');
    
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

let action = "setup";
let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));

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
console.log("Setup Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}