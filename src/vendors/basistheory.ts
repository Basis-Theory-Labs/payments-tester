import { TokenIntent } from "@basis-theory/basis-theory-js/types/models";
import { Create3dsSessionResponse } from "@basis-theory/web-threeds/dist/types/session";

import axios from "axios";
import { BasisTheory3ds } from "@basis-theory/web-threeds";

const create3dsSession = async (bt3ds: any, intent: TokenIntent) => {
  const session = await bt3ds.createSession({ tokenIntentId: intent.id });

  if (!session) throw new Error("3DS session creation failed");

  return session;
};

const authenticate3dsSession = async (session: Create3dsSessionResponse) => {
  const { data: authentication } = await axios.post("/api/authenticate", {
    sessionId: session.id,
  });

  if (!authentication) throw new Error("3DS session authentication failed");

  return authentication;
};

const perform3dsChallenge = async (
  bt3ds: any,
  authentication: any,
  session: any,
  containerId: string,
) => {
  const challenge = {
    acsChallengeUrl: authentication.acs_challenge_url,
    acsTransactionId: authentication.acs_transaction_id,
    sessionId: session.id,
    threeDSVersion: authentication.threeds_version,
    containerId,
  };

  // show challenge frame
  document.getElementById("challengeFrameContainer")?.classList.add("flex");
  const challengeCompletion = await bt3ds.startChallenge(challenge);

  // hide challenge frame
  document.getElementById("challengeFrameContainer")?.classList.remove("flex");

  if (!challengeCompletion) throw new Error("Challenge completion failed");
};

const get3dsChallengeResult = async (session: Create3dsSessionResponse) => {
  const challengeResultResponse = await fetch(
    `/api/challenge-result?sessionId=${session.id}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const challengeResult = await challengeResultResponse.json();

  if (!challengeResult) throw new Error("Challenge result retrieval failed");

  return challengeResult;
};

const perform3ds = async (
  bt3ds: ReturnType<typeof BasisTheory3ds>,
  intent: TokenIntent,
  containerId: string,
  onChallengeStart?: () => void,
  onChallengeComplete?: () => void,
) => {
  if (intent.type === "card" && intent.card.authentication !== "sca_required") {
    return;
  }

  console.info("Creating 3DS session");
  const session = await create3dsSession(bt3ds, intent);

  console.info("Authenticating 3DS session");
  const authentication = await authenticate3dsSession(session);
  console.info("Authentication", authentication);

  if (authentication.status === "successful") {
    return authentication;
  }

  // check if challenge required
  if (authentication.authentication_status === "challenge") {
    onChallengeStart?.();
    console.info("Waiting customer to complete challenge");
    // TODO pass div id and display it
    await perform3dsChallenge(bt3ds, authentication, session, containerId);
    console.info("Challenge complete. Retrieving results.");
    onChallengeComplete?.();

    const result = await get3dsChallengeResult(session);
    console.info("Results", result);

    return result;
  }
};

const basisTheoryProxyUrl = "https://api.basistheory.com/proxy";

export { perform3ds, basisTheoryProxyUrl };
