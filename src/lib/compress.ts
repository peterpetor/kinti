/**
 * Kliens-oldali kép-tömörítő (HTML5 Canvas alapú).
 * Megőrzi az aspektusarányt, maximális szélességet/magasságot kényszerít,
 * és WebP formátumba tömörít megadott minőséggel (quality).
 * Nem használ külső csomagokat, így nem növeli a bundle méretét.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.75,
): Promise<Blob> {
  // GIF és nem kép formátumok szűrése (a GIF animáció elveszne az átméretezéssel)
  if (file.type === "image/gif" || !file.type.startsWith("image/")) {
    return file;
  }

  // Ha a kép eleve nagyon kicsi (< 150 KB) és már JPEG, felesleges tömöríteni
  if (file.size < 150 * 1024 && file.type === "image/jpeg") {
    return file;
  }

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Aspektusarány megtartása az átméretezésnél
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // canvas hiba esetén az eredetit adjuk vissza fallbacknek
        return;
      }

      // Kép kirajzolása az új méretben
      ctx.drawImage(img, 0, 0, width, height);

      // Konverzió WebP jellé megadott minőséggel
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Csak akkor használjuk a tömörítettet, ha tényleg kisebb lett, mint az eredeti
            resolve(blob.size < file.size ? blob : file);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nem sikerült betölteni a képet."));
    };

    img.src = objectUrl;
  });
}
