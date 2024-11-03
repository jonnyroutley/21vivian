"use client"

import { League_Gothic } from "next/font/google"
import { useState } from "react"
import { z } from "zod"

import { addAttendeeToEvent } from "@/actions/events"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const leagueGothic = League_Gothic({ weight: "variable", subsets: ["latin"] })

const inputAttendeeSchema = z.object({
  name: z.string().min(1, "Please enter a name"),
  event_id: z.number(),
})

const EVENTS_KEY = "vivianEvents"

const EventStorage = {
  get localSavedEvents(): number[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]") as number[]
  },

  set localSavedEvents(localSavedEvents: number[]) {
    if (typeof window === "undefined") return
    localStorage.setItem(EVENTS_KEY, JSON.stringify(localSavedEvents))
  },

  addEvent(eventId: number) {
    const events = this.localSavedEvents
    events.push(eventId)
    this.localSavedEvents = events
  },
}

export function RsvpButton({ eventId }: { eventId: number }) {
  const [error, setError] = useState<string>()
  const [open, setOpen] = useState(false)
  const [canJoinEvent, setCanJoinEvent] = useState(!EventStorage.localSavedEvents.includes(eventId))

  const refreshEvents = () => {
    const events = EventStorage.localSavedEvents
    setCanJoinEvent(!events.includes(eventId))
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          disabled={canJoinEvent === false}
          className={cn(
            "group ml-auto mr-2 rounded-full border-2 border-ra_red px-2 py-1 font-mono text-xs hover:bg-ra_red",
          )}
        >
          RSVP
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "rounded-none border-ra_red bg-neutral-950 text-ra_red sm:max-w-[425px]",
          leagueGothic.className,
        )}
      >
        <form
          action={async (formData: FormData) => {
            const name = formData.get("name")
            const eventIdHidden = parseInt(formData.get("eventIdHidden") as unknown as string)

            const parsed = inputAttendeeSchema.safeParse({
              name,
              event_id: eventIdHidden,
            })

            if (parsed.error) {
              setError(parsed.error.errors[0]?.message)
              return
            }
            setError(undefined)
            await addAttendeeToEvent(parsed.data)
            EventStorage.addEvent(eventIdHidden)
            refreshEvents()
            setOpen(false)
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl">Who are you?</DialogTitle>
            <DialogDescription className="text-xl">
              We can&apos;t wait to see you. Please let us know your name first. NO lollygagging.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xl">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3 text-xl text-neutral-900" />
              <input id="eventIdHidden" name="eventIdHidden" type="hidden" value={eventId} />
            </div>
            {error && <p className="text-red-100">{error}</p>}
          </div>
          <DialogFooter>
            <Button className="ml-auto mr-2 rounded-full border-2 border-ra_red px-2 py-1 font-mono text-xs hover:bg-ra_red">
              RSVP
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
