const EthCrypto = require('eth-crypto');



const signer2 = EthCrypto.recoverPublicKey(
    '314084e37c46edb51877402c0cd930df500ea1bc801e104ca45f48177594bc6b0749af542f6a25f09afd8a60593e0ac80496410797721ba0c3c06297b2bceebc1c', // signature
    "7128d4e6c7ceb3867458c188c8f38a9e52c6b519c5aadfdf0b9132396f3eb4bb"
);

// console.log("public key recovered: " + signer2);
console.log("Signer Address recovered: " + EthCrypto.publicKey.toAddress(signer2));
