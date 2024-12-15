"use server"

import { config } from "@/lib/config"

export type ConsumptionRecord = {
  consumption: number
  interval_start: string
  interval_end: string
}

export const getGasUsage = async () => {
  const response = await fetch(
    "https://api.octopus.energy/v1/gas-meter-points/3223863404/meters/E6S16465632462/consumption/",
    {
      headers: {
        Authorization: "Basic " + btoa(config.octopusApiKey),
      },
    },
  )
  return (await response.json()).results as ConsumptionRecord[]
}

export const getElectricityUsage = async () => {
  const response = await fetch(
    "https://api.octopus.energy/v1/electricity-meter-points/1200022395890/meters/24J0591577/consumption/",
    {
      headers: {
        Authorization: "Basic " + btoa(config.octopusApiKey),
      },
    },
  )

  return (await response.json()).results as ConsumptionRecord[]
}
