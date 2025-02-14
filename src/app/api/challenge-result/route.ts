import axios from "axios";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get("sessionId");

  const { data } = await axios.get(
    `https://api.basistheory.com/3ds/sessions/${sessionId}/challenge-result`,
    {
      headers: {
        "Content-Type": "application/json",
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY!,
      },
    },
  );

  return Response.json(data);
}
