import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { parseArgsSolana } from "../modules/solana.js";

const network = parseArgsSolana().network;

if (!network) {
  console.error(
    "Network not found Please add it as --network=<devnet|testnet|mainnet>"
  );
  process.exit(1);
}

const payer = Keypair.generate();

const secretKeyHex = Buffer.from(payer.secretKey).toString("hex");

console.log(`Address: ${payer.publicKey.toBase58()}`);
console.log(`Private key(pleasee add it to .env): ${secretKeyHex}`);

const connection = new Connection(clusterApiUrl(network), "confirmed");

const airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  LAMPORTS_PER_SOL
);

const resp = await connection.confirmTransaction(airdropSignature);

console.log("Done. You account is ready to use");
