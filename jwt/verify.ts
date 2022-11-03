import * as didJWT from 'did-jwt';
import { Resolver } from 'did-resolver';
import { getResolver, EthereumDIDRegistry } from 'ethr-did-resolver';
import { EthrDID } from 'ethr-did';
import { ethers } from 'ethers';

import { 
    provider as ethersProvider, 
    signer as ethersSigner 
} from '../ethers/signer';
import { 
    signedJWT,
    subjectDid,
    issuerDid,
    issuerDelegateSignerAddress
} from './sign';

const validateJWTButton = document.querySelector('.validateJWT') as HTMLButtonElement;
const decodedJWTSpan = document.querySelector('.decodedJWT') as HTMLSpanElement;
const timestampSpan = document.querySelector('.timestamp') as HTMLSpanElement;

//
// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
      { name: "0x5", provider: ethersProvider },
    ],
    registry: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // ethr-did-resolver sets this up as default
  }
const ethrDidResolver = getResolver(providerConfig);
const didResolver: Resolver = new Resolver(ethrDidResolver);

// Allow user to trigger the validation
validateJWTButton.addEventListener('click', async () => {
    await validateJWT();
});

async function validateJWT() {
    let decoded = didJWT.decodeJWT(signedJWT);

    console.log(`Decoded JWT:`);
    console.debug(decoded);

    let issuedAt =  decoded.payload.iat!;

    await verifyIssuerDelegateSigner();

    // Resolve the document
    let doc = await didResolver.resolve(subjectDid.did);
    console.log(`DID Document:`)
    console.debug(doc);

    decodedJWTSpan.innerHTML = decoded.data.toString();
    timestampSpan.innerHTML = `Number - ${issuedAt.toString()} | UTC - ${(new Date(issuedAt*1000)).toUTCString()}`;
}

async function verifyIssuerDelegateSigner() {
    const registryAddress: string = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B';
    const registryAbi: string = '[{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"owners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"address"}],"name":"delegates","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"newOwner","type":"address"}],"name":"changeOwnerSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"validDelegate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"}],"name":"identityOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"changed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDOwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"delegateType","type":"bytes32"},{"indexed":false,"name":"delegate","type":"address"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDDelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"value","type":"bytes"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDAttributeChanged","type":"event"}]';
    const registryContract = new ethers.Contract(registryAddress, registryAbi, ethersSigner);

    console.log(`DIDDelegateChange:`);
    const issuerEvents = (await registryContract.queryFilter('DIDDelegateChanged')).filter(e => e.args!.identity === issuerDid.address);
    console.debug(issuerEvents);

    const tempDelegate = issuerEvents.filter(e => e.args!.delegate === issuerDelegateSignerAddress);
    console.log(`Delegate Event:`);
    console.debug(tempDelegate);
}