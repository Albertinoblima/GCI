// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient.js';
import authService from '../services/authService.js'; // Nosso novo serviço de API

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Pega o token do localStorage na inicialização
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Verdadeiro apenas durante a verificação inicial

    const navigate = useNavigate();
    const location = useLocation();

    // Efeito para sincronizar o token com o apiClient e o localStorage
    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('authToken', token);
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
        }
    }, [token]);

    // Função para verificar o token e buscar dados do usuário ao carregar a aplicação
    const verifyAuthOnLoad = useCallback(async () => {
        if (token && !user) {
            try {
                // Usa o serviço para validar o token e buscar os dados do usuário
                const response = await authService.getMe();
                setUser(response.data.usuario);
            } catch (error) {
                console.warn("Sessão inválida ou expirada. Limpando...", error);
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, [token, user]);

    // Executa a verificação apenas uma vez, quando o componente é montado.
    useEffect(() => {
        verifyAuthOnLoad();
    }, [verifyAuthOnLoad]);

    // Função de login que será chamada pelo LoginPage
    const login = async (email, password) => {
        try {
            const response = await authService.login({ email, password });
            // A resposta do authService já vem com o .data, então acessamos diretamente
            const { token: newToken, data: { usuario: userData } } = response;

            setToken(newToken);
            setUser(userData);

            // Redireciona para o dashboard ou para a página que o usuário tentou acessar
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (error) {
            // Re-lança o erro para que o componente do formulário (LoginPage) possa
            // parar o loading e exibir a mensagem de erro para o usuário.
            console.error("Falha no login (AuthContext):", error.message);
            throw error; // O erro já vem tratado do useApi/apiClient
        }
    };

    // Função de logout
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        // O useEffect acima já limpa o localStorage e o apiClient
        navigate('/login', { replace: true });
    }, [navigate]);

    // O valor que será fornecido para todos os componentes filhos
    const value = {
        user,
        token,
        isAuthenticated: !!user, // A autenticação é verdadeira se houver um objeto de usuário
        isLoadingAuth: isLoading, // Expõe o estado de carregamento inicial
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Não renderiza os filhos até que a verificação inicial esteja concluída */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};