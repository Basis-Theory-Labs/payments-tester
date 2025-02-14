import * as braintree from "@/vendors/braintree";
import * as adyen from "@/vendors/adyen";
import * as checkout from "@/vendors/checkout";
import * as stripe from "@/vendors/stripe";
import { BasisTheoryClient } from "@basis-theory/node-sdk";

const bt = new BasisTheoryClient({
  apiKey: process.env.BASIS_THEORY_PRIVATE_KEY,
});

import { db } from "@/server/db";
import * as settings from "@/server/settings";
import { TokenIntent } from "@basis-theory/basis-theory-js/types/models";
import { Token } from "@basis-theory/node-sdk/api";

export interface Verification {
  token?: Token;
  tokenIntent?: TokenIntent;
  status: "skipped" | "verified" | "failed";
  vendor?: {
    name: "braintree" | "checkout" | "adyen" | "stripe";
    token: string;
  };
}

export async function POST(request: Request) {
  const body = await request.json();

  const { tokenIntent, saveCard } = body;

  const setting = await (await db()).collections.settings
    .findOne(settings.card_verification_vendor)
    .exec();

  let response: Partial<Verification> = {
    status: "skipped",
  };

  if (setting?.value === "adyen") {
    const { status, vendorToken } = await verifyCardWithAdyen({
      tokenIntentId: tokenIntent.id,
    });

    response = {
      ...response,
      status,
      vendor: {
        name: "adyen",
        token: vendorToken,
      },
    };
  } else if (setting?.value === "braintree") {
    const { status, vendorToken } = await verifyCardWithBraintree({
      tokenIntentId: tokenIntent.id,
    });

    response = {
      ...response,
      status,
      vendor: {
        name: "braintree",
        token: vendorToken,
      },
    };
  } else if (setting?.value === "checkout") {
    const { status, vendorToken } = await verifyCardWithCheckout({
      tokenIntentId: tokenIntent.id,
    });

    response = {
      ...response,
      status,
      vendor: {
        name: "checkout",
        token: vendorToken,
      },
    };
  } else if (setting?.value === "stripe") {
    const { status, vendorToken } = await verifyCardWithStripe({
      tokenIntentId: tokenIntent.id,
    });

    response = {
      ...response,
      status,
      vendor: {
        name: "stripe",
        token: vendorToken,
      },
    };
  }

  // The vendor token can be used to charge the card later directly (no proxy)

  if (saveCard) {
    const token = await bt.tokens.create({
      tokenIntentId: tokenIntent.id,
    });
    response = {
      ...response,
      token,
    };
  } else {
    response = {
      ...response,
      tokenIntent,
    };
  }

  return Response.json(response);
}

const verifyCardWithBraintree = async ({
  tokenIntentId,
}: {
  tokenIntentId: string;
}) => {
  const singleTokenResponse = await braintree.createSingleUseToken({
    tokenIntentId,
  });

  const verification = await braintree.verifyCreditCard({
    paymentMethodId:
      singleTokenResponse.data.tokenizeCreditCard.paymentMethod.id,
  });
  return {
    status:
      verification.data.vaultCreditCard.verification.status === "VERIFIED"
        ? "verified"
        : "failed",
    vendorToken: verification.data.vaultCreditCard.paymentMethod.id,
  } as const;
};

const verifyCardWithCheckout = async ({
  tokenIntentId,
  authentication,
}: {
  tokenIntentId: string;
  authentication?: any;
}) => {
  const verification = await checkout.verifyCreditCard({
    tokenIntentId,
    authentication,
  });

  return {
    status: verification.status === "Card Verified" ? "verified" : "failed",
    vendorToken: verification.source.id,
  } as const;
};

const verifyCardWithAdyen = async ({
  tokenIntentId,
  authentication,
}: {
  tokenIntentId: string;
  authentication?: any;
}) => {
  const verification = await adyen.verifyCreditCard({
    tokenIntentId,
    authentication,
  });

  return {
    status: verification.resultCode === "Authorised" ? "verified" : "failed",
    vendorToken:
      verification.additionalData["recurring.recurringDetailReference"],
  } as const;
};

const verifyCardWithStripe = async ({
  tokenIntentId,
  authentication,
}: {
  tokenIntentId: string;
  authentication?: any;
}) => {
  const customer = await stripe.createCustomer();

  const verification = await stripe.verifyCreditCard({
    customerId: customer.id,
    tokenIntentId,
    authentication,
  });

  return {
    status: verification.status === "succeeded" ? "verified" : "failed",
    vendorToken: verification.payment_method,
  } as const;
};
