import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useSWRConfig } from "swr";
import { Verification } from "@/app/api/verify/route";

interface Props {
  verification?: Verification;
  onCancel: () => void;
}

export const ReviewOrder = ({ verification, onCancel }: Props) => {
  const [busy, setBusy] = useState(false);

  const { mutate } = useSWRConfig();
  const tokenOrIntent = verification?.tokenIntent || verification?.token;

  const subtotal = useMemo(
    () => parseFloat((Math.random() * (100 - 10) + 10).toFixed(2)),
    [verification],
  );
  const tax = 1.99;
  const total = subtotal + tax;

  const placeOrder = async () => {
    setBusy(true);
    await axios.post("/api/orders", {
      tokenIntent: verification!.tokenIntent,
      token: verification!.token,
      total,
    });
    await mutate("/api/orders");
    setBusy(false);
  };

  return (
    tokenOrIntent && (
      <Card sx={{ mt: 4 }} raised>
        <CardContent>
          <Typography variant="body1">Please review your order</Typography>
          <Container maxWidth="xs">
            <Grid container spacing={1} mt={4} mb={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">
                  Order subtotal (1 item)
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  textAlign="right"
                >
                  ${subtotal.toFixed(2)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">
                  Shipping
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  textAlign="right"
                >
                  Free
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">
                  Estimated tax
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  textAlign="right"
                >
                  ${tax.toFixed(2)}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body1" color="textSecondary">
                  Total
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="body1"
                  color="textPrimary"
                  textAlign="right"
                >
                  ${total.toFixed(2)}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="textSecondary">
                  Payment Method
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  textAlign="right"
                >
                  {tokenOrIntent?.type === "card" && (
                    <span>
                      {tokenOrIntent?.card?.brand?.toUpperCase()} ending in{" "}
                      {tokenOrIntent?.card?.last4}
                    </span>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </CardContent>
        <CardActions sx={{ justifyContent: "end" }}>
          <Button variant="outlined" onClick={onCancel} disabled={busy}>
            Back
          </Button>
          <Button variant="contained" loading={busy} onClick={placeOrder}>
            Place order
          </Button>
        </CardActions>
      </Card>
    )
  );
};
