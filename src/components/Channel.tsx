import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Channel as ChannelType } from "shared/catalogTypes";
import { Channel as TVChannelType } from "shared/types";

interface Props {
  channel: ChannelType;
  TVChannel: TVChannelType;
}

const Channel: FC<Props> = ({ channel, TVChannel }) => {
  // Get the current program based on the content with the first startTime
  const sortedPrograms = channel.contents.sort(
    (a, b) => a.startTime - b.startTime
  );
  const currentProgram = sortedPrograms[0];

  return (
    <Grid item>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          maxWidth: "320px",
          minHeight: "280px"
        }}
      >
        <CardActionArea
          component={Link}
          to={`/player/${channel.epgID}/${encodeURIComponent(TVChannel.WSXUrl)}`}
        >
          <Stack direction="column" gap={0}>
            <CardMedia
              component="img"
              alt={channel.Name}
              sx={{
                objectFit: "contain",
                width: "320px",
                height: "180px",
                zIndex: 1
              }}
              image={channel.URLLogoChannel}
            />
            <CardMedia
              component="img"
              alt={channel.Name}
              sx={{
                objectFit: "contain",
                width: "320px",
                height: "180px",
                position: "absolute"
              }}
              image={currentProgram.URLImage}
            />
            <CardContent>
              <Typography variant="h5">
                <b>{channel.Name}</b>
              </Typography>
              <Typography variant="body1">{currentProgram.title}</Typography>
              <Typography variant="subtitle2" color={"#c4c4c4"}>
                {currentProgram.subtitle}
              </Typography>
            </CardContent>
          </Stack>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default Channel;
