"use client";

import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { Box } from "@mui/system";
import * as settings from "@/server/settings";
import { useSetting } from "@/components/SettingsProvider";

const vendorOptions = [
  <MenuItem value="none" key="none">
    <em>None</em>
  </MenuItem>,
  <MenuItem value="braintree" key="braintree">
    Braintree
  </MenuItem>,
  <MenuItem value="checkout" key="checkout">
    Checkout
  </MenuItem>,
  <MenuItem value="adyen" key="adyen">
    Adyen
  </MenuItem>,
  <MenuItem value="stripe" key="stripe">
    Stripe
  </MenuItem>,
];

export const Options = () => {
  const [cardVerificationVendor, setCardVerificationVendor] = useSetting(
    settings.card_verification_vendor,
  );
  const [cardTransactionVendor, setCardTransactionVendor] = useSetting(
    settings.card_transaction_vendor,
  );
  const [enabled3ds, setEnable3ds] = useSetting(settings.enable_3ds);

  return (
    <Card>
      <CardHeader title="Options"></CardHeader>
      <CardContent>
        <Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled3ds === "true"}
                  onChange={(e) => {
                    setEnable3ds(String(e.target.checked));
                  }}
                />
              }
              label="Enable 3DS"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="card-verification-label">
                Card Verification Vendor
              </InputLabel>
              <Select
                labelId="card-verification-label"
                id="card-verification"
                value={cardVerificationVendor || "none"}
                onChange={(e) => setCardVerificationVendor(e.target.value)}
                label="Card Verification Vendor"
              >
                {vendorOptions}
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="card-transaction-label">
                Card Transaction Vendor
              </InputLabel>
              <Select
                labelId="card-transaction-label"
                id="card-transaction"
                value={cardTransactionVendor || "none"}
                onChange={(e) => setCardTransactionVendor(e.target.value)}
                label="Card Transaction Vendor"
              >
                {vendorOptions}
              </Select>
            </FormControl>
          </FormGroup>
        </Box>
      </CardContent>
    </Card>
  );
};
