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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = uidFromAuth(req);
  if (!uid) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = params;
  const { ivB64, ciphertextB64, version } = await req.json();
  const col = await vaultItems();
  const res = await col.updateOne({ _id: new ObjectId(id), userId: uid }, { $set: { ivB64, ciphertextB64, version: version ?? 1, updatedAt: new Date() } });
  if (!res.matchedCount) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = uidFromAuth(req);
  if (!uid) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = params;
  const col = await vaultItems();
  const res = await col.deleteOne({ _id: new ObjectId(id), userId: uid });
  if (!res.deletedCount) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ ok: true });
}
