import { Typography, Card, CardContent, ToggleButton } from "@mui/material";
import FlowSplitter, { FlowSplitterProps } from "./FlowSplitter";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useMemo, useState } from "react";

export interface FlowSplittersProps {
  readonly flowSplitters: FlowSplitterProps[];
  readonly address?: string;
}

const FlowSplitters = (props: FlowSplittersProps) => {
  const [selected, setSelected] = useState(props.address ? true : false);

  useEffect(() => {
    if (props.address) {
      setSelected(true);
    }
  }, [props.address]);

  const filteredSplitters = useMemo(() => {
    if (selected) {
      return props.flowSplitters.filter((x) => x.creator === props.address);
    } else {
      return props.flowSplitters;
    }
  }, [selected, props.flowSplitters]);

  return (
    <div style={{height: "500px"}}>
      <Typography variant="h4">Flow Splitters</Typography>
      <Card elevation={3}>
      {props.address && (
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
        )}
        <CardContent>
          <div>
            {filteredSplitters.map((x) => (
              <FlowSplitter {...x} />
            ))}
          </div>
        </CardContent>
        
      </Card>
    </div>
  );
};

export default FlowSplitters;
