import axios from "axios";
import { basisTheoryProxyUrl } from "@/vendors/basistheory";

const adyenPaymentsUrl = "https://checkout-test.adyen.com/v71/payments";

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
      paymentMethod: {
        type: "scheme",
        number: `{{ token_intent: ${tokenIntentId} | json: "$.data.number" }}`,
        expiryMonth: `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "MM" }}`,
        expiryYear: `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "YYYY" }}`,
        cvc: `{{ token_intent: ${tokenIntentId} | json: "$.data.cvc" }}`,
        holderName: "John Doe",
      },
      amount: {
        value: 0,
        currency: "USD",
      },
      reference: "merchant-reference",
      shopperReference: "shopper-reference",
      shopperInteraction: "Ecommerce",
      recurringProcessingModel: "CardOnFile",
      storePaymentMethod: "true",
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      ...(authentication
        ? {
            mpiData: {
              authenticationResponse: authentication.authentication_status_code,
              directoryResponse: authentication.authentication_status_code,
              cavv: authentication.authentication_value,
              dsTransID: authentication.ds_transaction_id,
              eci: authentication.eci,
              threeDSVersion: authentication.threeds_version,
            },
          }
        : {}),
    },
    {
      headers: {
        "X-API-Key": process.env.ADYEN_PRIVATE_KEY,
        "BT-PROXY-URL": adyenPaymentsUrl,
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
      paymentMethod: {
        type: "scheme",
        number: `{{ ${tokenSource} | json: "$.data.number" }}`,
        expiryMonth: `{{ ${tokenSource} | json: "$.data" | card_exp: "MM" }}`,
        expiryYear: `{{ ${tokenSource} | json: "$.data" | card_exp: "YYYY" }}`,
        cvc: `{{ ${tokenSource} | json: "$.data.cvc" }}`,
        holderName: "John Doe",
      },
      amount: {
        value: amount,
        currency: "USD",
      },
      reference: "merchant-reference",
      shopperReference: "shopper-reference",
      shopperInteraction: "Ecommerce",
      recurringProcessingModel: "CardOnFile",
      storePaymentMethod: "true",
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
    },
    {
      headers: {
        "X-API-Key": process.env.ADYEN_PRIVATE_KEY,
        "BT-PROXY-URL": adyenPaymentsUrl,
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY!,
      },
    },
  );

  return response.data;
}
