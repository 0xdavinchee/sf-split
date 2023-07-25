import { Button, Card, CardContent, Link, Typography } from "@mui/material";
import { Account, Stream as StreamType, Token } from "../.graphclient";
import { formatEther, getAddress, isAddress } from "viem";
import {
  useCfAv1ForwarderDeleteFlow,
  usePrepareCfAv1ForwarderDeleteFlow,
} from "../src/generated";
import { CFAv1ForwarderContract } from "../src/constants";
import { getAddressLink, tryCatchWrapper } from "../src/helpers";
import { useNetwork } from "wagmi";

type StreamProps = Pick<
  StreamType,
  "id" | "updatedAtTimestamp" | "currentFlowRate"
> & {
  token: Pick<Token, "id" | "name" | "symbol">;
  sender: Pick<Account, "id">;
  receiver: Pick<Account, "id">;
};

const Stream = (props: StreamProps) => {
  const { chain } = useNetwork();
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
      <CardContent style={{ width: 500 }}>
        <Typography variant="body2">
          You are streaming {getFormattedFlowRate(props.currentFlowRate)}{" "}
          {props.token.symbol} / second to{" "}
          <Link
            target="_blank"
            href={getAddressLink(props.receiver.id, chain?.id)}
          >
            {props.receiver.id}
          </Link>
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
