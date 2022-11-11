# Issuing and verifying Ethereum DIDs with Metamask

This project is a sample implementation of issuing and verifying an Ethereum claim on a subject. It comprises of 2 stages:
* Issuance of JWT with a private claim by the Issuer
* Validation of Subject/Issuer DID Document and JWT payload by the Audience

Views are separated according to the above whereby each page requires you to switch to the relevant role on Metamask.
* "/": Issuer application for preparing and signing the JWT as an Issuer
* "/audience": Audience application where a validator can choose validate against Subject DID Doc directly or use the convenience library

To run the application, user will have to run:
```
npm install
npm start
```

This repository utilises nodemon upon `npm start` to automatically refresh the application when any changes have been made.