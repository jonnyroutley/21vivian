"use client";

import dayjs, { type Dayjs } from "dayjs";

import type { CarBooking } from "@/actions/car";

import { driverColor } from "./constants";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildGrid(month: Dayjs): Dayjs[] {
	const startOfMonth = month.startOf("month");
	const daysInMonth = month.daysInMonth();
	// dayjs: Sunday = 0. Shift so Monday = 0.
	const leadingBlanks = (startOfMonth.day() + 6) % 7;
	const gridStart = startOfMonth.subtract(leadingBlanks, "day");
	const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
	return Array.from({ length: totalCells }, (_, i) => gridStart.add(i, "day"));
}

function bookingsOnDay(day: Dayjs, bookings: CarBooking[]): CarBooking[] {
	const dayStart = day.startOf("day").valueOf();
	const dayEnd = day.endOf("day").valueOf();
	return bookings.filter(
		(b) =>
			dayjs(b.starts_at).valueOf() <= dayEnd &&
			dayjs(b.ends_at).valueOf() >= dayStart,
	);
}

function NavArrow({ direction }: { direction: "left" | "right" }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<title>{direction === "left" ? "Previous" : "Next"}</title>
			<path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
		</svg>
	);
}

export function CarCalendar({
	month,
	bookings,
	onPrev,
	onNext,
	onToday,
	onSelectBooking,
	onDayClick,
}: {
	month: Dayjs;
	bookings: CarBooking[];
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	onSelectBooking: (booking: CarBooking) => void;
	onDayClick: (day: Dayjs) => void;
}) {
	const grid = buildGrid(month);
	const today = dayjs();

	return (
		<div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60">
			<div className="flex items-center justify-between gap-2 border-b border-neutral-800 px-4 py-3">
				<div className="flex items-baseline gap-3">
					<h2 className="text-2xl font-semibold tracking-tight text-neutral-50">
						{month.format("MMMM")}
					</h2>
					<span className="font-mono text-sm text-neutral-500">
						{month.format("YYYY")}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={onToday}
						className="rounded-lg border border-neutral-700 px-3 py-1.5 font-mono text-xs text-neutral-300 transition-colors hover:border-amber-400 hover:text-amber-400"
					>
						Today
					</button>
					<button
						type="button"
						onClick={onPrev}
						className="rounded-lg border border-neutral-700 p-1.5 text-neutral-300 transition-colors hover:border-amber-400 hover:text-amber-400"
					>
						<NavArrow direction="left" />
					</button>
					<button
						type="button"
						onClick={onNext}
						className="rounded-lg border border-neutral-700 p-1.5 text-neutral-300 transition-colors hover:border-amber-400 hover:text-amber-400"
					>
						<NavArrow direction="right" />
					</button>
				</div>
			</div>

			<div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-950/40">
				{WEEKDAYS.map((day) => (
					<div
						key={day}
						className="py-2 text-center font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500"
					>
						{day}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7">
				{grid.map((day) => {
					const inMonth = day.month() === month.month();
					const isToday = day.isSame(today, "day");
					const dayBookings = bookingsOnDay(day, bookings);
					const visible = dayBookings.slice(0, 3);
					const overflow = dayBookings.length - visible.length;

					return (
						<button
							type="button"
							key={day.format("YYYY-MM-DD")}
							onClick={() => onDayClick(day)}
							className={`group relative min-h-[5.5rem] border-b border-r border-neutral-800/70 p-1.5 text-left transition-colors hover:bg-neutral-800/40 sm:min-h-[7rem] ${
								inMonth ? "" : "bg-neutral-950/40"
							}`}
						>
							<div className="flex items-center justify-between">
								<span
									className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${
										isToday
											? "bg-amber-400 font-bold text-neutral-950"
											: inMonth
												? "text-neutral-300"
												: "text-neutral-600"
									}`}
								>
									{day.date()}
								</span>
								<span className="font-mono text-base text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100">
									+
								</span>
							</div>

							<div className="mt-1 flex flex-col gap-1">
								{visible.map((booking) => {
									const color = driverColor(booking.driver_name);
									const isStart = dayjs(booking.starts_at).isSame(day, "day");
									const isCompleted = booking.status === "completed";
									const needsMileage = booking.status === "awaiting_completion";
									return (
										<button
											type="button"
											key={booking.id}
											onClick={(e) => {
												e.stopPropagation();
												onSelectBooking(booking);
											}}
											style={{
												backgroundColor: `${color}22`,
												borderLeftColor: color,
											}}
											className={`flex items-center gap-1 overflow-hidden rounded-md border-l-[3px] px-1.5 py-0.5 text-left transition-opacity hover:opacity-80 ${
												isCompleted ? "opacity-60" : ""
											}`}
										>
											{isStart && (
												<span className="hidden shrink-0 font-mono text-[0.6rem] text-neutral-400 sm:inline">
													{dayjs(booking.starts_at).format("HH:mm")}
												</span>
											)}
											<span className="truncate text-[0.7rem] font-medium text-neutral-100">
												{booking.driver_name}
											</span>
											{needsMileage && (
												<span className="ml-auto shrink-0 text-[0.6rem]">
													⏱️
												</span>
											)}
										</button>
									);
								})}
								{overflow > 0 && (
									<span className="px-1 font-mono text-[0.6rem] text-neutral-500">
										+{overflow} more
									</span>
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
