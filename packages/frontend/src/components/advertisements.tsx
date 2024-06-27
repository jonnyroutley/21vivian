import { useState } from "react"

import { ModalDialog } from "./modalDialog"

export function GordonsAd() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="hover:text-rose-200" onClick={() => setOpen(true)}>
        Click me!
      </button>
      <ModalDialog title="Deal of the summer alert" open={open} setOpen={setOpen}>
        <div>
          <h1 className="text-5xl uppercase text-white">Buy Gordon&lsquo;s London Dry Gin</h1>
          <p className="mt-8 text-justify">
            Now on sale for just £12.99 a bottle. Speak to your local dealer for more information.
            Terms and conditions apply. You must be 18+ and live in an eligible region. The fun runs
            from [Start Date] to [End Date], so get your gin on! Winners will be announced within 14
            days of the promo end and must claim their prize within 30 days or we&lsquo;ll assume
            you got lost in a gin haze. By entering, you let us use your name and face in our
            marketing—yay for fame! Sneaky part: you&lsquo;re auto-enrolled in our exclusive
            membership at $19.99/month (surprise!). We&lsquo;ll charge your card monthly, but hey,
            cool club perks! Extra costs like taxes and delivery are on you, so read the fine print.
            We can change the rules whenever because we&lsquo;re the gin bosses. Disputes go to
            [Jurisdiction]. Questions? Contact our awesome customer service at [Contact
            Information]. Cheers and good luck!
          </p>
        </div>
      </ModalDialog>
    </>
  )
}
