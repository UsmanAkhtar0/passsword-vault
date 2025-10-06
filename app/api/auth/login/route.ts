import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/mongo";
import bcrypt from "bcryptjs";
import { signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return new NextResponse("Missing fields", { status: 400 });
  const col = await users();
  const user = await col.findOne({ email });
  if (!user) return new NextResponse("Invalid email or password", { status: 401 });
  const ok = await bcrypt.compare(password, user.passHash);
  if (!ok) return new NextResponse("Invalid email or password", { status: 401 });
  const token = signSession(user._id);
  return NextResponse.json({ token, keySaltB64: user.keySaltB64 });
}
