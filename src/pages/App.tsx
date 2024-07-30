import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  Link,
  Stack,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/App.css";
import { ConfigSchema } from "shared/configType";
import { GetLiveExperience } from "../../shared/getLiveExperienceTypes";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Channel from "@/components/Channel";
import LiveEventGroup from "@/components/LiveEventGroup";
import useSWR from "swr";

const fetchLiveExperience = async () => {
  const config = await window.mv.config.get();

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

  return data;
};

function App() {
  const [token, setToken] = useState("");
  const [open, setOpen] = useState(false);
  const [liveFilter, setLiveFilter] = useState(false);
  const [olypicsFilter, setOlypicsFilter] = useState(false);
  const [gridList, setGridList] = useState<string[]>([]);

  const [config, setConfig] = useState<ConfigSchema>({});
  const { data: liveExperience, isLoading } = useSWR<
    GetLiveExperience | undefined
  >("liveExperience", fetchLiveExperience);

  useEffect(() => {
    const fetchConfig = async () => {
      const res = await window.mv.config.get();
      setConfig(res);
    };

    fetchConfig();
  }, []);

  const openGrid = async () => {
    await window.mv.player.create(
      `/grid/${encodeURI(JSON.stringify(gridList))}`,
      location.port,
      gridList
    );
    setGridList([]);
  };

  if (!config.token)
    return (
      <Container>
        <Box
          sx={{
            // Center on screen the login form
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            height: "100vh"
          }}
        >
          <Typography variant="h2" textAlign={"center"}>
            Welcome to MultiViewer for 9NOW
          </Typography>
          <Typography>
            To obtain your token go to{" "}
            <Link
              sx={{
                cursor: "pointer"
              }}
              onClick={(e) => {
                e.preventDefault();
                window.mv["9now"].openWebsite();
              }}
            >
              https://www.9now.com.au/
            </Link>
            , login on the website, then open the DevTools (CTRL+Shift+I),
            select the `Console` tab, and type{" "}
            <code>
              copy(JSON.parse(localStorage.getItem(&apos;_nine_token&apos;)).token)
            </code>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(
                  `copy(JSON.parse(localStorage.getItem('_nine_token')).token)`
                );
              }}
            >
              <ContentCopyIcon />
            </IconButton>
            , then paste the token here:
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
            onClick={async () => {
              window.mv.config.set("token", token);
              setOpen(true);

              await new Promise((resolve) => setTimeout(resolve, 2000));

              window.location.reload();
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
            }}
            message="Token saved."
          />
        </Box>
      </Container>
    );

  if (isLoading || !liveExperience || !config) {
    return (
      <Container>
        <Typography variant="h2">
          Loading... <CircularProgress />
        </Typography>
      </Container>
    );
  }

  return (
    <>
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
          <Stack direction="row" spacing={2}>
            <FilterAltIcon />
            <FormControlLabel
              control={
                <Checkbox
                  value={liveFilter}
                  onChange={(e) => {
                    setLiveFilter(e.target.checked);
                  }}
                />
              }
              label="Show live only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={olypicsFilter}
                  onChange={(e) => {
                    setOlypicsFilter(e.target.checked);
                  }}
                />
              }
              label="Show Olympics only"
            />
          </Stack>

          <Box
            sx={{
              width: "100%"
            }}
          >
            <Button
              variant="contained"
              onClick={openGrid}
              sx={{
                width: "96%"
              }}
            >
              Open selected grid
            </Button>
            <IconButton
              onClick={() => {
                setGridList([]);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

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
            .map((r) => (
              <Channel
                channel={r}
                key={r.id}
                gridList={gridList}
                setGridList={setGridList}
                olympicsFilter={olypicsFilter}
              />
            ))}

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
              <LiveEventGroup
                switcherRail={r}
                key={r.id}
                gridList={gridList}
                setGridList={setGridList}
                liveFilter={liveFilter}
                olympicsFilter={olypicsFilter}
              />
            ))}

          <Box
            sx={{
              width: "100%",
              mb: 2
            }}
          >
            <Button
              variant="contained"
              onClick={openGrid}
              sx={{
                width: "96%"
              }}
            >
              Open selected grid
            </Button>
            <IconButton
              onClick={() => {
                setGridList([]);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default App;
