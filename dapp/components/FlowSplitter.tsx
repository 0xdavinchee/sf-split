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
  useFlowSplitterUpdateSplit,
  usePrepareFlowSplitterUpdateSplit,
} from "../src/generated";
import { FlowSplitter as FlowSplitterType } from "../.graphclient";
import { getAddress, isAddress } from "viem";
import {
  getAddressLink,
  isValidPortionInput,
  tryCatchWrapper,
} from "../src/helpers";
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
interface FlowSplitterProps {
  readonly flowSplitter: FlowSplitterPropsType;
  readonly address?: `0x${string}`;
  readonly tokenMap: Map<string, { name: string; symbol: string }>;
}

const FlowSplitter = (props: FlowSplitterProps) => {
  const { chain } = useNetwork();

  const { flowSplitter } = props;
  const [sideReceiverPortion, setSideReceiverPortion] = useState("");
  const [more, setMore] = useState(false);

  const toPct = (x: number) => ((Number(x) / 1000) * 100).toFixed(1) + "%";

  const flowSplitterContract = {
    address: isAddress(flowSplitter.id)
      ? getAddress(flowSplitter.id)
      : ("" as any),
    flowSplitterABI,
  };

  const isValidSideReceiverPortion = useMemo(() => {
    return isValidPortionInput(sideReceiverPortion);
  }, [sideReceiverPortion]);

  const validSideReceiverPortion = useMemo(() => {
    return isNaN(Number(sideReceiverPortion))
      ? BigInt(0)
      : BigInt(sideReceiverPortion);
  }, [sideReceiverPortion]);

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
            {getAddress(flowSplitter.id)}
          </Link>
        </Typography>
        <Typography variant="body2">
          Token:{" "}
          {props.tokenMap.get(flowSplitter.superToken.toLowerCase())?.symbol} |{" "}
          {props.tokenMap.get(flowSplitter.superToken.toLowerCase())?.name}
        </Typography>
        <Typography variant="body2">
          Main:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.mainReceiver, chain?.id)}
          >
            {getAddress(flowSplitter.mainReceiver)}
          </Link>{" "}
          | {toPct(flowSplitter.mainReceiverPortion)}
        </Typography>
        <Typography variant="body2">
          Side:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.sideReceiver, chain?.id)}
          >
            {getAddress(flowSplitter.sideReceiver)}
          </Link>{" "}
          | {toPct(flowSplitter.sideReceiverPortion)}
        </Typography>
        <Typography marginBottom={1} variant="body2">
          Creator:{" "}
          <Link
            target="_blank"
            href={getAddressLink(flowSplitter.flowSplitterCreator, chain?.id)}
          >
            {getAddress(flowSplitter.flowSplitterCreator)}
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
