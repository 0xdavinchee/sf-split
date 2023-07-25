import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import {
  flowSplitterABI,
  useCfAv1ForwarderCreateFlow,
  useCfAv1ForwarderGetFlowrate,
  useCfAv1ForwarderUpdateFlow,
  useFlowSplitterUpdateSplit,
  usePrepareCfAv1ForwarderCreateFlow,
  usePrepareCfAv1ForwarderUpdateFlow,
  usePrepareFlowSplitterUpdateSplit,
} from "../src/generated";
import { FlowSplitter as FlowSplitterType } from "../.graphclient";
import { getAddress, isAddress } from "viem";
import { isValidPortionInput, tryCatchWrapper } from "../src/helpers";
import { CFAv1ForwarderContract } from "../src/constants";

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
}

const FlowSplitter = (props: FlowSplitterProps) => {
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

  const { data, isFetchedAfterMount } = useCfAv1ForwarderGetFlowrate({
    ...CFAv1ForwarderContract,
    args: [
      getAddress(flowSplitter.superToken),
      props.address && isAddress(props.address)
        ? getAddress(props.address)
        : "0x",
      getAddress(flowSplitter.id),
    ],
    // watch: true,
  });

  const modifyFlowArgs = [
    isAddress(flowSplitter.superToken)
      ? getAddress(flowSplitter.superToken)
      : "0x",
    props.address && isAddress(props.address)
      ? getAddress(props.address)
      : "0x",
    isAddress(flowSplitter.id) ? getAddress(flowSplitter.id) : "0x",
    isNaN(Number(flowRate)) ? BigInt(0) : BigInt(flowRate),
    "0x",
  ] as ModifyFlowArgsType;

  const { config: createFlowConfig } = usePrepareCfAv1ForwarderCreateFlow({
    ...CFAv1ForwarderContract,
    args: modifyFlowArgs,
    enabled: more && isValidFlowRate && Number(data) === 0,
  });
  const { writeAsync: createFlowWrite } =
    useCfAv1ForwarderCreateFlow(createFlowConfig);

  const { config: updateFlowConfig } = usePrepareCfAv1ForwarderUpdateFlow({
    ...CFAv1ForwarderContract,
    args: modifyFlowArgs,
    enabled: more && isValidFlowRate && Number(data) > 0,
  });
  const { writeAsync: updateFlowWrite } =
    useCfAv1ForwarderUpdateFlow(updateFlowConfig);

  const handleStreamToFlowSplitter = async () => {
    if (data == null) return;

    if (Number(data) === 0) {
      await tryCatchWrapper(createFlowWrite);
    } else {
      await tryCatchWrapper(updateFlowWrite);
    }
  };

  const { config: updateSplitConfig } = usePrepareFlowSplitterUpdateSplit({
    ...flowSplitterContract,
    args: [
      isNaN(Number(sideReceiverPortion))
        ? BigInt(0)
        : BigInt(sideReceiverPortion),
    ],
    enabled: isValidSideReceiverPortion,
  });

  const { writeAsync: updateSplitWrite } =
    useFlowSplitterUpdateSplit(updateSplitConfig);

  return (
    <Card key={flowSplitter.id} style={{ marginBottom: 10 }}>
      <CardContent>
        <Typography variant="body2">Address: {flowSplitter.id}</Typography>
        <Typography variant="body2">
          Token: {flowSplitter.superToken}
        </Typography>
        <Typography variant="body2">
          Main: {flowSplitter.mainReceiver} |{" "}
          {toPct(flowSplitter.mainReceiverPortion)}
        </Typography>
        <Typography variant="body2">
          Side: {flowSplitter.sideReceiver} |{" "}
          {toPct(flowSplitter.sideReceiverPortion)}
        </Typography>
        <Typography marginBottom={1} variant="body2">
          Creator: {flowSplitter.flowSplitterCreator}
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
              error={!isValidFlowRate && flowRate !== ""}
              onChange={(e) => setFlowRate(e.target.value)}
            />

            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={!isValidFlowRate}
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
              label="Side Receiver Portion (1-999)"
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
