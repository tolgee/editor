export function updateNumberFormatOptions(
  currentOptions: Intl.NumberFormatOptions,
  newModifier: string
) {
  if (newModifier === "percent") {
    currentOptions.style = "percent";
  }
}
