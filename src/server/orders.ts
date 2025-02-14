import { RxDatabase } from "rxdb/plugins/core";
import { Token, TokenIntent } from "@basis-theory/basis-theory-js/types/models";

const addCollection = (db: RxDatabase) =>
  db.addCollections({
    orders: {
      schema: {
        version: 0,
        primaryKey: "id",
        type: "object",
        properties: {
          id: { type: "string", maxLength: 50 },
          tokenIntent: { type: "object" },
          token: { type: "object" },
          total: { type: "number" },
          charged: {
            type: "boolean",
            default: false,
          },
        },
        required: ["id", "total"],
      },
    },
  });

export interface Order {
  id: number;
  tokenIntent: TokenIntent;
  token: Token;
  total: number;
  charged: boolean;
}

export { addCollection };
