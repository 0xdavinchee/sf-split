import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { getTokensQuery, getBuiltGraphSDK } from "../.graphclient";
import { useEffect, useState } from "react";
import { Paper } from "@mui/material";
import { FlowSplitterProps } from "../components/FlowSplitter";
import { useAccount } from "wagmi";
import FlowSplitters from "../components/FlowSplitters";
import CreateFlowSplitter from "../components/CreateFlowSplitter";

const Home: NextPage<{ data: getTokensQuery }> = ({ data }) => {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<getTokensQuery>();

  useEffect(() => {
    (async () => {
      const tokens = await sdk.getTokens({ where: { isListed: true } });
      setTokens(tokens);
      const flowSplitters = await sdk.getFlowSplitters();
      const streams = await sdk.getStreams();
    })();
  }, []);

  const flowSplitters: FlowSplitterProps[] = [
    {
      id: "0x12F50528177E7934F46716023500b206732D3Ae4",
      token: "0x5C99F2c1EE10E9fF1448DEf4948eCd18065Bced2",
      mainReceiver: "0x688390820B57cd65c1f76B5509Ba28F79A343343",
      sideReceiver: "0xE0cc76334405EE8b39213E620587d815967af39C",
      mainReceiverPortion: 420,
      sideReceiverPortion: 580,
      creator: "0x5C99F2c1EE10E9fF1448DEf4948eCd18065Bced2",
    },
    {
      id: "0x5C99F2c1EE10E9fF1448DEf4948eCd18065Bced2",
      token: "0x12F50528177E7934F46716023500b206732D3Ae4",
      mainReceiver: "0x6EeE6060f715257b970700bc2656De21dEdF074C",
      sideReceiver: "0x688390820B57cd65c1f76B5509Ba28F79A343343",
      mainReceiverPortion: 420,
      sideReceiverPortion: 580,
      creator: "0xE0cc76334405EE8b39213E620587d815967af39C",
    },
  ];

  return (
    <Paper className={styles.container}>
      <Head>
        <title>SF Split dApp</title>
        <meta
          content="Split your income streams with your friends and family."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        <FlowSplitters address={address} flowSplitters={flowSplitters} />
        <CreateFlowSplitter tokens={tokens} />
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your fren, 0xdavinchee
        </a>
      </footer>
    </Paper>
  );
};
const sdk = getBuiltGraphSDK();
export async function getServerSideProps() {
  const data = await sdk.getTokens();
  return {
    props: {
      data,
    },
  };
}

export default Home;
