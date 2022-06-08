/* global AlgoSigner */
import './App.css';
const { default: algosdk } = require('algosdk');
// Withdraw function will be called when a request is initiated (for swap) from BSC network
// 1. We already know the Token address, target network, target wallet address and target blockchain from our UI and add it to env
const withdrawToken = (who, _amount) => {
    return withdraw(who, _amount);
}

async function withdraw(who, _amount) {
    const appId = 94104866;
    
    // Setup AlgodClient Connection
    const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const algodServer = 'http://3.145.206.208';
    const algodPort = 4001;
    let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    let txParams = await algodClient.getTransactionParams().do();
    txParams.fee = ALGORAND_MIN_TX_FEE * 2;
    txParams.flatFee = true;

    await AlgoSigner.connect({
        ledger: 'TestNet'
    });

    const accts = await AlgoSigner.accounts({
        ledger: 'TestNet'
    });

    const sender = accts[who]['address'];
    let token_address = 81317600;

    let accounts = [];
    let foreignApp = [];
    let foreignAssets = [];
    foreignAssets.push(token_address);

    let action = "withdraw";
    let amount = parseInt(_amount);

    let appArgs = [];
    appArgs.push(new Uint8Array(Buffer.from(action)));
    appArgs.push(algosdk.encodeUint64(token_address));
    appArgs.push(algosdk.encodeUint64(amount));

// create unsigned transaction
let txn = algosdk.makeApplicationNoOpTxn(sender, txParams, appId, appArgs, accounts, foreignApp, foreignAssets);

// get tx ID
let txId = txn.txID().toString();
console.log("Withdraw Tx ID: ", txId);

// sign transaction 
let binaryTx = [txn.toByte()];
let base64Tx = binaryTx.map((binary) => AlgoSigner.encoding.msgpackToBase64(binary));

let signedTx = await AlgoSigner.signTxn([
    {
      txn: base64Tx[0],
    },
    ]);

let binarySignedTx = signedTx.map((tx) => AlgoSigner.encoding.base64ToMsgpack(tx.blob));
console.log(binarySignedTx);

// submit the transaction 
const r = await algodClient.sendRawTransaction(binarySignedTx).do();
console.log("Raw transaction submitted: ", r);

return r;
};

export default withdrawToken;