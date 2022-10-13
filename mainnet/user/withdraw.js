const { waitForConfirmation, default: algosdk, ALGORAND_MIN_TX_FEE } = require('algosdk');
var ByteBuffer = require('bytebuffer');

withdraw();

async function withdraw() {
        // Setup AlgodClient Connection
    const token = { 'X-API-key': 'Enter your PureStake API key here..' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// // ADMIN
    let creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;
    
// get node suggested parameters (sp)
let suggestedParams = await algodClient.getTransactionParams().do();
suggestedParams.fee = ALGORAND_MIN_TX_FEE * 8;
suggestedParams.flatFee = true;

let index = 885277315;
let taxIndex = 885279530;
let token_address = 885201687;

// Once the withdraw is processed, the bridge fee will be deducted and added to the Bridge Tax Contract (..NLE)
// Bridge Tax Wallets are the ones where bridge tax will be distributed from bridge tax contract
account = ["Q6YCKI5SG7ZFLJ3BS6WGRJ5PJPAD3XCG4GRPYL3Y5U7QPAF4UOJYDRBNLE", "Bridge Tax Wallet 1", "Bridge Tax Wallet 2", "Bridge Tax Wallet 3"];
foreignApp = [];
foreignApp.push(taxIndex);
foreignAssets = [];
foreignAssets.push(token_address);

// withdraw_token(_token,_amount, _receiver, salt, signature),
let action = "withdraw";
let payee = "0x0Bdb79846e8331A19A65430363f240Ec8aCC2A52";
let amount = 5;

let signature = "e9193e49d8b5e917196923ca358ea45f4ffbd6bd2c5edfeea6bb620e6139240922bbe07b61d88f70a0eeb7773a534b4c804cdcb951c840c56c932bc46218bb3c1b";
let signByte = ByteBuffer.fromHex(signature, true, undefined);
signature = signByte.buffer;

// Message (hash) to be used for verification of arguments
let msg = "1b6cbd746ba6db32d124808b24fbed88e0e72a9e01841860c60c9d3ca5946cbb"
let msgByte = ByteBuffer.fromHex(msg, true, undefined);
msg = msgByte.buffer;

// Message Hash (hash) to be used along with signature for recovery of signer
let msgHash = "db05fefdf088ca9f95b1d312fba665588352b4e11052ff056c6c6de003f398a8"
let msgHashByte = ByteBuffer.fromHex(msgHash, true, undefined);
msgHash = msgHashByte.buffer;

let salt = "2a5bf46f6f05b9aa6072b5eccc4d28a28ad1425a";
let algoChainID = 26261;

let appArgs = [];
appArgs.push(new Uint8Array(Buffer.from(action)))
appArgs.push(algosdk.encodeUint64(token_address));
appArgs.push(new Uint8Array(Buffer.from(payee)))
appArgs.push(algosdk.encodeUint64(amount));
appArgs.push(new Uint8Array(Buffer.from(salt)));
appArgs.push(new Uint8Array(signature));
appArgs.push(algosdk.encodeUint64(algoChainID));
appArgs.push(new Uint8Array(msg));
appArgs.push(new Uint8Array(msgHash));

let recipient = sender; 
let revocationTarget = undefined;
let note = undefined;
// CloseReaminerTo is set to undefined as
// we are not closing out an asset
let closeRemainderTo = undefined;
amount = 0;
// signing and sending "txn" allows sender to begin accepting asset specified by creator and index
let txnOptin = algosdk.makeAssetTransferTxnWithSuggestedParams(
    sender, 
    recipient, 
    closeRemainderTo, 
    revocationTarget,
    amount, 
    note, 
    token_address, 
    suggestedParams);

// create unsigned transaction
let txnWithdraw = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs, account, foreignApp, foreignAssets);
/*
    ./sandbox goal app update --app-id=885277315 --from V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY --approval-prog bridge.teal --clear-prog clear.teal

    ./sandbox copyTo clear.teal

    ./sandbox goal app call --app-id 101467464 --from V4RFEEPLSXDFQ22Q45Q47ZZN5IWUQRAQTFI5N6JR3UOLHLD3UYPORMRALY --out=dryrun.json --dryrun-dump
*/
// Group the paymntTransferStakte Txn and AppCall
let txnGroup = [txnOptin, txnWithdraw];

// Group them
let txGroup = algosdk.assignGroupID(txnGroup);
console.log(txGroup);
// Sign each transaction
// Sign each transaction in the group 
signedTx1 = txnOptin.signTxn( creatorAccount.sk)
signedTx2 = txnWithdraw.signTxn( creatorAccount.sk )

// Assemble transaction group

let signed = []
signed.push( signedTx1 )
signed.push( signedTx2 )


// submit transaction
let tx = (await algodClient.sendRawTransaction(signed).do());
// let txId = tx.txId;
console.log("Transaction : " + tx.txId);

// Wait for transaction to be confirmed
await waitForConfirmation(algodClient, tx.txId,10)

// response display 
let transactionResponse = await algodClient.pendingTransactionInformation(tx.txId).do();
console.log(transactionResponse);
console.log("Withdrawed to the Algorand Network [AssetID]: ", transactionResponse['txn']['txn']['xaid'] );

    if (transactionResponse['global-state-delta'] !== undefined ) {
        console.log("Global State updated:",transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined ) {
        console.log("Local State updated:",transactionResponse['local-state-delta']);
    }


}