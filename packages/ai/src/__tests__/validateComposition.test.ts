import { describe, it, expect } from "vitest";
import { validateComposition } from "../utils/validateComposition.js";

const KNOWN = ["HeroSection", "Button", "Section", "FeatureCard"] as const;
const ID_RE = /^node_[A-Za-z0-9_-]{8}$/;

describe("validateComposition", () => {
  it("keeps known types and mints fresh node_<8> ids (never trusts AI ids)", () => {
    const raw = [
      { id: "not-a-valid-id", type: "HeroSection", props: { title: "Hi" }, children: [] },
    ];
    const r = validateComposition(raw, KNOWN);
    expect(r.elements).toHaveLength(1);
    expect(r.elements[0]!.type).toBe("HeroSection");
    expect(r.elements[0]!.id).toMatch(ID_RE);
    expect(r.elements[0]!.id).not.toBe("not-a-valid-id");
    expect(r.elements[0]!.props).toEqual({ title: "Hi" });
    expect(r.usedTypes).toEqual(["HeroSection"]);
    expect(r.droppedTypes).toEqual([]);
  });

  it("drops hallucinated/unknown types and reports them (transparency)", () => {
    const raw = [
      { id: "x", type: "HeroSection", props: {}, children: [] },
      { id: "y", type: "VideoCarousel", props: {}, children: [] }, // not registered
      { id: "z", type: "PricingTable", props: {}, children: [] }, // not registered
    ];
    const r = validateComposition(raw, KNOWN);
    expect(r.elements.map((e) => e.type)).toEqual(["HeroSection"]);
    expect(r.droppedTypes.sort()).toEqual(["PricingTable", "VideoCarousel"]);
  });

  it("recurses into children and mints ids at every depth", () => {
    const raw = [
      {
        id: "a",
        type: "HeroSection",
        props: {},
        children: [
          { id: "b", type: "Button", props: { label: "Go" }, children: [] },
          { id: "c", type: "Nope", props: {}, children: [] }, // unknown child → dropped
        ],
      },
    ];
    const r = validateComposition(raw, KNOWN);
    expect(r.elements[0]!.children).toHaveLength(1);
    expect(r.elements[0]!.children[0]!.type).toBe("Button");
    expect(r.elements[0]!.children[0]!.id).toMatch(ID_RE);
    expect(r.usedTypes.sort()).toEqual(["Button", "HeroSection"]);
    expect(r.droppedTypes).toEqual(["Nope"]);
  });

  it("defaults missing/invalid props to {} and missing children to []", () => {
    const raw = [{ type: "Section" }]; // no props, no children, no id
    const r = validateComposition(raw, KNOWN);
    expect(r.elements).toHaveLength(1);
    expect(r.elements[0]!.props).toEqual({});
    expect(r.elements[0]!.children).toEqual([]);
    expect(r.elements[0]!.id).toMatch(ID_RE);
  });

  it("dedupes usedTypes and droppedTypes", () => {
    const raw = [
      { type: "Button", props: {}, children: [] },
      { type: "Button", props: {}, children: [] },
      { type: "Ghost", props: {}, children: [] },
      { type: "Ghost", props: {}, children: [] },
    ];
    const r = validateComposition(raw, KNOWN);
    expect(r.usedTypes).toEqual(["Button"]);
    expect(r.droppedTypes).toEqual(["Ghost"]);
  });

  it("returns empty for non-array / junk input (never throws)", () => {
    for (const junk of [null, undefined, 42, "nope", {}, [1, 2, "x", null]]) {
      const r = validateComposition(junk, KNOWN);
      expect(r.elements).toEqual([]);
    }
  });
});
