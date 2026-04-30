// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import GCI from './GCI'; // Seu layout principal do painel
import Login from './components/Login/Login';
import './index.css'; // CSS Global

const DashboardHome = ({ currentUser }) => (
    <div>
        <h2>Visao Geral</h2>
        <p>Bem-vindo, {(currentUser && (currentUser.nome || currentUser.name)) || 'Usuario'}.</p>
        <div className="gci-stats-grid">
            <div className="gci-stat-card">
                <h3>Atendimentos Hoje</h3>
                <div className="gci-stat-number">0</div>
                <div className="gci-stat-change">Aguardando integracao</div>
            </div>
            <div className="gci-stat-card">
                <h3>Usuarios Ativos</h3>
                <div className="gci-stat-number">0</div>
                <div className="gci-stat-change">Aguardando integracao</div>
            </div>
            <div className="gci-stat-card">
                <h3>Servicos Disponiveis</h3>
                <div className="gci-stat-number">0</div>
                <div className="gci-stat-change">Aguardando integracao</div>
            </div>
        </div>
    </div>
);

const SectionPlaceholder = ({ title, description }) => (
    <div>
        <h2>{title}</h2>
        <p>{description}</p>
    </div>
);

// Componente para Rotas Protegidas
const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />; // Outlet é usado para rotas aninhadas
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Para evitar flicker

    useEffect(() => {
        // Verificar se existe um token no localStorage ao carregar a app
        const token = localStorage.getItem('gciToken');
        const storedUser = localStorage.getItem('gciUser');
        if (token && storedUser) {
            try {
                setIsAuthenticated(true);
                setCurrentUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Erro ao parsear usuário do localStorage", error);
                localStorage.removeItem('gciToken');
                localStorage.removeItem('gciUser');
            }
        }
        setIsLoadingAuth(false);
    }, []);

    const handleLoginSuccess = (userData) => {
        setIsAuthenticated(true);
        setCurrentUser(userData);
        // O token já foi salvo no localStorage pelo componente Login
    };

    const handleLogout = () => {
        localStorage.removeItem('gciToken');
        localStorage.removeItem('gciUser');
        setIsAuthenticated(false);
        setCurrentUser(null);
        // Idealmente, redirecionar para /login aqui também,
        // mas o ProtectedRoute já fará isso se tentarem acessar rota protegida.
    };

    if (isLoadingAuth) {
        return <div>Carregando aplicação...</div>; // Ou um spinner/loader
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />}
                />

                {/* Rotas Protegidas */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                    <Route path="/" element={<GCI currentUser={currentUser} onLogout={handleLogout} />}>
                        <Route path="dashboard" element={<DashboardHome currentUser={currentUser} />} />
                        <Route
                            path="atendimentos"
                            element={<SectionPlaceholder title="Atendimentos" description="Modulo em construcao." />}
                        />
                        <Route
                            path="usuarios"
                            element={<SectionPlaceholder title="Usuarios" description="Modulo em construcao." />}
                        />
                        <Route
                            path="configuracoes"
                            element={<SectionPlaceholder title="Configuracoes" description="Modulo em construcao." />}
                        />
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Route>

                {/* Rota padrão: se autenticado vai para dashboard, senão para login */}
                <Route
                    path="/"
                    element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;
