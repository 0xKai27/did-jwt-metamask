import * as didJWT from 'did-jwt';
import { ethers } from 'ethers';
import { EthrDID } from 'ethr-did';

import { 
    provider as ethersProvider,
    signer as ethersSigner,
} from '../ethers/signer';

type unsignedJWT = {
    payload: didJWT.JWTPayload,
    options?: {
        issuer: string // Removed signer in order to be able to prepare the message
    },
    header?: {
        alg: string
    }
}

// Initialise the page objects to interact with
// UI Section: "Configure subject and audience DIDs"
const configureAddessesForm = document.querySelector('#configureAddresses') as HTMLFormElement;
const subjectAddressHTML = document.querySelector('#subjectAddress') as HTMLFormElement;
const audienceAddressHTML = document.querySelector('#audienceAddress') as HTMLFormElement;
const subjectDIDSpan = document.querySelector('#subjectDID') as HTMLSpanElement;
const audienceDIDSpan = document.querySelector('#audienceDID') as HTMLSpanElement;
// UI Section: "Prepare JWT Token for Signing"
const prepareJWTForm = document.querySelector('#prepareJWT') as HTMLFormElement;
const privateClaimHTML = document.querySelector('#privateClaim') as HTMLFormElement;
const issuerDIDSpan = document.querySelector('#issuerDID') as HTMLSpanElement;
// UI Section: "Sign JWT Token"
const signJWTButton = document.querySelector('#signJWT') as HTMLButtonElement;
const connectedMetamaskAccountSpan = document.querySelector('#connectedMetamaskAccount') as HTMLSpanElement;
const signedJWTSpan = document.querySelector('#signedJWT') as HTMLSpanElement;
const delegateSignerSpan = document.querySelector('#delegateSigner') as HTMLSpanElement;
const delegateSignerIdentifierSpan = document.querySelector('#delegateSignerIdentifier') as HTMLSpanElement;

let chainNameOrId: number; // The connected EVM chain
let privateClaim: string;
let JWTMessage: unsignedJWT; // Unsigned JWT message
let signedJWT: string; // Signed JWT message
let issuerAddress: string;
let subjectAddress: string;
let audienceAddress: string;
let issuerDid: EthrDID; // Processed issuer DID based on connected Metamask account
let subjectDid: EthrDID;
let audienceDid: EthrDID;

// Prepare the JWT to display to user before signing
configureAddessesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Extract the form values, if any
    subjectAddress = subjectAddressHTML.value;
    audienceAddress = audienceAddressHTML.value;

    await processDid(); // Process the corresponding DID based on the ethr-did format
});

prepareJWTForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Extract the form value
    privateClaim = (privateClaimHTML.value === '') ? 'DEFAULT_PRIVATE_CLAIM' : privateClaimHTML.value;

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
    subjectAddress = (subjectAddress === '') ? '0xDBB3d90156fC23c28C709eB68af8403836951AF8' : subjectAddress;
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
        // options and header are added by ethr-did library
        payload: {
            iss: issuerDid.did,
            sub: subjectDid.did,
            aud: audienceDid.did,
            privateClaim: privateClaim
        }, //iat is overwritten when calling createJWT
        // options: { issuer: issuerDid.did },
        // header: { alg: 'ES256K' }
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
    const issuerDelegateKp: EthrDID = new EthrDID({...kp, chainNameOrId});

    // Use the delegate to sign the message
    signedJWT = await issuerDelegateKp.signJWT(JWTMessage.payload);
    
    // Update the UI to display the signed JWT
    connectedMetamaskAccountSpan.innerHTML = await ethersSigner.getAddress();
    delegateSignerSpan.innerHTML = kp.address;
    delegateSignerIdentifierSpan.innerHTML = kp.identifier;
    signedJWTSpan.innerHTML = signedJWT;

    // Save the JWT 
    await fetch('/api/saveJWT', {
        method: 'POST',
        body: JSON.stringify({signedJWT}),
        headers: { 'Content-type': 'application/json'}
    }).then(async (res) => {
        const message = await res.text();
        console.log(JSON.parse(message).message)
    })

}