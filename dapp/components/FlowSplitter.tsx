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
  useFlowSplitterUpdateSplit,
  usePrepareFlowSplitterUpdateSplit,
} from "../src/generated";
import { FlowSplitter as FlowSplitterType } from "../.graphclient";
import { getAddress } from "viem";
import { isValidPortionInput, tryCatchWrapper } from "../src/helpers";

type FlowSplitterProps = Pick<
  FlowSplitterType,
  | "id"
  | "superToken"
  | "flowSplitterCreator"
  | "mainReceiver"
  | "sideReceiver"
  | "sideReceiverPortion"
  | "mainReceiverPortion"
>;

const FlowSplitter = (flowSplitter: FlowSplitterProps) => {
  const [sideReceiverPortion, setSideReceiverPortion] = useState("");
  const toPct = (x: number) => ((x / 1000) * 100).toFixed(1) + "%";

  const flowSplitterContract = {
    address: getAddress(flowSplitter.id),
    flowSplitterABI,
  };

  const isValidSideReceiverPortion = useMemo(() => {
    return isValidPortionInput(sideReceiverPortion);
  }, [sideReceiverPortion]);

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
        <TextField
          margin="normal"
          style={{ marginBottom: 10 }}
          fullWidth
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
      </CardContent>
    </Card>
  );
};

export default FlowSplitter;
