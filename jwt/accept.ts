import { EthrDID } from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

import { 
    provider as ethersProvider,
    signer as ethersSigner
} from '../ethers/signer';

// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
        { name: "0x5", provider: ethersProvider },
    ],
    registry: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // optional as ethr-did-resolver sets this up as default
}
const ethrDidResolver = getResolver(providerConfig);
const didResolver: Resolver = new Resolver(ethrDidResolver);

const getJWTButton = document.querySelector('#getJWT') as HTMLButtonElement;
const signedJWTSpan = document.querySelector('#signedJWT') as HTMLSpanElement;
const addJWTButton = document.querySelector('#addJWT') as HTMLButtonElement;
const txReceiptSpan = document.querySelector('#txReceipt') as HTMLSpanElement;

let signedJWT: string;
let subjectDid: EthrDID;

getJWTButton.addEventListener('click', async () => {
    await getJWT();
});

addJWTButton.addEventListener('click', async () => {
    await addJWTAttribute();
    await resolveSubjectDidDoc();
});

async function getJWT() {
    // Get the JWT from user storage (session in this case)
    signedJWT = await fetch('/api/getJWT').then(async (res) => {
        const message = await res.text();
        return JSON.parse(message).message;
    });

    signedJWTSpan.innerHTML = signedJWT;
};

async function addJWTAttribute() {
    // Get the Metamask configured chainId
    const chainNameOrId: number = (await ethersProvider.getNetwork()).chainId;

    let subjectAddress: string = await ethersSigner.getAddress();

    // Create the subject DID object for signing
    subjectDid = new EthrDID({identifier: subjectAddress, provider: ethersProvider, chainNameOrId, txSigner: ethersSigner, alg: 'ES256K'});

    // Use the delegate to sign the message
    const setAttributeReceipt = await subjectDid.setAttribute(`did/pub/Secp256k1/veriKey`, signedJWT);

    txReceiptSpan.innerHTML = setAttributeReceipt;
};

async function resolveSubjectDidDoc() {
    const subjectDidDoc = await didResolver.resolve(subjectDid.did);

    console.log(`Subject DID Doc:`);
    console.debug(subjectDidDoc);;
};

