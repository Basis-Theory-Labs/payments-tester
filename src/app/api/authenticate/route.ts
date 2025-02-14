import axios from "axios";

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  const authenticateRequest = {
    sessionId,
    authentication_category: "payment",
    authentication_type: "payment-transaction",
    purchase_info: {
      amount: "80000",
      currency: "826",
      exponent: "2",
      date: "20240109141010",
    },
    requestor_info: {
      id: "example-3ds-merchant",
      name: "Example 3DS Merchant",
      url: "https://www.ravelin.com/example-merchant",
    },
    merchant_info: {
      mid: "9876543210001",
      acquirer_bin: "000000999",
      name: "Example 3DS Merchant",
      category_code: "7922",
      country_code: "826",
    },
    cardholder_info: {
      name: "Basis Theory",
      email: "engineering@basistheory.com",
    },
  };

  const { data } = await axios.post(
    `https://api.basistheory.com/3ds/sessions/${sessionId}/authenticate`,
    authenticateRequest,
    {
      headers: {
        "BT-API-KEY": process.env.BASIS_THEORY_PRIVATE_KEY!,
      },
    },
  );

  return Response.json(data);
}
