import axios from "axios";
import { basisTheoryProxyUrl } from "@/vendors/basistheory";

const checkoutPaymentsUrl = "https://api.sandbox.checkout.com/payments";

export async function verifyCreditCard({
  tokenIntentId,
  authentication,
}: {
  tokenIntentId: string;
  authentication: any;
}) {
  const response = await axios.post(
    basisTheoryProxyUrl,
    {
      source: {
        type: "card",
        number: `{{ token_intent: ${tokenIntentId} | json: "$.data.number" }}`,
        expiry_month: `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "MM" }}`,
        expiry_year: `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "YYYY" }}`,
        cvv: `{{ token_intent: ${tokenIntentId} | json: "$.data.cvc" }}`,
        store_for_future_use: true,
      },
      customer: {
        email: "john.smith@example.com",
        name: "John Smith",
      },
      currency: "USD",
      processing_channel_id: process.env.CHECKOUT_PROCESSING_CHANNEL_ID,
      ...(authentication
        ? {
            "3ds": {
              enabled: true,
              challenge_indicator: "no_preference",
              cryptogram: authentication.authentication_value,
              eci: authentication.eci,
              xid: authentication.ds_transaction_id,
            },
          }
        : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CHECKOUT_PRIVATE_KEY}`,
        "BT-PROXY-URL": checkoutPaymentsUrl,
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY!,
      },
    },
  );

  return response.data;
}

export async function chargeCreditCard({
  amount,
  tokenSource,
}: {
  tokenSource: string;
  amount: number;
}) {
  const response = await axios.post(
    basisTheoryProxyUrl,
    {
      reference: "merchant-reference",
      source: {
        type: "card",
        number: `{{ ${tokenSource} | json: "$.data.number" }}`,
        expiry_month: `{{ ${tokenSource} | json: "$.data" | card_exp: "MM" }}`,
        expiry_year: `{{ ${tokenSource} | json: "$.data" | card_exp: "YYYY" }}`,
        stored: true,
      },
      amount,
      currency: "USD",
      payment_type: "Regular",
      capture: true,
      customer: {
        email: "john.smith@example.com",
        name: "John Smith",
      },
      processing_channel_id: process.env.CHECKOUT_PROCESSING_CHANNEL_ID,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CHECKOUT_PRIVATE_KEY}`,
        "BT-PROXY-URL": checkoutPaymentsUrl,
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY!,
      },
    },
  );

  return response.data;
}
