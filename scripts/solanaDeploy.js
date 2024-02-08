import { setTimeout } from "node:timers/promises";
import "dotenv/config";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

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

const keyPair = Keypair.fromSecretKey(hexPrivateKey);

console.log(
  `You going to use this account to deploy your contract: ${keyPair.publicKey.toBase58()}`
);

const decimals = 9; // We are using 9 to match the CLI decimal default exactly

const mint = await createMint(
  connection,
  keyPair,
  keyPair.publicKey,
  keyPair.publicKey,
  decimals
);

console.log(`New token deployed ${mint.toBase58()}`);

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  keyPair,
  mint,
  keyPair.publicKey
);

console.log(`Associated token account: ${tokenAccount.address.toBase58()}`);

const mintRes = await mintTo(
  connection,
  keyPair,
  mint,
  tokenAccount.address,
  keyPair,
  100_000_000n * 10n ** BigInt(decimals)
);

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
    name: "PGPT",
    symbol: "PGPT",
    uri: "https://d104dsv7eh0zru.cloudfront.net/solana/pgpt_1.json",
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

const transaction = await instruction.buildAndSign(umi);

const transactionSignature = await umi.rpc.sendTransaction(transaction);

console.log("Token metadata is ready");
// console.log(`Transaction signature, ${transactionSignature}`);
