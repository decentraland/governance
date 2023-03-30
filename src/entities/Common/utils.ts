export function disableOnWheelInput(event: any) {
  // Prevent the input value change
  event.target.blur()

  // Prevent the page/container scrolling
  event.stopPropagation()

  // Refocus immediately, on the next tick (after the current function is done)
  setTimeout(() => {
    event.target.focus()
  }, 0)
}
