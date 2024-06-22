import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import localFont from "next/font/local"
import { useState } from "react"

import { classNames } from "@/utils/classNames"

// const TTEspina = localFont({ src: "../../public/fonts/TT_ESPINA/TT ESPINA Trial Variable.ttf" })

export function GordonsAd() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Click me!</button>
      <Dialog className="relative z-10 text-yellow-300" open={open} onClose={setOpen}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-emerald-950 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-emerald-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  className="rounded-md bg-emerald-950 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-white">
                    Deal of the summer alert
                  </DialogTitle>
                  <div>
                    <h1 className="text-5xl uppercase text-white">Buy Gordon's London Dry Gin</h1>
                    <p className="mt-8 text-justify">
                      Now on sale for just £12.99 a bottle. Speak to your local dealer for more
                      information. Terms and conditions apply. You must be 18+ and live in an
                      eligible region. The fun runs from [Start Date] to [End Date], so get your gin
                      on! Winners will be announced within 14 days of the promo end and must claim
                      their prize within 30 days or we’ll assume you got lost in a gin haze. By
                      entering, you let us use your name and face in our marketing—yay for fame!
                      Sneaky part: you’re auto-enrolled in our exclusive membership at $19.99/month
                      (surprise!). We’ll charge your card monthly, but hey, cool club perks! Extra
                      costs like taxes and delivery are on you, so read the fine print. We can
                      change the rules whenever because we’re the gin bosses. Disputes go to
                      [Jurisdiction]. Questions? Contact our awesome customer service at [Contact
                      Information]. Cheers and good luck!
                    </p>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export function AdButton() {
  return <button>click me!</button>
}
