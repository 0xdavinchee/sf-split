import { Button, Card, CardContent, Typography } from "@mui/material";
import { Account, Stream as StreamType, Token } from "../.graphclient";
import { formatEther, getAddress, isAddress } from "viem";
import {
  useCfAv1ForwarderDeleteFlow,
  usePrepareCfAv1ForwarderDeleteFlow,
} from "../src/generated";
import { CFAv1ForwarderContract } from "../src/constants";
import { tryCatchWrapper } from "../src/helpers";

type StreamProps = Pick<
  StreamType,
  "id" | "updatedAtTimestamp" | "currentFlowRate"
> & {
  token: Pick<Token, "id" | "name" | "symbol">;
  sender: Pick<Account, "id">;
  receiver: Pick<Account, "id">;
};

const Stream = (props: StreamProps) => {
  const getFormattedFlowRate = (flowRate: string) => {
    return formatEther(BigInt(flowRate));
  };

  const { config: deleteFlowConfig } = usePrepareCfAv1ForwarderDeleteFlow({
    ...CFAv1ForwarderContract,
    args: [
      isAddress(props.token.id) ? getAddress(props.token.id) : "0x",
      isAddress(props.sender.id) ? getAddress(props.sender.id) : "0x",
      isAddress(props.receiver.id) ? getAddress(props.receiver.id) : "0x",
      "0x",
    ],
  });

  const { writeAsync: deleteFlowWrite } =
    useCfAv1ForwarderDeleteFlow(deleteFlowConfig);

  return (
    <Card key={props.id} style={{ marginBottom: 10 }}>
      <CardContent>
        <Typography variant="body2">
          {props.sender.id} streaming to {props.receiver.id}
        </Typography>
        <Typography variant="body2"></Typography>
        <Typography variant="body2">
          @ {getFormattedFlowRate(props.currentFlowRate)} {props.token.symbol} /
          second
        </Typography>
        <Button
          style={{ marginTop: 10 }}
          size="small"
          variant="contained"
          color="error"
          onClick={() => tryCatchWrapper(deleteFlowWrite)}
        >
          Close Stream
        </Button>
      </CardContent>
    </Card>
  );
};

export default Stream;
