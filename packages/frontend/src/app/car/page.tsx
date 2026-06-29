import { getBookings } from "@/actions/car";

import { CarPageClient } from "./CarPageClient";

export const dynamic = "force-dynamic";

export default async function CarPage() {
	const bookings = await getBookings();

	return (
		<main className="flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-8 font-sans text-neutral-50">
			<CarPageClient bookings={bookings} />
		</main>
	);
}
