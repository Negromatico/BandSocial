import React, { useState } from 'react';
import { uploadToCloudinary } from '../services/cloudinary';

/**
 * Componente para subir una imagen o video a Cloudinary y mostrar la previsualización.
 * @param {Object} props
 * @param {'image'|'video'} props.type - Tipo de archivo permitido.
 * @param {function} props.onUpload - Callback con la URL subida.
 * @param {string} [props.label] - Texto del botón.
 * @param {number} [props.maxDuration] - Máx duración en segundos para videos (opcional).
 * @param {string} [props.folder] - Carpeta en Cloudinary (opcional).
 * @param {number} [props.previewSize] - Tamaño del preview (opcional).
 */
const UploadMedia = ({
  type = 'image',
  onUpload,
  label = 'Subir archivo',
  maxDuration,
  folder,
  previewSize = 120,
}) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'image' && !file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }
    if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        setError('Solo se permiten videos');
        return;
      }
      if (maxDuration) {
        // Validar duración del video
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > maxDuration) {
            setError(`El video no puede superar ${maxDuration} segundos.`);
          } else {
            upload(file);
          }
        };
        video.src = URL.createObjectURL(file);
        return;
      }
    }
    upload(file);
  };

  const upload = async (file) => {
    setLoading(true);
    try {
      const url = await uploadToCloudinary(file, 'Bandas', 'bandas');
      setPreview(url);
      if (onUpload) onUpload(url);
    } catch (err) {
      setError('Error subiendo archivo: ' + (err.message || err.toString()));
      // Mostrar error completo en consola para depuración
      console.error('Error subiendo archivo a Cloudinary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label>
        {label}
        <input
          type="file"
          accept={type === 'image' ? 'image/*' : 'video/*'}
          style={{ display: 'block', marginTop: 4 }}
          onChange={handleChange}
          disabled={loading}
        />
      </label>
      {loading && <div>Subiendo...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {preview && (
        type === 'image' ? (
          <img src={preview} alt="preview" style={{ width: previewSize, height: previewSize, objectFit: 'cover', borderRadius: 8, border: '2px solid #a78bfa', marginTop: 8 }} />
        ) : (
          <video src={preview} controls style={{ width: 180, maxHeight: previewSize, borderRadius: 8, border: '2px solid #a78bfa', marginTop: 8 }} />
        )
      )}
    </div>
  );
};

export default UploadMedia;
