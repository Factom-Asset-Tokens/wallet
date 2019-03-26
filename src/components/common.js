export function tryParseApiErrorCode(e) {
  try {
    return JSON.parse(e.message).code;
  } catch (e) {
    return;
  }
}
