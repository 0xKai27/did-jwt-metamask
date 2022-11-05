# Implementing JWT multiparty issuance/verification with the Ether DID Registry

This project is a sample implementation of issuing and verifying a claim on a subject. It comprises of 3 logically separate stages:
* Issuance of JWT with a private claim by the Issuer
* Adding of JWT to Subject DID Document by the Subject
* Validation of Subject DID Document and JWT payload by the Audience

Views are separated according to the above whereby each page requires you to switch to the relevant role on Metamask.
* "/": Issuer application for preparing and signing the JWT as an Issuer
* "/subject": Subject aplication that enables the subject to save the Issuer signed JWT to their DID Document
* "/audience": Audience application where a validator can choose validate against Subject DID Doc directly or use the convenience library

To run the application, user will have to run:
```
npm install
npm start
```

This repository utilises nodemon upon `npm start` to automatically refresh the application when any changes have been made.