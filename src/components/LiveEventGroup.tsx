import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
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

const LiveEventGroup: FC<Props> = ({ switcherRail }) => {
  const { data: LXP, isLoading } = useSWR<LiveExperienceGroup>(
    switcherRail.slug,
    fetchLXP
  );
  const [expanded, setExpanded] = useState(false);
  const [currentlyLive, setCurrentlyLive] = useState(0);
  const [nextLiveTime, setNextLiveTime] = useState("");

  useEffect(() => {
    if (!LXP || isLoading) return;

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
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        })[0];

      setNextLiveTime(next.startDate);
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
            {LXP?.data.getLXP.promoRail.items.map((item) => (
              <Stream stream={item} key={item.id} />
            ))}
          </CardContent>
        </Collapse>
      )}
    </Card>
  );
};

type StreamProps = {
  stream: Item;
};

const Stream: FC<StreamProps> = ({ stream }) => {
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
      <CardActionArea
        onClick={() => {
          window.mv.player.create(`/player/${stream.slug}`, location.port);
        }}
      >
        <Stack direction="row" spacing={2}>
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
      </CardActionArea>
    </Card>
  );
};

export default LiveEventGroup;
