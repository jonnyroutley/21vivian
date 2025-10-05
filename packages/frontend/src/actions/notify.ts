"use server";

import { config } from "@/lib/config";

import type { paths } from "../client/schema";

type SendNotification =
	paths["/notify"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"];

export async function sendNotification(notificationData: SendNotification) {
	await fetch(`${config.apiBaseUrl}/notify`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(notificationData),
	});

	return { message: "success" };
}
