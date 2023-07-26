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

type StreamPropsType = Pick<
  StreamType,
  "id" | "updatedAtTimestamp" | "currentFlowRate"
> & {
  token: Pick<Token, "id" | "name" | "symbol">;
  sender: Pick<Account, "id">;
  receiver: Pick<Account, "id">;
};

interface StreamProps {
  readonly stream: StreamPropsType;
  readonly tokenMap: Map<string, { name: string; symbol: string }>;
}

const Stream = (props: StreamProps) => {
  const { chain } = useNetwork();
  const getFormattedFlowRate = (flowRate: string) => {
    return formatEther(BigInt(flowRate));
  };

  const { config: deleteFlowConfig } = usePrepareCfAv1ForwarderDeleteFlow({
    ...CFAv1ForwarderContract,
    args: [
      isAddress(props.stream.token.id)
        ? getAddress(props.stream.token.id)
        : "0x",
      isAddress(props.stream.sender.id)
        ? getAddress(props.stream.sender.id)
        : "0x",
      isAddress(props.stream.receiver.id)
        ? getAddress(props.stream.receiver.id)
        : "0x",
      "0x",
    ],
  });

  const symbol = props.tokenMap.get(
    props.stream.token.id.toLowerCase()
  )?.symbol;

  const { writeAsync: deleteFlowWrite } =
    useCfAv1ForwarderDeleteFlow(deleteFlowConfig);

  return (
    <Card key={props.stream.id} style={{ marginBottom: 10, width: 500 }}>
      <CardContent>
        <Typography variant="body2">
          You are streaming {getFormattedFlowRate(props.stream.currentFlowRate)}{" "}
          {symbol} / second to{" "}
          <Link
            target="_blank"
            href={getAddressLink(props.stream.receiver.id, chain?.id)}
          >
            {props.stream.receiver.id}
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Stream;
