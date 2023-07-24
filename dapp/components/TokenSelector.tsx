import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { getTokensQuery } from "../.graphclient";
import { useState } from "react";

interface TokenSelectProps {
  readonly tokens?: getTokensQuery;
}

const TokenSelect = (props: TokenSelectProps) => {
  const [token, setToken] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setToken(event.target.value);
  };
  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id="select-super-token-label">Token</InputLabel>
      <Select
        labelId="select-super-token-label"
        id="select-super-token"
        value={token}
        label="Token"
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>Token</em>
        </MenuItem>
        {props.tokens?.result.map((x) => (
          <MenuItem key={x.id} value={x.id}>
            {x.symbol} | {x.name}
          </MenuItem>
        ))}
      </Select>
      {token == "" && <FormHelperText>Select a SuperToken</FormHelperText>}
    </FormControl>
  );
};

export default TokenSelect;
