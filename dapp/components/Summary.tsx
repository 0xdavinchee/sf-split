import { Paper, Typography } from "@mui/material";

const Summary = () => {
  return (
    <Paper elevation={3} style={{ marginTop: 10, padding: 10 }}>
      <Typography maxWidth={420} marginY={0.5} variant="body2">
        This is a demo app which allows you to deploy Flow Splitter Smart
        Contracts using the Flow Splitter Factory.
      </Typography>
      <Typography maxWidth={420} marginY={0.5} variant="body2">
        You can also view your deployed Flow Splitters and any streams opened to
        your deployed Flow Splitter.
      </Typography>
      <Typography maxWidth={420} marginY={0.5} variant="body2">
        Lastly, you can modify the side receiver portions of your deployed Flow
        Splitters.
      </Typography>
    </Paper>
  );
};

export default Summary;