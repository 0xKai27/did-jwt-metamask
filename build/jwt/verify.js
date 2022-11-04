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
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const ethr_did_1 = require("ethr-did");
const signer_1 = require("../ethers/signer");
const validateJWTButton = document.querySelector('#validateJWT');
const configureAudienceForm = document.querySelector('#configureAudience');
const audienceAddressHTML = document.querySelector('#audienceAddressForm');
const audienceAddressSpan = document.querySelector('#audienceAddress');
const verifiedBoolSpan = document.querySelector('#verifiedBool');
let audienceAddress;
// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
        { name: "0x5", provider: signer_1.provider },
    ],
    registry: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // optional as ethr-did-resolver sets this up as default
};
const ethrDidResolver = (0, ethr_did_resolver_1.getResolver)(providerConfig);
const didResolver = new did_resolver_1.Resolver(ethrDidResolver);
// Configure the audience address used to validate the JWT
configureAudienceForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    if (audienceAddressHTML.value === '') {
        audienceAddress = yield signer_1.signer.getAddress();
    }
    else {
        audienceAddress = audienceAddressHTML.value;
    }
    audienceAddressSpan.innerHTML = audienceAddress;
}));
// Allow user to trigger the validation
validateJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Clicked');
    yield validateJWT();
}));
function validateJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        yield verifyIssuerDelegateSigner();
        // await resolveDidDoc();
    });
}
function verifyIssuerDelegateSigner() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the Metamask configured chainId
        const chainNameOrId = (yield signer_1.provider.getNetwork()).chainId;
        // Process the accounts
        const audienceDid = new ethr_did_1.EthrDID({ identifier: audienceAddress, provider: signer_1.provider, chainNameOrId });
        // Get the JWT from user storage (session in this case)
        let signedJWT = yield fetch('/api/getJWT').then((res) => __awaiter(this, void 0, void 0, function* () {
            const message = yield res.text();
            return JSON.parse(message).message;
        }));
        console.log(`signed JWT:`);
        console.debug(signedJWT);
        const JWTVerified = yield audienceDid.verifyJWT(signedJWT, didResolver);
        console.log(`Verify JWT:`);
        console.debug(JWTVerified);
        verifiedBoolSpan.innerHTML = JSON.stringify(JWTVerified.verified);
    });
}
// async function resolveDidDoc() {
//     // get the subjectDID
//     // Resolve the document
//     let doc = await didResolver.resolve(subjectDid.did);
//     console.log(`DID Document:`)
//     console.debug(doc);
//     // decodedJWTSpan.innerHTML = decoded.data.toString();
//     // timestampSpan.innerHTML = `Number - ${issuedAt.toString()} | UTC - ${(new Date(issuedAt*1000)).toUTCString()}`;
// }
