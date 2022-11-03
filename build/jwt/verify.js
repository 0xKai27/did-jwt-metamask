"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const didJWT = __importStar(require("did-jwt"));
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const ethers_1 = require("ethers");
const signer_1 = require("../ethers/signer");
const sign_1 = require("./sign");
const validateJWTButton = document.querySelector('.validateJWT');
const decodedJWTSpan = document.querySelector('.decodedJWT');
const timestampSpan = document.querySelector('.timestamp');
//
// getResolver will return an object with a key/value pair of { "ethr": resolver } where resolver is a function used by the generic did resolver.
const providerConfig = {
    networks: [
        { name: "0x5", provider: signer_1.provider },
    ],
    registry: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // ethr-did-resolver sets this up as default
};
const ethrDidResolver = (0, ethr_did_resolver_1.getResolver)(providerConfig);
const didResolver = new did_resolver_1.Resolver(ethrDidResolver);
// Allow user to trigger the validation
validateJWTButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield validateJWT();
}));
function validateJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        let decoded = didJWT.decodeJWT(sign_1.signedJWT);
        console.log(`Decoded JWT:`);
        console.debug(decoded);
        let issuedAt = decoded.payload.iat;
        yield verifyIssuerDelegateSigner();
        // Resolve the document
        let doc = yield didResolver.resolve(sign_1.subjectDid.did);
        console.log(`DID Document:`);
        console.debug(doc);
        decodedJWTSpan.innerHTML = decoded.data.toString();
        timestampSpan.innerHTML = `Number - ${issuedAt.toString()} | UTC - ${(new Date(issuedAt * 1000)).toUTCString()}`;
    });
}
function verifyIssuerDelegateSigner() {
    return __awaiter(this, void 0, void 0, function* () {
        const registryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B';
        const registryAbi = '[{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"owners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"address"}],"name":"delegates","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"newOwner","type":"address"}],"name":"changeOwnerSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"validDelegate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"},{"name":"validity","type":"uint256"}],"name":"setAttribute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"identity","type":"address"}],"name":"identityOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"}],"name":"revokeDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegateSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"delegateType","type":"bytes32"},{"name":"delegate","type":"address"},{"name":"validity","type":"uint256"}],"name":"addDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"sigV","type":"uint8"},{"name":"sigR","type":"bytes32"},{"name":"sigS","type":"bytes32"},{"name":"name","type":"bytes32"},{"name":"value","type":"bytes"}],"name":"revokeAttributeSigned","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"identity","type":"address"},{"name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"changed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDOwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"delegateType","type":"bytes32"},{"indexed":false,"name":"delegate","type":"address"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDDelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"identity","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"value","type":"bytes"},{"indexed":false,"name":"validTo","type":"uint256"},{"indexed":false,"name":"previousChange","type":"uint256"}],"name":"DIDAttributeChanged","type":"event"}]';
        const registryContract = new ethers_1.ethers.Contract(registryAddress, registryAbi, signer_1.signer);
        console.log(`DIDDelegateChange:`);
        const issuerEvents = (yield registryContract.queryFilter('DIDDelegateChanged')).filter(e => e.args.identity === sign_1.issuerDid.address);
        console.debug(issuerEvents);
        const tempDelegate = issuerEvents.filter(e => e.args.delegate === sign_1.issuerDelegateSignerAddress);
        console.log(`Delegate Event:`);
        console.debug(tempDelegate);
    });
}
