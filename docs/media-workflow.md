# Flujo de optimización de fotos y videos

Los archivos que se muestran en la web deben pasar por el optimizador antes de publicar el proyecto.

## Requisitos

- Node.js y las dependencias instaladas con `npm install`.
- FFmpeg instalado. En macOS: `brew install ffmpeg`.

## Agregar contenido nuevo

1. Copia las fotos o videos originales en `public/meses/<mes>`.
2. Agrega sus nombres y descripciones en `content/meses/<mes>.json`.
3. Revisa lo que se procesará:

   ```bash
   npm run media:audit
   ```

4. Ejecuta la optimización:

   ```bash
   npm run media:optimize
   ```

5. Verifica el proyecto:

   ```bash
   npm run build
   npm run dev
   ```

El comando convierte imágenes JPG, JPEG y PNG a WebP con un máximo de 2560 px. Los videos MOV y MP4 se convierten a MP4 H.264, máximo 1080p o 1920 px para videos verticales, máximo 30 FPS, audio AAC y reproducción progresiva (`faststart`). También genera un poster WebP para cada video y actualiza automáticamente las referencias JSON.

Los originales se mueven a `media-originals/`, una carpeta local ignorada por Git. Consérvala hasta revisar visualmente la web y guarda una copia externa de las fotos importantes.

## Repetición segura

Los archivos generados usan `.webp`, `.poster.webp` y `.web.mp4`. El comando los reconoce y no vuelve a comprimirlos. Solo procesa originales nuevos.

No edites directamente un archivo ya optimizado. Si necesitas reemplazarlo, usa un nombre nuevo para evitar colisiones y problemas de caché.
