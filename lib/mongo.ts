import { MongoClient, Db, Collection, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error("MONGODB_URI is missing");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function db(): Promise<Db> {
  const c = await clientPromise;
  return c.db(process.env.MONGODB_DB || "vault_mvp");
}

export type UserDoc = {
  _id: ObjectId;
  email: string;
  passHash: string;
  keySaltB64: string; // base64 salt used for client-side key derivation
  createdAt: Date;
};

export type VaultItemDoc = {
  _id: ObjectId;
  userId: ObjectId;
  // all user fields live inside ciphertext
  ciphertextB64: string;
  ivB64: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function users(): Promise<Collection<UserDoc>> {
  return (await db()).collection<UserDoc>("users");
}

export async function vaultItems(): Promise<Collection<VaultItemDoc>> {
  return (await db()).collection<VaultItemDoc>("vault_items");
}
