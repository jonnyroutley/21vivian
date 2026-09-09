import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Christmas countdown",
};

export const dynamic = "force-dynamic";

const CHRISTMAS_DINNER = { month: 11, day: 12 };

type Colour = { background: string; text: string };

const PALETTE: [Colour, ...Colour[]] = [
	{ background: "#FF2D55", text: "#FFF3B0" },
	{ background: "#00C2A8", text: "#052B26" },
	{ background: "#FFD400", text: "#7A1F00" },
	{ background: "#7B2FF7", text: "#F6E7FF" },
	{ background: "#FF6B00", text: "#2B0B00" },
	{ background: "#00A8FF", text: "#00203A" },
	{ background: "#39FF6A", text: "#04300F" },
	{ background: "#FF4FD8", text: "#2E0026" },
];

function londonToday() {
	const [date] = new Date()
		.toLocaleString("en-CA", { timeZone: "Europe/London" })
		.split(",");
	return new Date(`${date}T00:00:00Z`);
}

function daysUntilChristmasDinner() {
	const today = londonToday();
	const year = today.getUTCFullYear();
	const { month, day } = CHRISTMAS_DINNER;
	const thisYear = new Date(Date.UTC(year, month, day));
	const target =
		thisYear >= today ? thisYear : new Date(Date.UTC(year + 1, month, day));

	return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export default function ChristmasCountdown() {
	const days = daysUntilChristmasDinner();
	const { background, text } =
		PALETTE[Math.floor(Math.random() * PALETTE.length)] ?? PALETTE[0];

	return (
		<main
			className="flex h-screen w-full flex-col items-center justify-center overflow-hidden"
			style={{ backgroundColor: background, color: text }}
		>
			<span className="font-bold text-[45vw] leading-[0.8]">{days}</span>
			<span className="px-8 text-center text-xl uppercase tracking-[0.3em] sm:text-3xl">
				{days === 0
					? "christmas dinner today"
					: `${days === 1 ? "day" : "days"} until christmas dinner`}
			</span>
		</main>
	);
}
