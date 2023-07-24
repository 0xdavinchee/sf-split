import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import FlowSplitter from "./abis/FlowSplitter.json";
import FlowSplitterFactory from "./abis/FlowSplitterFactory.json";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    { name: "FlowSplitter", abi: FlowSplitter.abi as any },
    { name: "FlowSplitterFactory", abi: FlowSplitterFactory.abi as any },
  ],
  plugins: [react()],
});
