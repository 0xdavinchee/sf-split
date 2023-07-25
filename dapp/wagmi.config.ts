import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import FlowSplitter from "./abis/FlowSplitter.json";
import FlowSplitterFactory from "./abis/FlowSplitterFactory.json";
import CFAv1Forwarder from "./abis/CFAv1Forwarder.json";
import { erc20ABI } from "wagmi";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    { name: "FlowSplitter", abi: FlowSplitter.abi as any },
    { name: "FlowSplitterFactory", abi: FlowSplitterFactory.abi as any },
    { name: "CFAv1Forwarder", abi: CFAv1Forwarder.abi as any },
    { name: "erc20", abi: erc20ABI },
  ],
  plugins: [react()],
});
