import { setTimeout } from "node:timers/promises";
import "dotenv/config";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import bs58 from "bs58";

import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { createSignerFromKeypair } from "@metaplex-foundation/umi";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { parseArgsSolana } from "../modules/solana.js";

if (!process.env.SOLANA_PRIVATE_KEY) {
  console.error(
    "Private key not found in.env file. Please add it as SOLANA_PRIVATE_KEY"
  );
  process.exit(1);
}
const { network } = parseArgsSolana();

if (!network) {
  console.error(
    "Network not found Please add it as --network=<devnet|testnet|mainnet>"
  );
  process.exit(1);
}

const connection = new Connection(clusterApiUrl(network), "confirmed");

const hexPrivateKey = Uint8Array.from(
  Buffer.from(process.env.SOLANA_PRIVATE_KEY, "hex")
);

let keyPair;

try {
  keyPair = Keypair.fromSecretKey(hexPrivateKey);
} catch (e) {
  console.error("looks like your private key is not HEX. Trying as base58");
  keyPair = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY));
}

console.log(
  `You going to use this account to deploy your contract: ${keyPair.publicKey.toBase58()}`
);

const decimals = 9; // We are using 9 to match the CLI decimal default exactly

let mint;

while (!mint) {
  try {
    mint = await createMint(
      connection,
      keyPair,
      keyPair.publicKey,
      keyPair.publicKey,
      decimals
    );
  } catch (e) {
    console.error("failed to create mint", e);
    console.log("By we are going to retry mint ");
  }
}

console.log(`New token deployed ${mint.toBase58()}`);

let tokenAccount;

while (!tokenAccount) {
  try {
    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keyPair,
      mint,
      keyPair.publicKey
    );
  } catch (e) {
    console.error("failed to get/CREATE associated token account", e);
    console.log("By we are going to retry it ");
  }
}

console.log(`Associated token account: ${tokenAccount.address.toBase58()}`);

let mintRes;

while (!mintRes) {
  try {
    mintRes = await mintTo(
      connection,
      keyPair,
      mint,
      tokenAccount.address,
      keyPair,
      33_333_333n * 10n ** BigInt(decimals)
    );
  } catch (e) {
    console.error("failed to mint tokens", e);
    console.log("By we are going to retry mint to ");
  }
}

console.log(`Minted tokens to ${tokenAccount.address.toBase58()}`);

// Start token metadata

await setTimeout(10000); // wait a lillte bit

const umi = createUmi(clusterApiUrl(network));

const keypairUMI = fromWeb3JsKeypair(keyPair);
const signer = createSignerFromKeypair(umi, keypairUMI);
umi.identity = signer;
umi.payer = signer;

const createMetadataAccountV3Args = {
  mint: fromWeb3JsPublicKey(mint),
  mintAuthority: signer,
  payer: signer,
  updateAuthority: fromWeb3JsPublicKey(keyPair.publicKey),
  data: {
    name: "PrivateAI.com",
    symbol: "PGPT",
    uri: "https://token.privateai.com/pgpt/pgpt_meta.json",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  },
  isMutable: false,
  collectionDetails: null,
};

console.log(createMetadataAccountV3Args);

const instruction = createMetadataAccountV3(umi, createMetadataAccountV3Args);


let transactionSignature ;

while (!transactionSignature) {
  try {
    const transaction = await instruction.buildAndSign(umi);

    transactionSignature = await umi.rpc.sendTransaction(transaction);
  } catch (e) {
    console.error("failed to send transaction", e);
    console.log("By we are going to retry it ");
  }
}

console.log("Token metadata is ready");
// console.log(`Transaction signature, ${transactionSignature}`);
