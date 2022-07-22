const EthCrypto = require('eth-crypto');
const signer2 = EthCrypto.recoverPublicKey(
    '0xb619c95d7c021afe266d8119990234990603dfae428064e8c1019519d175253a333d73e2ebf17d08e0ec66c6261cea1b2a4504311bf246fc20fcebadcbcc02d31b', // signature
    "0x59c29fd62b4589d9a20c2e86ca1c7655739d383bc5135fa848526c9efe79a254"
);

console.log("public key recovered:" + signer2);
console.log("address recovered:" + EthCrypto.publicKey.toAddress(signer2));
