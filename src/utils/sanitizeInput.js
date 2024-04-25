export function sanitizeInput(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}
