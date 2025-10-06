import { NextRequest, NextResponse } from "next/server";
import { vaultItems } from "@/lib/mongo";
import { verifySession } from "@/lib/auth";
import { ObjectId } from "mongodb";

function uidFromAuth(req: NextRequest): ObjectId | null {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const s = verifySession(token);
  if (!s?.uid) return null;
  try { return new ObjectId(s.uid); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const uid = uidFromAuth(req);
  if (!uid) return new NextResponse("Unauthorized", { status: 401 });
  const col = await vaultItems();
  const list = await col.find({ userId: uid }).sort({ updatedAt: -1 }).toArray();
  return NextResponse.json(list.map(d => ({
    _id: d._id.toHexString(),
    ivB64: d.ivB64,
    ciphertextB64: d.ciphertextB64,
    version: d.version,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  })));
}

export async function POST(req: NextRequest) {
  const uid = uidFromAuth(req);
  if (!uid) return new NextResponse("Unauthorized", { status: 401 });
  const { ivB64, ciphertextB64, version } = await req.json();
  if (!ivB64 || !ciphertextB64) return new NextResponse("Missing fields", { status: 400 });
  const col = await vaultItems();
  const now = new Date();
  const ins = await col.insertOne({ userId: uid, ivB64, ciphertextB64, version: version ?? 1, createdAt: now, updatedAt: now } as any);
  return NextResponse.json({ _id: ins.insertedId.toHexString() });
}
