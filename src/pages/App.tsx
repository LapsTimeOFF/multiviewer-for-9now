import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  Grid,
  Snackbar,
  TextField,
  Typography
} from "@mui/material";
import "../styles/App.css";
import { Channel as ChannelType, ConfigSchema, OutData } from "shared/types";
import Channel from "@/components/Channel";
import { Channel as CatalogChannels } from "shared/catalogTypes";

function App() {
  const [passToken, setPassToken] = useState("");
  const [userKeyId, setUserKeyId] = useState("");
  const [deviceKeyId, setDeviceKeyId] = useState("");
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ConfigSchema>({});
  const [loading, setLoading] = useState(true);
  const [initTV, setInitTV] = useState<OutData | undefined>(undefined);
  const [categories, setCategories] = useState<
    | {
        id: string;
        displayName: string;
        url: string;
        adult?: boolean;
      }[]
    | undefined
  >(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [channelsInCategory, setChannelsInCategory] = useState<
    CatalogChannels[]
  >([]);
  const [channels, setChannels] = useState<ChannelType[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      const res = await window.mv.config.get();
      setConfig(res);
      setLoading(false);
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!category) return;
    if (!config.RMUToken) return;

    const fetchChannels = async () => {
      const res = await window.mv.mycanal.getCatalog(
        categories?.find((r) => r.id === category)?.url
      );

      if (!res.channels) return;

      setChannelsInCategory(res.channels);
    };

    fetchChannels();
  }, [category, config.RMUToken]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!config.RMUToken) return;
      const res = await window.mv.mycanal.getCatalog();

      setCategories(
        res.rubriques?.map((r) => ({
          id: r.idRubrique,
          displayName: r.displayName,
          url: r.URLPage,
          adult: r.adult
        }))
      );
    };

    fetchCategories();
  }, [config.RMUToken]);

  useEffect(() => {
    const fetchInitTV = async () => {
      if (!config.passToken) return;
      const res = await window.mv.mycanal.initLiveTV(config.passToken);
      setInitTV(res);

      if (!res) {
        // passToken expired
        window.mv.config.remove("passToken");
        setConfig({ ...config, passToken: undefined });
        return;
      }

      const channelGroup = res.PDS.ChannelsGroups.ChannelsGroup;
      const channels = channelGroup.map((g) => g.Channels).flat();
      setChannels(channels);

      window.mv.config.set("RMUToken", res.RMUToken);
      window.mv.config.set("LiveToken", res.LiveToken);
    };

    fetchInitTV();
  }, [config.passToken]);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  if (!config.passToken || !config.userKeyId || !config.deviceKeyId)
    return (
      <>
        <TextField
          label="passToken"
          variant="outlined"
          value={passToken}
          onChange={(e) => {
            setPassToken(e.target.value);
          }}
        />
        <TextField
          label="oneplayer:user:usr"
          variant="outlined"
          value={userKeyId}
          onChange={(e) => {
            setUserKeyId(e.target.value);
          }}
        />
        <TextField
          label="oneplayer:user:dev"
          variant="outlined"
          value={deviceKeyId}
          onChange={(e) => {
            setDeviceKeyId(e.target.value);
          }}
        />
        <Button
          onClick={() => {
            window.mv.config.set("passToken", passToken);
            window.mv.config.set("userKeyId", userKeyId);
            window.mv.config.set("deviceKeyId", deviceKeyId);
            handleClick();
          }}
          variant="outlined"
          color="success"
        >
          Save
        </Button>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message="Token saved."
        />{" "}
      </>
    );

  if (loading || !initTV || !categories) {
    return (
      <Container>
        <Typography variant="h2">
          Loading... <CircularProgress />
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h2">App</Typography>

      <ButtonGroup variant="text">
        {categories
          .filter((r) => {
            // remove adult category and Favoris
            return !r.adult && r.displayName !== "Favoris";
          })
          .map((c) => (
            <Button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
              }}
            >
              {c.displayName}
            </Button>
          ))}
      </ButtonGroup>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 2
        }}
      >
        <Grid container spacing={2}>
          {channelsInCategory &&
            channelsInCategory.length > 0 &&
            channelsInCategory.map((channel) => {
              const TVChannel = channels.find(
                (c) => c.EpgId === channel.epgID.toString()
              );

              if (!TVChannel) {
                console.log(`no TVChannel found for ${channel.Name}`);
                return;
              }

              return (
                <Channel
                  key={channel.epgID}
                  channel={channel}
                  TVChannel={TVChannel}
                />
              );
            })}
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
