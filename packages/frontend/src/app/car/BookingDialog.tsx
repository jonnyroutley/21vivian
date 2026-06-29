"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createBooking } from "@/actions/car";

import { CarModal } from "./CarModal";
import { DRIVERS, driverColor } from "./constants";

function toApiIso(localValue: string): string {
	return new Date(localValue).toISOString();
}

export function BookingDialog({
	open,
	setOpen,
	presetStart,
}: {
	open: boolean;
	setOpen: (val: boolean) => void;
	presetStart: string | null;
}) {
	const router = useRouter();
	const [driver, setDriver] = useState<string>("");
	const [startsAt, setStartsAt] = useState("");
	const [endsAt, setEndsAt] = useState("");
	const [error, setError] = useState<string>();
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setError(undefined);
			if (presetStart) {
				const start = `${presetStart}T18:00`;
				const end = `${presetStart}T20:00`;
				setStartsAt(start);
				setEndsAt(end);
			}
		}
	}, [open, presetStart]);

	const handleSubmit = async () => {
		if (!driver) {
			setError("Pick who's driving");
			return;
		}
		if (!startsAt || !endsAt) {
			setError("Choose a start and end time");
			return;
		}
		if (new Date(endsAt) <= new Date(startsAt)) {
			setError("The end time must be after the start time");
			return;
		}

		setSubmitting(true);
		setError(undefined);
		const result = await createBooking({
			driver_name: driver,
			starts_at: toApiIso(startsAt),
			ends_at: toApiIso(endsAt),
		});
		setSubmitting(false);

		if (result.ok) {
			setDriver("");
			setStartsAt("");
			setEndsAt("");
			setOpen(false);
			router.refresh();
		} else {
			setError(result.error);
		}
	};

	return (
		<CarModal
			open={open}
			setOpen={setOpen}
			title="Book Muriel"
			subtitle="VW Golf+ · house wheels"
		>
			<div className="flex flex-col gap-5">
				<div>
					<p className="mb-2 font-mono text-xs uppercase tracking-wider text-neutral-400">
						Who's driving?
					</p>
					<div className="flex flex-wrap gap-2">
						{DRIVERS.map((name) => {
							const color = driverColor(name);
							const selected = driver === name;
							return (
								<button
									key={name}
									type="button"
									onClick={() => setDriver(name)}
									style={
										selected
											? { backgroundColor: color, borderColor: color }
											: { borderColor: `${color}66` }
									}
									className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
										selected
											? "text-neutral-950"
											: "text-neutral-200 hover:bg-neutral-800"
									}`}
								>
									{name}
								</button>
							);
						})}
					</div>
				</div>

				<label className="flex flex-col gap-1.5">
					<span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
						From
					</span>
					<input
						type="datetime-local"
						value={startsAt}
						onChange={(e) => setStartsAt(e.target.value)}
						className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-50 outline-none transition-colors focus:border-amber-400"
					/>
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
						Until
					</span>
					<input
						type="datetime-local"
						value={endsAt}
						onChange={(e) => setEndsAt(e.target.value)}
						className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-50 outline-none transition-colors focus:border-amber-400"
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
					className="rounded-lg bg-amber-400 py-2.5 font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{submitting ? "Booking…" : "Grab the keys 🔑"}
				</button>
			</div>
		</CarModal>
	);
}
