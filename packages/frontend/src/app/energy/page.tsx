import { getElectricityUsage, getGasUsage } from "@/actions/energy";

import { EnergyChart } from "./energyChart";

export default async function EnergyPage() {
	const gasUsage = await getGasUsage();
	const electricityUsage = await getElectricityUsage();
	if (!gasUsage || !electricityUsage) {
		return null;
	}
	return (
		<main
			className={`flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-8 font-mono text-neutral-50`}
		>
			{/* <h1 className="my-4 text-4xl text-yellow-400">Energy usage</h1> */}
			<EnergyChart gasData={gasUsage} electricityData={electricityUsage} />
		</main>
	);
}

// hack for now
export const dynamic = "force-dynamic";