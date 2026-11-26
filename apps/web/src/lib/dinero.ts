/** Formatea un monto decimal en texto (sin convertirlo a float). */
export function formatearCOP(valor: string): string {
  const [entero, decimales = '00'] = valor.split('.');
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${conMiles},${decimales.padEnd(2, '0').slice(0, 2)}`;
}

/** Convierte un monto en texto a centavos enteros (sin float). */
export function parseCentavos(valor: string): number {
  const limpio = valor.replace(/,/g, '').trim();
  const [entero, decimales = ''] = limpio.split('.');
  const centavos = (decimales + '00').slice(0, 2);
  return parseInt(entero || '0', 10) * 100 + parseInt(centavos || '0', 10);
}

/** Convierte centavos enteros a texto decimal "1234.56". */
export function centavosAMonto(centavos: number): string {
  const signo = centavos < 0 ? '-' : '';
  const abs = Math.abs(centavos);
  const entero = Math.floor(abs / 100);
  const decimales = String(abs % 100).padStart(2, '0');
  return `${signo}${entero}.${decimales}`;
}

/** Suma el total de líneas (cantidad × precio/costo) en centavos. */
export function totalLineas(
  lineas: Array<{ cantidad: string; monto: string }>,
): string {
  let total = 0;
  for (const linea of lineas) {
    const cantidad = parseInt(linea.cantidad, 10);
    if (!cantidad || cantidad <= 0) continue;
    total += cantidad * parseCentavos(linea.monto);
  }
  return centavosAMonto(total);
}
