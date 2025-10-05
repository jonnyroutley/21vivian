"use client";

import { sendChatMessage } from "@/actions/chat";
import { type components } from "@/client/schema";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { EB_Garamond } from "next/font/google";
import { type FormEvent, useState } from "react";

const ebGaramond = EB_Garamond({ weight: "variable", subsets: ["latin"] });

function PromptContainer({ prompt }: { prompt: string }) {
	return (
		<div className="bg-[#F0EEE6] rounded-xl p-2 w-fit font-semibold">
			{prompt}
		</div>
	);
}

function ResponseContainer({
	response,
}: {
	response: components["schemas"]["ChatDto"];
}) {
	return <div className="mb-2">{response.message}</div>;
}

const housemates: components["schemas"]["Housemate"][] = [
	"Luke",
	"Jonny",
	"George",
	"Fraser",
];

export default function ChatPage() {
	const [selectedHousemate, setSelectedHousemate] =
		useState<components["schemas"]["Housemate"]>("George");
	const [prompts, setPrompts] = useState<string[]>([]);
	const [responses, setResponses] = useState<
		components["schemas"]["ChatDto"][]
	>([]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const message = formData.get("message") as string;
		if (!message) {
			return;
		}
		setPrompts((prev) => [...prev, message]);

		(event.target as HTMLFormElement).reset();
		const response = await sendChatMessage({ message }, selectedHousemate);
		setResponses((prev) => [...prev, response]);
	};

	return (
		<div
			className={`${ebGaramond.className} bg-[#FAF9F5] min-h-screen w-full flex flex-col items-center justify-center`}
		>
			<div className="flex flex-col w-full max-w-xl gap-8 items-center px-4">
				<h1 className="text-4xl">Chat to the house</h1>
				<div className="w-full overflow-y-scroll max-h-[60vh] ">
					{/* {housemates.map((housemate) => (
						<button key={housemate} onClick={() => setHousemate(housemate)}>
							{housemate}
						</button>
					))} */}
					<div className="flex flex-col gap-2 w-full">
						{/* interleave prompts and responses */}
						{prompts.map((prompt, index) => (
							<>
								<PromptContainer key={prompt} prompt={prompt} />
								{responses[index] && (
									<ResponseContainer
										key={responses[index].message}
										response={responses[index]}
									/>
								)}
							</>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-4 w-full items-center">
					<form
						className="flex w-full items-center gap-2"
						onSubmit={handleSubmit}
					>
						<input
							className="bg-white w-full shadow-sm px-4 py-3 border border-neutral-300 rounded-xl"
							type="text"
							placeholder="Ask me anything"
							name="message"
							autoComplete="off"
						/>
						<button
							type="submit"
							className="text-white bg-[#C66240] disabled:bg-[#E4B1A0] size-8 flex items-center justify-center rounded-md"
						>
							<ArrowUp className="size-4" />
						</button>
					</form>
					<div className="flex flex-row gap-2">
						{housemates.map((housemate) => {
							return (
								<button
									key={housemate}
									onClick={() => setSelectedHousemate(housemate)}
									type="button"
									className={cn(
										housemate === selectedHousemate &&
											"bg-[#C66240] text-white",
										"rounded-md p-1",
									)}
								>
									{housemate}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
