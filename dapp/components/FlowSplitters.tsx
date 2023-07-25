import {
  Typography,
  Card,
  CardContent,
  Button,
  ToggleButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FlowSplitter from "./FlowSplitter";
import { getFlowSplittersQuery } from "../.graphclient";
import { useMemo, useState } from "react";

export interface FlowSplittersProps {
  readonly address?: `0x${string}`;
  readonly flowSplitters?: getFlowSplittersQuery;
  readonly tokenMap: Map<string, { name: string; symbol: string }>;
  readonly openModal: () => void;
}

const FlowSplitters = (props: FlowSplittersProps) => {
  const [selected, setSelected] = useState(false);
  const filteredSplitters = useMemo(() => {
    if (selected) {
      return props.flowSplitters?.result.filter(
        (x) => x.flowSplitterCreator === props.address
      );
    } else {
      return props.flowSplitters?.result;
    }
  }, [selected, props.flowSplitters]);

  return (
    <div>
      <Typography marginBottom={1} variant="h4">
        Flow Splitters
      </Typography>
      <Card elevation={3}>
        <CardContent>
          {props.flowSplitters?.result.length === 0 ? (
            <div>
              <Typography color="GrayText" variant="body2">
                There are no flow splitters to display.
              </Typography>
              <Button
                style={{ marginTop: 10 }}
                variant="outlined"
                color="primary"
                onClick={() => props.openModal()}
              >
                Create a Flow Splitter
              </Button>
            </div>
          ) : (
            <div>
              <CardContent>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ToggleButton
                    value="check"
                    selected={selected}
                    onChange={() => {
                      setSelected(!selected);
                    }}
                  >
                    <CheckIcon fontSize="small" />
                  </ToggleButton>
                  <Typography marginLeft={1} variant="body1">
                    Only display my deployed flow splitters
                  </Typography>
                </div>
              </CardContent>
              {filteredSplitters?.map((x) => (
                <FlowSplitter
                  key={x.id}
                  address={props.address}
                  flowSplitter={x}
                  tokenMap={props.tokenMap}
                />
              ))}
              <Button
                style={{ marginTop: 10 }}
                variant="outlined"
                color="primary"
                onClick={() => props.openModal()}
              >
                Create a Flow Splitter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlowSplitters;
