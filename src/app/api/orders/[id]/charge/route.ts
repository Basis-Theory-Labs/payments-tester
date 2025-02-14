import { db as _db } from "@/server/db";
import * as settings from "@/server/settings";
import * as adyen from "@/vendors/adyen";
import * as stripe from "@/vendors/stripe";
import * as checkout from "@/vendors/checkout";

interface Charge {
  tokenIntentId?: string;
  token_id?: string;
  status: "authorized" | "failed";
  vendor?: {
    name: "braintree" | "checkout" | "adyen" | "stripe";
    id: string;
  };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;

  const db = await _db();

  const order = await db.collections.orders.findOne(id).exec();

  const setting = await db.collections.settings
    .findOne(settings.card_transaction_vendor)
    .exec();

  const tokenSource = order.token
    ? `token: ${order.token.id}`
    : `token_intent: ${order.tokenIntent.id}`;

  let response: Partial<Charge>;

  if (setting?.value === "checkout") {
    const { status, id } = await chargeCardWithCheckout({
      amount: order.total,
      tokenSource,
    });
    response = {
      status,
      vendor: {
        name: "checkout",
        id,
      },
    };
  } else if (setting?.value === "adyen") {
    const { status, id } = await chargeCardWithAdyen({
      amount: order.total,
      tokenSource,
    });
    response = {
      status,
      vendor: {
        name: "adyen",
        id,
      },
    };
  } else if (setting?.value === "stripe") {
    const { status, id } = await chargeCardWithStripe({
      amount: order.total,
      tokenSource,
    });
    response = {
      status,
      vendor: {
        name: "stripe",
        id,
      },
    };
  } else if (setting?.value === "braintree") {
    // charging with braintree not implemented
    // must use their token directly
    return new Response(undefined, {
      status: 501,
    });
  } else {
    response = {};
  }

  await order.update({
    $set: {
      charged: true,
    },
  });

  return Response.json(response);
}

const chargeCardWithCheckout = async ({
  tokenSource,
  amount,
}: {
  tokenSource: string;
  amount: number;
}) => {
  const charge = await checkout.chargeCreditCard({
    tokenSource,
    amount: amount * 100,
  });

  return {
    status: charge.status === "Authorized" ? "authorized" : "failed",
    id: charge.id,
  } as const;
};

const chargeCardWithAdyen = async ({
  tokenSource,
  amount,
}: {
  tokenSource: string;
  amount: number;
}) => {
  const charge = await adyen.chargeCreditCard({
    tokenSource,
    amount: amount * 100,
  });

  return {
    status: charge.resultCode === "Authorised" ? "authorized" : "failed",
    id: charge.pspReference,
  } as const;
};

const chargeCardWithStripe = async ({
  tokenSource,
  amount,
}: {
  tokenSource: string;
  amount: number;
}) => {
  const charge = await stripe.chargeCreditCard({
    tokenSource,
    amount: amount * 100,
  });

  console.log(charge);

  return {
    status: charge.status === "succeeded" ? "authorized" : "failed",
    id: charge.pspReference,
  } as const;
};
