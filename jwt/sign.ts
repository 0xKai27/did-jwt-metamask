import * as didJWT from 'did-jwt';
import { UnsignedTransaction } from 'ethers';

import { 
    provider,
    signer as ethersSigner,
} from '../ethers/signer';

type unsignedJWT = {
    payload: didJWT.JWTPayload,
    options: didJWT.JWTOptions,
    header: {
        alg: string
    }
}

// Initialise the page objects to interact with
const prepareJWTForm = document.querySelector('#prepareJWT') as HTMLFormElement;
const subjectAddressHTML = document.querySelector('#subjectAddress') as HTMLFormElement;
const audienceAddressHTML = document.querySelector('#audienceAddress') as HTMLFormElement;
const signJWTButton = document.querySelector('.signJWT') as HTMLButtonElement;
const issuerDIDSpan = document.querySelector('.issuerDID') as HTMLSpanElement;
const subjectDIDSpan = document.querySelector('.subjectDID') as HTMLSpanElement;
const audienceDIDSpan = document.querySelector('.audienceDID') as HTMLSpanElement;
const timestampSpan = document.querySelector('.timestamp') as HTMLSpanElement;
const signingAccountSpan = document.querySelector('.signingAccount') as HTMLSpanElement;
const signedJWTSpan = document.querySelector('.signedJWT') as HTMLSpanElement;

const signer: didJWT.Signer = didJWT.ES256KSigner(didJWT.hexToBytes('278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'));

let unsignedJWT: unsignedJWT;
let signedJWT: string;

// Prepare the JWT to display to user before signing
prepareJWTForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Extract the form values, if any
    const subjectAddress: string = subjectAddressHTML.value;
    const audienceAddress: string = audienceAddressHTML.value;

    await prepareJWT(subjectAddress, audienceAddress);
});

// Sign the JWT and display to user
signJWTButton.addEventListener('click', async () => {
   await signJWT(unsignedJWT);
});

// Prepare the JWT data
async function prepareJWT(subjectAddress: string, audienceAddress: string) {
    // Check parameters for address else use default addreses per Hardhat default accounts 
    subjectAddress = (subjectAddress === '') ? '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' : subjectAddress;
    audienceAddress = (audienceAddress === '') ? '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' : audienceAddress;

    // Get the connected Metamask account for signing
    const account: string = await ethersSigner.getAddress();
    const issuerDID: string = `did:ethr:${account}`;

    // Process the subject and audience address into did:ethr equivalent
    const subjectDID: string = `did:ethr:${subjectAddress}`;
    const audienceDID: string = `did:ethr:${audienceAddress}`;

    // Get the current time for timestamping
    const timestamp: Date = new Date();
    const timestampNumber: number = timestamp.getTime();

    // Build the JWT to be signed
    const buildJWT: unsignedJWT = {
        payload: { iss: issuerDID, sub: subjectDID, aud: audienceDID, iat: timestampNumber },
        options: { issuer: issuerDID, signer },
        header: { alg: 'ES256K' }
    }

    // Display the JWT parameters
    issuerDIDSpan.innerHTML = issuerDID;
    subjectDIDSpan.innerHTML = subjectDID;
    audienceDIDSpan.innerHTML = audienceDID;
    timestampSpan.innerHTML = `UTC - ${timestamp.toString()} | Number - ${timestampNumber.toString()}`;

    // Save the unsignedJWT
    unsignedJWT = buildJWT;

}

async function signJWT(unsignedJWT: unsignedJWT) {
    // Use the did-jwt library to generate the signed JWT
    signedJWT = await didJWT.createJWT(
        unsignedJWT.payload, 
        unsignedJWT.options, 
        unsignedJWT.header
    );
    
    // Update the UI to display the signed JWT
    signingAccountSpan.innerHTML = await ethersSigner.getAddress();
    signedJWTSpan.innerHTML = signedJWT;

}
