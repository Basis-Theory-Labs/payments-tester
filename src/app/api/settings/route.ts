import { db } from "@/server/db";

export async function GET() {
  const records = await (await db()).collections.settings.find().exec();

  const settings = records.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.key]: cur.value,
    }),
    {},
  );

  return Response.json(settings);
}
