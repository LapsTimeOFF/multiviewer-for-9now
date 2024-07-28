/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import RxPlayer from "rx-player";
import { useParams } from "react-router-dom";
import { ConfigSchema, ManifestList } from "shared/types";
import axios from "axios";

export function bytesToStr(bytes: Uint8Array): string {
  return String.fromCharCode.apply(null, bytes as unknown as number[]);
}

async function initPlayer(
  manifestURL: string,
  config: ConfigSchema,
  epgId: string,
  videoElement: HTMLVideoElement
) {
  if (!videoElement) return;

  if (window.player) {
    console.log("Disposing previous player instance");
    window.player.dispose();
    window.player = null;
  }

  console.log("Initializing new player instance");
  const player = new RxPlayer({
    videoElement
  });

  // Attaching the player instance to the window for debugging purposes
  window.player = player;

  const getLicense = async (challenge: Uint8Array) => {
    console.log("Received Widevine Challenge (Uint8Array):", challenge);

    const challengeStr = bytesToStr(challenge);
    console.log("Converted Widevine Challenge (String):", challengeStr);
    console.log("Converted Widevine Challenge (Base64):", btoa(challengeStr));

    const body = {
      ServiceRequest: {
        InData: {
          EpgId: epgId,
          LiveToken: config.LiveToken,
          UserKeyId: config.userKeyId,
          DeviceKeyId: config.deviceKeyId,
          ChallengeInfo: btoa(challengeStr),
          Mode: "MKPL"
        }
      }
    };

    const res = await axios.post(
      "https://ltv.slc-app-aka.prod.bo.canal.canalplustech.pro/api/V4/zones/cpfra/devices/31/apps/1/jobs/GetLicence",
      body
    );

    if (res.data.ServiceResponse.Status !== "0") {
      throw new Error("Failed to get license");
    }

    console.log("Successfully received license");
    return res.data.ServiceResponse.OutData.LicenseInfo;
  };

  try {
    player.loadVideo({
      url: manifestURL,
      transport: "dash",
      autoPlay: false,
      keySystems: [
        {
          type: "widevine",
          getLicense,
          getLicenseConfig: {
            retry: 1,
            timeout: 5
          },
          persistentLicenseConfig: {
            save(data) {
              localStorage.setItem(
                "RxPlayer-persistent-storage",
                JSON.stringify(data)
              );
            },
            load() {
              const item = localStorage.getItem("RxPlayer-persistent-storage");
              return item === null ? [] : JSON.parse(item);
            }
          }
        }
      ],
      referenceDateTime: 1370044800
    });

    console.log("The video has now been loaded!");
  } catch (e: unknown) {
    console.error("An error occurred:", e);
  }
}

const Player = () => {
  const videoElement = useRef<HTMLVideoElement>(null);
  const { epgId, WSXUrl } = useParams();

  useEffect(() => {
    const fetchManifest = async () => {
      const config = (await window.mv.config.get()) as ConfigSchema;
      if (!WSXUrl || !epgId || !config.RMUToken || !videoElement.current)
        return;

      console.log("Fetching manifest list");
      const manifestListURL = decodeURIComponent(WSXUrl as string);
      const res = await fetch(
        manifestListURL.replace("{RMUToken}", config.RMUToken!)
      );
      const data = (await res.json()) as ManifestList;
      const manifestURL = data.primary.src;

      initPlayer(manifestURL, config, epgId, videoElement.current);
    };

    fetchManifest();

    return () => {
      // Clean up the player instance when the component unmounts
      if (window.player) {
        window.player.dispose();
      }
    };
  }, [WSXUrl, epgId]);

  useEffect(() => {
    console.log(videoElement.current);
  }, [videoElement]);

  return (
    <div>
      <video controls ref={videoElement} autoPlay />
    </div>
  );
};

export default Player;
