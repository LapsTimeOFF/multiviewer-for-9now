/* eslint-disable @typescript-eslint/no-explicit-any  */
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import React, { FC, useEffect, useRef, useState } from "react";
import "shaka-player/dist/controls.css";
import "../styles/Player.css";
import shaka from "shaka-player/dist/shaka-player.ui";
import { BrightcoveGetStream } from "shared/BrightcoveGetStream";
import { LXPStream } from "shared/LXPStream";

async function initPlayer(
  manifestUri: string,
  video: HTMLVideoElement,
  uiContainer: HTMLDivElement,
  setLoaded: (loaded: boolean) => void
) {
  shaka.polyfill.installAll();

  const player = new shaka.Player();
  await player.attach(video);

  window.player = player;

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
  const videoElement = useRef<HTMLVideoElement>(null);
  const uiContainer = useRef<HTMLDivElement>(null);
  const [manifestUri, setManifestUri] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchManifest = async () => {
    const token = (await window.mv.config.get()).token;
    const response = await fetch(
      `https://api.9now.com.au/web/live-experience?device=web&slug=${slug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${token}`
    );
    const LXP = (await response.json()) as LXPStream;

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
  };

  useEffect(() => {
    if (!manifestUri || !videoElement.current || !uiContainer.current) return;

    initPlayer(
      manifestUri,
      videoElement.current,
      uiContainer.current,
      setLoaded
    );
  }, [manifestUri, slug]);

  useEffect(() => {
    fetchManifest().then((result) => {
      setManifestUri(result);
    });
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
            alignItems: "center"
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative"
        }}
      >
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
