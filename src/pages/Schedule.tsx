import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import React, { useState } from "react";
import { JSONTree } from "react-json-tree";
import { GetLiveExperience, SwitcherRail } from "shared/getLiveExperienceTypes";
import { LiveExperienceGroup } from "shared/LXPGroupTypes";
import useSWR from "swr";
import { nonOlympicsSlug } from "@/components/LiveEventGroup";
import moment from "moment";
import { FiberManualRecord } from "@mui/icons-material";

const isLive = (startTime: string, endTime: string) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const now = new Date();

  return startDate < now && endDate > now;
};

const getAllAirings = async () => {
  const { token } = await window.mv.config.get();

  const lxp = (await (
    await fetch(
      `https://api.9now.com.au/web/live-experience?device=web&slug=gem&streamParams=web%2Cchrome%2Cmacos&region=nsw&offset=0&token=${token}`
    )
  ).json()) as GetLiveExperience;

  const channels: {
    channel: SwitcherRail;
    airings:
      | {
          title: string;
          startTime: string;
          endTime: string;
          slug: string;
          image: string;
          description: string;
        }[]
      | undefined;
  }[] =
    lxp.data.getLXP.switcherRail
      .filter((r) => r.type === "channel")
      .map((channel) => {
        return {
          channel: channel,
          airings: channel.airings?.map((r) => ({
            title: r.title,
            startTime: r.startDate,
            endTime: r.endDate,
            slug: channel.slug,
            image: "",
            description: ""
          }))
        };
      }) ?? [];

  const liveEventGroups: {
    channel: SwitcherRail;
    airings:
      | {
          title: string;
          startTime: string;
          endTime: string;
          slug: string;
          image: string;
          description: string;
        }[]
      | undefined;
  }[] = await Promise.all(
    lxp.data.getLXP.switcherRail
      .filter((r) => r.type === "live-event-group")
      .map(async (r) => {
        const res = await fetch(
          `https://api.9now.com.au/web/metadata/live-experience?device=web&slug=${r.slug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${token}`
        );

        if (!res.ok) {
          console.error(`Failed to fetch LXP data for ${r.slug}`);
        }

        const data = (await res.json()) as LiveExperienceGroup;

        return {
          channel: r,
          airings: data.data.getLXP.promoRail.items.map((r) => ({
            title: r.name,
            startTime: r.startDate,
            endTime: r.endDate,
            slug: r.slug,
            image: r.image.sizes.w1280,
            description: r.description
          }))
        };
      })
  );

  return [
    ...channels.sort((a, b) => {
      if (a.channel.name < b.channel.name) return -1;
      if (a.channel.name > b.channel.name) return 1;
      return 0;
    }),
    ...liveEventGroups.sort((a, b) => {
      if (a.channel.name < b.channel.name) return -1;
      if (a.channel.name > b.channel.name) return 1;
      return 0;
    })
  ];
};

const Schedule = () => {
  const { data, isLoading, error } = useSWR("allAirings", getAllAirings);
  const [olympicsFilter, setOlympicsFilter] = useState(false);
  const [todayOnly, setTodayOnly] = useState(true);

  return (
    <Box sx={{ mx: 2 }}>
      <Typography variant="h2" align="center">
        Schedule
      </Typography>

      <JSONTree data={data} />

      {isLoading && <CircularProgress />}

      {error && (
        <Alert variant="outlined" color="error">
          {error.message}
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        <FilterAltIcon />
        <FormControlLabel
          control={
            <Checkbox
              value={olympicsFilter}
              onChange={(e) => {
                setOlympicsFilter(e.target.checked);
              }}
            />
          }
          label="Show Olympics only"
        />
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked
              value={todayOnly}
              onChange={(e) => {
                setTodayOnly(e.target.checked);
              }}
            />
          }
          label="Show today only"
        />
      </Stack>

      <Box
        sx={{
          overflowX: "auto"
        }}
      >
        <Stack direction="row" spacing={2}>
          {data
            ?.filter((r) => {
              if (olympicsFilter && nonOlympicsSlug.includes(r.channel.slug)) {
                return false;
              } else {
                return true;
              }
            })
            .filter((r) => r.airings?.length)
            .filter((r) => {
              if (todayOnly) {
                const now = new Date();
                return r.airings?.some((airing) => {
                  const startTime = new Date(airing.startTime);
                  return (
                    startTime.getDate() === now.getDate() &&
                    startTime.getMonth() === now.getMonth() &&
                    startTime.getFullYear() === now.getFullYear()
                  );
                });
              }
              return true;
            })
            .map((r) => (
              <Box key={r.channel.id} sx={{ minWidth: 320 }}>
                <Card sx={{ mb: 4 }}>
                  <CardMedia
                    component="img"
                    height="320"
                    image={r.channel.switcherLogo.sizes.w1280}
                    alt={r.channel.name}
                  />
                  <Typography variant="h4" sx={{ m: 2, textAlign: "center" }}>
                    {r.channel.name}
                  </Typography>
                </Card>

                <Stack direction="column" spacing={2}>
                  {r.airings?.map((airing) => {
                    const startTime = new Date(airing.startTime);
                    if (todayOnly) {
                      const now = new Date();
                      if (
                        startTime.getDate() !== now.getDate() ||
                        startTime.getMonth() !== now.getMonth() ||
                        startTime.getFullYear() !== now.getFullYear()
                      ) {
                        return null;
                      }
                    }

                    const live = isLive(airing.startTime, airing.endTime);

                    return (
                      <Card
                        key={airing.title}
                        sx={{ minWidth: 320 }}
                        elevation={5}
                      >
                        <CardActionArea
                          disabled={!live}
                          onClick={() => {
                            window.mv.player.create(
                              `/grid/${encodeURI(JSON.stringify([airing.slug]))}`,
                              location.port,
                              [airing.slug]
                            );
                          }}
                        >
                          {airing.image !== "" && (
                            <CardMedia
                              component="img"
                              height="180"
                              image={airing.image}
                              alt={airing.title}
                            />
                          )}
                          <Typography
                            variant={"h5"}
                            sx={{ m: 2, textAlign: "center" }}
                          >
                            <b>{airing.title}</b>{" "}
                            <FiberManualRecord
                              color="error"
                              sx={{
                                display: live ? "inline" : "none",
                                pt: 0.5,
                                animation: "flashLive 1.5s infinite"
                              }}
                            />
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ m: 2, textAlign: "center" }}
                          >
                            {moment(airing.startTime).format("h:mm a")} -{" "}
                            {moment(airing.endTime).format("h:mm a")}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Schedule;
