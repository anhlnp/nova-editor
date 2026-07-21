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
    // Collect ALL props matching this instanceId + name (there may be duplicates
    // created by different code paths using different ID formats).
    const matching: string[] = [];
    for (const p of allProps.values()) {
      if (p.instanceId === instanceId && p.name === name) matching.push(p.id);
    }
    // Keep the first existing ID; delete the rest to avoid stale duplicates.
    const id = matching[0] ?? `prop_${nanoid(8)}`;
    for (let i = 1; i < matching.length; i++) allProps.delete(matching[i]);
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
