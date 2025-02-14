import { useEffect, useState } from "react";
import type { BasisTheory3ds } from "@basis-theory/web-threeds";

export const useBasisTheory3ds = () => {
  const [bt3ds, setBasisTheory3ds] =
    useState<ReturnType<typeof BasisTheory3ds>>();

  useEffect(() => {
    const init = async () => {
      import("@basis-theory/web-threeds").then((mod) => {
        setBasisTheory3ds(
          mod.BasisTheory3ds(process.env.NEXT_PUBLIC_BASIS_THEORY_PUBLIC_KEY!, {
            apiBaseUrl: process.env.NEXT_PUBLIC_API_HOST,
            // challengeContainerOptions: {
            //   id: "challenge-container",
            // },
          }),
        );
      });
    };
    init();

    return () => {
      setBasisTheory3ds(undefined);
    };
  }, []);

  return bt3ds;
};
