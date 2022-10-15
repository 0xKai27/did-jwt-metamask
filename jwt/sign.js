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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var didJWT = require("did-jwt");
var signer_1 = require("../ethers/signer");
// Initialise the page objects to interact with
var prepareJWTForm = document.querySelector('#prepareJWT');
var subjectAddressHTML = document.querySelector('#subjectAddress');
var audienceAddressHTML = document.querySelector('#audienceAddress');
var signJWTButton = document.querySelector('.signJWT');
var issuerDIDSpan = document.querySelector('.issuerDID');
var subjectDIDSpan = document.querySelector('.subjectDID');
var audienceDIDSpan = document.querySelector('.audienceDID');
var timestampSpan = document.querySelector('.timestamp');
var signingAccountSpan = document.querySelector('.signingAccount');
var signedJWTSpan = document.querySelector('.signedJWT');
var signer = didJWT.ES256KSigner(didJWT.hexToBytes('278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'));
// const accounts: string = await ethersSigner.getAddress();
var unsignedJWT;
var signedJWT;
// Prepare the JWT to display to user before signing
prepareJWTForm.addEventListener('submit', function (e) { return __awaiter(void 0, void 0, void 0, function () {
    var subjectAddress, audienceAddress;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                e.preventDefault();
                subjectAddress = subjectAddressHTML.value;
                audienceAddress = audienceAddressHTML.value;
                return [4 /*yield*/, prepareJWT(subjectAddress, audienceAddress)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Sign the JWT and display to user
signJWTButton.addEventListener('click', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, signJWT(unsignedJWT)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Prepare the JWT data
function prepareJWT(subjectAddress, audienceAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var account, issuerDID, subjectDID, audienceDID, timestamp, timestampNumber, buildJWT;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check parameters for address else use default addreses per Hardhat default accounts 
                    subjectAddress = (subjectAddress === '') ? '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' : subjectAddress;
                    audienceAddress = (audienceAddress === '') ? '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' : audienceAddress;
                    return [4 /*yield*/, signer_1.signer.getAddress()];
                case 1:
                    account = _a.sent();
                    issuerDID = "did:ethr:".concat(account);
                    subjectDID = "did:ethr:".concat(subjectAddress);
                    audienceDID = "did:ethr:".concat(audienceAddress);
                    timestamp = new Date();
                    timestampNumber = timestamp.getTime();
                    buildJWT = {
                        payload: { iss: issuerDID, sub: subjectDID, aud: audienceDID, iat: timestampNumber },
                        options: { issuer: issuerDID, signer: signer },
                        header: { alg: 'ES256K' }
                    };
                    // Display the JWT parameters
                    issuerDIDSpan.innerHTML = issuerDID;
                    subjectDIDSpan.innerHTML = subjectDID;
                    audienceDIDSpan.innerHTML = audienceDID;
                    timestampSpan.innerHTML = "UTC - ".concat(timestamp.toString(), " | Number - ").concat(timestampNumber.toString());
                    // Save the unsignedJWT
                    unsignedJWT = buildJWT;
                    return [2 /*return*/];
            }
        });
    });
}
function signJWT(unsignedJWT) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, didJWT.createJWT(unsignedJWT.payload, unsignedJWT.options, unsignedJWT.header)];
                case 1:
                    signedJWT = _b.sent();
                    _a = signingAccountSpan;
                    return [4 /*yield*/, signer_1.signer.getAddress()];
                case 2:
                    _a.innerHTML = _b.sent();
                    signedJWTSpan.innerHTML = signedJWT;
                    return [2 /*return*/];
            }
        });
    });
}
