"use client";

import dayjs from "dayjs";
import Link from "next/link";

import type { CarBooking } from "@/actions/car";

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
	const open = booking !== null;
	const color = booking ? driverColor(booking.driver_name) : "#fbbf24";
	const status = booking ? STATUS_META[booking.status] : undefined;

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
				</div>
			)}
		</CarModal>
	);
}
