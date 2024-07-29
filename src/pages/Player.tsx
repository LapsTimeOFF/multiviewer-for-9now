/* eslint-disable @typescript-eslint/no-explicit-any  */
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "shaka-player/dist/controls.css";
import shaka from "shaka-player/dist/shaka-player.ui.debug";
import { BrightcoveGetStream } from "shared/BrightcoveGetStream";
import { LXPStream } from "shared/LXPStream";

async function initPlayer(
  manifestUri: string,
  video: HTMLVideoElement,
  uiContainer: HTMLDivElement
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

const Player = () => {
  const videoElement = useRef<HTMLVideoElement>(null);
  const uiContainer = useRef<HTMLDivElement>(null);
  const [manifestUri, setManifestUri] = useState<string | null>(null);
  const { slug } = useParams<{ slug: string }>();

  const fetchManifest = async () => {
    const token = (await window.mv.config.get()).token;
    const response = await fetch(
      `https://api.9now.com.au/web/live-experience?device=web&slug=${slug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${token}`
    );
    const LXP = (await response.json()) as LXPStream;

    console.log(LXP);

    const { data } = await axios.get<BrightcoveGetStream>(
      `https://edge.api.brightcove.com/playback/v1/accounts/4460760524001/videos/ref%3A${LXP.data.getLXP.stream.video.referenceId ?? LXP.data.getLXP.stream.video.fallbackId}`,
      {
        headers: {
          Accept:
            "application/json;pk=BCpkADawqM17uNt4BA9TibECIvv8vBVypgHHIgThenKM55b88yzwUAmQ5hHbEfpsaQCimxMfcJglqzWqPTc21Mbnt4H-49t8_htP91BPml8bDw7AjWou9m_avlno4V7DBRsuLWdpLOoUMziK"
        }
      }
    );

    console.log(data, LXP);

    const manifestUri =
      data.sources[0].src +
      "?" +
      LXP.data.getLXP.stream.video.ssai.postfixParams;

    return manifestUri;
  };

  useEffect(() => {
    if (!manifestUri || !videoElement.current || !uiContainer.current) return;

    initPlayer(manifestUri, videoElement.current, uiContainer.current);
  }, [manifestUri, slug]);

  useEffect(() => {
    fetchManifest().then((result) => {
      setManifestUri(result);
    });
  }, []);

  return (
    <div>
      <div id="video-container" ref={uiContainer}>
        <video data-shaka-player ref={videoElement} autoPlay muted />
      </div>
    </div>
  );
};

export default Player;
