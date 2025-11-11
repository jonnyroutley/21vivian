import {
	getElectricityRates,
	getElectricityUsage,
	getGasRates,
	getGasUsage,
} from "@/actions/energy";

import { EnergyChart } from "./energyChart";

export default async function EnergyPage() {
	const [gasUsage, electricityUsage, gasRates, electricityRates] =
		await Promise.all([
			getGasUsage(),
			getElectricityUsage(),
			getGasRates(),
			getElectricityRates(),
		]);

	if (!gasUsage || !electricityUsage || !gasRates || !electricityRates) {
		return null;
	}

	return (
		<main
			className={`flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-8 font-mono text-neutral-50`}
		>
			<EnergyChart
				gasData={gasUsage}
				electricityData={electricityUsage}
				gasRates={gasRates}
				electricityRates={electricityRates}
			/>
		</main>
	);
}
