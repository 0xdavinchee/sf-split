import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import {
  flowSplitterABI,
  useCfAv1ForwarderCreateFlow,
  useCfAv1ForwarderGetFlowrate,
  useCfAv1ForwarderUpdateFlow,
  useFlowSplitterGetMainAndSideReceiverFlowRates,
  useFlowSplitterUpdateSplit,
  usePrepareCfAv1ForwarderCreateFlow,
  usePrepareCfAv1ForwarderUpdateFlow,
  usePrepareFlowSplitterUpdateSplit,
} from "../src/generated";
import { FlowSplitter as FlowSplitterType } from "../.graphclient";
import { getAddress, isAddress } from "viem";
import {
  getAddressLink,
  isValidPortionInput,
  tryCatchWrapper,
} from "../src/helpers";
import { CFAv1ForwarderContract } from "../src/constants";
import { useNetwork } from "wagmi";

type FlowSplitterPropsType = Pick<
  FlowSplitterType,
  | "id"
  | "superToken"
  | "flowSplitterCreator"
  | "mainReceiver"
  | "sideReceiver"
  | "sideReceiverPortion"
  | "mainReceiverPortion"
>;

type ModifyFlowArgsType = readonly [
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  bigint,
  `0x${string}`
];

interface FlowSplitterProps {
  readonly flowSplitter: FlowSplitterPropsType;
  readonly address?: `0x${string}`;
  readonly tokenMap: Map<string, { name: string; symbol: string }>;
}

