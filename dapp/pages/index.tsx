import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import {
  getTokensQuery,
  getBuiltGraphSDK,
  getStreamsQuery,
  getFlowSplittersQuery,
} from "../.graphclient";
import { useEffect, useState } from "react";
import { Link, Paper, Typography } from "@mui/material";
import { useAccount, useNetwork } from "wagmi";
import FlowSplitters from "../components/FlowSplitters";
import CreateFlowSplitter from "../components/CreateFlowSplitter";
import Streams from "../components/Streams";
import { FlowSplitterFactoryContract } from "../src/constants";
import Summary from "../components/Summary";
import { getAddressLink } from "../src/helpers";

const sdk = getBuiltGraphSDK();

const Home: NextPage = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<getTokensQuery>();
  const [streams, setStreams] = useState<getStreamsQuery>();
  const [flowSplitters, setFlowSplitters] = useState<getFlowSplittersQuery>();
  const [tokenMap, setTokenMap] = useState(
    new Map<string, { name: string; symbol: string }>()
  );
  useEffect(() => {
    (async () => {
      const tokens = await sdk.getTokens({ where: { isListed: true } });
      setTokens(tokens);
      const tempTokenMap = tokenMap;
      tokens.result.forEach((token) => {
        tempTokenMap.set(token.id, { name: token.name, symbol: token.symbol });
      });
      setTokenMap(tempTokenMap);
      await getAndSetFlowSplittersAndStreams(address);
      setLoading(false);
    })();
  }, [address]);

  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(async () => {
      await getAndSetFlowSplittersAndStreams(address);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [loading, address]);

  const getAndSetFlowSplittersAndStreams = async (
    connectedAddress?: string
  ) => {
    const flowSplitters = await sdk.getFlowSplitters({
      // where: {
      //   flowSplitterCreator: connectedAddress
      //     ? connectedAddress.toLowerCase()
      //     : "",
      // },
    });
    setFlowSplitters(flowSplitters);
    const flowSplitterAddresses = flowSplitters.result.map((x) =>
      x.id.toLowerCase()
    );
    const streams = await sdk.getStreams({
      where: {
        currentFlowRate_gt: 0,
        sender: connectedAddress ? connectedAddress.toLowerCase() : "",
        receiver_in: flowSplitterAddresses,
      },
    });
    setStreams(streams);
  };

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

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
        <Summary />
        <Typography marginY={2} variant="body2" color="GrayText">
          Factory Address:{" "}
          <Link
            target="_blank"
            href={getAddressLink(
              FlowSplitterFactoryContract.address,
              chain?.id
            )}
          >
            {FlowSplitterFactoryContract.address}
          </Link>
        </Typography>
        {loading ? (
          <div>
            <Typography>Loading...</Typography>
          </div>
        ) : (
          <div>
            <FlowSplitters
              address={address}
              flowSplitters={flowSplitters}
              tokenMap={tokenMap}
              openModal={() => handleOpen()}
            />
            <Streams streams={streams} />
          </div>
        )}
        <CreateFlowSplitter
          open={modalOpen}
          address={address}
          tokens={tokens}
          handleClose={() => handleClose()}
        />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vincentchee.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Made with ❤️ by your fren, 0xdavinchee
        </a>
      </footer>
    </Paper>
  );
};
export default Home;
