/* global AlgoSigner */
import './App.css';
const { default: algosdk } = require('algosdk');

const swapToken = (who, _amount) => {
    return swap(who, _amount);
}
// const stakeToken = ({who}) => {
async function swap(who, _amount) {
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

      let revocationTarget = undefined;
      let closeRemainderTo = undefined;
      let note = undefined; 

      const appArgs = [];
      const action = "swap";
      let amount = parseInt(_amount);

// Parameters to be picked from UI/ENV
// 1. If BSC Network is selected then targetnetwork will be 56
// 2. When metamask wallet is connected, we will fetch the wallet address that gets connected and pass it to target_address variable
// 3. The token that is selected is on BSC, we will use its contract address

      let smartContract = "YWQOXVYP74AJI2WOXSOHENVZE6ZHNPD55UN6YLMFYVPCJW25SA56FGEQ34";
      let target_token = "0xA719b8aB7EA7AF0DDb4358719a34631bb79d15Dc";
      let target_network = 56;
      let target_address = "0x0Bdb79846e8331A19A65430363f240Ec8aCC2A52";

      appArgs.push(new Uint8Array(Buffer.from(action)));
      appArgs.push(algosdk.encodeUint64(token_address));
      appArgs.push(algosdk.encodeUint64(amount));
      appArgs.push(new Uint8Array(Buffer.from(target_token)));
      appArgs.push(algosdk.encodeUint64(target_network));
      appArgs.push(new Uint8Array(Buffer.from(target_address)));

      // Transaction to stake token 
  
  let txnStake = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, smartContract, closeRemainderTo, revocationTarget, amount, note, token_address, txParams);  
  // console.log(txnStake)
  // create unsigned transaction
  let txnCall = algosdk.makeApplicationNoOpTxn(sender, txParams, appId, appArgs);
  // console.log(txn)
  // Group the paymntTransferStakte Txn and AppCall
  let txnGroup = [txnStake, txnCall];
  let txGroup = algosdk.assignGroupID(txnGroup);
  
  let binaryTxs = [txnStake.toByte(), txnCall.toByte()];
  let base64Txs = binaryTxs.map((binary) => AlgoSigner.encoding.msgpackToBase64(binary));
  
  let signedTxs = await AlgoSigner.signTxn([
    {
      txn: base64Txs[0],
    },
    {
      txn: base64Txs[1],
    },
    ]);
    let binarySignedTxs = signedTxs.map((tx) => AlgoSigner.encoding.base64ToMsgpack(tx.blob));
    console.log(binarySignedTxs);
    const r = await algodClient.sendRawTransaction(binarySignedTxs).do();
    console.log(r);
    return r;
};

export default swapToken;