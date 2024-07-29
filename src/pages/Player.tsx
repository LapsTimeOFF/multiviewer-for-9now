/* eslint-disable @typescript-eslint/no-explicit-any */

// ? This player is the live-event-group player

import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
// @ts-expect-error Types are just non existant
import muxjs from "mux.js";
import "shaka-player/dist/controls.css";
import shaka from "shaka-player/dist/shaka-player.ui.debug";
import { BrightcoveGetStream } from "shared/BrightcoveGetStream";
import { LXPStream } from "shared/LXPStream";

async function initPlayer(manifestUri: string, video: HTMLVideoElement) {
  shaka.polyfill.installAll();

  shaka.dependencies.add(shaka.dependencies.Allowed.muxjs, muxjs);

  const player = new shaka.Player();
  await player.attach(video);

  window.player = player;

  player.addEventListener("error", onErrorEvent);

  try {
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
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const fetchManifest = async () => {
      if (!videoElement.current) return;

      const LXP = (await (
        await fetch(
          `https://api.9now.com.au/web/live-experience?device=web&slug=${slug}&streamParams=web%2Cchrome%2Cmacos&region=act&offset=0&token=${(await window.mv.config.get()).token}`
        )
      ).json()) as LXPStream;

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

      console.log(manifestUri);

      initPlayer(manifestUri, videoElement.current);
    };

    fetchManifest();
  }, [slug, videoElement]);

  return (
    <div>
      <video controls ref={videoElement} autoPlay />
    </div>
  );
};

export default Player;
