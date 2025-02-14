import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb/plugins/core";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import * as orders from "@/server/orders";

declare global {
  var database: Promise<RxDatabase> | undefined;
}

async function createDb() {
  if (process.env.NODE_ENV !== "production") {
    await import("rxdb/plugins/dev-mode").then((module) =>
      addRxPlugin(module.RxDBDevModePlugin),
    );
  }
  addRxPlugin(RxDBUpdatePlugin);

  const storage = wrappedValidateAjvStorage({
    storage: getRxStorageMemory(),
  });

  const db = await createRxDatabase({
    name: "payments-db",
    storage,
  });

  await db.addCollections({
    settings: {
      schema: {
        version: 0,
        primaryKey: "key",
        type: "object",
        properties: {
          key: { type: "string", maxLength: 50 },
          value: { type: "string" },
        },
        required: ["key", "value"],
      },
    },
  });

  await orders.addCollection(db);

  return db;
}

export const db = async (): Promise<RxDatabase> => {
  if (!globalThis.database) {
    globalThis.database = createDb(); // Assign to globalThis so it persists
  }
  return globalThis.database;
};
