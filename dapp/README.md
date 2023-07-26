## Superfluid Flow Splitter dApp

### Prerequisite
- `npm` or `pnpm`

### How to use

First install dependencies: `pnpm install`.

To run the development server: `pnpm dev`. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To build: `pnpm build`, this builds both the graph client SDK as well as building the Next app.

If you want to add in more hooks, add the contract ABI's you'd like hooks for to the `abis` folder and run `pnpm wagmi` to generate wagmi hooks with `@wagmi/cli`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
