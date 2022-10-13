const algosdk = require('algosdk');
var fs = require('fs');

async function readApprovalTeal(){
    var approvalProgramSource;
    var content;
    approvalProgramSource = fs.readFileSync('tax.teal', 'utf8');
    content = await getCompiledResult(approvalProgramSource)
    return content;
}

async function readClearTeal(){
    clearProgramSource = `#pragma version 6
    int 1
    `;
    var content = await getCompiledResult(clearProgramSource);
    return content
}

async function getCompiledResult(data){
    let compiledSource = await compileTEAL(data);
       return compiledSource;
}

async function compileTEAL(content){
        // Setup AlgodClient Connection
        const token = { 'X-API-key': 'QgOcdLWZn84sAfFfIK6SN2h3FR7P8TgY9E8YlEAI' }
        let algodClient = new algosdk.Algodv2(token, 'https://mainnet-algorand.api.purestake.io/ps2', '');

    // Read Teal from Content
    let programSource = content;
 
    // compile program to binary
    let compiledSource = await compileProgram(algodClient, programSource);

    return compiledSource;
}
// to compile program source (TEAL) to Bytecode
async function compileProgram(algodClient, programSource){
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    let compileBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
    return compileBytes;
}

module.exports = { readApprovalTeal, readClearTeal };