/**
 * Configuración de renderizado para todas las rutas.
 *
 * `ssr: false` — la app es una SPA offline-first. No hay nada que renderizar en
 * el servidor: el contenido sale de un JSON que se descarga en el navegador, y
 * el store vive en el cliente. Intentar SSR obligaría a resolver de dónde saca
 * los datos el servidor, para producir un HTML que igual se va a rehidratar.
 *
 * `prerender: true` — el shell de la app se genera en el build. Es lo que
 * permite que el sitio sea archivos estáticos.
 */

export const ssr = false;
export const prerender = true;
export const trailingSlash = 'always';
