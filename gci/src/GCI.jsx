import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import './index.css';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/atendimentos', label: 'Atendimentos', icon: '🩺' },
    { path: '/usuarios', label: 'Usuários', icon: '👤' },
    { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function GCI({ currentUser, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate('/login');
    };

    return (
        <div className="gci-admin-layout">
            <aside className="gci-sidebar">
                <div className="gci-sidebar-header">
                    <Link to="/dashboard" className="gci-sidebar-logo">
                        <span className="nav-icon">🌐</span>
                        <span className="nav-text">GCI</span>
                    </Link>
                </div>
                <nav className="gci-sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink to={item.path} className={({ isActive }) => (isActive ? 'gci-active' : '')}>
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="gci-user-menu">
                    <span>{currentUser ? (currentUser.nome || currentUser.name) : 'Usuario'}</span>
                    <button onClick={handleLogout}>Sair</button>
                </div>
            </aside>
            <main className="gci-content">
                <header className="gci-header">
                    <h1>Painel Administrativo</h1>
                </header>
                <section className="gci-main-section">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
