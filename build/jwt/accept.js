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
const ethr_did_1 = require("ethr-did");
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const signer_1 = require("../ethers/signer");
// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
        { name: "0x5", provider: signer_1.provider },
    ],
    registry: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // optional as ethr-did-resolver sets this up as default
};
const ethrDidResolver = (0, ethr_did_resolver_1.getResolver)(providerConfig);
const didResolver = new did_resolver_1.Resolver(ethrDidResolver);
const getJWTButton = document.querySelector('#getJWT');
const signedJWTSpan = document.querySelector('#signedJWT');
const addJWTButton = document.querySelector('#addJWT');
const txReceiptSpan = document.querySelector('#txReceipt');
let signedJWT;
let subjectDid;
getJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield getJWT();
}));
addJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield addJWTAttribute();
    yield resolveSubjectDidDoc();
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
function addJWTAttribute() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the Metamask configured chainId
        const chainNameOrId = (yield signer_1.provider.getNetwork()).chainId;
        let subjectAddress = yield signer_1.signer.getAddress();
        // Create the subject DID object for signing
        subjectDid = new ethr_did_1.EthrDID({ identifier: subjectAddress, provider: signer_1.provider, chainNameOrId, txSigner: signer_1.signer, alg: 'ES256K' });
        // Use the delegate to sign the message
        const setAttributeReceipt = yield subjectDid.setAttribute(`did/pub/Secp256k1/veriKey`, signedJWT, undefined, undefined, { gasLimit: 500000 });
        txReceiptSpan.innerHTML = setAttributeReceipt;
    });
}
;
function resolveSubjectDidDoc() {
    return __awaiter(this, void 0, void 0, function* () {
        const subjectDidDoc = yield didResolver.resolve(subjectDid.did);
        console.log(`Subject DID Doc:`);
        console.debug(subjectDidDoc);
        ;
    });
}
;
