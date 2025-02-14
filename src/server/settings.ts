export const card_verification_vendor = "card_verification_vendor" as const;
export const enable_3ds = "enable_3ds" as const;
export const card_transaction_vendor = "card_transaction_vendor" as const;

export const settings = [
  card_verification_vendor,
  enable_3ds,
  card_transaction_vendor,
] as const;

export type Setting = (typeof settings)[number];
