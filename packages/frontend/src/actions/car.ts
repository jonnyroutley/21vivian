"use server";

import { revalidatePath } from "next/cache";

import { config } from "@/lib/config";

export type BookingStatus =
	| "upcoming"
	| "active"
	| "awaiting_completion"
	| "completed";

export type CarBooking = {
	id: number;
	driver_name: string;
	starts_at: string;
	ends_at: string;
	miles: number | null;
	paid_for_fuel: boolean;
	fuel_cost: number | null;
	trip_note: string | null;
	completed_at: string | null;
	created_at: string;
	status: BookingStatus;
};

export type CreateBookingInput = {
	driver_name: string;
	starts_at: string;
	ends_at: string;
};

export type CompleteBookingInput = {
	miles: number;
	paid_for_fuel: boolean;
	fuel_cost: number | null;
	trip_note: string | null;
};

type MutationResult = {
	ok: boolean;
	error?: string;
	booking?: CarBooking;
};

async function readError(res: Response): Promise<string> {
	try {
		const body = await res.json();
		if (body && typeof body.message === "string") {
			return body.message;
		}
	} catch {
		// fall through to generic message
	}
	return "Something went wrong. Please try again.";
}

export async function getBookings(): Promise<CarBooking[]> {
	const res = await fetch(`${config.apiBaseUrl}/car/bookings`, {
		method: "GET",
		cache: "no-store",
	});
	if (!res.ok) {
		return [];
	}
	return res.json();
}

export async function getBooking(id: number): Promise<CarBooking | null> {
	const res = await fetch(`${config.apiBaseUrl}/car/bookings/${id}`, {
		method: "GET",
		cache: "no-store",
	});
	if (!res.ok) {
		return null;
	}
	return res.json();
}

export async function createBooking(
	input: CreateBookingInput,
): Promise<MutationResult> {
	const res = await fetch(`${config.apiBaseUrl}/car/bookings`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (res.ok) {
		const booking = (await res.json()) as CarBooking;
		revalidatePath("/car");
		return { ok: true, booking };
	}

	return { ok: false, error: await readError(res) };
}

export async function completeBooking(
	id: number,
	input: CompleteBookingInput,
): Promise<MutationResult> {
	const res = await fetch(`${config.apiBaseUrl}/car/bookings/${id}/complete`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (res.ok) {
		const booking = (await res.json()) as CarBooking;
		revalidatePath("/car");
		revalidatePath(`/car/complete/${id}`);
		return { ok: true, booking };
	}

	return { ok: false, error: await readError(res) };
}
