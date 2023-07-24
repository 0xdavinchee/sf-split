import { useState } from "react";
import { Card, CardContent, TextField, Typography } from "@mui/material";
import { isAddress } from "viem";
import { getTokensQuery } from "../.graphclient";
import TokenSelect from "./TokenSelector";

interface CreateFlowSplitterProps {
  readonly tokens?: getTokensQuery;
}

const CreateFlowSplitter = (props: CreateFlowSplitterProps) => {
  const [token, setToken] = useState("");
  const [mainReceiver, setMainReceiver] = useState("");
  const [sideReceiver, setSideReceiver] = useState("");
  const [sideReceiverPortion, setSideReceiverPortion] = useState("500");

  const isBadAddressInput = (address: string) =>
    address !== "" && !isAddress(address) && address.length === 42;

  const isBadPortionInput = (portion: string) =>
    portion !== "" && (Number(portion) < 1 || Number(portion) > 999);

  // TODO: include the create flow splitter factory hook in here

  return (
    <Card>
      <CardContent style={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h4">Create Flow Splitter</Typography>
        <TokenSelect tokens={props.tokens} />
        <TextField
          id="main-receiver"
          label="Main Receiver"
          variant="outlined"
          value={mainReceiver}
          error={isBadAddressInput(mainReceiver)}
          onChange={(e) => setMainReceiver(e.target.value)}
        />
        <TextField
          id="side-receiver"
          label="Side Receiver"
          variant="outlined"
          value={sideReceiver}
          error={isBadAddressInput(sideReceiver)}
          onChange={(e) => setSideReceiver(e.target.value)}
        />
        <TextField
          id="side-receiver-portion"
          label="Side Receiver Portion (1-999)"
          type="number"
          variant="outlined"
          error={isBadPortionInput(sideReceiverPortion)}
          value={sideReceiverPortion}
          onChange={(e) => setSideReceiverPortion(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};

export default CreateFlowSplitter;
