# Payments Tester

## Getting Started

### Vendor Setup

First, create a `.env` file at the project root following the `.env.example`. Fill it out with your vendor keys.

> Some vendors require enabling APIs to receive card data from an external vault.

#### Basis Theory

[Click here](https://portal.basistheory.com/applications/create?name=Frontend&permissions=token-intent%3Acreate&permissions=3ds%3Asession%3Acreate&type=public) to create a Public Application Key with the following permissions:
- `token-intent:create`
- `3ds:session:create`


[Click here](https://portal.basistheory.com/applications/create?name=Backend&permissions=token%3Acreate&permissions=token%3Ause&permissions=3ds%3Asession%3Aread&permissions=3ds%3Asession%3Aauthenticate) to create a Private Application Key with the following permissions:
- `token:create`
- `token:use`
- `3ds:session:read`
- `3ds:session:authenticate`

### Running the app

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

### 3D Secure

Use [Basis Theory 3DS test cards](https://developers.basistheory.com/docs/api/testing#3ds-test-cards) to test specific 3DS scenarios.

Prefer using **Checkout** as Verification and Transaction vendor because of its flexible sandbox.

### Authorization

Use vendor-specific test cards for Verification and Transaction authorization.
