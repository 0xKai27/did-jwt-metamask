import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { EthrDID } from 'ethr-did';

import { 
    provider as ethersProvider,
    signer as ethersSigner
} from '../ethers/signer';

const validateJWTButton = document.querySelector('#validateJWT') as HTMLButtonElement;
const configureAudienceForm = document.querySelector('#configureAudience') as HTMLFormElement;
const audienceAddressHTML = document.querySelector('#audienceAddressForm') as HTMLFormElement;
const audienceAddressSpan = document.querySelector('#audienceAddress') as HTMLSpanElement;
const verifiedBoolSpan = document.querySelector('#verifiedBool') as HTMLSpanElement;

let audienceAddress: string;

// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
      { name: "0x5", provider: ethersProvider },
    ],
    registry: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // optional as ethr-did-resolver sets this up as default
  }
const ethrDidResolver = getResolver(providerConfig);
const didResolver: Resolver = new Resolver(ethrDidResolver);

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
    console.log('Clicked');
    await validateJWT();
});

async function validateJWT() {
    await verifyIssuerDelegateSigner();
    // await resolveDidDoc();
}

async function verifyIssuerDelegateSigner() {

    // Get the Metamask configured chainId
    const chainNameOrId = (await ethersProvider.getNetwork()).chainId;

    // Process the accounts
    const audienceDid = new EthrDID({identifier: audienceAddress, provider: ethersProvider, chainNameOrId});

    // Get the JWT from user storage (session in this case)
    let signedJWT = await fetch('/api/getJWT').then(async (res) => {
        const message = await res.text();
        return JSON.parse(message).message;
    })

    console.log(`signed JWT:`)
    console.debug(signedJWT);

    const JWTVerified = await audienceDid.verifyJWT(signedJWT, didResolver);

    console.log(`Verify JWT:`)
    console.debug(JWTVerified);

    verifiedBoolSpan.innerHTML = JSON.stringify(JWTVerified.verified);

}