import { describe, expect, it } from "vitest";
import { dateTypes } from "@/lib/date-types";
describe("General date types", () => {
  it("classifies soulmate without requiring a selected goal", () => { expect(dateTypes(["soulmate"]).map(t => t.type)).toEqual(["soulmate"]); });
  it("keeps beneficial as a general date type alongside wealth", () => { expect(dateTypes(["beneficial", "wealth"]).map(t => t.type)).toEqual(["beneficial", "wealth"]); });
  it("does not invent a special type when none applies", () => { expect(dateTypes([])).toEqual([]); });
});