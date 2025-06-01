import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { socket_id, channel_name } = await req.json();

  // ⚠️  Add your own auth
  const auth = pusher.authenticate(socket_id, channel_name);
  return NextResponse.json(auth);
}
