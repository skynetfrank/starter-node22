import React, { useState, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import { Send } from "lucide-react";

/**
 * Pantalla de demostración para el componente ImageUploader.
 * Gestiona la subida de archivos a Cloudinary y muestra el progreso y los resultados.
 */
function ImageUploaderScreen() {
  const [currentFiles, setCurrentFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [uploadedThumbnails, setUploadedThumbnails] = useState([]);

  // Resetea el estado cuando los archivos seleccionados cambian.
  useEffect(() => {
    setMainImageUrl("");
    setUploadedThumbnails([]);
    setUploadProgress(0);
  }, [currentFiles]);

  // Esta función se pasa como prop a ImageUploader y se ejecuta cada vez que los archivos cambian.
  const handleFilesChange = (files) => {
    console.log("Archivos recibidos en el componente padre:", files);
    setCurrentFiles(files);
  };

  /**
   * Sube un único archivo a Cloudinary.
   * @param {File} file - El archivo a subir.
   * @returns {Promise<string>} Una promesa que se resuelve con la URL segura de la imagen.
   */
  const uploadToCloudinary = (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ronald_preset");
    data.append("cloud_name", "ronaldimg");
    data.append("folder", "productos");

    return new Promise((resolve, reject) => {
      fetch("https://api.cloudinary.com/v1_1/ronaldimg/image/upload", {
        method: "post",
        body: data,
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.secure_url) {
            resolve(data.secure_url);
          } else {
            reject(new Error("La subida a Cloudinary falló."));
          }
        })
        .catch((err) => reject(err));
    });
  };

  /**
   * Orquesta la subida de todos los archivos seleccionados a Cloudinary.
   */
  const handleUploadImages = async () => {
    if (currentFiles.length === 0) {
      alert("Por favor, selecciona al menos una imagen para subir.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMainImageUrl("");
    setUploadedThumbnails([]);

    const totalFiles = currentFiles.length;

    try {
      const uploadedUrls = [];
      for (let i = 0; i < totalFiles; i++) {
        const file = currentFiles[i];
        console.log(`Subiendo archivo ${i + 1} de ${totalFiles}: ${file.name}`);
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);

        // Actualiza el progreso después de cada subida exitosa.
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      // Asigna la primera URL a la imagen principal y el resto a las miniaturas.
      setMainImageUrl(uploadedUrls[0] || "");
      setUploadedThumbnails(uploadedUrls.slice(1).map((url) => ({ url })));

      alert(`¡Carga finalizada con éxito! Se subieron ${totalFiles} imágenes.`);
      console.log("URL Principal:", uploadedUrls[0]);
      console.log("Miniaturas:", uploadedUrls.slice(1));
    } catch (error) {
      console.error("Error durante la subida de imágenes:", error);
      alert("Ocurrió un error al subir una o más imágenes. Revisa la consola para más detalles.");
    } finally {
      // Se asegura de que el estado de carga se desactive al finalizar, incluso si hay errores.
      setIsUploading(false);
    }
  };

  // Condición para mostrar la sección de resultados/acciones
  // Se muestra si hay archivos seleccionados, si se está subiendo, o si ya hay URLs de imágenes.
  const showResultsSection = isUploading || mainImageUrl || uploadedThumbnails.length > 0 || currentFiles.length > 0;

  return (
    <div className="uploader-screen-container">
      <h1 className="uploader-screen-title">Cargar Imagenes</h1>
      <div className="uploader-wrapper-card">
        <ImageUploader onFilesChange={handleFilesChange} />
      </div>

      {showResultsSection && (
        <div className="upload-results-section">
          {isUploading && (
            <div className="upload-progress-bar-container">
              <p className="upload-progress-text">Subiendo... {Math.round(uploadProgress)}%</p>
              <progress value={uploadProgress} max="100" className="upload-progress-bar" />
            </div>
          )}

          {mainImageUrl && (
            <div className="main-image-display">
              <h4 className="main-image-title">Imagen Principal:</h4>
              <img src={mainImageUrl} alt="Imagen principal subida" className="main-uploaded-image" />
              <p className="image-url-link">
                <a href={mainImageUrl} target="_blank" rel="noopener noreferrer">
                  Ver URL
                </a>
              </p>
            </div>
          )}

          {uploadedThumbnails.length > 0 && (
            <div className="thumbnails-display">
              <h4 className="thumbnails-title">Miniaturas Adicionales:</h4>
              <div className="thumbnails-grid">
                {uploadedThumbnails.map((thumb, index) => (
                  <img
                    key={index}
                    src={thumb.url.replace("/upload/", "/upload/c_fill,h_60,w_60/")}
                    alt={`Miniatura ${index + 1}`}
                    className="uploaded-thumbnail"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-with-icon upload-action-button"
            onClick={handleUploadImages}
            disabled={currentFiles.length === 0 || isUploading}
          >
            <Send size={18} />
            <span>{isUploading ? "Subiendo..." : "Subir Imágenes"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploaderScreen;
