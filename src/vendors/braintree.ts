import axios from "axios";
import { basisTheoryProxyUrl } from "@/vendors/basistheory";

const braintreeUrl = "https://payments.sandbox.braintree-api.com/graphql";

const defaultHeaders = {
  "Braintree-Version": "2019-01-01",
  Authorization: `Basic ${Buffer.from(
    `${process.env.BRAINTREE_PUBLIC_KEY}:${process.env.BRAINTREE_PRIVATE_KEY}`,
  ).toString("base64")}`,
};

const proxiedHeaders = {
  ...defaultHeaders,
  "BT-PROXY-URL": braintreeUrl,
  "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY!,
};

export async function createSingleUseToken({
  tokenIntentId,
}: {
  tokenIntentId: string;
}) {
  const query = `
        mutation TokenizeCreditCard($input: TokenizeCreditCardInput!) {
            tokenizeCreditCard(input: $input) {
                paymentMethod {
                    id
                    legacyId
                }
            }
        }
    `;

  const variables = {
    input: {
      creditCard: {
        number: `{{ token_intent: ${tokenIntentId} | json: "$.data.number" }}`,
        expirationMonth: `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "MM" }}`,
        expirationYear: `{{ token_intent: ${tokenIntentId} | json: "$.data" | card_exp: "YYYY" }}`,
        cvv: `{{ token_intent: ${tokenIntentId} | json: "$.data.cvc" }}`,
      },
    },
  };

  const response = await axios.post(
    basisTheoryProxyUrl,
    {
      query,
      variables,
    },
    {
      headers: {
        ...proxiedHeaders,
      },
    },
  );

  return response.data;
}

export async function verifyCreditCard({
  paymentMethodId,
}: {
  paymentMethodId: string;
}) {
  const query = `
        mutation vaultCreditCard($input: VaultCreditCardInput!) {
          vaultCreditCard(input: $input) {
            verification {
              status
            },
            paymentMethod {
              id
            }
          }
        }
    `;

  const variables = {
    input: {
      paymentMethodId: paymentMethodId,
      verification: {
        amount: 0,
      },
    },
  };

  const response = await axios.post(
    braintreeUrl,
    {
      query,
      variables,
    },
    {
      headers: {
        ...defaultHeaders,
      },
    },
  );

  return response.data;
}

export async function chargeCreditCard({
  paymentMethodId,
}: {
  paymentMethodId: string;
}) {
  const query = `
        mutation vaultCreditCard($input: VaultCreditCardInput!) {
          vaultCreditCard(input: $input) {
            verification {
              status
            },
            paymentMethod {
              id
            }
          }
        }
    `;

  const variables = {
    input: {
      paymentMethodId: paymentMethodId,
      verification: {
        amount: 0,
      },
    },
  };

  const response = await axios.post(
    braintreeUrl,
    {
      query,
      variables,
    },
    {
      headers: {
        ...defaultHeaders,
      },
    },
  );

  return response.data;
}

//
// export async function chargeBraintree({
//   token,
//   auth,
//   amount,
// }: ChargeParams): Promise<ChargeResponse> {
//   const headers = getHeaders(auth);
//
//   if (!token?.providers?.braintree?.token) {
//     throw new Error("No Braintree token in universal token");
//   }
//
//   const query = `
//         mutation CreateTransaction($input: ChargePaymentMethodInput!) {
//             chargePaymentMethod(input: $input) {
//                 transaction {
//                     id
//                     status
//                 }
//             }
//         }
//     `;
//
//   const variables = {
//     input: {
//       paymentMethodId: token.providers.braintree.token,
//       transaction: {
//         amount: amount.toString(),
//       },
//     },
//   };
//
//   const data = { query, variables };
//
//   const response = await httpPost(braintreeGraphQLUrl, { data, headers });
//
//   return {
//     id: response.data.chargePaymentMethod.transaction.id,
//     universalToken: token,
//   };
// }
