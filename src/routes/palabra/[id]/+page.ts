/**
 * Esta ruta NO se pre-renderiza.
 *
 * `/palabra/[id]` se resuelve en el navegador: el componente lee el id de la
 * URL y busca en el índice que ya está en memoria (0,25 µs). El servidor sirve
 * el `200.html` de fallback para cualquier id.
 *
 * La alternativa sería pregenerar 851 páginas HTML, una por palabra. Se
 * descartó porque duplicaría en 851 archivos algo que ya viaja en un JSON de
 * 300 KB, y el service worker tendría que cachear las 851 para funcionar
 * offline — que en una escuela rural es justo lo que hay que evitar.
 *
 * El resto de las rutas sí se pre-renderiza: apagarlo acá y no globalmente
 * mantiene el chequeo activo para las demás.
 */

export const prerender = false;