const FlowSplitter = (props: FlowSplitterProps) => {
  const { chain } = useNetwork();

  const { flowSplitter } = props;
  const [sideReceiverPortion, setSideReceiverPortion] = useState("");
  const [flowRate, setFlowRate] = useState("");
  const [more, setMore] = useState(false);

  const toPct = (x: number) => ((x / 1000) * 100).toFixed(1) + "%";

  const flowSplitterContract = {
    address: isAddress(flowSplitter.id)
      ? getAddress(flowSplitter.id)
      : ("" as any),
    flowSplitterABI,
  };

  const isValidSideReceiverPortion = useMemo(() => {
    return isValidPortionInput(sideReceiverPortion);
  }, [sideReceiverPortion]);

  const isValidFlowRate = useMemo(() => {
    return flowRate !== "" && Number(flowRate) > 1000;
  }, [flowRate]);

  const validFlowRate = useMemo(() => {
    return isNaN(Number(flowRate)) ? BigInt(0) : BigInt(flowRate);
  }, [flowRate]);

  const validSideReceiverPortion = useMemo(() => {
    return isNaN(Number(sideReceiverPortion))
      ? BigInt(0)
      : BigInt(sideReceiverPortion);
  }, [sideReceiverPortion]);

  const { data: mainAndSideReceiverFlowRates } =
    useFlowSplitterGetMainAndSideReceiverFlowRates({
      ...flowSplitterContract,
      args: [validFlowRate, validSideReceiverPortion],
      enabled: more && isValidFlowRate && isValidSideReceiverPortion,
    });

  const canModifyFlow = useMemo(() => {
    if (mainAndSideReceiverFlowRates == null) return false;

    const mainReceiverFlowRate = mainAndSideReceiverFlowRates[0];
    const sideReceiverFlowRate = mainAndSideReceiverFlowRates[1];

    return Number(mainReceiverFlowRate) > 0 && Number(sideReceiverFlowRate) > 0;
  }, [mainAndSideReceiverFlowRates]);

  const { data: inflowToFlowSplitter } = useCfAv1ForwarderGetFlowrate({
    ...CFAv1ForwarderContract,
    args: [
      getAddress(flowSplitter.superToken),
      props.address && isAddress(props.address)
        ? getAddress(props.address)
        : "0x",
      getAddress(flowSplitter.id),
    ],
  });

  const modifyFlowArgs = [
    isAddress(flowSplitter.superToken)
      ? getAddress(flowSplitter.superToken)
      : "0x",
    props.address && isAddress(props.address)
      ? getAddress(props.address)
      : "0x",
    isAddress(flowSplitter.id) ? getAddress(flowSplitter.id) : "0x",
    validFlowRate,
    "0x",
  ] as ModifyFlowArgsType;

  const { config: createFlowConfig } = usePrepareCfAv1ForwarderCreateFlow({
    ...CFAv1ForwarderContract,
    args: modifyFlowArgs,
    enabled:
      more &&
      canModifyFlow &&
      isValidFlowRate &&
      Number(inflowToFlowSplitter) === 0,
  });
  const { writeAsync: createFlowWrite } =
    useCfAv1ForwarderCreateFlow(createFlowConfig);

  const { config: updateFlowConfig } = usePrepareCfAv1ForwarderUpdateFlow({
    ...CFAv1ForwarderContract,
    args: modifyFlowArgs,
    enabled:
      more &&
      canModifyFlow &&
      isValidFlowRate &&
      Number(inflowToFlowSplitter) > 0,
  });
  const { writeAsync: updateFlowWrite } =
    useCfAv1ForwarderUpdateFlow(updateFlowConfig);

  const handleStreamToFlowSplitter = async () => {
    if (inflowToFlowSplitter == null) return;

    if (Number(inflowToFlowSplitter) === 0) {
      await tryCatchWrapper(createFlowWrite);
    } else {
      await tryCatchWrapper(updateFlowWrite);
    }
  };

  const { config: updateSplitConfig } = usePrepareFlowSplitterUpdateSplit({
    ...flowSplitterContract,
    args: [validSideReceiverPortion],
    enabled: isValidSideReceiverPortion,
  });

  const { writeAsync: updateSplitWrite } =
    useFlowSplitterUpdateSplit(updateSplitConfig);

  return (
    <Card key={flowSplitter.id} style={{ marginBottom: 10, width: 500 }}>
      <CardContent>
        <Typography variant="body2">
          Address:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.id, chain?.id)}
          >
            {flowSplitter.id}
          </Link>
        </Typography>
        <Typography variant="body2">
          Token: {props.tokenMap.get(flowSplitter.superToken)?.symbol} |{" "}
          {props.tokenMap.get(flowSplitter.superToken)?.name}
        </Typography>
        <Typography variant="body2">
          Main:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.mainReceiver, chain?.id)}
          >
            {flowSplitter.mainReceiver}
          </Link>{" "}
          | {toPct(flowSplitter.mainReceiverPortion)}
        </Typography>
        <Typography variant="body2">
          Side:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.sideReceiver, chain?.id)}
          >
            {flowSplitter.sideReceiver}
          </Link>{" "}
          | {toPct(flowSplitter.sideReceiverPortion)}
        </Typography>
        <Typography marginBottom={1} variant="body2">
          Creator:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.flowSplitterCreator, chain?.id)}
          >
            {flowSplitter.flowSplitterCreator}
          </Link>
        </Typography>
        <Button variant="contained" size="small" onClick={() => setMore(!more)}>
          {more ? "Less" : "More"}
        </Button>
        {more && (
          <>
            <TextField
              margin="normal"
              style={{ marginBottom: 10 }}
              fullWidth
              size="small"
              id="create-or-update-flow"
              label="Flow Rate (per second)"
              variant="outlined"
              value={flowRate}
              error={(!isValidFlowRate || !canModifyFlow) && flowRate !== ""}
              onChange={(e) => setFlowRate(e.target.value)}
            />

            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={!isValidFlowRate || !canModifyFlow}
              onClick={() => handleStreamToFlowSplitter()}
            >
              Stream to flow splitter
            </Button>
            <TextField
              margin="normal"
              style={{ marginBottom: 10 }}
              fullWidth
              size="small"
              id="update-side-receiver-portion"
              label="Side Receiver Portion (1 - 999)"
              variant="outlined"
              value={sideReceiverPortion}
              error={!isValidSideReceiverPortion && sideReceiverPortion !== ""}
              onChange={(e) => setSideReceiverPortion(e.target.value)}
            />

            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={!isValidSideReceiverPortion}
              onClick={() => tryCatchWrapper(updateSplitWrite)}
            >
              Update Split
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FlowSplitter;
