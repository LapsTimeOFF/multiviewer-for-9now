import {
  Box,
  Card,
  Checkbox,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  CardActionArea
} from "@mui/material";
import moment from "moment";
import React, { FC } from "react";
import { SwitcherRail } from "shared/getLiveExperienceTypes";

interface Props {
  channel: SwitcherRail;
  gridList: string[];
  setGridList: React.Dispatch<React.SetStateAction<string[]>>;
  olympicsFilter: boolean;
}

const Channel: FC<Props> = ({
  channel,
  gridList,
  setGridList,
  olympicsFilter
}) => {
  const currentAiring = channel.airings?.find(
    (a) =>
      new Date(a.startDate) < new Date() && new Date(a.endDate) > new Date()
  );

  if (
    !(
      currentAiring?.title.includes("Olympic") ||
      currentAiring?.title.includes("Paris")
    ) &&
    olympicsFilter
  )
    return;

  return (
    <Card>
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
            checked={gridList.includes(channel.slug)}
            onChange={(e) => {
              if (e.target.checked) {
                setGridList((prev) => [...prev, channel.slug]);
              } else {
                setGridList((prev) =>
                  prev.filter((slug) => slug !== channel.slug)
                );
              }
            }}
          />
        </Box>
        <CardActionArea
          onClick={() => {
            window.mv.player.create(
              `/grid/${encodeURI(JSON.stringify([channel.slug]))}`,
              location.port,
              [channel.slug]
            );
          }}
        >
          <Stack direction="row" spacing={2}>
            <CardMedia
              component="img"
              sx={{
                width: 125,
                height: 125
              }}
              image={channel.switcherLogo.sizes.w768}
              alt={channel.switcherLogo.alt}
            />
            <CardContent>
              <Typography variant="h4">{channel.name}</Typography>
              <Typography variant="body1">
                {currentAiring?.title || "No current airing"}
              </Typography>
              <Typography variant="subtitle2" color="#c4c4c4">
                {moment(currentAiring?.startDate).format("h:mm a")} -{" "}
                {moment(currentAiring?.endDate).format("h:mm a")}
              </Typography>
            </CardContent>
          </Stack>
        </CardActionArea>
      </Stack>
    </Card>
  );
};

export default Channel;
