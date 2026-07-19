import { nanoid } from "nanoid";
import { updateData } from "./transactions";

export type AnyProp = {
  id: string;
  instanceId: string;
  name: string;
  type: string;
  value: unknown;
};

export function writeProp(instanceId: string, name: string, value: unknown, type: string) {
  updateData(({ props: draft }) => {
    const allProps = draft as Map<string, AnyProp>;
    const existingId = [...allProps.values()].find(
      (p) => p.instanceId === instanceId && p.name === name
    )?.id;
    const id = existingId ?? `prop_${nanoid(8)}`;
    allProps.set(id, { id, instanceId, name, type, value });
  });
}

export function writeGridSpan(instanceId: string, span: number) {
  const clamped = Math.max(1, Math.min(12, span));
  writeProp(instanceId, "span", clamped, "number");
}

export function writeGridColumnStart(instanceId: string, start: number | null) {
  if (start === null) {
    // To unset, we can remove the prop, but for now we write null or undefined, or remove it.
    // wait, let's look at how writeProp handles null. We can just write null.
    // Or we can just set it to undefined, but our writeProp just sets the value.
    writeProp(instanceId, "colStart", start, "number");
  } else {
    writeProp(instanceId, "colStart", start, "number");
  }
}
