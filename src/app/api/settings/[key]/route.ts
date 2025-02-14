import { db } from "@/server/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const body = await request.json();
  const key = (await params).key;

  const { value } = body;

  await (
    await db()
  ).collections.settings.upsert({
    key,
    value,
  });

  return new Response(null, {
    status: 204,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const key = (await params).key;

  const setting = await (await db()).collections.settings.findOne(key).exec();

  return Response.json(setting);
}
