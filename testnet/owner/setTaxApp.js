const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
// require('./deploy.js');

noop();

async function noop() {
        // Setup AlgodClient Connection
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://18.220.61.102';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
   
// Owner 
let creatorMnemonic = "Enter your Mnemonics here to execute the script";
let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
let sender = creatorAccount.addr;

 
// get node suggested parameters (sp)
    let suggestedParams = await algodClient.getTransactionParams().do();
    suggestedParams.fee = ALGORAND_MIN_TX_FEE * 2;
    suggestedParams.flatFee = true;
   
//python3 -c "import algosdk.encoding as e; print(e.encode_address(e.checksum(b'appID'+(107194846).to_bytes(8, 'big'))))"

let index = 114299206;
let taxIndex = 107194846;
let token_address = 81317600;

account = [];
foreignApp = [];
foreignAssets = [];
foreignAssets.push(token_address);

let action = "set-tax-app";

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)));
appArgs.push(algosdk.encodeUint64(taxIndex));


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
console.log("Tax Contract App ID is added to the BridgePool Contract [App-ID]: ", txResponse['txn']['txn']['apid'] );

}