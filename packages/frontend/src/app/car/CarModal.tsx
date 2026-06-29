"use client";

import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function CarModal({
	open,
	setOpen,
	title,
	subtitle,
	accent = "#fbbf24",
	children,
}: {
	open: boolean;
	setOpen: (val: boolean) => void;
	title: string;
	subtitle?: string;
	accent?: string;
	children: React.ReactNode;
}) {
	return (
		<Dialog className="relative z-20" open={open} onClose={setOpen}>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-20 w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-4">
					<DialogPanel
						transition
						className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 text-neutral-50 shadow-2xl transition-all data-[closed]:translate-y-6 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
					>
						<div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
						<div className="p-5 sm:p-6">
							<div className="flex items-start justify-between gap-4">
								<div>
									<DialogTitle
										as="h3"
										className="text-2xl font-semibold tracking-tight"
									>
										{title}
									</DialogTitle>
									{subtitle && (
										<p className="mt-1 font-mono text-xs text-neutral-400">
											{subtitle}
										</p>
									)}
								</div>
								<button
									type="button"
									className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-50"
									onClick={() => setOpen(false)}
								>
									<span className="sr-only">Close</span>
									<XMarkIcon className="h-6 w-6" aria-hidden="true" />
								</button>
							</div>
							<div className="mt-4">{children}</div>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
