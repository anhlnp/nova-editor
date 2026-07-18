"use client";
// M5 — Collection item scope.
// RepeatList provides a per-iteration map of dataSourceId → value via this
// context. WebstudioComponentCanvas/Preview read it and pass it to
// evaluateExpression as injectedValues, so child expressions bound to the item
// variable resolve to the current array element. Empty map = page scope.
import { createContext } from "react";

export type ItemScope = Map<string, unknown>;

export const ItemScopeContext = createContext<ItemScope | undefined>(undefined);
