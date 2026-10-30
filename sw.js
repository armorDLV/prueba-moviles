// PROTOTIPO, se tira. Prueba 4: al recibir un push, ¿puede el service worker hacer fetch?
// Orden «fetch-primero» (por defecto): hace el fetch y luego muestra la notificación con el resultado.
// Orden «notificacion-primero»: muestra la notificación, hace el fetch y la reemplaza con el resultado.
importScripts('db.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

async function hacerFetch(recibido) {
  try {
    const r = await fetch(`ping.json?t=${recibido}`, { cache: 'no-store' });
    const j = await r.json();
    return `fetch ${r.status} «${j.ping}» en ${Date.now() - recibido} ms`;
  } catch (err) {
    return `fetch falló tras ${Date.now() - recibido} ms: ${err}`;
  }
}

self.addEventListener('push', (e) => {
  e.waitUntil(
    (async () => {
      const recibido = Date.now();
      let datos = {};
      try {
        datos = e.data.json();
      } catch {}
      const orden = datos.orden || 'fetch-primero';
      const titulo = `Push ${datos.id ?? '?'} (${orden})`;
      if (orden === 'notificacion-primero') {
        await self.registration.showNotification(titulo, { body: 'fetch en curso…', tag: titulo });
      }
      const resultado = await hacerFetch(recibido);
      await self.registration.showNotification(titulo, { body: resultado, tag: titulo });
      await anotar('4-push', { modo: 'service-worker', id: datos.id, orden, enviado: datos.enviado, resultado });
    })(),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./'));
});
