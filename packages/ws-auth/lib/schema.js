// src/schema.ts
import { z } from "zod";
var basicAuthInput = z.union([
  z.object({
    method: z.literal("basic"),
    login: z.string(),
    password: z.string()
  }),
  z.object({
    type: z.literal("basic"),
    login: z.string(),
    password: z.string()
  })
]);
var wsAuthConfig = z.object({
  version: z.literal(1),
  routes: z.record(basicAuthInput)
});
export {
  basicAuthInput,
  wsAuthConfig
};
