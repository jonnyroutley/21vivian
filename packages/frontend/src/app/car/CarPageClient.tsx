"use client";

import dayjs, { type Dayjs } from "dayjs";
import { League_Gothic } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

import type { CarBooking } from "@/actions/car";

import { BookingDetail } from "./BookingDetail";
import { BookingDialog } from "./BookingDialog";
import { CarCalendar } from "./CarCalendar";
import { driverColor, STATUS_META } from "./constants";
import { MonthlyBreakdown } from "./MonthlyBreakdown";
import { TripLog } from "./TripLog";

const leagueGothic = League_Gothic({ weight: "variable", subsets: ["latin"] });

function Stat({
	label,
	value,
	unit,
}: {
	label: string;
	value: string | number;
	unit?: string;
}) {
	return (
		<div className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
			<p className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500">
				{label}
			</p>
			<p className="mt-0.5 font-mono text-2xl font-bold text-amber-400">
				{value}
				{unit && (
					<span className="ml-1 text-sm font-normal text-neutral-500">
						{unit}
					</span>
				)}
			</p>
		</div>
	);
}

export function CarPageClient({ bookings }: { bookings: CarBooking[] }) {
	const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
	const [createOpen, setCreateOpen] = useState(false);
	const [presetStart, setPresetStart] = useState<string | null>(null);
	const [detailBooking, setDetailBooking] = useState<CarBooking | null>(null);
	const [driving, setDriving] = useState(false);

	const now = dayjs();
	const milesThisMonth = bookings
		.filter(
			(b) => b.status === "completed" && dayjs(b.ends_at).isSame(now, "month"),
		)
		.reduce((sum, b) => sum + (b.miles ?? 0), 0);
	const tripsThisMonth = bookings.filter(
		(b) => b.status === "completed" && dayjs(b.ends_at).isSame(now, "month"),
	).length;
	const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;

	const awaiting = bookings
		.filter((b) => b.status === "awaiting_completion")
		.sort((a, b) => dayjs(b.ends_at).valueOf() - dayjs(a.ends_at).valueOf());

	const horizon = bookings
		.filter((b) => b.status === "active" || b.status === "upcoming")
		.sort((a, b) => dayjs(a.starts_at).valueOf() - dayjs(b.starts_at).valueOf())
		.slice(0, 6);

	const openCreate = (preset: string | null) => {
		setPresetStart(preset);
		setCreateOpen(true);
	};

	return (
		<div className="mb-32 w-full max-w-5xl px-4">
			<header className="flex flex-col gap-5 pb-8 pt-2">
				<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
					<div>
						<p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
							The house wheels
						</p>
						<h1
							className={`text-6xl uppercase leading-none text-neutral-50 sm:text-8xl ${leagueGothic.className}`}
						>
							Muriel{" "}
							<button
								type="button"
								onClick={() => setDriving(true)}
								onAnimationEnd={() => setDriving(false)}
								aria-label="Take Muriel for a spin"
								className={`inline-block cursor-pointer text-amber-400 ${
									driving ? "animate-drive-off" : ""
								}`}
							>
								🚗
							</button>
						</h1>
						<p className="mt-1 font-mono text-sm text-neutral-500">
							VW Golf+ · book her, drive her, log the miles
						</p>
					</div>
					<button
						type="button"
						onClick={() => openCreate(now.format("YYYY-MM-DD"))}
						className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
					>
						+ Book Muriel
					</button>
				</div>

				<div className="flex gap-3">
					<Stat label="This month" value={milesThisMonth} unit="mi" />
					<Stat label="Trips logged" value={tripsThisMonth} />
					<Stat label="Booked ahead" value={upcomingCount} />
				</div>
			</header>

			{awaiting.length > 0 && (
				<section className="mb-8 rounded-2xl border border-ra_red/40 bg-ra_red/5 p-5">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-ra_red">
						⏱️ Trips waiting to be logged
					</h2>
					<p className="mt-0.5 font-mono text-xs text-neutral-400">
						These bookings have ended — drop in the mileage.
					</p>
					<div className="mt-4 flex flex-col gap-2">
						{awaiting.map((booking) => (
							<div
								key={booking.id}
								className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3"
							>
								<div className="flex items-center gap-3">
									<span
										className="h-2.5 w-2.5 rounded-full"
										style={{
											backgroundColor: driverColor(booking.driver_name),
										}}
									/>
									<div>
										<p className="text-sm font-medium text-neutral-100">
											{booking.driver_name}
										</p>
										<p className="font-mono text-xs text-neutral-500">
											{dayjs(booking.starts_at).format("D MMM, HH:mm")} →{" "}
											{dayjs(booking.ends_at).format("D MMM, HH:mm")}
										</p>
									</div>
								</div>
								<Link
									href={`/car/complete/${booking.id}`}
									className="rounded-lg bg-ra_red px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-ra_red/90"
								>
									Log trip →
								</Link>
							</div>
						))}
					</div>
				</section>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<CarCalendar
						month={month}
						bookings={bookings}
						onPrev={() => setMonth(month.subtract(1, "month"))}
						onNext={() => setMonth(month.add(1, "month"))}
						onToday={() => setMonth(dayjs().startOf("month"))}
						onSelectBooking={setDetailBooking}
						onDayClick={(day) => openCreate(day.format("YYYY-MM-DD"))}
					/>
				</div>

				<aside className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
					<h2 className="text-xl font-semibold tracking-tight text-neutral-50">
						On the horizon
					</h2>
					{horizon.length === 0 ? (
						<p className="mt-4 font-mono text-sm text-neutral-500">
							Nothing booked. Muriel's free.
						</p>
					) : (
						<ul className="mt-4 flex flex-col gap-2">
							{horizon.map((booking) => {
								const status = STATUS_META[booking.status];
								return (
									<li key={booking.id}>
										<button
											type="button"
											onClick={() => setDetailBooking(booking)}
											className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2.5 text-left transition-colors hover:border-neutral-700"
										>
											<span
												className="h-8 w-1 shrink-0 rounded-full"
												style={{
													backgroundColor: driverColor(booking.driver_name),
												}}
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-neutral-100">
													{booking.driver_name}
												</p>
												<p className="truncate font-mono text-xs text-neutral-500">
													{dayjs(booking.starts_at).format("ddd D MMM, HH:mm")}
												</p>
											</div>
											{booking.status === "active" && (
												<span
													className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.6rem] uppercase"
													style={{
														backgroundColor: `${status.color}22`,
														color: status.color,
													}}
												>
													out now
												</span>
											)}
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</aside>
			</div>

			<div className="mt-6">
				<MonthlyBreakdown bookings={bookings} />
			</div>

			<div className="mt-6">
				<TripLog bookings={bookings} />
			</div>

			<BookingDialog
				open={createOpen}
				setOpen={setCreateOpen}
				presetStart={presetStart}
			/>
			<BookingDetail
				booking={detailBooking}
				setOpen={(val) => {
					if (!val) {
						setDetailBooking(null);
					}
				}}
			/>
		</div>
	);
}
