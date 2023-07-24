import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

export interface FlowSplitterProps {
  readonly id: string;
  readonly token: string;
  readonly mainReceiver: string;
  readonly sideReceiver: string;
  readonly mainReceiverPortion: number;
  readonly sideReceiverPortion: number;
  readonly creator: string;
}

const FlowSplitter = (props: FlowSplitterProps) => {
  const toPct = (x: number) => ((x / 1000) * 100).toFixed(1) + "%";

  return (
    <Card key={props.id} style={{ marginBottom: 10 }}>
      <CardContent>
        <Typography variant="body1">Token: {props.token}</Typography>
        <Typography variant="body1">
          Main: {props.mainReceiver} | {toPct(props.mainReceiverPortion)}
        </Typography>
        <Typography variant="body1">
          Side: {props.sideReceiver} | {toPct(props.sideReceiverPortion)}
        </Typography>
        <Typography variant="body1">
          Creator: {props.creator}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FlowSplitter;
