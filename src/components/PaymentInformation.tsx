"use client";

import { PaymentForm } from "@/components/PaymentForm";
import { Box } from "@mui/system";
import { useState } from "react";
import type { TokenIntent } from "@basis-theory/basis-theory-js/types/models";
import axios from "axios";
import {
  BasisTheoryProvider,
  useBasisTheory,
} from "@basis-theory/basis-theory-react";
import { useSetting } from "@/components/SettingsProvider";
import * as settings from "@/server/settings";
import { useBasisTheory3ds } from "@/components/useBasisTheory3ds";
import { perform3ds } from "@/vendors/basistheory";
import { Card, CardContent, Fade } from "@mui/material";
import type { Verification } from "@/app/api/verify/route";

interface Props {
  onComplete: (verification: Verification) => void | Promise<void>;
}

const CHALLENGE_CONTAINER_ID = "challenge-container";

export const PaymentInformation = ({ onComplete }: Props) => {
  const [enable3ds] = useSetting(settings.enable_3ds);
  const [challengeActive, setChallengeActive] = useState(false);

  const { bt } = useBasisTheory(
    process.env.NEXT_PUBLIC_BASIS_THEORY_PUBLIC_KEY,
    {
      elements: true,
    },
  );

  const bt3ds = useBasisTheory3ds();

  const handleCheckoutSubmit = async (
    intent: TokenIntent,
    saveCard: boolean,
  ) => {
    let authentication = undefined;
    if (enable3ds === "true") {
      authentication = await perform3ds(
        bt3ds!,
        intent,
        CHALLENGE_CONTAINER_ID,
        () => {
          setChallengeActive(true);
        },
        () => {
          setChallengeActive(false);
        },
      ).finally(() => {
        setChallengeActive(false);
      });
    }
    // this request fails when verification failed
    console.info("Verifying card");
    const { data: verification } = await axios.post<Verification>(
      "/api/verify",
      {
        tokenIntent: intent,
        saveCard,
        authentication,
      },
    );
    if (verification.token) {
      console.info("Persistent token created");
    }
    console.info("Verification", verification);
    onComplete(verification);
  };

  return (
    <BasisTheoryProvider bt={bt}>
      <Box mt={4}>
        <PaymentForm onSubmit={handleCheckoutSubmit} />
        <Fade in={challengeActive}>
          <Card raised sx={{ mt: 4 }}>
            <CardContent>
              <Box
                id={CHALLENGE_CONTAINER_ID}
                display="flex"
                justifyContent="center"
              />
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </BasisTheoryProvider>
  );
};
