"use server";

import { config } from "@/lib/config";

export type ConsumptionRecord = {
	consumption: number;
	interval_start: string;
	interval_end: string;
};

export type RateRecord = {
	value_exc_vat: number;
	value_inc_vat: number;
	valid_from: string;
	valid_to: string | null;
	payment_method: string;
};

// Gas conversion factor for SMETS2 meters (m³ to kWh)
// Calculated from actual meter readings: 14.169 kWh / 1.279 m³ = 11.08
// This aligns with the standard UK conversion factor of ~11.19
const GAS_CONVERSION_FACTOR = 11.19;

export const getGasUsage = async () => {
	// Get data from 7 days ago
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const periodFrom = sevenDaysAgo.toISOString();

	const url = new URL(
		"https://api.octopus.energy/v1/gas-meter-points/3223863404/meters/E6S16465632462/consumption/",
	);
	url.searchParams.set("period_from", periodFrom);
	url.searchParams.set("page_size", "1000");

	const response = await fetch(url.toString(), {
		headers: {
			Authorization: `Basic ${btoa(config.octopusApiKey)}`,
		},
		cache: "no-store",
	});

	const results = (await response.json()).results as ConsumptionRecord[];

	// Convert m³ to kWh for SMETS2 gas meters
	return results.map((record) => ({
		...record,
		consumption: record.consumption * GAS_CONVERSION_FACTOR,
	}));
};

export const getElectricityUsage = async () => {
	// Get data from 7 days ago
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const periodFrom = sevenDaysAgo.toISOString();

	const url = new URL(
		"https://api.octopus.energy/v1/electricity-meter-points/1200022395890/meters/24J0591577/consumption/",
	);
	url.searchParams.set("period_from", periodFrom);
	url.searchParams.set("page_size", "1000");

	const response = await fetch(url.toString(), {
		headers: {
			Authorization: `Basic ${btoa(config.octopusApiKey)}`,
		},
		cache: "no-store",
	});

	return (await response.json()).results as ConsumptionRecord[];
};

export const getElectricityRates = async () => {
	// Get data from 7 days ago to cover the consumption period
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const periodFrom = sevenDaysAgo.toISOString();

	const url = new URL(
		"https://api.octopus.energy/v1/products/VAR-22-11-01/electricity-tariffs/E-1R-VAR-22-11-01-C/standard-unit-rates/",
	);
	url.searchParams.set("period_from", periodFrom);
	url.searchParams.set("page_size", "100");

	const response = await fetch(url.toString(), {
		cache: "no-store",
	});

	return (await response.json()).results as RateRecord[];
};

export const getGasRates = async () => {
	// Get data from 7 days ago to cover the consumption period
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const periodFrom = sevenDaysAgo.toISOString();

	const url = new URL(
		"https://api.octopus.energy/v1/products/VAR-22-11-01/gas-tariffs/G-1R-VAR-22-11-01-C/standard-unit-rates/",
	);
	url.searchParams.set("period_from", periodFrom);
	url.searchParams.set("page_size", "100");

	const response = await fetch(url.toString(), {
		cache: "no-store",
	});

	return (await response.json()).results as RateRecord[];
};
