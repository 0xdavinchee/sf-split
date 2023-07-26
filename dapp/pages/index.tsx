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
import { useAccount, useNetwork, usePublicClient } from "wagmi";
import FlowSplitters from "../components/FlowSplitters";
import CreateFlowSplitter from "../components/CreateFlowSplitter";
import Streams from "../components/Streams";
import {
  ConstantFlowAgreementV1Contract,
  FlowSplitterFactoryContract,
  fromBlock,
} from "../src/constants";
import Summary from "../components/Summary";
import { getAddressLink } from "../src/helpers";
import { parseAbiItem } from "viem";

const sdk = getBuiltGraphSDK();
const Home: NextPage = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();

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
  }, [address, tokenMap]);

  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(async () => {
      await getAndSetFlowSplittersAndStreams(address);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [loading, address]);

  const getAndSetFlowSplittersAndStreams = async (
    connectedAddress?: `0x${string}`
  ) => {
    const subgraphFlowSplitters = await sdk.getFlowSplitters();
    const flowSplitterLogs = await publicClient.getLogs({
      address: FlowSplitterFactoryContract.address,
      fromBlock,
      event: parseAbiItem(
        "event FlowSplitterCreated(address indexed superToken, address indexed flowSplitterCreator, address mainReceiver, address sideReceiver, address flowSplitter, int96 mainReceiverPortion, int96 sideReceiverPortion)"
      ),
    });
    const flowSplittersLogData = {
      result: flowSplitterLogs.map((x) => ({
        ...x.args,
        id: x.args.flowSplitter,
      })),
    };
    const fullFlowSplitterData =
      flowSplittersLogData.result.length > subgraphFlowSplitters.result.length
        ? (flowSplittersLogData as getFlowSplittersQuery)
        : subgraphFlowSplitters;

    const flowSplitterData = fullFlowSplitterData.result.filter(
      (x) =>
        x.flowSplitterCreator.toLowerCase() === connectedAddress?.toLowerCase()
    );
    setFlowSplitters(
      connectedAddress ? ({ result: flowSplitterData } as any) : { result: [] }
    );
    const flowSplitterAddresses = fullFlowSplitterData.result.map((x) =>
      x.id?.toLowerCase()
    );
    const flowUpdatedLogs = await publicClient.getLogs({
      address: ConstantFlowAgreementV1Contract.address,
      fromBlock,
      event: parseAbiItem(
        "event FlowUpdated(address indexed token,address indexed sender,address indexed receiver,int96 flowRate,int256 totalSenderFlowRate,int256 totalReceiverFlowRate,bytes userData)"
      ),
      args: {
        sender: connectedAddress,
      },
    });
    const flowUpdatedLogData = {
      result: flowUpdatedLogs
        .map((x) => ({
          token: {
            id: x.args.token,
          },
          sender: {
            id: x.args.sender,
          },
          receiver: {
            id: x.args.receiver,
          },
          currentFlowRate: x.args.flowRate,
          id: x.transactionHash,
        }))
        .filter((x) =>
          flowSplitterAddresses.includes(x.receiver.id?.toLowerCase() || "")
        ),
    };
    console.log(flowUpdatedLogs)
    const subgraphStreams = await sdk.getStreams({
      where: {
        currentFlowRate_gt: 0,
        sender: connectedAddress ? connectedAddress.toLowerCase() : "",
        receiver_in: flowSplitterAddresses,
      },
    });
    const streamData =
      flowUpdatedLogData.result.length > subgraphStreams.result.length
        ? flowUpdatedLogData
        : subgraphStreams;
      console.log(streamData)
    setStreams(connectedAddress ? (streamData as any) : { result: [] });
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
            <Streams streams={streams} tokenMap={tokenMap} />
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
