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
const ethers_1 = require("ethers");
// UI Section: "Get the signed JWT"
const getJWTButton = document.querySelector('#getJWT');
const signedJWTSpan = document.querySelector('#signedJWT');
// UI Section: 
const configureAudienceForm = document.querySelector('#configureAudience');
const audienceAddressHTML = document.querySelector('#audienceAddressForm');
const audienceAddressSpan = document.querySelector('#audienceAddress');
// UI Section: "Validate Subject DID Doc contains the JWT"
const validateSubjectDidDocForm = document.querySelector('#validateSubjectDidDoc');
const subjectAddressFormHTML = document.querySelector('#subjectAddressForm');
const publicKeyHexSpan = document.querySelector('#publicKeyHex');
const hexStringSpan = document.querySelector('#hexString');
const hexPrivateClaimSpan = document.querySelector('#hexPrivateClaim');
const subjectValidatedSpan = document.querySelector('#subjectValidated');
// UI Section: Validate JWT Payload
const validateJWTButton = document.querySelector('#validateJWT');
const privateClaimSpan = document.querySelector('#privateClaim');
const verifiedBoolSpan = document.querySelector('#verifiedBool');
const registryAddress = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b';
let audienceAddress;
let signedJWT;
// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
        { name: "0x5", provider: signer_1.provider },
    ],
    registry: registryAddress // optional as ethr-did-resolver sets this up as default
};
const ethrDidResolver = (0, ethr_did_resolver_1.getResolver)(providerConfig);
const didResolver = new did_resolver_1.Resolver(ethrDidResolver);
const DidReg = new ethers_1.ethers.Contract(registryAddress, ethr_did_resolver_1.EthereumDIDRegistry.abi, signer_1.provider);
getJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield getJWT();
}));
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
validateSubjectDidDocForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    let subjectAddress = (subjectAddressFormHTML.value === '') ? '0xDBB3d90156fC23c28C709eB68af8403836951AF8' : subjectAddressFormHTML.value;
    yield verifySubjectAttribute(subjectAddress);
}));
// Allow user to trigger the validation
validateJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield verifyIssuerDelegateSigner();
}));
function getJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the JWT from user storage (session in this case)
        signedJWT = yield fetch('/api/getJWT').then((res) => __awaiter(this, void 0, void 0, function* () {
            const message = yield res.text();
            return JSON.parse(message).message;
        }));
        signedJWTSpan.innerHTML = signedJWT;
    });
}
;
function verifySubjectAttribute(subjectAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the Metamask configured chainId
        let chainNameOrId = (yield signer_1.provider.getNetwork()).chainId;
        const subjectDid = new ethr_did_1.EthrDID({ identifier: subjectAddress, provider: signer_1.provider, chainNameOrId });
        const subjectDidDoc = yield didResolver.resolve(subjectDid.did);
        console.debug(subjectDidDoc);
        for (const method of subjectDidDoc.didDocument.verificationMethod) {
            if (!method.publicKeyHex) {
                continue;
            }
            let publiKeyUtf8 = ethers_1.ethers.utils.toUtf8String(`0x${method.publicKeyHex}`);
            if (publiKeyUtf8 === signedJWT) {
                const payload = publiKeyUtf8.split('.')[1];
                const payloadJSON = JSON.parse(ethers_1.ethers.utils.toUtf8String(ethers_1.ethers.utils.base64.decode(payload)));
                hexPrivateClaimSpan.innerHTML = JSON.stringify(payloadJSON.privateClaim);
                publicKeyHexSpan.innerHTML = JSON.stringify(method.publicKeyHex);
                hexStringSpan.innerHTML = publiKeyUtf8;
                subjectValidatedSpan.innerHTML = "Found Matching Public Key";
            }
        }
    });
}
;
function verifyIssuerDelegateSigner() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the Metamask configured chainId
        const chainNameOrId = (yield signer_1.provider.getNetwork()).chainId;
        // Process the accounts
        const audienceDid = new ethr_did_1.EthrDID({ identifier: audienceAddress, provider: signer_1.provider, chainNameOrId });
        const JWTVerified = yield audienceDid.verifyJWT(signedJWT, didResolver);
        console.log(`Verify JWT:`);
        console.debug(JWTVerified);
        verifiedBoolSpan.innerHTML = JSON.stringify(JWTVerified.verified);
        privateClaimSpan.innerHTML = JSON.stringify(JWTVerified.payload.privateClaim);
    });
}
