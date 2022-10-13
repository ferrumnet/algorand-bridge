const { default: algosdk } = require('algosdk');

        // Setup AlgodClient Connection
    const token = { 'X-API-key': 'Enter your PureStake API key here..' }
    let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

// ADMIN
    let creatorMnemonic = "Enter your Mnemonics here to execute the script";
    let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    let sender = creatorAccount.addr;

let index = 885277315;

// to read local state of user account
readLocalState(algodClient, sender, index);

// to read global state of blockchain
readGlobalState(algodClient, sender, index);


async function readLocalState(algodClient, sender, index) {
    let accountInfoResponse = await algodClient.accountInformation(sender).do();
    console.log(accountInfoResponse);
    for (let i = 0; i < accountInfoResponse['apps-local-state'].length; i++) { 
        if (accountInfoResponse['apps-local-state'][i].id == index) {
            console.log("User's local state:");
            for (let n = 0; n < accountInfoResponse['apps-local-state'][i]['key-value'].length; n++) {
                console.log(accountInfoResponse['apps-local-state'][i]['key-value'][n]);
            }
        }
    }
}

// read global state of application
async function readGlobalState(algodClient, sender, index){
    let accountInfoResponse = await algodClient.accountInformation(sender).do();
    for (let i = 0; i < accountInfoResponse['created-apps'].length; i++) { 
        if (accountInfoResponse['created-apps'][i].id == index) {
            console.log("Application's global state:");
            
            for (let n = 0; n < accountInfoResponse['created-apps'][i]['params']['global-state'].length; n++) {
                console.log(accountInfoResponse['created-apps'][i]['params']['global-state'][n]);
            }
        }
    }
}