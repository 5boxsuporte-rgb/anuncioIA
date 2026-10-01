import { getDemoOutput } from "@/lib/demo/analysis";
import { DEMO_LISTING } from "@/lib/demo/listing";
import { buildResult } from "./build";

export function createDemoResult() {
  return buildResult(DEMO_LISTING, getDemoOutput(), "demo");
}
