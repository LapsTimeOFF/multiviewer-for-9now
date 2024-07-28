import { ipcMain } from "electron";
import { InitLiveTV } from "../../../shared/types";
import { Catalogs } from "../../../shared/catalogTypes";

export const initLiveTV = async (tokenPass: string) => {
  const LiveData = (await (
    await fetch(
      "https://ltv.slc-app-aka.prod.bo.canal.canalplustech.pro/api/V4/zones/cpfra/devices/3/apps/1/jobs/InitLiveTV",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ServiceRequest: {
            InData: {
              UseRmuTokenPlaceHolder: true,
              PassData: {
                Id: 0,
                Token: tokenPass
              },
              UserKeyId: "_2ynjpjfks", // TBD
              DeviceKeyId: "_ba45u4axr", // TBD
              PDSData: {
                GroupTypes: "1;2;4" // Depends on region, check config
              }
            }
          }
        })
      }
    )
  ).json()) as InitLiveTV;

  return LiveData.ServiceResponse.OutData;
};

export const getCatalog = async (
  url: string = "https://hodor.canalplus.pro/api/v2/mycanal/page/618d7ac93cff20d81ab62e0e09c5550d/102569.json?aegon=true"
) => {
  const data = (await (await fetch(url)).json()) as Catalogs;
  return data;
};

export default function () {
  ipcMain.handle("mycanal:initLiveTV", async (event, tokenPass: string) => {
    return await initLiveTV(tokenPass);
  });
  ipcMain.handle("mycanal:getCatalog", async (event, url: string) => {
    return await getCatalog(url);
  });
}
