# PGN Study PRO · Coordinador

PWA de audios para preparación al cargo **Profesional Coordinador** en la Procuraduría General de la Nación.

## Estructura del proyecto

```
pgn-study-prof/
├── index.html        ← App principal
├── styles.css        ← Estilos
├── script.js         ← Lógica (episodios, reproductor, admin)
├── sw.js             ← Service Worker (offline)
├── manifest.json     ← PWA manifest
├── icon-192.png      ← Ícono PWA (debes crearlo)
├── icon-512.png      ← Ícono PWA grande (debes crearlo)
├── audios/           ← Carpeta con todos los archivos .m4a
│   ├── Claves_del_núcleo_común_para_la_Procuraduría.m4a
│   ├── Ep-3.m4a
│   └── Estructura_y_funciones_de_la_Procuraduría.m4a
└── README.md
```

## Cómo agregar un audio nuevo

1. Copia el archivo `.m4a` a la carpeta `audios/`
2. Abre la app → pulsa el botón **⚙️** (esquina superior izquierda)
3. Contraseña: `pgn2026` ← **cámbiala en script.js antes de subir a GitHub**
4. Rellena el formulario y pulsa **Agregar episodio**
5. Desde CMD:
   ```
   cd C:\ruta\pgn-study-prof
   git add .
   git commit -m "Nuevo audio: nombre_del_episodio"
   git push origin main
   ```

## Categorías disponibles

| Categoría | Eje | Badge |
|---|---|---|
| 📚 Conocimiento General | `general` | Azul |
| 🎯 Conocimiento Específico | `especifico` | Violeta |
| 🧠 Comportamental | `comportamental` | Verde |

## Contraseña admin

Está en `script.js`, línea: `const ADMIN_PASS = "pgn2026";`
Cámbiala antes de publicar.

## Deploy en GitHub Pages

1. Crea repo `pgn-study-prof` en GitHub
2. `git init && git add . && git commit -m "Inicio"`
3. `git remote add origin https://github.com/TU_USUARIO/pgn-study-prof.git`
4. `git push -u origin main`
5. En GitHub → Settings → Pages → Branch: main / root
