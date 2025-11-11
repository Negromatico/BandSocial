// src/services/cloudinary.js

/**
 * Sube un archivo (imagen o video) a Cloudinary usando un upload preset unsigned.
 * @param {File} file - Archivo a subir.
 * @param {string} preset - Nombre del upload preset (debe ser unsigned).
 * @param {string} folder - (opcional) Carpeta destino en Cloudinary.
 * @returns {Promise<string>} - URL pública del archivo subido.
 */
export async function uploadToCloudinary(file, preset = 'Bandas', folder = 'bandas') {
  const url = `https://api.cloudinary.com/v1_1/ddijtaal1/${file.type.startsWith('video') ? 'video' : 'image'}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error subiendo archivo a Cloudinary');
  const data = await res.json();
  return data.secure_url;
}
