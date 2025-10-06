import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/mongo";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, keySaltB64 } = await req.json();
  if (!email || !password || !keySaltB64) return new NextResponse("Missing fields", { status: 400 });

  const col = await users();
  const exists = await col.findOne({ email });
  if (exists) return new NextResponse("Email already registered", { status: 409 });

  const passHash = await bcrypt.hash(password, 12);
  const doc = await col.insertOne({
    email,
    passHash,
    keySaltB64,
    createdAt: new Date()
  } as any);
  return NextResponse.json({ ok: true, id: doc.insertedId.toHexString() });
}
