import React, { useState } from 'react';
import axios from 'axios';
import './login-page.css';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/auth/login', {
                email: username,
                senha: password
            });
            const { token, usuario } = response.data;
            // Salva token e usuário no localStorage
            localStorage.setItem('gciToken', token);
            localStorage.setItem('gciUser', JSON.stringify(usuario));
            if (onLoginSuccess) onLoginSuccess(usuario);
        } catch (err) {
            setError('Usuário ou senha inválidos');
        }
        setLoading(false);
    };

    return (
        <div className="login-page-container">
            <form className="login-container" onSubmit={handleSubmit}>
                <div className="login-logo">
                    <img src="/Logo-sem-fundo.svg" alt="Logo GCI" height={64} />
                </div>
                <h2 className="login-title">Acesso ao Sistema</h2>
                <div className="login-subtitle">Entre com suas credenciais</div>
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
                {error && <div className="login-error-message">{error}</div>}
                <button className="login-button" type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
                <div className="login-footer">
                    <a href="#">Esqueceu a senha?</a>
                </div>
            </form>
        </div>
    );
}
