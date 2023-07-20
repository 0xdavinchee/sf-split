## Superfluid Splitter Subgraph

### Prerequisite
- pnpm

### How to use

First install dependencies: `pnpm install`

To build locally, run: `pnpm build-local`

To build for a specific network, run `pnpm build <NETWORK>`, e.g. `pnpm build mumbai`.

> NOTE: The build step looks at the `networks.json` file, so this is the file to change if you'd like to extend to more networks or modify the data for the existing networks.

To execute the tests, run `pnpm test`.

Before deploying, you'll need to get an access token by signing up for an account via GitHub. You can follow along with the instructions [here](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-hosted/#create-a-hosted-service-account).

Then, you'll want to store the access token on your computer so that you can deploy with the graph-cli, you do this by running `graph auth --product hosted-service <ACCESS_TOKEN>`.

You also need to first create a subgraph in the graph explorer via the dashboard. You can follow along with the instructions [here](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-hosted/#create-a-subgraph-on-the-hosted-service).

To deploy, run: `pnpm deploy-subgraph <NETWORK>`