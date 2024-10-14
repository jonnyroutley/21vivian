export function CreateEventForm() {
  return (
    <form className="mt-8 flex flex-col gap-6 text-3xl text-ra_red">
      <label className="flex justify-between gap-4">
        Name
        <input type="text" className="rounded-md px-2 py-1 text-black" />
      </label>
      <label className="flex justify-between gap-4">
        Location
        <input type="text" className="rounded-md px-2 py-1 text-black" />
      </label>
      <label className="flex justify-between gap-4">
        Upload image
        <input type="file" className="hidden rounded-md px-2 py-1 text-black" />
        <div className="hover:cursor-pointer">Select file 📎</div>
      </label>
      <label className="flex justify-between gap-4">
        Start
        <input type="datetime-local" className="rounded-md px-2 py-1 text-black" />
      </label>
      <label className="flex justify-between gap-4">
        End
        <input type="datetime-local" className="rounded-md px-2 py-1 text-black" />
      </label>
      <button className="rounded-md border border-ra_red hover:bg-ra_red hover:text-black">
        Create
      </button>
    </form>
  )
}
