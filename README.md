# Ethereum Name Service Registrar DApp

This app allows you to register a .dapp domain name, for use in expanse decentralized applications and compatible blockchain browsers.

Check [expanse.domains](https://expanse.domains/) for more information about the ENS.

Try the app: [registrar.expanse.domains](https://registrar.expanse.domains/)

### How to run it

    cd app
    meteor npm install
    meteor


### Deploying to github pages

A static copy of the app is kept at [registrar.expanse.domains](https://registrar.expanse.domains/). The page reflects whatever is kept at the `docs` folder in the `master` branch. So to update the static site, create a working branch and execute these:

```
cd app
meteor-build-client ../docs --path ""
cd ..
git add .
```

Then commit all and make a Pull Request to master.
