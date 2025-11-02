import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Image, Plus } from "lucide-react";

const MAX_IMAGES = 10;

/**
 * Componente reutilizable para cargar y previsualizar imágenes.
 * @param {object} props
 * @param {function(File[]): void} props.onFilesChange - Callback que se ejecuta cuando la lista de archivos seleccionados cambia.
 */
function ImageUploader({ onFilesChange }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    // Limpia los Object URLs para evitar memory leaks cuando el componente se desmonta.
    useEffect(() => {
        return () => {
            // No-op
        };
    }, []); // <-- El array de dependencias vacío asegura que esto solo se ejecute al desmontar.

    const handleFileChange = (event) => {
        setIsProcessing(true);

        const files = Array.from(event.target.files);
        const totalFiles = selectedFiles.length + files.length;

        if (totalFiles > MAX_IMAGES) {
            alert(`No puedes seleccionar más de ${MAX_IMAGES} imágenes en total.`);
            setIsProcessing(false);
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        const newPreviews = files.map((file) => URL.createObjectURL(file));

        setSelectedFiles(newFiles); // Actualiza la lista de archivos
        setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviews]); // Añade las nuevas previsualizaciones a las existentes
        onFilesChange(newFiles); // Notifica al componente padre

        // Simulamos un pequeño retardo para que el spinner sea visible en cargas rápidas
        setTimeout(() => {
            setIsProcessing(false);
        }, 300);
    };

    const handleRemoveImage = (indexToRemove) => {
        // Revoca el Object URL de la imagen que se va a eliminar.
        URL.revokeObjectURL(previewUrls[indexToRemove]);

        const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        const updatedPreviews = previewUrls.filter((_, index) => index !== indexToRemove);

        setSelectedFiles(updatedFiles);
        setPreviewUrls(updatedPreviews);
        onFilesChange(updatedFiles);
    };

    const handleUploadAreaClick = () => {
        // Limpia el valor del input para permitir seleccionar el mismo archivo de nuevo.
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        fileInputRef.current.click();
    };

    // Helper para formatear el tamaño del archivo
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="image-uploader-container">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/png, image/jpeg, image/gif"
                style={{ display: "none" }}
                disabled={selectedFiles.length >= MAX_IMAGES}
            />
            {/* Si no hay imágenes, muestra un área de carga grande */}
            {selectedFiles.length === 0 ? (
                <div className="upload-area-full" onClick={handleUploadAreaClick}>
                    <Upload size={48} className="upload-icon-large" />
                    <span className="upload-text-large">Haz clic o arrastra imágenes aquí</span>
                    <span className="upload-text-small">Máximo 10 imágenes</span>
                </div>
            ) : (
                isProcessing ? (
                    <div className="upload-area-full is-processing">
                        <div className="spinner-small"></div>
                        <span className="upload-text-large mt-3">Procesando...</span>
                    </div>) : (
                    // Si hay imágenes, muestra la galería
                    <div className="image-preview-gallery">
                        {previewUrls.map((url, index) => (
                            <div key={url} className="image-preview-card">
                                <div className="image-preview-wrapper">
                                    <img src={url} alt={`Previsualización ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => handleRemoveImage(index)}
                                        aria-label="Eliminar imagen"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="image-info">
                                    <span className="file-size">{formatFileSize(selectedFiles[index].size)}</span>
                                </div>
                            </div>
                        ))}
                        {/* Botón para añadir más imágenes si no se ha alcanzado el límite */}
                        {selectedFiles.length < MAX_IMAGES && (
                            <button type="button" className="upload-area-small" onClick={handleUploadAreaClick} aria-label="Añadir más imágenes" title="Añadir más imágenes" >
                                <div className="add-more-icons">
                                    <Image size={96} />
                                    <Plus size={24} className="plus-icon-overlay" />
                                </div>
                                <span className="upload-counter">
                                    {selectedFiles.length}/{MAX_IMAGES}
                                </span>
                            </button>
                        )}
                    </div>)
            )}
        </div>
    );
}

export default ImageUploader;