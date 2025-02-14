"use client";
import React, { useRef, useState } from "react";
import { CardElement as ICardElement } from "@basis-theory/basis-theory-js/types/elements";

import { CardElement, useBasisTheory } from "@basis-theory/basis-theory-react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import type { TokenIntent } from "@basis-theory/basis-theory-js/types/models";

interface Props {
  onSubmit: (tokenIntent: TokenIntent, saveCard: boolean) => Promise<void>;
}

export const PaymentForm = ({ onSubmit }: Props) => {
  const [cardComplete, setCardComplete] = useState(false);
  const [cardState, setCardState] = useState<"empty" | "error" | "complete">(
    "empty",
  );
  const [busy, setBusy] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const { bt } = useBasisTheory();

  const cardElementRef = useRef<ICardElement>(null);

  const borderColor =
    cardState === "empty"
      ? "grey.300"
      : cardState === "error"
        ? "error.main"
        : "success.main";

  const clear = () => {
    console.info("Clearing checkout");
    cardElementRef.current?.clear();
  };

  const submit = async () => {
    setBusy(true);
    try {
      console.info("Creating token intent");
      const intent = await bt!.tokenIntents.create({
        type: "card",
        data: cardElementRef.current,
      });
      console.info("Token intent", intent);
      await onSubmit(intent, saveCard);
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="body1">Enter your payment information</Typography>
        <Box
          mt={2}
          border={1}
          borderColor={borderColor}
          borderRadius={1}
          padding="4px 8px"
        >
          <CardElement
            id="myCard"
            ref={cardElementRef}
            disabled={busy}
            onChange={(event) => {
              setCardComplete(event.complete);
              if (event.empty) {
                setCardState("empty");
              } else if (event.complete) {
                setCardState("complete");
              } else if (event.errors?.length) {
                setCardState("error");
              }
            }}
            onReady={() => {
              cardElementRef.current?.focus();
            }}
          />
        </Box>
        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Checkbox
              checked={saveCard}
              onChange={() => setSaveCard(!saveCard)}
            />
          }
          label="Save card information for future purchases"
        />
      </CardContent>
      <CardActions sx={{ justifyContent: "end" }}>
        <Button
          variant="outlined"
          disabled={busy || cardState === "empty"}
          onClick={clear}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          disabled={!cardComplete}
          loading={busy}
          onClick={submit}
        >
          Submit
        </Button>
      </CardActions>
    </Card>
  );
};
