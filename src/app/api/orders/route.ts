import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import * as uuid from "uuid";

export async function POST(request: Request) {
  const body = await request.json();

  const order = await (
    await db()
  ).collections.orders.insert({
    id: uuid.v7(),
    ...body,
  });
  revalidatePath("/orders");

  return Response.json(order, { status: 201 });
}

export async function GET() {
  const orders = await (await db()).collections.orders.find().exec();

  return Response.json(orders);
}
