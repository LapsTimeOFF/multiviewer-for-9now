import Player from "@/components/Player";
import { Grid, Snackbar, Typography } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useParams } from "react-router-dom";

const GridPlayer = () => {
  const [open, setOpen] = useState(true);
  const [draggable, setDraggable] = useState(false);
  const [slug, setSlug] = useState<Map<string, boolean>>(new Map());
  const [numRows, setNumRows] = useState<number>(0);
  const [numCols, setNumCols] = useState<number>(0);
  const { data } = useParams<{ data: string }>();
  useHotkeys("d", () => setDraggable((prev) => !prev));

  const handleClose = () => {
    setOpen(false);
  };

  const addSlugToList = (key: string, value: boolean) => {
    setSlug((prevMap) => new Map(prevMap.set(key, value)));
  };

  useEffect(() => {
    const fetchSlugs = async () => {
      if (!data) return;
      const slugs = JSON.parse(decodeURI(data)) as string[];

      const numRows = Math.floor(Math.sqrt(slugs.length));
      const numCols = Math.ceil(slugs.length / numRows);

      slugs.forEach((slug) => addSlugToList(slug, true));

      setNumRows(numRows);
      setNumCols(numCols);
    };

    fetchSlugs();
    window.player = new Map();
  }, [data]);

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
        {Array.from(slug).map(([slug]) => (
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
