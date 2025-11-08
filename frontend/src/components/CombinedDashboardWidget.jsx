import React, { useState } from "react";
import { Link } from "react-router";
import useBcvRate from "../hooks/useBcvRate";
import { useGetClientesQuery } from "../api/clientesApi";
import {
  DollarSign,
  Euro,
  Users,
  AlertCircle,
  Loader,
  TrendingUp,
  UserPlus,
} from "lucide-react";

/**
 * Un widget combinado para el dashboard que muestra las tasas de cambio y el total de clientes,
 * con pestañas para navegar entre las dos vistas.
 */
const CombinedDashboardWidget = () => {
  const [activeTab, setActiveTab] = useState("rates"); // 'rates' o 'clients'

  // Hooks para obtener los datos de ambas pestañas
  const { rates, loading: ratesLoading, error: ratesError } = useBcvRate();
  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
  } = useGetClientesQuery({ limit: 1 });

  const renderRatesContent = () => {
    if (ratesLoading) {
      return (
        <div className="widget-state-feedback">
          <Loader className="animate-spin" size={24} />
          <span>Cargando tasas...</span>
        </div>
      );
    }
    if (ratesError) {
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
    return null;
  };

  const renderClientsContent = () => {
    if (clientsLoading) {
      return (
        <div className="widget-state-feedback">
          <Loader className="animate-spin" size={24} />
          <span>Cargando total...</span>
        </div>
      );
    }
    if (clientsError) {
      return (
        <div className="widget-state-feedback text-danger">
          <AlertCircle size={24} />
          <span>Error al cargar</span>
        </div>
      );
    }
    if (clientsData?.total !== undefined) {
      return (
        <div className="widget-rate-display">
          <Users size={32} className="text-accent" />
          <div className="rate-value">
            <span className="rate-amount">{clientsData.total}</span>
            <span className="rate-currency">Clientes Registrados</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-widget combined-widget-card">
      <div className="widget-tabs">
        <button className={`widget-tab ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')}>
          <TrendingUp size={16} /> Tasas
        </button>
        <button className={`widget-tab ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
          <UserPlus size={16} /> Clientes
        </button>
      </div>
      <div className="widget-body">
        {activeTab === "rates" ? renderRatesContent() : renderClientsContent()}
      </div>
      <div className="widget-footer">
        {activeTab === 'rates' && !ratesError && <small>Datos proporcionados por DolarVzla</small>}
        {activeTab === 'clients' && !clientsError && <Link to="/clientes" className="widget-footer-link">Gestionar Clientes</Link>}
        {activeTab === 'rates' && ratesError && <p className="error-message">{ratesError}</p>}
        {activeTab === 'clients' && clientsError && <p className="error-message">No se pudo obtener el total</p>}
      </div>
    </div>
  );
};

export default CombinedDashboardWidget;