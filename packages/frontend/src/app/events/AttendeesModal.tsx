"use client";

import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import type { components } from "@/client/schema";

function AttendeesIcon() {
	return (
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 24 24"
			aria-label="Person"
			className="h-6 w-6 text-ra_red"
		>
			<title>Person</title>
			<g fill="none" fillRule="evenodd">
				<path fill="none" d="M0 0h24v24H0z"></path>
				<path
					d="M14 8a2 2 0 10-4 0 2 2 0 004 0zm2 0a4 4 0 11-8 0 4 4 0 018 0zM7 19a1 1 0 01-2 0 7 7 0 0114 0 1 1 0 01-2 0 5 5 0 00-10 0z"
					fill="currentColor"
				></path>
			</g>
		</svg>
	);
}

// DRY can kiss my ass
export function Modal({
	open,
	setOpen,
	title,
	children,
}: {
	open: boolean;
	setOpen: (val: boolean) => void;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Dialog
			className="relative z-10 font-sans text-ra_red"
			open={open}
			onClose={setOpen}
		>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div className="flex min-h-full items-center justify-center p-4 sm:p-0">
					<DialogPanel
						transition
						className="relative transform overflow-hidden rounded-lg border border-ra_red bg-black px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
					>
						<div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
							<button
								type="button"
								className="rounded-md bg-red-950 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onClick={() => setOpen(false)}
							>
								<span className="sr-only">Close</span>
								<XMarkIcon className="h-6 w-6" aria-hidden="true" />
							</button>
						</div>
						<div className="sm:flex sm:items-start">
							<div className="mt-0 text-left sm:mt-6">
								<DialogTitle as="h3" className="text-xl font-semibold">
									{title}
								</DialogTitle>
								{children}
							</div>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}

export function AttendeesModal({
	name,
	attendees,
}: {
	name: string;
	attendees: components["schemas"]["EventDto"]["attendees"];
}) {
	const [open, setOpen] = useState(false);

	if (attendees.length === 0) {
		return null;
	}

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setOpen(!open);
				}}
				className="flex flex-row items-center justify-center gap-2 p-1 hover:bg-neutral-800"
			>
				<AttendeesIcon /> {attendees.length}
			</button>
			<Modal open={open} setOpen={setOpen} title={`Attendees for "${name}"`}>
				<ul className="">
					{attendees.map((attendee) => (
						<li key={attendee.id}>{attendee.name}</li>
					))}
				</ul>
			</Modal>
		</>
	);
}
