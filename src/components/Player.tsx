/* eslint-disable @typescript-eslint/no-explicit-any  */
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import axios from "axios";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "shaka-player/dist/controls.css";
import "../styles/Player.css";
import shaka from "shaka-player/dist/shaka-player.ui";
import { BrightcoveGetStream } from "shared/BrightcoveGetStream";
import { LXPStream } from "shared/LXPStream";
import Tesseract from "tesseract.js";
import { GetLiveExperience, SwitcherRail } from "shared/getLiveExperienceTypes";
import { LiveExperienceGroup } from "shared/LXPGroupTypes";
import { nonOlympicsSlug } from "./LiveEventGroup";

async function initPlayer(
  manifestUri: string,
  video: HTMLVideoElement,
  uiContainer: HTMLDivElement,
  setLoaded: (loaded: boolean) => void,
  slug: string
) {
  shaka.polyfill.installAll();

  const player = new shaka.Player();
  await player.attach(video);

  window.player?.set(slug, player);

  player.addEventListener("error", onErrorEvent);

  try {
    const ui = new shaka.ui.Overlay(player, uiContainer, video);
    ui.configure({
      overflowMenuButtons: [
        "captions",
        "quality",
        "language",
        "picture_in_picture",
        "cast",
        "playback_rate",
        "statistics"
      ],
      singleClickForPlayAndPause: false,
      doubleClickForFullscreen: false,
      enableKeyboardPlaybackControls: false
    } as shaka.extern.UIConfiguration);

    player.configure({
      streaming: {
        retryParameters: {
          timeout: 30_000, // timeout in ms, after which we abort; 0 means never
          maxAttempts: 128, // the maximum number of requests before we fail
          baseDelay: 1000, // the base delay in ms between retries
          backoffFactor: 4, // the multiplicative backoff factor between retries
          fuzzFactor: 0.5 // the fuzz factor to apply to each retry delay
        }
      }
    });

    await player.load(manifestUri);
    console.log("The video has now been loaded!");
    setLoaded(true);
  } catch (e) {
    onError(e);
  }
}

function onErrorEvent(event: any) {
  onError(event.detail);
}

function onError(error: any) {
  console.error("Error code", error.code, "object", error);
}

type Props = {
  slug: string;
};

