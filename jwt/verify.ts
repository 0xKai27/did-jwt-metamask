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

// Allow user to trigger the validation
validateJWTButton.addEventListener('click', async () => {
    await verifyIssuerDelegateSigner();
});

async function getJWT() {
    // Get the JWT from user storage (session in this case)
    signedJWT = await fetch('/api/getJWT').then(async (res) => {
        const message = await res.text();
        return JSON.parse(message).message;
    });

    signedJWTSpan.innerHTML = signedJWT;
};

async function verifyIssuerDelegateSigner() {

    // Get the Metamask configured chainId
    const chainNameOrId = (await ethersProvider.getNetwork()).chainId;

    // Wrap the audience address to enable calling of verify method
    const audienceDid = new EthrDID({identifier: audienceAddress, provider: ethersProvider, chainNameOrId});

    // Utilise ethr-did to verify
    const JWTVerified = await audienceDid.verifyJWT(signedJWT, didResolver);

    console.log(`Verify JWT:`)
    console.debug(JWTVerified);

    verifiedBoolSpan.innerHTML = JSON.stringify(JWTVerified.verified);
    privateClaimSpan.innerHTML = JSON.stringify(JWTVerified.payload!.privateClaim!);

}