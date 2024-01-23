export function updateNumberFormatOptions(
  currentOptions: Intl.NumberFormatOptions,
  style: string
) {
  const options = style.split(/\s+/);
  for (const modifier of options) {
    if (modifier === "percent") {
      currentOptions.style = "percent";
    }
  }
}
