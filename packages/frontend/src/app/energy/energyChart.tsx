"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

import type { ConsumptionRecord, RateRecord } from "@/actions/energy";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
	electricity: {
		label: "Electricity",
		color: "#FFDE21",
	},
	gas: {
		label: "Gas",
		color: "#26fbff",
	},
} satisfies ChartConfig;

// Helper function to find the rate for a given timestamp
function getRateForTimestamp(
	timestamp: string,
	rates: RateRecord[],
): number | null {
	const date = new Date(timestamp);
	for (const rate of rates) {
		const validFrom = new Date(rate.valid_from);
		const validTo = rate.valid_to ? new Date(rate.valid_to) : new Date();
		if (
			date >= validFrom &&
			(rate.valid_to === null || date < validTo) &&
			rate.payment_method === "DIRECT_DEBIT"
		) {
			return rate.value_inc_vat;
		}
	}
	return null;
}

export function EnergyChart({
	electricityData,
	gasData,
	electricityRates,
	gasRates,
}: {
	electricityData: ConsumptionRecord[];
	gasData: ConsumptionRecord[];
	electricityRates: RateRecord[];
	gasRates: RateRecord[];
}) {
	const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
	const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, "day"));

	// Get current rates (most recent valid rate)
	const currentElectricityRate =
		electricityRates.find(
			(r) => r.valid_to === null && r.payment_method === "DIRECT_DEBIT",
		)?.value_inc_vat || 0;
	const currentGasRate =
		gasRates.find(
			(r) => r.valid_to === null && r.payment_method === "DIRECT_DEBIT",
		)?.value_inc_vat || 0;

	// Helper to get available dates from the data
	const availableDates = Array.from(
		new Set(
			electricityData.map((r) => dayjs(r.interval_start).format("YYYY-MM-DD")),
		),
	).sort();

	const canGoBack = availableDates.length > 0 && selectedDate.isAfter(dayjs(availableDates[0]));
	const canGoForward = selectedDate.isBefore(dayjs().subtract(1, "day"));

	const goToPreviousDay = () => {
		if (canGoBack) {
			setSelectedDate(selectedDate.subtract(1, "day"));
		}
	};

	const goToNextDay = () => {
		if (canGoForward) {
			setSelectedDate(selectedDate.add(1, "day"));
		}
	};

	// Transform data based on view mode
	const transformedData =
		viewMode === "weekly"
			? // Weekly view: aggregate by day
				Array.from({ length: 7 }, (_, i) => {
					const date = dayjs().subtract(6 - i, "day");
					const dateStr = date.format("YYYY-MM-DD");

					const dayElectricity = electricityData.filter((r) =>
						dayjs(r.interval_start).isSame(date, "day"),
					);
					const dayGas = gasData.filter((r) =>
						dayjs(r.interval_start).isSame(date, "day"),
					);

					const totalElectricity = dayElectricity.reduce(
						(sum, r) => sum + r.consumption,
						0,
					);
					const totalGas = dayGas.reduce((sum, r) => sum + r.consumption, 0);

					const electricityRate = getRateForTimestamp(
						date.toISOString(),
						electricityRates,
					);
					const gasRate = getRateForTimestamp(date.toISOString(), gasRates);

					return {
						datetime: date.format("DD/MM"),
						electricity: totalElectricity,
						gas: totalGas,
						electricityCost: electricityRate
							? (totalElectricity * electricityRate) / 100
							: 0,
						gasCost: gasRate ? (totalGas * gasRate) / 100 : 0,
					};
				})
			: // Daily view: show 30-min intervals for selected date
				electricityData
					.filter((r) => dayjs(r.interval_start).isSame(selectedDate, "day"))
					.map((record) => {
						const electricityRate = getRateForTimestamp(
							record.interval_start,
							electricityRates,
						);
						const gasRecord = gasData.find((g) =>
							dayjs(g.interval_start).isSame(
								dayjs(record.interval_start),
								"minute",
							),
						);
						const gasRate = gasRecord
							? getRateForTimestamp(gasRecord.interval_start, gasRates)
							: null;

						return {
							datetime: dayjs(record.interval_start).format("HH:mm"),
							electricity: record.consumption,
							gas: gasRecord ? gasRecord.consumption : 0,
							electricityCost: electricityRate
								? (record.consumption * electricityRate) / 100
								: 0,
							gasCost:
								gasRecord && gasRate
									? (gasRecord.consumption * gasRate) / 100
									: 0,
						};
					})
					.sort((a, b) => a.datetime.localeCompare(b.datetime));

	// Calculate totals
	const totalElectricity = transformedData.reduce(
		(sum, d) => sum + d.electricity,
		0,
	);
	const totalGas = transformedData.reduce((sum, d) => sum + d.gas, 0);
	const totalElectricityCost = transformedData.reduce(
		(sum, d) => sum + d.electricityCost,
		0,
	);
	const totalGasCost = transformedData.reduce((sum, d) => sum + d.gasCost, 0);

	return (
		<div className="w-full space-y-8 px-4">
			{/* View Mode Toggle */}
			<div className="flex items-center gap-4">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setViewMode("weekly")}
						className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
							viewMode === "weekly"
								? "bg-yellow-400 text-neutral-900"
								: "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
						}`}
					>
						Weekly
					</button>
					<button
						type="button"
						onClick={() => setViewMode("daily")}
						className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
							viewMode === "daily"
								? "bg-yellow-400 text-neutral-900"
								: "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
						}`}
					>
						Daily
					</button>
				</div>

				{/* Date Navigation (only shown in daily view) */}
				{viewMode === "daily" && (
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={goToPreviousDay}
							disabled={!canGoBack}
							className="rounded-lg bg-neutral-800 px-4 py-2 font-semibold text-neutral-50 transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							← Previous
						</button>
						<span className="text-lg font-semibold">
							{selectedDate.format("DD MMM YYYY")}
						</span>
						<button
							type="button"
							onClick={goToNextDay}
							disabled={!canGoForward}
							className="rounded-lg bg-neutral-800 px-4 py-2 font-semibold text-neutral-50 transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next →
						</button>
					</div>
				)}
			</div>

			{/* Current Rates Summary */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-yellow-400 bg-neutral-900 p-4">
					<h3 className="text-sm text-neutral-400">Current Electricity Rate</h3>
					<p className="text-2xl font-bold text-yellow-400">
						{currentElectricityRate.toFixed(2)}p/kWh
					</p>
				</div>
				<div className="rounded-lg border border-cyan-400 bg-neutral-900 p-4">
					<h3 className="text-sm text-neutral-400">Current Gas Rate</h3>
					<p className="text-2xl font-bold text-cyan-400">
						{currentGasRate.toFixed(2)}p/kWh
					</p>
				</div>
				<div className="rounded-lg border border-yellow-400 bg-neutral-900 p-4">
					<h3 className="text-sm text-neutral-400">
						Total Electricity (
						{viewMode === "weekly" ? "7d" : selectedDate.format("DD MMM")})
					</h3>
					<p className="text-2xl font-bold text-yellow-400">
						{totalElectricity.toFixed(2)} kWh
					</p>
					<p className="text-sm text-neutral-400">
						£{totalElectricityCost.toFixed(2)}
					</p>
				</div>
				<div className="rounded-lg border border-cyan-400 bg-neutral-900 p-4">
					<h3 className="text-sm text-neutral-400">
						Total Gas ({viewMode === "weekly" ? "7d" : selectedDate.format("DD MMM")})
					</h3>
					<p className="text-2xl font-bold text-cyan-400">
						{totalGas.toFixed(2)} kWh
					</p>
					<p className="text-sm text-neutral-400">£{totalGasCost.toFixed(2)}</p>
				</div>
			</div>

			{/* Total Cost */}
			<div className="rounded-lg border border-green-400 bg-neutral-900 p-6 text-center">
				<h3 className="text-lg text-neutral-400">
					Total Cost (
					{viewMode === "weekly" ? "Last 7 Days" : selectedDate.format("DD MMM YYYY")}
					)
				</h3>
				<p className="text-4xl font-bold text-green-400">
					£{(totalElectricityCost + totalGasCost).toFixed(2)}
				</p>
			</div>

			{/* Consumption Chart */}
			<div>
				<h2 className="mb-4 text-xl font-bold">
					{viewMode === "weekly"
						? "Energy Consumption (Last 7 Days)"
						: `Energy Consumption (${selectedDate.format("DD MMM YYYY")})`}
				</h2>
				<ChartContainer
					config={chartConfig}
					className="min-h-[300px] w-full pr-10"
				>
					<ResponsiveContainer>
						<BarChart data={transformedData} barGap={4}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="datetime"
								tickLine={true}
								tickMargin={20}
								axisLine={false}
								angle={-20}
							/>
							<YAxis
								label={{ value: "kWh", angle: -90, position: "insideLeft" }}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel={false} />}
							/>
							<ChartLegend className="mt-8" content={<ChartLegendContent />} />
							<Bar
								dataKey="electricity"
								fill="var(--color-electricity)"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="gas"
								fill="var(--color-gas)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</ChartContainer>
			</div>

		</div>
	);
}
