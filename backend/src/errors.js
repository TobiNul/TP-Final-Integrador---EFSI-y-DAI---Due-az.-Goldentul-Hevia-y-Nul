export function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

export function id(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) fail(400, 'Identificador inválido.');
  return n;
}

export function text(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim()))
    fail(400, 'Revisá los campos del formulario.');
  return value.trim();
}

export function webUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') throw new Error();
    return url.href;
  } catch {
    fail(400, 'La imagen debe ser una URL HTTPS válida.');
  }
}
