import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { getAddress, isAddress } from "viem";
import { getTokensQuery } from "../.graphclient";
import TokenSelect from "./TokenSelector";
import {
  useFlowSplitterFactoryDeployFlowSplitter,
  usePrepareFlowSplitterFactoryDeployFlowSplitter,
} from "../src/generated";
import { FlowSplitterFactoryContract } from "../src/constants";
import { isValidPortionInput } from "../src/helpers";
import { useWaitForTransaction } from "wagmi";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface CreateFlowSplitterProps {
  readonly open: boolean;
  readonly address?: `0x${string}`;
  readonly tokens?: getTokensQuery;

  readonly handleClose: () => void;
}

const CreateFlowSplitter = (props: CreateFlowSplitterProps) => {
  const [token, setToken] = useState("");
  const [mainReceiver, setMainReceiver] = useState("");
  const [sideReceiver, setSideReceiver] = useState("");
  const [sideReceiverPortion, setSideReceiverPortion] = useState("");
  const [hash, setHash] = useState<`0x${string}`>("0x");

  const enabled =
    isAddress(token) &&
    isAddress(mainReceiver) &&
    isAddress(sideReceiver) &&
    isValidPortionInput(sideReceiverPortion);

  const { config: deployFlowSplitterConfig } =
    usePrepareFlowSplitterFactoryDeployFlowSplitter({
      ...FlowSplitterFactoryContract,
      args: [
        isAddress(token) ? getAddress(token) : "0x",
        isAddress(mainReceiver) ? getAddress(mainReceiver) : "0x",
        isAddress(sideReceiver) ? getAddress(sideReceiver) : "0x",
        isNaN(Number(sideReceiverPortion))
        ? BigInt(0)
        : BigInt(sideReceiverPortion),
      ],
      enabled,
    });

  const { writeAsync: deployFlowSplitterWrite } =
    useFlowSplitterFactoryDeployFlowSplitter(deployFlowSplitterConfig);

  const { data, isLoading } = useWaitForTransaction({
    hash,
    enabled: hash !== "0x",
  });

  useEffect(() => {
    if (data) {
      props.handleClose();
    }
  }, [data]);

  const isBadAddressInput = (address: string) =>
    address !== "" && !isAddress(address) && address.length === 42;

  const deployFlowSplitter = async () => {
    if (deployFlowSplitterWrite) {
      try {
        const result = await deployFlowSplitterWrite();
        setHash(result.hash);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Modal
      open={props.open}
      onClose={() => props.handleClose()}
      aria-labelledby="modal-create-flow-splitter"
      aria-describedby="modal-create-flow-splitters"
    >
      <Box sx={style}>
        <Card elevation={6}>
          <CardContent style={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h4">Create Flow Splitter</Typography>
            <TokenSelect
              tokens={props.tokens}
              selectedToken={token}
              address={props.address}
              setToken={(x) => setToken(x)}
            />
            <TextField
              style={{ marginBottom: 10 }}
              id="main-receiver"
              label="Main Receiver"
              variant="outlined"
              size="small"
              value={mainReceiver}
              error={isBadAddressInput(mainReceiver)}
              onChange={(e) => setMainReceiver(e.target.value)}
            />
            <TextField
              style={{ marginBottom: 10 }}
              id="side-receiver"
              label="Side Receiver"
              variant="outlined"
              size="small"
              value={sideReceiver}
              error={isBadAddressInput(sideReceiver)}
              onChange={(e) => setSideReceiver(e.target.value)}
            />
            <TextField
              style={{ marginBottom: 10 }}
              id="set-side-receiver-portion"
              label="Side Receiver Portion (1-999)"
              type="number"
              variant="outlined"
              size="small"
              error={
                !isValidPortionInput(sideReceiverPortion) &&
                sideReceiverPortion !== ""
              }
              value={sideReceiverPortion}
              onChange={(e) => setSideReceiverPortion(e.target.value)}
            />
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={!enabled || isLoading}
              onClick={() => deployFlowSplitter()}
            >
              {isLoading ? "Loading..." : "Create Flow Splitter"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
};

export default CreateFlowSplitter;
