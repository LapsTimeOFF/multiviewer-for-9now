import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Checkbox,
  CircularProgress,
  Collapse,
  Stack,
  Typography
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import React, { FC, useEffect, useState } from "react";
import { SwitcherRail } from "shared/getLiveExperienceTypes";
import { Item, LiveExperienceGroup } from "shared/LXPGroupTypes";
import moment from "moment";
import useSWR from "swr";

interface Props {
  switcherRail: SwitcherRail;
  gridList: string[];
  setGridList: React.Dispatch<React.SetStateAction<string[]>>;
}

const fetchLXP = async (slug: string) => {
  const { token } = await window.mv.config.get();

  const res = await fetch(
    `https://api.9now.com.au/web/metadata/live-experience?device=web&slug=${slug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${token}`
  );

  if (!res.ok) {
    console.error(`Failed to fetch LXP data for ${slug}`);
    throw new Error("Failed to fetch LXP data");
  }

  const data = (await res.json()) as LiveExperienceGroup;
  return data;
};

const LiveEventGroup: FC<Props> = ({ switcherRail, gridList, setGridList }) => {
  const { data: LXP, isLoading } = useSWR<LiveExperienceGroup>(
    switcherRail.slug,
    fetchLXP
  );
  const [expanded, setExpanded] = useState(false);
  const [currentlyLive, setCurrentlyLive] = useState(0);
  const [nextLiveTime, setNextLiveTime] = useState("");

  useEffect(() => {
    if (!LXP || isLoading) return;

    try {
      const items = LXP.data.getLXP.promoRail.items;

      const live = items.filter((item) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const now = new Date();

        return startDate < now && endDate > now;
      });

      setCurrentlyLive(live.length);

      if (live.length === 0) {
        const next = items
          .filter((item) => new Date(item.startDate) > new Date())
          .sort((a, b) => {
            if (!a.startDate || !b.startDate) return 0;
            return (
              new Date(a.startDate ?? 0).getTime() -
              new Date(b.startDate ?? 0).getTime()
            );
          })[0];

        setNextLiveTime(next.startDate);
      }
    } catch (error) {
      console.error("Failed to parse live data", error);
    }
  }, [LXP]);

  return (
    <Card>
      <CardActionArea
        onClick={() => {
          setExpanded((prev) => !prev);
        }}
      >
        <Stack direction="row" spacing={2}>
          <CardMedia
            component="img"
            sx={{
              width: 125,
              height: 125
            }}
            image={switcherRail.switcherLogo.sizes.w320}
            alt={switcherRail.switcherLogo.alt}
          />
          <CardContent>
            <Typography variant="h4">{switcherRail.name}</Typography>

            <Typography
              variant="body1"
              color={currentlyLive > 0 ? "#00C7E1" : "#c4c4c4"}
            >
              {currentlyLive > 0
                ? `${currentlyLive} live now`
                : `Next live at ${moment(nextLiveTime).format("h:mm a")}`}
            </Typography>
          </CardContent>
        </Stack>
      </CardActionArea>
      {!LXP || isLoading ? (
        <CircularProgress />
      ) : (
        <Collapse in={expanded}>
          <CardContent>
            {LXP?.data.getLXP.promoRail.items
              .sort((a, b) => {
                if (!a.startDate || !b.startDate) return 0;
                return (
                  new Date(a.startDate ?? 0).getTime() -
                  new Date(b.startDate ?? 0).getTime()
                );
              })
              .map((item) => (
                <Stream
                  stream={item}
                  key={item.id}
                  gridList={gridList}
                  setGridList={setGridList}
                />
              ))}
          </CardContent>
        </Collapse>
      )}
    </Card>
  );
};

type StreamProps = {
  stream: Item;
  gridList: string[];
  setGridList: React.Dispatch<React.SetStateAction<string[]>>;
};

const Stream: FC<StreamProps> = ({ stream, gridList, setGridList }) => {
  const isLive = () => {
    const startDate = new Date(stream.startDate);
    const endDate = new Date(stream.endDate);
    const now = new Date();

    return startDate < now && endDate > now;
  };

  return (
    <Card
      elevation={isLive() ? 20 : 5}
      sx={{
        my: 2,
        width: "100%"
      }}
    >
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            w: 24,
            h: 24,
            pl: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Checkbox
            checked={gridList.includes(stream.slug)}
            onChange={(e) => {
              if (e.target.checked) {
                setGridList((prev) => [...prev, stream.slug]);
              } else {
                setGridList((prev) =>
                  prev.filter((slug) => slug !== stream.slug)
                );
              }
            }}
          />
        </Box>
        <CardMedia
          component="img"
          sx={{
            width: 800 / 3,
            height: 150
          }}
          image={stream.image.sizes.w320}
          alt={stream.image.alt}
        />
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              opacity: isLive() ? 1 : 0.5
            }}
          >
            {stream.name}{" "}
            <FiberManualRecordIcon
              color="error"
              sx={{
                display: isLive() ? "inline" : "none",
                pt: 0.5,
                animation: "flashLive 1.5s infinite"
              }}
            />
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: isLive() ? 1 : 0.5
            }}
          >
            {stream.description}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              opacity: isLive() ? 1 : 0.5
            }}
          >
            {moment(stream.startDate).format("h:mm a")} -{" "}
            {moment(stream.endDate).format("h:mm a")}
          </Typography>
        </CardContent>
      </Stack>
    </Card>
  );
};

export default LiveEventGroup;
