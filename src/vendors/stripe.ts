import axios from "axios";
import querystring from "querystring";
import { basisTheoryProxyUrl } from "@/vendors/basistheory";

const stripeUrl = "https://api.stripe.com/v1";

const headers = {
  Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
  "Content-Type": "application/x-www-form-urlencoded",
};

export const createCustomer = async () => {
  const { data } = await axios.post(`${stripeUrl}/customers`, null, {
    headers: {
      ...headers,
    },
  });

  return data;
};

export const verifyCreditCard = async ({
  customerId,
  tokenIntentId,
  authentication,
}: {
  customerId: string;
  tokenIntentId: string;
  authentication: any;
}) => {
  const { data } = await axios.post(
    basisTheoryProxyUrl,
    querystring.stringify({
      customer: customerId,
      confirm: "true",
      "payment_method_data[type]": "card",
      "payment_method_data[card][number]": `{{ token_intent: ${tokenIntentId} | json: "$.data.number" }}`,
      "payment_method_data[card][exp_month]": `{{ token_intent: ${tokenIntentId} | json: "$.data" |  card_exp: "MM" }}`,
      "payment_method_data[card][exp_year]": `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "YYYY" }}`,
      "payment_method_data[card][cvc]": `{{ token_intent: ${tokenIntentId} | json: "$.data.cvc" }}`,
      ...(authentication
        ? {
            "payment_method_options[card][three_d_secure][cryptogram]":
              authentication.cryptogram,
            "payment_method_options[card][three_d_secure][transaction_id]":
              authentication.transaction_id,
            "payment_method_options[card][three_d_secure][version]":
              authentication.version,
            "payment_method_options[card][three_d_secure][ares_trans_status]":
              authentication.ares_trans_status,
            "payment_method_options[card][three_d_secure][electronic_commerce_indicator]":
              authentication.electronic_commerce_indicator,
            "payment_method_options[card][three_d_secure][exemption_indicator]":
              authentication.exemption_indicator,
            "payment_method_options[card][three_d_secure][network_options]":
              authentication.network_options,
            "payment_method_options[card][three_d_secure][requestor_challenge_indicator]":
              authentication.requestor_challenge_indicator,
          }
        : {}),
    }),
    {
      headers: {
        ...headers,
        "BT-PROXY-URL": `${stripeUrl}/setup_intents`,
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY,
      },
    },
  );
  return data;
};

export const chargeCreditCard = async ({
  tokenSource,
  amount,
}: {
  tokenSource: string;
  amount: number;
}) => {
  const { data } = await axios.post(
    basisTheoryProxyUrl,
    querystring.stringify({
      amount,
      currency: "USD",
      confirm: "true",
      "payment_method_data[type]": "card",
      "payment_method_data[card][number]": `{{ ${tokenSource} | json: "$.data.number" }}`,
      "payment_method_data[card][exp_month]": `{{ ${tokenSource} | json: "$.data" |  card_exp: "MM" }}`,
      "payment_method_data[card][exp_year]": `{{ ${tokenSource} | json: "$.data" | card_exp: "YYYY" }}`,
      "payment_method_data[card][cvc]": `{{ ${tokenSource} | json: "$.data.cvc" }}`,
    }),
    {
      headers: {
        ...headers,
        "BT-PROXY-URL": `${stripeUrl}/payment_intents`,
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY,
      },
    },
  );
  return data;
};
