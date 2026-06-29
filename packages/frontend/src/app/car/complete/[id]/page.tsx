import Link from "next/link";

import { getBooking } from "@/actions/car";

import { CompleteBookingForm } from "./CompleteBookingForm";

export const dynamic = "force-dynamic";

export default async function CompleteBookingPage({
	params,
}: {
	params: { id: string };
}) {
	const id = Number(params.id);
	const booking = Number.isNaN(id) ? null : await getBooking(id);

	return (
		<main className="flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-12 font-sans text-neutral-50">
			<div className="w-full max-w-md px-4">
				{booking ? (
					<CompleteBookingForm booking={booking} />
				) : (
					<div className="text-center">
						<p className="text-5xl">🤷</p>
						<h1 className="mt-3 text-2xl font-semibold">Booking not found</h1>
						<p className="mt-2 font-mono text-sm text-neutral-400">
							This trip link doesn't lead anywhere.
						</p>
						<Link
							href="/car"
							className="mt-6 inline-block rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
						>
							Back to Muriel
						</Link>
					</div>
				)}
			</div>
		</main>
	);
}
