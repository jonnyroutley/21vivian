"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type CarBooking, deleteBooking } from "@/actions/car";

import { CarModal } from "./CarModal";
import { driverColor, STATUS_META } from "./constants";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between border-b border-neutral-800 py-2.5 last:border-0">
			<span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
				{label}
			</span>
			<span className="text-right text-sm text-neutral-100">{value}</span>
		</div>
	);
}

export function BookingDetail({
	booking,
	setOpen,
}: {
	booking: CarBooking | null;
	setOpen: (val: boolean) => void;
}) {
	const router = useRouter();
	const open = booking !== null;
	const color = booking ? driverColor(booking.driver_name) : "#fbbf24";
	const status = booking ? STATUS_META[booking.status] : undefined;

	const [confirming, setConfirming] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string>();

	useEffect(() => {
		if (!open) {
			setConfirming(false);
			setDeleting(false);
			setError(undefined);
		}
	}, [open]);

	const handleDelete = async () => {
		if (!booking) {
			return;
		}
		setDeleting(true);
		setError(undefined);
		const result = await deleteBooking(booking.id);
		setDeleting(false);

		if (result.ok) {
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
			accent={color}
			title={booking?.driver_name ?? ""}
			subtitle={status ? `${status.emoji} ${status.label}` : undefined}
		>
			{booking && (
				<div className="flex flex-col gap-1">
					<Row
						label="From"
						value={dayjs(booking.starts_at).format("ddd D MMM, HH:mm")}
					/>
					<Row
						label="Until"
						value={dayjs(booking.ends_at).format("ddd D MMM, HH:mm")}
					/>

					{booking.status === "completed" ? (
						<>
							<Row
								label="Distance"
								value={
									<span className="font-mono text-base font-bold text-amber-400">
										{booking.miles ?? 0} mi
									</span>
								}
							/>
							<Row
								label="Fuel"
								value={
									booking.paid_for_fuel
										? `Paid £${(booking.fuel_cost ?? 0).toFixed(2)}`
										: "Didn't fill up"
								}
							/>
							{booking.trip_note && (
								<div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
									<p className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500">
										Trip note
									</p>
									<p className="mt-1 text-sm italic text-neutral-200">
										“{booking.trip_note}”
									</p>
								</div>
							)}
						</>
					) : booking.status === "awaiting_completion" ? (
						<Link
							href={`/car/complete/${booking.id}`}
							className="mt-4 block rounded-lg bg-ra_red py-2.5 text-center font-semibold text-neutral-950 transition-colors hover:bg-ra_red/90"
						>
							Log this trip →
						</Link>
					) : (
						<p className="mt-3 text-sm text-neutral-400">
							{booking.status === "active"
								? "Muriel is out on the road right now."
								: "All booked in. Keys are waiting."}
						</p>
					)}

					<div className="mt-5 border-t border-neutral-800 pt-4">
						{error && (
							<p className="mb-3 rounded-lg border border-ra_red/40 bg-ra_red/10 px-3 py-2 text-sm text-ra_red">
								{error}
							</p>
						)}
						{confirming ? (
							<div className="flex flex-col gap-2">
								<p className="font-mono text-xs text-neutral-400">
									Delete this booking for good? This can't be undone.
								</p>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleDelete}
										disabled={deleting}
										className="flex-1 rounded-lg bg-ra_red py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-ra_red/90 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{deleting ? "Deleting…" : "Yes, delete it"}
									</button>
									<button
										type="button"
										onClick={() => setConfirming(false)}
										disabled={deleting}
										className="flex-1 rounded-lg border border-neutral-700 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Keep it
									</button>
								</div>
							</div>
						) : (
							<button
								type="button"
								onClick={() => setConfirming(true)}
								className="font-mono text-xs uppercase tracking-wider text-neutral-500 transition-colors hover:text-ra_red"
							>
								🗑 Delete booking
							</button>
						)}
					</div>
				</div>
			)}
		</CarModal>
	);
}
