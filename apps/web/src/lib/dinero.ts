/** Formatea un monto decimal en texto (sin convertirlo a float). */
export function formatearCOP(valor: string): string {
  const [entero, decimales = '00'] = valor.split('.');
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${conMiles},${decimales.padEnd(2, '0').slice(0, 2)}`;
}
