import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import ProductsList from '../../components/ProductsList';
import ProductModal from '../../components/ProductModal';
import ExchangeRates from '../../components/ExchangeRates';
import { useNavigate } from 'react-router-dom';
import './ProductsPage.scss';

export default function ProductsPage() {
  const { user, hasRole, logout } = useAuth(); // добавляем logout
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления товара');
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        const newProduct = await api.createProduct(payload);
        setProducts(prev => [...prev, newProduct]);
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload);
        setProducts(prev => prev.map(p => p.id === payload.id ? updatedProduct : p));
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения товара');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canCreate = hasRole(['seller', 'admin']);
  const canEdit = hasRole(['seller', 'admin']);
  const canDelete = hasRole(['admin']);

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Online Store</div>
          <div className="header__right">
            {user ? (
              <>
                <span style={{ marginRight: '1rem' }}>
                  {user.first_name} {user.last_name} ({user.role})
                </span>
                {hasRole(['admin']) && (
                  <a href="/admin/users" className="admin-link" style={{ marginRight: '1rem' }}>
                    Управление пользователями
                  </a>
                )}
                <button onClick={handleLogout} className="btn btn--secondary">
                  Выйти
                </button>
              </>
            ) : (
              'Загрузка...'
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <ExchangeRates />

          <div className="toolbar">
            <h1 className="title">Товары</h1>
            {canCreate && (
              <button className="btn btn--primary" onClick={openCreate}>
                + Добавить товар
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : (
            <ProductsList
              products={products}
              onEdit={openEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Online Store
        </div>
      </footer>

      {canCreate && (
        <ProductModal
          open={modalOpen}
          mode={modalMode}
          initialProduct={editingProduct}
          onClose={closeModal}
          onSubmit={handleSubmitModal}
        />
      )}
    </div>
  );
}