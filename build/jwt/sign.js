"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issuerDelegateSignerAddress = exports.issuerDid = exports.subjectDid = exports.signedJWT = void 0;
const ethers_1 = require("ethers");
const ethr_did_1 = require("ethr-did");
const signer_1 = require("../ethers/signer");
// Initialise the page objects to interact with
const configureAddessesForm = document.querySelector('#configureAddresses');
const subjectAddressHTML = document.querySelector('#subjectAddress');
const audienceAddressHTML = document.querySelector('#audienceAddress');
const prepareJWTButton = document.querySelector('.prepareJWT');
const signJWTButton = document.querySelector('.signJWT');
const issuerDIDSpan = document.querySelector('.issuerDID');
const subjectDIDSpan = document.querySelector('.subjectDID');
const audienceDIDSpan = document.querySelector('.audienceDID');
const connectedMetamaskAccountSpan = document.querySelector('.connectedMetamaskAccount');
const signedJWTSpan = document.querySelector('.signedJWT');
const delegateSignerSpan = document.querySelector('.delegateSigner');
const delegateSignerIdentifierSpan = document.querySelector('.delegateSignerIdentifier');
let chainNameOrId; // The connected EVM chain
let JWTMessage; // Unsigned JWT message
let signedJWT; // Signed JWT message
exports.signedJWT = signedJWT;
let issuerAddress;
let subjectAddress;
let audienceAddress;
let issuerDid; // Processed issuer DID based on connected Metamask account
exports.issuerDid = issuerDid;
let subjectDid;
exports.subjectDid = subjectDid;
let audienceDid;
let signer; // The JWT signer (in this case, a hashed signed message from the Metamask user)
let issuerDelegateSignerAddress;
exports.issuerDelegateSignerAddress = issuerDelegateSignerAddress;
// Prepare the JWT to display to user before signing
configureAddessesForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    // Extract the form values, if any
    subjectAddress = subjectAddressHTML.value;
    audienceAddress = audienceAddressHTML.value;
    yield processDid(); // Process the corresponding DID based on the ethr-did format
}));
prepareJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prepareJWT();
}));
// Sign the JWT and display to user
signJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield signJWT(JWTMessage);
    //    await buildDidDocument();
}));
// Format the DID using ethr-did
function processDid() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the Metamask configured chainId
        chainNameOrId = (yield signer_1.provider.getNetwork()).chainId;
        // Check parameters for address else use default addreses per Hardhat default accounts 
        subjectAddress = (subjectAddress === '') ? '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' : subjectAddress;
        audienceAddress = (audienceAddress === '') ? '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' : audienceAddress;
        // Process the accounts
        exports.subjectDid = subjectDid = new ethr_did_1.EthrDID({ identifier: subjectAddress, provider: signer_1.provider, chainNameOrId });
        audienceDid = new ethr_did_1.EthrDID({ identifier: audienceAddress, provider: signer_1.provider, chainNameOrId });
        // Display the configured DID to the user
        subjectDIDSpan.innerHTML = subjectDid.did;
        audienceDIDSpan.innerHTML = audienceDid.did;
    });
}
// Prepare the JWT data
function prepareJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the connected signer address
        issuerAddress = yield signer_1.signer.getAddress();
        // Initialise the issuerDID object to get the issuer DID
        exports.issuerDid = issuerDid = new ethr_did_1.EthrDID({ identifier: issuerAddress, provider: signer_1.provider, chainNameOrId });
        // Build the JWT to be signed
        const buildJWT = {
            payload: { iss: issuerDid.did, sub: subjectDid.did, aud: audienceDid.did },
            options: { issuer: issuerDid.did },
            header: { alg: 'ES256K' }
        };
        // Display the JWT parameters
        issuerDIDSpan.innerHTML = issuerDid.did;
        // Save the unsignedJWT
        JWTMessage = buildJWT;
        console.log(`JWT Message:`);
        console.debug(buildJWT);
    });
}
// Sign the JWT 
function signJWT(JWTMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        // Recreate issuer DID object with signer
        exports.issuerDid = issuerDid = new ethr_did_1.EthrDID({ identifier: issuerAddress, provider: signer_1.provider, chainNameOrId, txSigner: signer_1.signer, alg: 'ES256K' });
        // Create a signing delegate as web3 providers are not able to sign directly
        const { kp, txHash } = yield issuerDid.createSigningDelegate();
        const issuerDelegateKp = new ethr_did_1.EthrDID(Object.assign({}, kp));
        exports.issuerDelegateSignerAddress = issuerDelegateSignerAddress = kp.address;
        console.log(`KP:`);
        console.debug(kp);
        // Use the delegate to sign the message
        exports.signedJWT = signedJWT = yield issuerDelegateKp.signJWT(JWTMessage.payload);
        // Update the UI to display the signed JWT
        connectedMetamaskAccountSpan.innerHTML = yield signer_1.signer.getAddress();
        delegateSignerSpan.innerHTML = kp.address;
        delegateSignerIdentifierSpan.innerHTML = kp.identifier;
        signedJWTSpan.innerHTML = signedJWT;
    });
}
function buildDidDocument() {
    return __awaiter(this, void 0, void 0, function* () {
        const registryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B';
        const registryAbi = '[{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"owners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"address"}],"name":"delegates","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"newOwner","type":"address"}],"name":"changeOwnerSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"validDelegate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"}],"name":"identityOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"changed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDOwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"delegateType","type":"bytes32"},{"indexed":false,"name":"delegate","type":"address"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDDelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"value","type":"bytes"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDAttributeChanged","type":"event"}]';
        const registryContract = new ethers_1.ethers.Contract(registryAddress, registryAbi, signer_1.signer);
        console.log(`issuerController:`);
        const issuerController = yield registryContract["identityOwner(address)"](issuerAddress);
        console.debug(issuerController);
        console.log(`DIDOwnerChanged:`);
        const ownerEvents = (yield registryContract.queryFilter('DIDOwnerChanged')).filter(e => e.args.identity === subjectAddress);
        console.debug(ownerEvents);
        console.log(`DIDDelegateChanged:`);
        const delegateEvents = (yield registryContract.queryFilter('DIDDelegateChanged')).filter(e => e.args.identity === subjectAddress);
        console.debug(delegateEvents);
        console.log(`DIDAttributeChanged:`);
        const attributeEvents = (yield registryContract.queryFilter('DIDOwnerChanged')).filter(e => e.args.identity === subjectAddress);
        console.debug(attributeEvents);
    });
}
