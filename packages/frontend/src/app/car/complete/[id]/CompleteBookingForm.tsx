"use client";

import dayjs from "dayjs";
import { League_Gothic } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

import { type CarBooking, completeBooking } from "@/actions/car";

import { driverColor } from "../../constants";

const leagueGothic = League_Gothic({ weight: "variable", subsets: ["latin"] });

function AlreadyLogged({ booking }: { booking: CarBooking }) {
	return (
		<div className="text-center">
			<p className="text-5xl">✅</p>
			<h1 className="mt-3 text-2xl font-semibold text-neutral-50">
				Already logged
			</h1>
			<p className="mt-2 font-mono text-sm text-neutral-400">
				{booking.driver_name}'s trip on {dayjs(booking.ends_at).format("D MMM")}{" "}
				recorded <span className="text-amber-400">{booking.miles ?? 0} mi</span>
				{booking.paid_for_fuel &&
					` and £${(booking.fuel_cost ?? 0).toFixed(2)} of fuel`}
				.
			</p>
			<Link
				href="/car"
				className="mt-6 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
			>
				Back to Muriel
			</Link>
		</div>
	);
}

export function CompleteBookingForm({ booking }: { booking: CarBooking }) {
	const color = driverColor(booking.driver_name);
	const [miles, setMiles] = useState("");
	const [paidForFuel, setPaidForFuel] = useState(false);
	const [fuelCost, setFuelCost] = useState("");
	const [tripNote, setTripNote] = useState("");
	const [error, setError] = useState<string>();
	const [submitting, setSubmitting] = useState(false);
	const [done, setDone] = useState(false);

	if (booking.status === "completed" && !done) {
		return <AlreadyLogged booking={booking} />;
	}

	if (done) {
		return (
			<div className="text-center">
				<p className="text-5xl">🏁</p>
				<h1 className="mt-3 text-2xl font-semibold text-neutral-50">
					Trip logged. Nice one.
				</h1>
				<p className="mt-2 font-mono text-sm text-neutral-400">
					{miles} miles added to {booking.driver_name}'s tally.
				</p>
				<Link
					href="/car"
					className="mt-6 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
				>
					See the leaderboard
				</Link>
			</div>
		);
	}

	const handleSubmit = async () => {
		const milesValue = Number(miles);
		if (!miles || Number.isNaN(milesValue) || milesValue < 0) {
			setError("Enter the miles you drove");
			return;
		}
		const fuelValue = Number(fuelCost);
		if (
			paidForFuel &&
			(!fuelCost || Number.isNaN(fuelValue) || fuelValue < 0)
		) {
			setError("Enter how much you spent on fuel");
			return;
		}

		setSubmitting(true);
		setError(undefined);
		const result = await completeBooking(booking.id, {
			miles: milesValue,
			paid_for_fuel: paidForFuel,
			fuel_cost: paidForFuel ? fuelValue : null,
			trip_note: tripNote.trim() ? tripNote.trim() : null,
		});
		setSubmitting(false);

		if (result.ok) {
			setDone(true);
		} else {
			setError(result.error);
		}
	};

	return (
		<div>
			<header className="mb-6">
				<p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
					Log your trip
				</p>
				<h1
					className={`text-5xl uppercase leading-none text-neutral-50 ${leagueGothic.className}`}
				>
					Muriel 🚗
				</h1>
				<div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
					<span
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: color }}
					/>
					<p className="text-sm text-neutral-200">
						<span className="font-medium">{booking.driver_name}</span>
						<span className="font-mono text-xs text-neutral-500">
							{" · "}
							{dayjs(booking.starts_at).format("D MMM, HH:mm")} →{" "}
							{dayjs(booking.ends_at).format("D MMM, HH:mm")}
						</span>
					</p>
				</div>
			</header>

			<div className="flex flex-col gap-5">
				<label className="flex flex-col gap-1.5">
					<span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
						Miles driven
					</span>
					<div className="relative">
						<input
							type="number"
							inputMode="numeric"
							min={0}
							value={miles}
							onChange={(e) => setMiles(e.target.value)}
							placeholder="0"
							className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3 font-mono text-2xl font-bold text-amber-400 outline-none transition-colors placeholder:text-neutral-700 focus:border-amber-400"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-500">
							miles
						</span>
					</div>
				</label>

				<div className="flex flex-col gap-2">
					<span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
						Did you pay for fuel?
					</span>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setPaidForFuel(true)}
							className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
								paidForFuel
									? "border-amber-400 bg-amber-400 text-neutral-950"
									: "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
							}`}
						>
							Yes, I filled up
						</button>
						<button
							type="button"
							onClick={() => setPaidForFuel(false)}
							className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
								!paidForFuel
									? "border-neutral-500 bg-neutral-700 text-neutral-50"
									: "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
							}`}
						>
							Nope
						</button>
					</div>
				</div>

				{paidForFuel && (
					<label className="flex flex-col gap-1.5">
						<span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
							How much?
						</span>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg text-neutral-500">
								£
							</span>
							<input
								type="number"
								inputMode="decimal"
								min={0}
								step="0.01"
								value={fuelCost}
								onChange={(e) => setFuelCost(e.target.value)}
								placeholder="0.00"
								className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-3 pl-8 pr-3 font-mono text-lg text-neutral-50 outline-none transition-colors placeholder:text-neutral-700 focus:border-amber-400"
							/>
						</div>
					</label>
				)}

				<label className="flex flex-col gap-1.5">
					<span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
						Trip note <span className="text-neutral-600">(optional)</span>
					</span>
					<textarea
						value={tripNote}
						onChange={(e) => setTripNote(e.target.value)}
						rows={3}
						placeholder="Anything to report? Scrapes, smells, a cracking playlist…"
						className="resize-none rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none transition-colors placeholder:text-neutral-600 focus:border-amber-400"
					/>
				</label>

				{error && (
					<p className="rounded-lg border border-ra_red/40 bg-ra_red/10 px-3 py-2 text-sm text-ra_red">
						{error}
					</p>
				)}

				<button
					type="button"
					onClick={handleSubmit}
					disabled={submitting}
					className="rounded-lg bg-amber-400 py-3 font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{submitting ? "Logging…" : "Log the trip 🏁"}
				</button>
			</div>
		</div>
	);
}
