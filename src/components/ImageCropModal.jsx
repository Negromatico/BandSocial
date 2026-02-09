import React, { useState, useRef, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropModal = ({ show, onHide, imageFile, onCropComplete, aspectRatio = null, title = "Editar Imagen" }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect: aspectRatio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState('');

  // Cargar imagen cuando cambia el archivo
  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (90 / 100) * width;
    const cropHeightInPercent = aspectRatio 
      ? cropWidthInPercent / aspectRatio 
      : (90 / 100) * height;
    
    const crop = {
      unit: 'px',
      width: cropWidthInPercent,
      height: cropHeightInPercent,
      x: (width - cropWidthInPercent) / 2,
      y: (height - cropHeightInPercent) / 2
    };
    
    setCrop(crop);
    setCompletedCrop(crop);
  }, [aspectRatio]);

  const generateCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const file = new File([blob], imageFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(file);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop, scale, rotate, imageFile]);

  const handleSave = async () => {
    const croppedFile = await generateCroppedImage();
    if (croppedFile) {
      onCropComplete(croppedFile);
      onHide();
    }
  };

  const handleCancel = () => {
    setCrop({ unit: '%', width: 90, aspect: aspectRatio });
    setScale(1);
    setRotate(0);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e4e6eb' }}>
        <Modal.Title style={{ fontSize: '20px', fontWeight: 700 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          {imageSrc && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              maxHeight: '500px',
              overflow: 'auto',
              background: '#f0f2f5',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
              >
                <img
                  ref={imgRef}
                  alt="Crop"
                  src={imageSrc}
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '450px'
                  }}
                />
              </ReactCrop>
            </div>
          )}
        </div>

        {/* Controles de edición */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              fontSize: '14px',
              color: '#050505'
            }}>
              Zoom: {scale.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              fontSize: '14px',
              color: '#050505'
            }}>
              Rotación: {rotate}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotate}
              onChange={(e) => setRotate(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer style={{ borderTop: '1px solid #e4e6eb', padding: '12px 20px' }}>
        <Button 
          variant="secondary" 
          onClick={handleCancel}
          style={{
            fontWeight: 600,
            padding: '8px 20px',
            borderRadius: '6px'
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          style={{
            background: '#1877f2',
            border: 'none',
            fontWeight: 600,
            padding: '8px 20px',
            borderRadius: '6px'
          }}
        >
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageCropModal;
