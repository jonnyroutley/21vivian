"use client";

import dayjs from "dayjs";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

import type { ConsumptionRecord } from "@/actions/energy";
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

export function EnergyChart({
	electricityData,
	gasData,
}: {
	electricityData: ConsumptionRecord[];
	gasData: ConsumptionRecord[];
}) {
	// Transform data for the chart, combining electricity and gas
	const transformedData = electricityData
		.map((record, index) => ({
			datetime: dayjs(record.interval_start).format("DD/MM HH:mm"),
			electricity: record.consumption,
			gas: gasData[index] ? gasData[index].consumption : 0,
		}))
		.toReversed();

	return (
		<ChartContainer
			config={chartConfig}
			className="min-h-[300px] w-full pr-10 pt-20"
		>
			<ResponsiveContainer>
				<BarChart accessibilityLayer data={transformedData} barGap={4}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="datetime"
						tickLine={true}
						tickMargin={20}
						axisLine={false}
						angle={-20}
					/>
					<YAxis />
					<ChartTooltip
						labelClassName="text-black"
						content={<ChartTooltipContent />}
					/>
					<ChartLegend className="mt-8" content={<ChartLegendContent />} />
					<Bar
						dataKey="electricity"
						fill="var(--color-electricity)"
						radius={[4, 4, 0, 0]}
						stackId="a"
					/>
					<Bar
						dataKey="gas"
						fill="var(--color-gas)"
						radius={[4, 4, 0, 0]}
						stackId="a"
					/>
				</BarChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}
