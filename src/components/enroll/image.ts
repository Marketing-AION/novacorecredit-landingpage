/**
 * Reduce las fotos de los documentos antes de subirlas (máx. 2000 px, JPEG).
 * Una foto de celular pesa 3 a 5 MB; así queda en unos cientos de KB, sube
 * más rápido con datos móviles y cabe bien en el PDF para NovaCore. Si el
 * navegador no puede leer la imagen (por ejemplo HEIC fuera de Safari), se
 * sube tal cual.
 */
export async function compressImage(file: File, maxSide = 2000, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return file;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || (blob.size >= file.size && file.type === "image/jpeg")) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "documento";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
