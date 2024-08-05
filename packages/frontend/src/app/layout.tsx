import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"

import "./globals.css"
import { NavButton } from "@/components/nav"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Boys' House",
  description: "Just 4 guys living in a house",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={playfairDisplay.className}>
        <>
        <NavButton />
        {children}
        </>
        </body>
    </html>
  )
}
