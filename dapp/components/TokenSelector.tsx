import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { erc20ABI } from "wagmi";
import { getTokensQuery } from "../.graphclient";
import { useErc20BalanceOf } from "../src/generated";
import { formatEther, getAddress, isAddress } from "viem";

interface TokenSelectProps {
  readonly tokens?: getTokensQuery;
  readonly selectedToken: string;
  readonly address?: `0x${string}`;
  readonly setToken: (token: string) => void;
}

const TokenSelect = (props: TokenSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    props.setToken(event.target.value);
  };

  const tokenContract = {
    address: isAddress(props.selectedToken)
      ? getAddress(props.selectedToken)
      : ("" as any),
    erc20ABI,
  };

  const { data, isFetchedAfterMount } = useErc20BalanceOf({
    ...tokenContract,
    args: [props.address ? props.address : "0x"],
    enabled: props.address && isAddress(props.address),
  });

  return (
    <FormControl sx={{ m: 1 }}>
      <InputLabel id="select-super-token-label">Token</InputLabel>
      <Select
        labelId="select-super-token-label"
        id="select-super-token"
        value={props.selectedToken}
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
      {isFetchedAfterMount && data != null && props.selectedToken !== "" && (
        <FormHelperText>
          Token Balance: {Number(formatEther(data, "wei")).toFixed(6)}
        </FormHelperText>
      )}
      {props.selectedToken == "" && (
        <FormHelperText>Select a SuperToken</FormHelperText>
      )}
    </FormControl>
  );
};

export default TokenSelect;
