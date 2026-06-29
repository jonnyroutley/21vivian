"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useMousePosition } from "@/hooks/useMousePosition";
import { cn } from "@/lib/utils";

type NavItem = {
	href: string;
	label: string;
	bg: string;
	fg: string;
};

const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "home", bg: "#fbbf24", fg: "#1c1917" },
	{ href: "/reviews", label: "reviews", bg: "#34d399", fg: "#1c1917" },
	{ href: "/events", label: "events", bg: "#fb7185", fg: "#1c1917" },
	{ href: "/car", label: "muriel", bg: "#38bdf8", fg: "#1c1917" },
];

const MAGNET_RADIUS = 200;
const MAGNET_STRENGTH = 0.32;

function magnet(dx: number, dy: number) {
	const distance = Math.hypot(dx, dy);
	if (distance >= MAGNET_RADIUS) {
		return { x: 0, y: 0 };
	}
	const pull = (1 - distance / MAGNET_RADIUS) ** 1.5 * MAGNET_STRENGTH;
	return { x: dx * pull, y: dy * pull };
}

function useActiveItem() {
	const pathname = usePathname();
	return NAV_ITEMS.find((item) =>
		item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
	);
}

export function NavButton() {
	const active = useActiveItem();
	const pathname = usePathname();
	const mouse = useMousePosition();

	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const [center, setCenter] = useState<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const measure = () => {
			const el = anchorRef.current;
			if (!el) {
				return;
			}
			const rect = el.getBoundingClientRect();
			setCenter({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const pull =
		!open && center && mouse.x !== null && mouse.y !== null
			? magnet(mouse.x - center.x, mouse.y - center.y)
			: { x: 0, y: 0 };

	const triggerBg = active?.bg ?? "#fbbf24";
	const triggerFg = active?.fg ?? "#1c1917";

	return (
		<div className="fixed right-5 top-5 z-50 font-mono md:right-8 md:top-8">
			{open && (
				<button
					type="button"
					aria-hidden
					tabIndex={-1}
					onClick={() => setOpen(false)}
					className="fixed inset-0 -z-10 cursor-default bg-transparent"
				/>
			)}

			<div ref={anchorRef} className="relative h-12 w-12 md:h-14 md:w-14">
				<button
					type="button"
					aria-label="Toggle navigation menu"
					aria-expanded={open}
					onClick={() => setOpen((prev) => !prev)}
					className="absolute inset-0 grid place-items-center rounded-full shadow-xl ring-1 ring-black/15 transition-[transform,filter] duration-200 ease-out hover:brightness-105 hover:shadow-2xl active:brightness-95 motion-reduce:transition-none"
					style={{
						background: triggerBg,
						color: triggerFg,
						transform: `translate(${pull.x}px, ${pull.y}px)`,
					}}
				/>
			</div>

			<nav
				aria-label="Main navigation"
				className={cn(
					"absolute right-0 top-full mt-3",
					open ? "pointer-events-auto" : "pointer-events-none",
				)}
			>
				<div
					className={cn(
						"origin-top-right rounded-[1.75rem] bg-neutral-950/85 p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none",
						open ? "scale-100 opacity-100" : "scale-90 opacity-0",
					)}
				>
					<ul className="flex flex-col items-stretch gap-2">
						{NAV_ITEMS.map((item, i) => {
							const isActive =
								item.href === "/"
									? pathname === "/"
									: pathname.startsWith(item.href);
							return (
								<li
									key={item.href}
									className="transition-all duration-300 ease-out motion-reduce:transition-none"
									style={{
										transitionDelay: open ? `${i * 45}ms` : "0ms",
										opacity: open ? 1 : 0,
										transform: open ? "translateY(0)" : "translateY(-8px)",
									}}
								>
									<Link
										href={item.href}
										onClick={() => setOpen(false)}
										className={cn(
											"block min-w-[8rem] rounded-full px-5 py-2 text-center text-xl lowercase shadow-md transition-[transform,box-shadow] duration-200 ease-out hover:-translate-x-1 hover:scale-[1.04] hover:shadow-xl motion-reduce:transition-none",
											isActive &&
												"ring-2 ring-white ring-offset-2 ring-offset-neutral-950",
										)}
										style={{ background: item.bg, color: item.fg }}
									>
										{item.label}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			</nav>
		</div>
	);
}
