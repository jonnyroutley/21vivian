"use client";

import dayjs from "dayjs";
import { useMemo } from "react";

import type { CarBooking } from "@/actions/car";

import { driverColor } from "./constants";

export function TripLog({ bookings }: { bookings: CarBooking[] }) {
	const trips = useMemo(
		() =>
			bookings
				.filter((b) => b.status === "completed")
				.sort(
					(a, b) =>
						dayjs(b.completed_at ?? b.ends_at).valueOf() -
						dayjs(a.completed_at ?? a.ends_at).valueOf(),
				),
		[bookings],
	);

	const totalMiles = trips.reduce((sum, t) => sum + (t.miles ?? 0), 0);

	return (
		<div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6">
			<div className="flex items-baseline justify-between gap-2">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight text-neutral-50">
						Muriel's guest book 📖
					</h2>
					<p className="font-mono text-xs text-neutral-500">
						Every trip she's ever taken
					</p>
				</div>
				{trips.length > 0 && (
					<p className="shrink-0 font-mono text-xs text-neutral-400">
						<span className="font-bold text-amber-400">{trips.length}</span>{" "}
						{trips.length === 1 ? "trip" : "trips"} ·{" "}
						<span className="font-bold text-amber-400">{totalMiles}</span> mi
					</p>
				)}
			</div>

			{trips.length === 0 ? (
				<p className="mt-8 text-center font-mono text-sm text-neutral-500">
					No trips logged yet. Be the first to take her out.
				</p>
			) : (
				<ol className="mt-6 flex flex-col gap-4">
					{trips.map((trip) => {
						const color = driverColor(trip.driver_name);
						return (
							<li key={trip.id} className="flex gap-3">
								<div className="flex flex-col items-center">
									<span
										className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: color }}
									/>
									<span className="mt-1 w-px flex-1 bg-neutral-800" />
								</div>
								<div className="flex-1 pb-1">
									<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
										<span className="text-sm font-semibold" style={{ color }}>
											{trip.driver_name}
										</span>
										<span className="font-mono text-xs text-neutral-500">
											{dayjs(trip.ends_at).format("ddd D MMM YYYY")}
										</span>
									</div>
									<div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-400">
										<span className="rounded bg-neutral-800 px-1.5 py-0.5 font-bold text-neutral-100">
											{trip.miles ?? 0} mi
										</span>
										{trip.paid_for_fuel && (
											<span className="rounded bg-neutral-800 px-1.5 py-0.5">
												⛽ £{(trip.fuel_cost ?? 0).toFixed(2)}
											</span>
										)}
									</div>
									{trip.trip_note && (
										<p className="mt-2 border-l-2 border-neutral-700 pl-3 text-sm italic text-neutral-200">
											“{trip.trip_note}”
										</p>
									)}
								</div>
							</li>
						);
					})}
				</ol>
			)}
		</div>
	);
}
