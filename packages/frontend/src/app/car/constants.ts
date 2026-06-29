import type { BookingStatus } from "@/actions/car";

export const DRIVERS = [
	"Luke",
	"Jonny",
	"George",
	"Fraser",
	"Jess",
	"Guest",
] as const;

export type Driver = (typeof DRIVERS)[number];

const DRIVER_COLORS: Record<string, string> = {
	Luke: "#f59e0b",
	Jonny: "#FF4848",
	George: "#34d399",
	Fraser: "#38bdf8",
	Jess: "#f472b6",
	Guest: "#a3a3a3",
};

export function driverColor(name: string): string {
	const known = DRIVER_COLORS[name];
	if (known) {
		return known;
	}
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash) % 360;
	return `hsl(${hue} 70% 62%)`;
}

export const STATUS_META = {
	upcoming: { label: "Upcoming", color: "#a3a3a3", emoji: "🗓️" },
	active: { label: "Out now", color: "#34d399", emoji: "🚗" },
	awaiting_completion: { label: "Needs mileage", color: "#FF4848", emoji: "⏱️" },
	completed: { label: "Logged", color: "#38bdf8", emoji: "✅" },
} satisfies Record<
	BookingStatus,
	{ label: string; color: string; emoji: string }
>;
