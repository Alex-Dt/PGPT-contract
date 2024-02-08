# PGPT-contract

## Prepare

You should have node js installed
https://nodejs.org/en/download/current

After install node js run:
`npm i`

Copy .env.sample to .env

Add to .env there are private key of owner and API token from [bscscan](https://bscscan.com/)
Add solna private key too

## For EVM

run

```
npx hardhat run --network bnb scripts/deploy.js
```

## For solana

```
npm run solana -- --network mainnet-beta 
```
