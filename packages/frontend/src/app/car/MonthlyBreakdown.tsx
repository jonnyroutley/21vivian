"use client";

import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";

import type { CarBooking } from "@/actions/car";

import { driverColor } from "./constants";

const MEDALS = ["🥇", "🥈", "🥉"];

type DriverStat = {
	name: string;
	miles: number;
	trips: number;
	fuel: number;
	color: string;
};

export function MonthlyBreakdown({ bookings }: { bookings: CarBooking[] }) {
	const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));

	const stats = useMemo<DriverStat[]>(() => {
		const byDriver = new Map<
			string,
			{ miles: number; trips: number; fuel: number }
		>();
		for (const b of bookings) {
			if (b.status !== "completed") {
				continue;
			}
			if (!dayjs(b.ends_at).isSame(month, "month")) {
				continue;
			}
			const current = byDriver.get(b.driver_name) ?? {
				miles: 0,
				trips: 0,
				fuel: 0,
			};
			current.miles += b.miles ?? 0;
			current.trips += 1;
			current.fuel += b.paid_for_fuel ? (b.fuel_cost ?? 0) : 0;
			byDriver.set(b.driver_name, current);
		}
		return Array.from(byDriver.entries())
			.map(([name, v]) => ({ name, ...v, color: driverColor(name) }))
			.sort((a, b) => b.miles - a.miles);
	}, [bookings, month]);

	const totalMiles = stats.reduce((sum, s) => sum + s.miles, 0);
	const totalFuel = stats.reduce((sum, s) => sum + s.fuel, 0);
	const maxMiles = Math.max(...stats.map((s) => s.miles), 1);
	const isCurrentMonth = month.isSame(dayjs(), "month");

	return (
		<div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6">
			<div className="flex items-center justify-between gap-2">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight text-neutral-50">
						Mileage leaderboard
					</h2>
					<p className="font-mono text-xs text-neutral-500">
						{month.format("MMMM YYYY")}
					</p>
				</div>
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={() => setMonth(month.subtract(1, "month"))}
						className="rounded-lg border border-neutral-700 px-2.5 py-1.5 font-mono text-xs text-neutral-300 transition-colors hover:border-amber-400 hover:text-amber-400"
					>
						←
					</button>
					<button
						type="button"
						onClick={() => setMonth(month.add(1, "month"))}
						disabled={isCurrentMonth}
						className="rounded-lg border border-neutral-700 px-2.5 py-1.5 font-mono text-xs text-neutral-300 transition-colors hover:border-amber-400 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
					>
						→
					</button>
				</div>
			</div>

			{stats.length === 0 ? (
				<p className="mt-8 text-center font-mono text-sm text-neutral-500">
					No trips logged in {month.format("MMMM")} yet.
				</p>
			) : (
				<>
					<div className="mt-5 flex flex-col gap-3">
						{stats.map((stat, index) => (
							<div key={stat.name} className="flex items-center gap-3">
								<span className="w-6 text-center font-mono text-sm text-neutral-500">
									{MEDALS[index] ?? index + 1}
								</span>
								<div className="flex-1">
									<div className="mb-1 flex items-baseline justify-between">
										<span className="text-sm font-medium text-neutral-100">
											{stat.name}
										</span>
										<span className="font-mono text-xs text-neutral-400">
											<span className="font-bold text-neutral-50">
												{stat.miles}
											</span>{" "}
											mi · {stat.trips} {stat.trips === 1 ? "trip" : "trips"}
											{stat.fuel > 0 && ` · £${stat.fuel.toFixed(2)} fuel`}
										</span>
									</div>
									<div className="h-2.5 overflow-hidden rounded-full bg-neutral-800">
										<div
											className="h-full rounded-full transition-all duration-500"
											style={{
												width: `${(stat.miles / maxMiles) * 100}%`,
												backgroundColor: stat.color,
											}}
										/>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="mt-5 flex items-center justify-between border-t border-neutral-800 pt-4 font-mono text-xs text-neutral-400">
						<span>
							Total:{" "}
							<span className="font-bold text-amber-400">{totalMiles} mi</span>
						</span>
						{totalFuel > 0 && (
							<span>
								Fuel:{" "}
								<span className="font-bold text-neutral-100">
									£{totalFuel.toFixed(2)}
								</span>
							</span>
						)}
					</div>
				</>
			)}
		</div>
	);
}
