import Player from "@/components/Player";
import { Grid, Snackbar, Typography } from "@mui/material";
import React, { FC, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const GridPlayer = () => {
  const [open, setOpen] = useState(true);
  const [draggable, setDraggable] = useState(false);
  useHotkeys("d", () => setDraggable((prev) => !prev));

  const handleClose = () => {
    setOpen(false);
  };

  const slugs = [
    "gem",
    // "go",
    "event-clyqisxa2000z0glelo3pdvmn",
    "event-clyqisx6h00140glkl9ybny6f",
    "event-clyqisx6m00130gqvsfhjh7it",
    "event-clyqisx71000w0htkp0he72at"
  ];
  const numRows = Math.floor(Math.sqrt(slugs.length));
  const numCols = Math.ceil(slugs.length / numRows);

  return (
    <>
      <Grid
        container
        spacing={0}
        sx={{
          height: "100vh",
          width: "100vw"
        }}
      >
        {draggable && (
          <div className="draggable">
            <Typography variant="h3">Move mode</Typography>
            <Typography variant="body1">
              Press <code>d</code> again to disable the move mode.
            </Typography>
          </div>
        )}
        {slugs.map((slug) => (
          <PlayerSlot
            key={slug}
            slug={slug}
            numRows={numRows}
            numCols={numCols}
          />
        ))}
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={15000}
        onClose={handleClose}
        message="Press `d` to enable move mode"
      />
    </>
  );
};

type Props = {
  slug: string;
  numRows: number;
  numCols: number;
};

export const PlayerSlot: FC<Props> = ({ slug, numRows, numCols }) => {
  return (
    <Grid
      item
      sx={{
        height: `${100 / numRows}%`,
        width: `${100 / numCols}%`,
        padding: 0,
        margin: 0
      }}
    >
      <Player slug={slug} />
    </Grid>
  );
};

export default GridPlayer;
