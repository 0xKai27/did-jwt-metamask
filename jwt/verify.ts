import { Resolver } from 'did-resolver';
import { getResolver, EthereumDIDRegistry } from 'ethr-did-resolver';
import { EthrDID } from 'ethr-did';

import { 
    provider as ethersProvider,
    signer as ethersSigner
} from '../ethers/signer';
import { ethers } from 'ethers';

// UI Section: "Get the signed JWT"
const getJWTButton = document.querySelector('#getJWT') as HTMLButtonElement;
const signedJWTSpan = document.querySelector('#signedJWT') as HTMLSpanElement;
// UI Section: 
const configureAudienceForm = document.querySelector('#configureAudience') as HTMLFormElement;
const audienceAddressHTML = document.querySelector('#audienceAddressForm') as HTMLFormElement;
const audienceAddressSpan = document.querySelector('#audienceAddress') as HTMLSpanElement;
// UI Section: "Validate Subject DID Doc contains the JWT"
const validateSubjectDidDocButton = document.querySelector('#validateSubjectDidDoc') as HTMLButtonElement;
const publicKeyHexSpan = document.querySelector('#publicKeyHex') as HTMLSpanElement;
const hexStringSpan = document.querySelector('#hexString') as HTMLSpanElement;
const subjectValidatedSpan = document.querySelector('#subjectValidated') as HTMLSpanElement;
// UI Section: Validate JWT Payload
const validateJWTButton = document.querySelector('#validateJWT') as HTMLButtonElement;
const privateClaimSpan = document.querySelector('#privateClaim') as HTMLSpanElement;
const verifiedBoolSpan = document.querySelector('#verifiedBool') as HTMLSpanElement;

const registryAddress: string = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b';
let audienceAddress: string;
let signedJWT: string;

// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
      { name: "0x5", provider: ethersProvider },
    ],
    registry: registryAddress // optional as ethr-did-resolver sets this up as default
  }
const ethrDidResolver = getResolver(providerConfig);
const didResolver: Resolver = new Resolver(ethrDidResolver);
const DidReg = new ethers.Contract(registryAddress, EthereumDIDRegistry.abi, ethersProvider);

getJWTButton.addEventListener('click', async () => {
    await getJWT();
});

// Configure the audience address used to validate the JWT
configureAudienceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (audienceAddressHTML.value === '') {
        audienceAddress = await ethersSigner.getAddress();
    } else {
        audienceAddress = audienceAddressHTML.value;
    }

    audienceAddressSpan.innerHTML = audienceAddress;
    
})

validateSubjectDidDocButton.addEventListener('click', async () => {
    await verifySubjectAttribute();
})

// Allow user to trigger the validation
validateJWTButton.addEventListener('click', async () => {
    await validateJWT();
});

async function getJWT() {
    // Get the JWT from user storage (session in this case)
    signedJWT = await fetch('/api/getJWT').then(async (res) => {
        const message = await res.text();
        return JSON.parse(message).message;
    });

    signedJWTSpan.innerHTML = signedJWT;
};

async function validateJWT() {
    await verifySubjectAttribute();
    await verifyIssuerDelegateSigner();
};

async function verifySubjectAttribute() {

    let subjectAddress = 'did:ethr:0x5:0xDBB3d90156fC23c28C709eB68af8403836951AF8';

    const subjectDidDoc = await didResolver.resolve(subjectAddress);

    console.debug(subjectDidDoc);

    for (const method of subjectDidDoc.didDocument!.verificationMethod!) {
        if (!method.publicKeyHex) {
            continue;
        }

        let publiKeyUtf8: string = ethers.utils.toUtf8String(`0x${method.publicKeyHex}`)

        if ( publiKeyUtf8 === signedJWT) {
            publicKeyHexSpan.innerHTML = JSON.stringify(method.publicKeyHex);
            hexStringSpan.innerHTML = publiKeyUtf8;
            subjectValidatedSpan.innerHTML = "Found Matching Public Key"
        }

    }

};

async function verifyIssuerDelegateSigner() {

    // Get the Metamask configured chainId
    const chainNameOrId = (await ethersProvider.getNetwork()).chainId;

    // Process the accounts
    const audienceDid = new EthrDID({identifier: audienceAddress, provider: ethersProvider, chainNameOrId});

    const JWTVerified = await audienceDid.verifyJWT(signedJWT, didResolver);

    console.log(`Verify JWT:`)
    console.debug(JWTVerified);

    verifiedBoolSpan.innerHTML = JSON.stringify(JWTVerified.verified);
    privateClaimSpan.innerHTML = JSON.stringify(JWTVerified.payload!.privateClaim!);

}