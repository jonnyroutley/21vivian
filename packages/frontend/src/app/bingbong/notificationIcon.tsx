"use client";

import { sendNotification } from "@/actions/notify";

const notificationTemplates = {
	dinner: "Dinner time",
	sexy: "Mr Sexy in da house",
	dave: "Dave alert",
	pints: "Pints!",
	girlfriend: "Girlfriend alert",
	summers: "Summers family alert",
} as const;

export function NotificationIcon({
	id,
}: {
	id: keyof typeof notificationTemplates;
}) {
	return (
		<button
			className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-green-400 p-4 shadow-md transition-all hover:translate-y-1"
			type="submit"
			onClick={() => sendNotification({ id })}
		>
			<h2 className="text-center text-purple-500">
				{notificationTemplates[id]}
			</h2>
		</button>
	);
}
