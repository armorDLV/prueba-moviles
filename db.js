// PROTOTIPO, se tira (ticket armorDLV/pedidos#16). El registro de resultados en IndexedDB, compartido
// por la página y el service worker: «registro» guarda cada resultado y «kv», las marcas y la foto.
const VERSION = 'v2';

function abrir() {
  return new Promise((ok, mal) => {
    const r = indexedDB.open('sonda', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('registro', { autoIncrement: true });
      r.result.createObjectStore('kv');
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
}

async function tx(almacen, modo, fn) {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction(almacen, modo);
    const peticion = fn(t.objectStore(almacen));
    t.oncomplete = () => ok(peticion && peticion.result);
    t.onerror = () => mal(t.error);
  });
}

const anotar = (prueba, datos) =>
  tx('registro', 'readwrite', (s) => s.add({ prueba, cuando: new Date().toISOString(), version: VERSION, ...datos }));
const registro = () => tx('registro', 'readonly', (s) => s.getAll());
const leer = (clave) => tx('kv', 'readonly', (s) => s.get(clave));
const guardar = (clave, valor) => tx('kv', 'readwrite', (s) => s.put(valor, clave));
