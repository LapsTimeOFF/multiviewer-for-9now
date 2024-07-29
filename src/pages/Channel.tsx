/* eslint-disable @typescript-eslint/no-explicit-any */

// ? This player is Channel player

import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "shaka-player/dist/controls.css";
import shaka from "shaka-player/dist/shaka-player.ui";
import { GetLiveExperience } from "shared/getLiveExperienceTypes";

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

const Channel = () => {
  const uiContainer = useRef<HTMLDivElement>(null);
  const videoElement = useRef<HTMLVideoElement>(null);
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const fetchManifest = async () => {
      if (!videoElement.current || !uiContainer.current) return;

      const data = (await (
        await fetch(
          `https://api.9now.com.au/web/live-experience?device=web&slug=${slug}&streamParams=web%2Cchrome%2Cmacos&region=wa&offset=0&token=${(await window.mv.config.get()).token}`,
          {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "accept-encoding": "gzip, deflate, br, zstd"
            }
          }
        )
      ).json()) as GetLiveExperience;

      const manifestUri = data.data.getLXP.stream.video.url;

      initPlayer(manifestUri, videoElement.current, uiContainer.current);
    };

    fetchManifest();

    return () => {
      window.player?.destroy();
    };
  }, [slug, videoElement]);

  return (
    <div>
      <div id="video-container" ref={uiContainer}>
        <video data-shaka-player ref={videoElement} autoPlay muted />
      </div>
    </div>
  );
};

export default Channel;
