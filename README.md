# Superfluid Flow Splitter Factory

## Problem Description
The Flow Splitter SuperApp currently lacks a user-friendly interface for viewing and deploying new Flow Splitter contracts.

Despite the utility of the Flow Splitter, it doesn't have an intuitive user interface. Currently, interacting with the Flow Splitter and managing the deployment of new flow splitters requires technical knowledge. This limitation hinders efficient utilization of the SuperApp's core feature to developers with the necessary tooling.

This project seeks to extend the Flow Splitter SuperApp with a Flow Splitter Factory, and an intuitive UI. This will simplify the process of deploying new flow splitters and viewing existing flow splitters and streams that are open to flow splitters created with the canonical factory.

## Proposed Solution/Technical Design

### High-Level
To address this issue, we will implement a solution that integrates a user-friendly UI for the existing Flow Splitter SuperApp. The primary objective is to empower users to easily view and deploy new flow splitters without the need for deep technical knowledge or assistance.

### Specifics
1. Flow Splitter Factory Smart Contract:
  - Deploys new instances of the Flow Splitter contract.
  - Emits a `FlowSplitterCreated` event to be indexed by the Subgraph

2. Modified Flow Splitter Contract:
  - Emits a `SplitUpdated` event to be indexed by the Subgraph
  - Includes additional checks during initialization and a helper function: `getMainAndSideReceiverFlowRates` to ensure that given the desired flow rate and the side receiver portion, the main and side receiver flow rates are valid (greater than 0).

3. Subgraph:
  - Indexes events from the Flow Splitter Factory and deployed Flow Splitters.
  - Facilitates quick data retrieval for the frontend via The Graph protocol.

4. Autogenerated SDK using `graph-client`:
  - Simplifies interaction between dApp and subgraph.
  - Enables seamless data fetching and blockchain operations.

5. Autogenerated Hooks using `wagmi`:
  - Generates React hooks for smart contract read and write operations.
  - Enhances developer experience and reduces boilerplate code.

6. Frontend:
  - Using rainbowkit starter
  - Developed using TypeScript React and deployed with Next.js.
  - Provides a user-friendly interface for interacting with Flow Splitters.

7. Cross-Network Deployment:
  - Currently only functional on the Mumbai network.
  - Utilizes tools allowing straightforward deployment to multiple networks.

This technical design outlines the key components, from smart contracts and subgraph integration to frontend development and cross-network deployment. 

## Misc

[FlowSplitter contract changeset](https://github.com/superfluid-finance/super-examples/compare/flow-splitter-changes?expand=1)
[FlowSplitter dApp](https://sf-split.vercel.app/)

Please refer to the README's in contracts, dapp and subgraph for more information on how to work with the code.