# Reverse engineering the myCANAL API

## Getting channels + live token

`POST https://ltv.slc-app-aka.prod.bo.canal.canalplustech.pro/api/V4/zones/cpfra/devices/3/apps/1/jobs/InitLiveTV`
TokenPass in auth.

Make sure to save the `RMUToken`

Channels are in `Root.ServiceResponse.OutData.PDS.ChannelsGroups.ChannelsGroups[0].Channels`

## Live stream

To play live stream fetch `{channel object}.WSXUrl.replace("{RMUToken}", RMUToken)`

This will return a few keys, CDN, and `dvr`, `nodvr`, `primary` with `src` in each.

By default myCANAL fetches `primary` which most of the time is `dvr`, it avoids incompatibility channels

## DRM

License and WideVine certificate are available in the public config: `https://player.canalplus.com/one/configs/v2/11/mycanal/prod.json`

The `offerZone` are the following:

```json
{
  "cpfra": "mycanal",
  "cppol": "mycanalpl",
  "cpche": "mycanalch",
  "cpafr": "mycanalcos",
  "cpreu": "mycanalcos",
  "cpmdg": "mycanalcos",
  "cpant": "mycanalcos",
  "cpmus": "mycanalcosmus",
  "cpncl": "mycanalcos",
  "cpoth": "mycanalcos",
  "cppyf": "mycanalcos",
  "cpeth": "mycanaleth",
  "tiita": "mycanaltim",
  "cpchd": "mycanalchde",
  "default": "mycanal"
}
```

Device ID appears to always be `31`?

The license is in `Root.ServiceResponse.OutData.LicenseInfo` as Base64 encoded

In the body, ChallengeInfo is just the challenge in Base64.
`UserKeyId` can be find in the local storage in myCANAL (`oneplayer:user:usr`) and `oneplayer:user:dev` for `DeviceKeyId`
