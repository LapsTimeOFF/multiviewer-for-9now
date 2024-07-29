import { GetLiveExperience } from "../../../shared/getLiveExperienceTypes";
import { ipcMain } from "electron";

const getLiveExperience = async (token: string) => {
  const data = (await (
    await fetch(
      `https://api.9now.com.au/web/live-experience?device=web&slug=gem&streamParams=web%2Cchrome%2Cmacos&region=nsw&offset=0&token=${token}`
    )
  ).json()) as GetLiveExperience;

  return data;
};

export default function () {
  ipcMain.handle("9now:getLiveExperience", async (event, token: string) => {
    return getLiveExperience(token);
  });
}
