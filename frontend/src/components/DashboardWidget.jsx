import React from "react";
import useBcvRate from "../hooks/useBcvRate";
import { DollarSign, Euro, AlertCircle, Loader } from "lucide-react";

/**
 * Un widget para el dashboard que muestra la tasa de cambio actual del BCV.
 * Utiliza el hook `useBcvRate` para obtener los datos.
 */
const DashboardWidget = () => {
    const { rates, loading, error } = useBcvRate();

    const renderContent = () => {
        if (loading) {
            return (
                <div className="widget-state-feedback">
                    <Loader className="animate-spin" size={24} />
                    <span>Cargando tasa...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="widget-state-feedback text-danger">
                    <AlertCircle size={24} />
                    <span>Error al cargar</span>
                </div>
            );
        }

        if (rates.usd !== null && rates.eur !== null) {
            return (
                <div className="widget-multi-rate-display">
                    <div className="widget-rate-item">
                        <DollarSign size={28} className="text-success" />
                        <div className="rate-value">
                            <span className="rate-amount">{rates.usd.toFixed(2)}</span>
                            <span className="rate-currency">Bs. / USD</span>
                        </div>
                    </div>
                    <div className="rate-divider"></div>
                    <div className="widget-rate-item">
                        <Euro size={28} className="text-info" />
                        <div className="rate-value">
                            <span className="rate-amount">{rates.eur.toFixed(2)}</span>
                            <span className="rate-currency">Bs. / EUR</span>
                        </div>
                    </div>
                </div>
            );
        }

        return null; // No mostrar nada si no hay datos y no hay error/carga
    };

    return (
        <div className="dashboard-widget bcv-widget-card">
            <div className="widget-header">
                <h5 className="widget-title">Tasas de Cambio</h5>
            </div>
            <div className="widget-body">{renderContent()}</div>
            <div className="widget-footer">
                {error ? (
                    <p className="error-message">{error}</p> // Solo muestra el error si existe
                ):(<p className="info-message">Datos proporcionados por DolarVzla.com</p>
                )}
            </div>
        </div>
    );
};

export default DashboardWidget;