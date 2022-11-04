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
const ethr_did_1 = require("ethr-did");
const signer_1 = require("../ethers/signer");
// Initialise the page objects to interact with
// UI Section: "Configure subject and audience DIDs"
const configureAddessesForm = document.querySelector('#configureAddresses');
const subjectAddressHTML = document.querySelector('#subjectAddress');
const audienceAddressHTML = document.querySelector('#audienceAddress');
const subjectDIDSpan = document.querySelector('#subjectDID');
const audienceDIDSpan = document.querySelector('#audienceDID');
// UI Section: "Prepare JWT Token for Signing"
const prepareJWTForm = document.querySelector('#prepareJWT');
const privateClaimHTML = document.querySelector('#privateClaim');
const issuerDIDSpan = document.querySelector('#issuerDID');
// UI Section: "Sign JWT Token"
const signJWTButton = document.querySelector('#signJWT');
const connectedMetamaskAccountSpan = document.querySelector('#connectedMetamaskAccount');
const signedJWTSpan = document.querySelector('#signedJWT');
const delegateSignerSpan = document.querySelector('#delegateSigner');
const delegateSignerIdentifierSpan = document.querySelector('#delegateSignerIdentifier');
let chainNameOrId; // The connected EVM chain
let privateClaim;
let JWTMessage; // Unsigned JWT message
let signedJWT; // Signed JWT message
let issuerAddress;
let subjectAddress;
let audienceAddress;
let issuerDid; // Processed issuer DID based on connected Metamask account
let subjectDid;
let audienceDid;
// Prepare the JWT to display to user before signing
configureAddessesForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    // Extract the form values, if any
    subjectAddress = subjectAddressHTML.value;
    audienceAddress = audienceAddressHTML.value;
    yield processDid(); // Process the corresponding DID based on the ethr-did format
}));
prepareJWTForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    // Extract the form value
    privateClaim = (privateClaimHTML.value === '') ? 'DEFAULT_PRIVATE_CLAIM' : privateClaimHTML.value;
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
        subjectDid = new ethr_did_1.EthrDID({ identifier: subjectAddress, provider: signer_1.provider, chainNameOrId });
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
        issuerDid = new ethr_did_1.EthrDID({ identifier: issuerAddress, provider: signer_1.provider, chainNameOrId });
        // Build the JWT to be signed
        const buildJWT = {
            // options and header are added by ethr-did library
            payload: {
                iss: issuerDid.did,
                sub: subjectDid.did,
                aud: audienceDid.did,
                privateClaim: privateClaim
            }, //iat is overwritten when calling createJWT
            // options: { issuer: issuerDid.did },
            // header: { alg: 'ES256K' }
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
        issuerDid = new ethr_did_1.EthrDID({ identifier: issuerAddress, provider: signer_1.provider, chainNameOrId, txSigner: signer_1.signer, alg: 'ES256K' });
        // Create a signing delegate as web3 providers are not able to sign directly
        const { kp, txHash } = yield issuerDid.createSigningDelegate();
        const issuerDelegateKp = new ethr_did_1.EthrDID(Object.assign(Object.assign({}, kp), { chainNameOrId }));
        // Use the delegate to sign the message
        signedJWT = yield issuerDelegateKp.signJWT(JWTMessage.payload);
        // Update the UI to display the signed JWT
        connectedMetamaskAccountSpan.innerHTML = yield signer_1.signer.getAddress();
        delegateSignerSpan.innerHTML = kp.address;
        delegateSignerIdentifierSpan.innerHTML = kp.identifier;
        signedJWTSpan.innerHTML = signedJWT;
        // Save the JWT 
        yield fetch('/api/saveJWT', {
            method: 'POST',
            body: JSON.stringify({ signedJWT }),
            headers: { 'Content-type': 'application/json' }
        }).then((res) => __awaiter(this, void 0, void 0, function* () {
            const message = yield res.text();
            console.log(JSON.parse(message).message);
        }));
    });
}
