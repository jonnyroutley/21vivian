"use client";

import { config } from "@/lib/config";

import type { components, paths } from "../client/schema";

type Housemate = components["schemas"]["Housemate"];
type ChatMessage =
	paths["/chat/{housemate}"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"];

export const sendChatMessage = async (
	message: ChatMessage,
	housemate: Housemate,
) => {
	const response = await fetch(`${config.apiBaseUrl}/chat/${housemate}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(message),
	});
	return response.json() as Promise<components["schemas"]["ChatDto"]>;
};
