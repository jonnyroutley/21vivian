import { NotificationIcon } from "./notificationIcon";

export default function NotificationPage() {
	return (
		<main className="flex h-screen w-full bg-purple-500 font-mono text-purple-50">
			<div className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-12 px-8">
				<h1 className="text-5xl">BING BONG</h1>
				<div className="flex flex-row flex-wrap gap-12">
					<NotificationIcon id={`dinner`} />
					<NotificationIcon id={`sexy`} />
					<NotificationIcon id={`dave`} />
					<NotificationIcon id={`pints`} />
					<NotificationIcon id={`girlfriend`} />
					<NotificationIcon id={`summers`} />
				</div>
			</div>
		</main>
	);
}
