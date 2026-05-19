# PGN Study PRO · Coordinador

PWA mobile-first para estudio en audio con foco en funcionamiento offline.

## Archivos
- `index.html`
- `styles.css`
- `script.js`
- `sw.js`
- `manifest.json`

## Requisitos previos
1. Mantén en la raíz del proyecto `icon-192.png` e `icon-512.png`.
2. Mantén la carpeta `audios/` con los 8 archivos `.m4a` exactamente con los nombres definidos en `script.js` y `sw.js`.

## Publicación
1. Sube la carpeta a GitHub Pages o a cualquier hosting estático.
2. Abre la app una primera vez con internet.
3. Pulsa **Guardar audios offline** para cachear toda la biblioteca.
4. Instálala desde el navegador o desde la guía indicada en la interfaz.

## Notas
- El progreso se guarda por episodio en `localStorage`.
- El service worker cachea shell, assets y audios.
- Los episodios están definidos directamente en el código, sin panel de administración.
