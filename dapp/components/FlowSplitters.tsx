import { Typography, Card, CardContent, Button } from "@mui/material";
import FlowSplitter from "./FlowSplitter";
import { getFlowSplittersQuery } from "../.graphclient";

export interface FlowSplittersProps {
  readonly address?: `0x${string}`;
  readonly flowSplitters?: getFlowSplittersQuery;
  readonly tokenMap: Map<string, { name: string; symbol: string }>;
  readonly openModal: () => void;
}

const FlowSplitters = (props: FlowSplittersProps) => {
  return (
    <div>
      <Typography marginBottom={1} variant="h4">
        Flow Splitters
      </Typography>
      <Card elevation={3}>
        <CardContent>
          {props.flowSplitters?.result?.length === 0 ? (
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
              {props.flowSplitters?.result.map((x) => (
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
