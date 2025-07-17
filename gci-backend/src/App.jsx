// src/App.jsx
import React, { useState, useContext } // Adicionado useContext
    from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext'; // Ajuste o caminho se necessário
import AppLayout from './components/layout/Layout'; // Seu layout principal
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AtendimentosPage from './pages/AtendimentosPage';
import MunicipiosPage from './pages/MunicipiosPage'; // 1. IMPORTE A PÁGINA DE MUNICÍPIOS
import React, { useState, useContext } from 'react';
import { createPageUrl } from './utils/urls';
import SecretariasPorMunicipioPage from './pages/SecretariasPorMunicipioPage';
// Função utilitária para criar URLs (idealmente em um arquivo utils/urls.js)
// Se já existir em @/utils/urls, remova esta definição local.
function createPageUrl(pageName) {
    if (!pageName) return '/'; // Fallback para a raiz se pageName for undefined
    return `/${pageName.toLowerCase().replace(/\s+/g, '-')}`; // Ex: "Gerenciar Municípios" -> "/gerenciar-municipios"
}


// Componente para Rotas Protegidas
function ProtectedRoute({ children }) {
    const auth = useContext(AuthContext); // Usar o hook useContext para acessar o contexto

    if (auth.isLoadingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="ml-4 text-slate-700 dark:text-slate-300">Carregando autenticação...</p>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Componente para Rotas Públicas (como Login) que redireciona se já estiver logado
function PublicRoute({ children }) {
    const auth = useContext(AuthContext); // Usar o hook useContext

    if (auth.isLoadingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="ml-4 text-slate-700 dark:text-slate-300">Carregando...</p>
            </div>
        );
    }

    if (auth.isAuthenticated) {
        return <Navigate to={createPageUrl('Dashboard')} replace />;
    }
    return children;
}


function App() {
    // O estado currentPageName é passado para o AppLayout.
    // Ele poderia ser atualizado com base na rota atual usando useLocation e useEffect,
    // ou cada rota pode passar seu próprio nome diretamente.
    // Por simplicidade, cada Route com AppLayout passará o nome diretamente.
    // const [currentPageName, setCurrentPageName] = useState("Dashboard"); 

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                    {/* Rota Raiz Protegida - Redireciona para o Dashboard */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                {/* Não precisa do AppLayout aqui se for só redirecionar */}
                                <Navigate to={createPageUrl('Dashboard')} replace />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas Protegidas que usam o AppLayout */}
                    <Route
                        path={createPageUrl('Dashboard')}
                        element={
                            <ProtectedRoute>
                                <AppLayout currentPageName="Dashboard">
                                    <DashboardPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={createPageUrl('Atendimentos')}
                        element={
                            <ProtectedRoute>
                                <AppLayout currentPageName="Atendimentos">
                                    <AtendimentosPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 2. ROTA PARA MUNICÍPIOS (DESCOMENTADA E ATIVA) */}
                    {/* Gera /municipios */}
                    <Route
                        path={createPageUrl('Municipios')}
                        element={
                            <ProtectedRoute>
                                <AppLayout currentPageName="Gerenciar Municípios">
                                    <MunicipiosPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Adicione outras rotas protegidas aqui, usando o AppLayout */}
                    {/* Exemplo:
                    <Route 
                        path={createPageUrl('Configuracoes')}
                        element={
                            <ProtectedRoute>
                                <AppLayout currentPageName="Configurações">
                                    <ConfiguracoesPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    */}

                    {/* Rota de fallback para páginas não encontradas (404) */}
                    <Route path="*" element={
                        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-100 dark:bg-slate-900 p-6">
                            <AlertTriangle className="w-16 h-16 text-orange-500 mb-6" />
                            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">Erro 404</h1>
                            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Oops! A página que você está procurando não foi encontrada.</p>
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                                <RouterLink to={createPageUrl('Dashboard')}>
                                    Voltar para o Dashboard
                                </RouterLink>
                            </Button>
                        </div>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ... suas rotas de login, dashboard, atendimentos ... */}
                    <Route
                        path={createPageUrl('Municipios')}
                        element={
                            <ProtectedRoute>
                                <AppLayout currentPageName="Gerenciar Municípios">
                                    <MunicipiosPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    {/* 2. NOVA ROTA PARA SECRETARIAS POR MUNICÍPIO */}
                    <Route
                        // Ex: /municipios/:municipioId/secretarias
                        path={`${createPageUrl('Municipios')}/:municipioId/secretarias`}
                        element={
                            <ProtectedRoute>
                                {/* O AppLayout pode precisar do nome da página dinamicamente aqui ou ser ajustado */}
                                <AppLayout currentPageName="Gerenciar Secretarias">
                                    <SecretariasPorMunicipioPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ... outras rotas ... */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;