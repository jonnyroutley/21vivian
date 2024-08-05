"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useMousePosition } from "@/hooks/useMousePosition"
import { cn } from "@/lib/utils"

function trim(input: number) {
  const sign = Math.sign(input)
  const absoluteValue = Math.abs(input)

  if (absoluteValue >= 100) {
    return 10 * sign
  }

  return (absoluteValue / 10) * sign
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

export function NavButton() {
  const mousePosition = useMousePosition()
  const [showMenu, setShowMenu] = useState(false)
  const [navPosition, setNavPosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  })

  const base_translate_x = trim((mousePosition.x ?? 0) - (navPosition.x ?? 0))
  const base_translate_y = trim((mousePosition.y ?? 0) - (navPosition.y ?? 0))

  return (
    <div
      className={cn(
        "invisible absolute right-8 top-8 h-12 w-12 rounded-full bg-yellow-400 lg:visible md:h-16 md:w-16",
      )}
      style={{
        transform: `translate(${base_translate_x}px, ${base_translate_y}px)`,
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
        className="h-full w-full rounded-full bg-yellow-500"
        style={{
          transform: `translate(${base_translate_x * 1.1}px, ${base_translate_y * 1.1}px)`,
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
                  transform: `translate(${base_translate_x - item.xOff}px, ${base_translate_y - item.yOff}px )`,
                }}
              >
                <Link
                  className="p-1 text-yellow-50 transition-colors duration-200 hover:text-yellow-500"
                  href={item.href}
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
