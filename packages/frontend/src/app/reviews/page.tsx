import { DM_Mono } from "next/font/google";

import { getReviews } from "@/actions/reviews";
import { cn } from "@/lib/utils";

import { CreateReview } from "./CreateReview";

const dmMono = DM_Mono({
	weight: "400",
	style: "normal",
	subsets: ["latin"],
});

export default async function Page() {
	const reviews = await getReviews();

	return (
		<main
			className={cn(
				"flex min-h-screen w-full flex-col items-center bg-neutral-200 bg-[url('/leopard.jpg')] p-4 md:p-16",
				dmMono.className,
			)}
		>
			<div className="flex w-full max-w-lg flex-col gap-8">
				<h1 className="text-6xl lg:text-8xl">Reviews</h1>
				<div className="flex flex-col gap-2 md:gap-6">
					<CreateReview reviews={reviews} />
				</div>
			</div>
		</main>
	);
}