const Player: FC<Props> = ({ slug }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElement = useRef<HTMLVideoElement>(null);
  const uiContainer = useRef<HTMLDivElement>(null);
  const [LXP, setLXP] = useState<LXPStream | null>(null);
  const [manifestUri, setManifestUri] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [programsLive, setProgramsLive] = useState<
    (SwitcherRail | undefined)[]
  >([]);
  const [eventsLive, setEventsLive] = useState<
    (
      | {
          sportName: string;
          description: string;
          displayName: string;
          endDate: string;
          id: number;
          name: string;
          slug: string;
          promoStartDate: string;
          programStartDate: any;
          programEndDate: any;
          startDate: string;
          subtitle: string;
          type: string;
          image: object;
        }
      | undefined
    )[]
  >([]);

  const fetchManifest = useCallback(async () => {
    const token = (await window.mv.config.get()).token;
    const response = await fetch(
      `https://api.9now.com.au/web/live-experience?device=web&slug=${currentSlug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${token}`
    );
    const LXP = (await response.json()) as LXPStream;

    setLXP(LXP);

    if (LXP.data.getLXP.stream.video.url) {
      return LXP.data.getLXP.stream.video.url;
    } else {
      const { data } = await axios.get<BrightcoveGetStream>(
        `https://edge.api.brightcove.com/playback/v1/accounts/4460760524001/videos/ref%3A${LXP.data.getLXP.stream.video.referenceId ?? LXP.data.getLXP.stream.video.fallbackId}`,
        {
          headers: {
            Accept:
              "application/json;pk=BCpkADawqM17uNt4BA9TibECIvv8vBVypgHHIgThenKM55b88yzwUAmQ5hHbEfpsaQCimxMfcJglqzWqPTc21Mbnt4H-49t8_htP91BPml8bDw7AjWou9m_avlno4V7DBRsuLWdpLOoUMziK"
          }
        }
      );

      const manifestUri =
        data.sources[0].src +
        "?" +
        LXP.data.getLXP.stream.video.ssai.postfixParams;

      return manifestUri;
    }
  }, [currentSlug]);

  useEffect(() => {
    if (!manifestUri || !videoElement.current || !uiContainer.current) return;

    initPlayer(
      manifestUri,
      videoElement.current,
      uiContainer.current,
      setLoaded,
      currentSlug
    );

    return () => {
      window.player?.get(currentSlug)?.destroy();
    };
  }, [manifestUri, currentSlug]);

  useEffect(() => {
    fetchManifest().then((result) => {
      setManifestUri(result);
    });
  }, [currentSlug]);

  // OCR
  useEffect(() => {
    const captureFrame = (video: HTMLVideoElement) => {
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;

      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    };

    const performOCR = async (dataUrl: string) => {
      const result = await Tesseract.recognize(dataUrl, "eng");
      const text = result.data.text;
      // Check for the presence of specific text
      if (text.includes("Want more action")) {
        await fetchProgramsLive();
        setFinished(true);
      }
    };

    const checkTextInFrame = () => {
      if (videoElement.current) {
        const frame = captureFrame(videoElement.current);

        performOCR(frame);
      }
    };

    const fetchProgramsLive = async () => {
      const config = await window.mv.config.get();

      if (!config.token) return;

      const { data } = (await (
        await fetch(
          `https://api.9now.com.au/web/live-experience?device=web&slug=gem&streamParams=web%2Cchrome%2Cmacos&region=nsw&offset=0&token=${config.token}`
        )
      ).json()) as GetLiveExperience;

      setProgramsLive(
        await Promise.all(
          data.getLXP.switcherRail.map(async (switcherRail) => {
            if (switcherRail.type === "channel") {
              const currentlyAiring = switcherRail.airings?.find((airing) => {
                const startDate = new Date(airing.startDate);
                const endDate = new Date(airing.endDate);
                const now = new Date();

                return startDate < now && endDate > now;
              });

              if (
                currentlyAiring?.title.includes("Paris") ||
                currentlyAiring?.title.includes("Olympic")
              )
                return switcherRail;

              return;
            }
          })
        )
      );

      const eventsLive: (
        | {
            sportName: string;
            description: string;
            displayName: string;
            endDate: string;
            id: number;
            name: string;
            slug: string;
            promoStartDate: string;
            programStartDate: any;
            programEndDate: any;
            startDate: string;
            subtitle: string;
            type: string;
            image: object;
          }
        | undefined
      )[] = [];

      await Promise.all(
        data.getLXP.switcherRail.map(async (switcherRail) => {
          const res = await fetch(
            `https://api.9now.com.au/web/metadata/live-experience?device=web&slug=${switcherRail.slug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${config.token}`
          );

          if (!res.ok) {
            console.error(`Failed to fetch LXP data for ${slug}`);
            throw new Error("Failed to fetch LXP data");
          }

          const group = (await res.json()) as LiveExperienceGroup;

          if (nonOlympicsSlug.includes(group.data.getLXP.promoRail.slug))
            return;

          const lives = group.data.getLXP.promoRail.items.map((stream) => {
            const currentlyAiring =
              new Date(stream.startDate) < new Date() &&
              new Date(stream.endDate) > new Date();

            return currentlyAiring
              ? {
                  ...stream,
                  sportName: group.data.getLXP.stream.display.tagline
                }
              : undefined;
          });

          eventsLive.push(...lives);
        })
      );

      setEventsLive(eventsLive);

      console.log({ programsLive, eventsLive });
    };

    const intervalId = setInterval(checkTextInFrame, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      style={{
        height: "100%",
        width: "100%"
      }}
    >
      {!loaded && (
        <Box
          sx={{
            // position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#1c1c1c",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {LXP
              ? LXP.data.getLXP.stream.display.listings[0].title
              : "Loading..."}
          </Typography>
        </Box>
      )}
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          display: loaded ? "block" : "none"
        }}
      >
        {finished && (
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(28, 28, 28, 0.8)",
              zIndex: 100,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2
            }}
          >
            <WarningIcon />
            <Typography variant="h6" sx={{ mt: 2 }}>
              It looks like this program has ended (or not started yet)! Select
              below a new program:
            </Typography>
            <FormControl
              sx={{
                maxWidth: 320
              }}
              fullWidth
            >
              <InputLabel id="demo-simple-select-label">
                Currently Live
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Currently Live"
                onChange={(e) => {
                  window.player?.get(currentSlug)?.destroy();
                  setFinished(false);
                  setLoaded(false);
                  setCurrentSlug(e.target.value as string);
                }}
              >
                {programsLive.filter((item) => item !== undefined).length >
                  0 && <MenuItem disabled>Channels</MenuItem>}
                {programsLive.map((program) => {
                  if (!program) return;

                  const alreadyOpen = window.player?.has(program.slug);

                  return (
                    <MenuItem
                      key={program.slug}
                      value={program.slug}
                      disabled={alreadyOpen}
                    >
                      {program.name} -{" "}
                      {
                        program.airings?.find((airing) => {
                          const startDate = new Date(airing.startDate);
                          const endDate = new Date(airing.endDate);
                          const now = new Date();

                          return startDate < now && endDate > now;
                        })?.title
                      }
                      {alreadyOpen ? " (already open)" : ""}
                    </MenuItem>
                  );
                })}

                {eventsLive.filter((item) => item !== undefined).length > 0 && (
                  <MenuItem disabled>Live events</MenuItem>
                )}
                {eventsLive
                  .sort((a, b) => {
                    if (!a?.sportName || !b?.sportName) return 0;
                    if (a.sportName < b.sportName) {
                      return -1;
                    }
                    if (a.sportName > b.sportName) {
                      return 1;
                    }
                    return 0;
                  })
                  .map((event) => {
                    if (!event) return;

                    const alreadyOpen = window.player?.has(event.slug);

                    return (
                      <MenuItem
                        key={event.slug}
                        value={event.slug}
                        disabled={alreadyOpen}
                      >
                        <Typography>
                          <b>{event.sportName}</b> | {event.displayName} -{" "}
                          {event.subtitle}
                          {alreadyOpen ? " (already open)" : ""}
                        </Typography>
                      </MenuItem>
                    );
                  })}

                {eventsLive.filter((item) => item !== undefined).length === 0 &&
                  programsLive.filter((item) => item !== undefined).length ===
                    0 && (
                    <MenuItem disabled>
                      Sorry! No programs are currently live...
                    </MenuItem>
                  )}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => {
                setFinished(false);
              }}
            >
              My program is not done!
            </Button>
          </Box>
        )}
        <canvas
          style={{
            display: "none"
          }}
          ref={canvasRef}
        />
        <div
          id="video-container"
          style={{
            zIndex: 2,
            height: "100%",
            width: "100%"
          }}
          ref={uiContainer}
        >
          <video
            data-shaka-player
            ref={videoElement}
            autoPlay
            muted
            style={{
              zIndex: 1,
              height: "100%",
              width: "100%",
              objectFit: "contain"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
