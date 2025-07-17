// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import GCI from './GCI'; // Seu layout principal do painel
import Login from './components/Login/Login';
import './index.css'; // CSS Global

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
                    {/* GCI agora é o layout para as rotas filhas */}
                    <Route path="/*" element={<GCI currentUser={currentUser} onLogout={handleLogout} />} />
                    {/*
                        Dentro de GCI.js, você terá mais <Routes> para as sub-páginas do painel
                        Ex: /dashboard, /atendimentos, etc.
                        A rota "/*" aqui significa que qualquer rota que não seja /login e que esteja
                        autenticada será gerenciada pelo roteador dentro de GCI.js
                    */}
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
