import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Snackbar,
  TextField,
  Typography
} from "@mui/material";
import "../styles/App.css";
import { ConfigSchema } from "shared/configType";
import { GetLiveExperience } from "../../shared/getLiveExperienceTypes";
import Channel from "@/components/Channel";
import LiveEventGroup from "@/components/LiveEventGroup";

function App() {
  const [token, setToken] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState<ConfigSchema>({});
  const [liveExperience, setLiveExperience] = useState<GetLiveExperience>();

  useEffect(() => {
    const fetchConfig = async () => {
      const res = await window.mv.config.get();
      setConfig(res);

      setLoading(false);
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchLiveExperience = async () => {
      if (!config.token) return;

      const data = (await (
        await fetch(
          `https://api.9now.com.au/web/live-experience?device=web&slug=gem&streamParams=web%2Cchrome%2Cmacos&region=nsw&offset=0&token=${config.token}`
        )
      ).json()) as GetLiveExperience;

      console.log(data);

      if (!data.data) {
        window.mv.config.set("token", "");
        window.location.reload();
      }

      setLiveExperience(data);
    };

    fetchLiveExperience();
  }, [config.token]);

  if (!config.token)
    return (
      <Container>
        <Typography>
          To obtain your token go to https://www.9now.com.au/, open dev tools,
          go to the localStorage and found the key &quot;_nine_token&quot;, copy
          the key &quot;token&quot; in it and paste it below.
        </Typography>
        <TextField
          label="token"
          variant="outlined"
          value={token}
          fullWidth
          onChange={(e) => {
            setToken(e.target.value);
          }}
        />
        <Button
          onClick={() => {
            window.mv.config.set("token", token);
            setOpen(true);
          }}
          variant="outlined"
          fullWidth
          color="success"
        >
          Save
        </Button>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={(event: React.SyntheticEvent | Event, reason?: string) => {
            if (reason === "clickaway") {
              return;
            }

            setOpen(false);
            location.reload();
          }}
          message="Token saved."
        />{" "}
      </Container>
    );

  if (loading || !liveExperience) {
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
      <Typography variant="h3" textAlign={"center"}>
        Welcome back!
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 2
        }}
      >
        {liveExperience?.data.getLXP.switcherRail
          .filter((r) => r.type === "channel")
          .sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })
          .map((r) => <Channel channel={r} key={r.id} />)}

        {liveExperience?.data.getLXP.switcherRail
          .filter((r) => r.type === "live-event-group")
          .sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })
          .map((r) => (
            <LiveEventGroup switcherRail={r} key={r.id} config={config} />
          ))}
      </Box>
    </Container>
  );
}

export default App;
