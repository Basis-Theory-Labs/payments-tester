"use client";
import "./globals.css";
import {
  Container,
  Divider,
  Step,
  StepLabel,
  Stepper,
  Grid2 as Grid,
} from "@mui/material";
import { Options } from "@/components/Options";
import { PaymentInformation } from "@/components/PaymentInformation";
import React, { useState } from "react";
import { ReviewOrder } from "@/components/ReviewOrder";
import { SettingsProvider } from "@/components/SettingsProvider";
import { Box } from "@mui/system";
import { ConsoleFeed } from "@/components/ConsoleFeed";
import { Orders } from "@/components/Orders";
import { Verification } from "@/app/api/verify/route";

export default function Home() {
  const [verification, setVerification] = useState<Verification>();

  /**
   * Invoked after the intent has been verified and authenticated with 3DS
   */
  const handleCompletePaymentInformation = (verification: Verification) => {
    setVerification(verification);
  };

  const handleReviewCancel = () => {
    setVerification(undefined);
  };

  const activeStep = verification ? 2 : 1;

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <SettingsProvider>
        <Container maxWidth="md" sx={{ p: 10 }}>
          <Stepper activeStep={activeStep}>
            <Step>
              <StepLabel>Shipping Address</StepLabel>
            </Step>
            <Step>
              <StepLabel>Payment Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>Review your order</StepLabel>
            </Step>
          </Stepper>
          <Box display={activeStep === 1 ? "initial" : "none"}>
            <PaymentInformation onComplete={handleCompletePaymentInformation} />
          </Box>
          <Box display={activeStep === 2 ? "initial" : "none"}>
            <ReviewOrder
              verification={verification}
              onCancel={handleReviewCancel}
            />
          </Box>
        </Container>
        <Divider />
        <Grid container flexGrow={1} spacing={4} mt={4}>
          <Grid size={{ xs: 12, md: 8 }} px={4}>
            <Orders />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} px={4}>
            <Options />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ConsoleFeed />
          </Grid>
        </Grid>
      </SettingsProvider>
    </Box>
  );
}
