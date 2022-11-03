import * as didJWT from 'did-jwt';
import { ethers } from 'ethers';
import { EthrDID } from 'ethr-did';
import { EthereumDIDRegistry, EthrDidController } from 'ethr-did-resolver';

import { 
    provider as ethersProvider,
    signer as ethersSigner,
} from '../ethers/signer';

type unsignedJWT = {
    payload: didJWT.JWTPayload,
    options: {
        issuer: string // Removed signer in order to be able to prepare the message
    },
    header: {
        alg: string
    }
}

// Initialise the page objects to interact with
const configureAddessesForm = document.querySelector('#configureAddresses') as HTMLFormElement;
const subjectAddressHTML = document.querySelector('#subjectAddress') as HTMLFormElement;
const audienceAddressHTML = document.querySelector('#audienceAddress') as HTMLFormElement;
const prepareJWTButton = document.querySelector('.prepareJWT') as HTMLButtonElement;
const signJWTButton = document.querySelector('.signJWT') as HTMLButtonElement;
const issuerDIDSpan = document.querySelector('.issuerDID') as HTMLSpanElement;
const subjectDIDSpan = document.querySelector('.subjectDID') as HTMLSpanElement;
const audienceDIDSpan = document.querySelector('.audienceDID') as HTMLSpanElement;
const connectedMetamaskAccountSpan = document.querySelector('.connectedMetamaskAccount') as HTMLSpanElement;
const signedJWTSpan = document.querySelector('.signedJWT') as HTMLSpanElement;
const delegateSignerSpan = document.querySelector('.delegateSigner') as HTMLSpanElement;
const delegateSignerIdentifierSpan = document.querySelector('.delegateSignerIdentifier') as HTMLSpanElement;

let chainNameOrId: number; // The connected EVM chain
let JWTMessage: unsignedJWT; // Unsigned JWT message
let signedJWT: string; // Signed JWT message

let issuerAddress: string;
let subjectAddress: string;
let audienceAddress: string;
let issuerDid: EthrDID; // Processed issuer DID based on connected Metamask account
let subjectDid: EthrDID;
let audienceDid: EthrDID;
let signer: didJWT.Signer; // The JWT signer (in this case, a hashed signed message from the Metamask user)
let issuerDelegateSignerAddress: string;

// Prepare the JWT to display to user before signing
configureAddessesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Extract the form values, if any
    subjectAddress = subjectAddressHTML.value;
    audienceAddress = audienceAddressHTML.value;

    await processDid(); // Process the corresponding DID based on the ethr-did format
});

prepareJWTButton.addEventListener('click', async () => {
    await prepareJWT();
})

// Sign the JWT and display to user
signJWTButton.addEventListener('click', async () => {
   await signJWT(JWTMessage);
//    await buildDidDocument();
});

// Format the DID using ethr-did
async function processDid() {
    // Get the Metamask configured chainId
    chainNameOrId = (await ethersProvider.getNetwork()).chainId;

    // Check parameters for address else use default addreses per Hardhat default accounts 
    subjectAddress = (subjectAddress === '') ? '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' : subjectAddress;
    audienceAddress = (audienceAddress === '') ? '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' : audienceAddress;

    // Process the accounts
    subjectDid = new EthrDID({identifier: subjectAddress, provider: ethersProvider, chainNameOrId});
    audienceDid = new EthrDID({identifier: audienceAddress, provider: ethersProvider, chainNameOrId});

    // Display the configured DID to the user
    subjectDIDSpan.innerHTML = subjectDid.did;
    audienceDIDSpan.innerHTML = audienceDid.did;

}

// Prepare the JWT data
async function prepareJWT() {

    // Get the connected signer address
    issuerAddress = await ethersSigner.getAddress();

    // Initialise the issuerDID object to get the issuer DID
    issuerDid = new EthrDID({identifier: issuerAddress, provider: ethersProvider, chainNameOrId});

    // Build the JWT to be signed
    const buildJWT: unsignedJWT = {
        payload: { iss: issuerDid.did, sub: subjectDid.did, aud: audienceDid.did}, //iat is overwritten when calling createJWT
        options: { issuer: issuerDid.did },
        header: { alg: 'ES256K' }
    }

    // Display the JWT parameters
    issuerDIDSpan.innerHTML = issuerDid.did;

    // Save the unsignedJWT
    JWTMessage = buildJWT;

    console.log(`JWT Message:`);
    console.debug(buildJWT);

}

// Sign the JWT 
async function signJWT(JWTMessage: unsignedJWT) {

    // Recreate issuer DID object with signer
    issuerDid = new EthrDID({identifier: issuerAddress, provider: ethersProvider, chainNameOrId, txSigner: ethersSigner, alg: 'ES256K'});

    // Create a signing delegate as web3 providers are not able to sign directly
    const { kp, txHash} = await issuerDid.createSigningDelegate();
    const issuerDelegateKp: EthrDID = new EthrDID({...kp});

    issuerDelegateSignerAddress = kp.address;

    console.log(`KP:`)
    console.debug(kp);

    // Use the delegate to sign the message
    signedJWT = await issuerDelegateKp.signJWT(JWTMessage.payload);
    
    // Update the UI to display the signed JWT
    connectedMetamaskAccountSpan.innerHTML = await ethersSigner.getAddress();
    delegateSignerSpan.innerHTML = kp.address;
    delegateSignerIdentifierSpan.innerHTML = kp.identifier;
    signedJWTSpan.innerHTML = signedJWT;

}

async function buildDidDocument() {

    const registryAddress: string = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B';
    const registryAbi: string = '[{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"owners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"address"}],"name":"delegates","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"newOwner","type":"address"}],"name":"changeOwnerSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"validDelegate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"}],"name":"identityOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"changed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDOwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"delegateType","type":"bytes32"},{"indexed":false,"name":"delegate","type":"address"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDDelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"value","type":"bytes"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDAttributeChanged","type":"event"}]';
    const registryContract = new ethers.Contract(registryAddress, registryAbi, ethersSigner);

    console.log(`issuerController:`);
    const issuerController = await registryContract["identityOwner(address)"](issuerAddress);
    console.debug(issuerController);

    console.log(`DIDOwnerChanged:`);
    const ownerEvents = (await registryContract.queryFilter('DIDOwnerChanged')).filter(e => e.args!.identity === subjectAddress);
    console.debug(ownerEvents);

    console.log(`DIDDelegateChanged:`);
    const delegateEvents = (await registryContract.queryFilter('DIDDelegateChanged')).filter(e => e.args!.identity === subjectAddress);
    console.debug(delegateEvents);

    console.log(`DIDAttributeChanged:`);
    const attributeEvents = (await registryContract.queryFilter('DIDOwnerChanged')).filter(e => e.args!.identity === subjectAddress);
    console.debug(attributeEvents);
}

export { signedJWT, subjectDid, issuerDid, issuerDelegateSignerAddress };