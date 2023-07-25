import { Card, CardContent, Typography } from "@mui/material";
import { getStreamsQuery } from "../.graphclient";
import Stream from "./Stream";

interface StreamsProps {
  readonly streams?: getStreamsQuery;
}

const Streams = (props: StreamsProps) => {
  return (
    <div style={{ marginTop: 15 }}>
      <Typography marginBottom={1} variant="h4">Open Streams</Typography>
      <Card elevation={6}>
        <CardContent>
          {props.streams?.result.length === 0 ? (
            <div>
              <Typography color="GrayText" variant="body2">
                You don&apos;t have any streams to Flow Splitters created via this
                factory.
              </Typography>
            </div>
          ) : (
            <div>
              {props.streams?.result.map((x) => (
                <Stream key={x.id} {...x} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Streams;
