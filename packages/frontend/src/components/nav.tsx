"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { useMousePosition } from "@/hooks/useMousePosition"
import { cn } from "@/lib/utils"

function curve(distance: number) {
  const gain = 0.5
  const shift = 1
  const spread = 40

  return (gain * 1) / Math.cosh(distance / spread - shift)
}

const NavItems = [
  {
    href: "/",
    text: "home",
    xOff: 80,
    yOff: 40,
  },
  {
    href: "/reviews",
    text: "reviews",
    xOff: 60,
    yOff: 30,
  },
  {
    href: "/events",
    text: "events",
    xOff: 0,
    yOff: 30,
  },
]
type RouteColour = {
  primaryColour: string
  secondaryColour: string
  textColour: string
}

type Routes = "home" | "reviews" | "events"

const RouteColours: Record<Routes, RouteColour> = {
  home: {
    primaryColour: "#eab308",
    secondaryColour: "#facc15",
    textColour: "#fefce8",
  },
  reviews: {
    primaryColour: "#eab308",
    secondaryColour: "#facc15",
    textColour: "#fefce8",
  },
  events: {
    primaryColour: "#FF4848",
    secondaryColour: "#ef4444",
    textColour: "#FF4848",
  },
}

export function NavButton() {
  const pathname = usePathname()
  const path = pathname.split("/").at(-1)

  let colours: RouteColour
  if (path && path in RouteColours) {
    colours = RouteColours[path as keyof typeof RouteColours]
  } else {
    colours = RouteColours.home // TODO: make default
  }

  const mousePosition = useMousePosition()
  const [showMenu, setShowMenu] = useState(false)
  const [navPosition, setNavPosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  })

  const xOff = (mousePosition.x ?? 0) - (navPosition.x ?? 0)
  const yOff = (mousePosition.y ?? 0) - (navPosition.y ?? 0)
  const distance = Math.sqrt(xOff ** 2 + yOff ** 2)
  const translateX = curve(distance) * xOff
  const translateY = curve(distance) * yOff

  return (
    <div
      className={cn(
        "invisible absolute right-8 top-8 h-12 w-12 rounded-full md:h-16 md:w-16 lg:visible",
      )}
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
        background: colours.secondaryColour,
      }}
      ref={(el) => {
        if (!el) {
          return
        }
        const rect = el.getBoundingClientRect()
        if (navPosition.x === null && navPosition.y === null) {
          setNavPosition({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
        }
      }}
    >
      <button
        className="h-full w-full rounded-full"
        style={{
          transform: `translate(${translateX * 1.1}px, ${translateY * 1.1}px)`,
          background: colours.primaryColour,
        }}
        type="button"
        onClick={() => setShowMenu(!showMenu)}
      ></button>
      <nav
        className={cn("peer opacity-0 transition-opacity duration-200", showMenu && "opacity-100")}
      >
        <ul>
          {NavItems.map((item) => {
            return (
              <li
                key={item.href}
                style={{
                  transform: `translate(${translateX - item.xOff}px, ${translateY - item.yOff}px )`,
                }}
              >
                <Link
                  className="p-1 transition-colors duration-200"
                  href={item.href}
                  style={{ color: colours.textColour }}
                >
                  {item.text}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      {/* )} */}
    </div>
  )
}