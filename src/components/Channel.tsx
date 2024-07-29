import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Typography
} from "@mui/material";
import moment from "moment";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { SwitcherRail } from "shared/getLiveExperienceTypes";

interface Props {
  channel: SwitcherRail;
}

const Channel: FC<Props> = ({ channel }) => {
  const currentAiring = channel.airings?.find(
    (a) =>
      new Date(a.startDate) < new Date() && new Date(a.endDate) > new Date()
  );

  return (
    <Card>
      <CardActionArea component={Link} to={`/channel/${channel.slug}`}>
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
    </Card>
  );
};

export default Channel;
