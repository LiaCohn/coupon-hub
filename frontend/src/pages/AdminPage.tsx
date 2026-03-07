import { useState, useEffect } from 'react';
import ProductForm from '../components/Admin/ProductForm';
import ProductList from '../components/Admin/ProductList';
import { adminService, Coupon } from '../services/api';
import './AdminPage.css';

function AdminPage() {
  const [products, setProducts] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Coupon | null>(null); // ADD THIS


  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductCreated = (message: string) => {
    setSuccessMessage(message);
    setEditingProduct(null);
    loadProducts();
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleProductUpdated = (message: string) => {
    setSuccessMessage(message);
    setEditingProduct(null);
    loadProducts();
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleProductDeleted = () => {
    setSuccessMessage('Product deleted successfully');
    setEditingProduct(null);
    loadProducts();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (product: Coupon) => {
    setEditingProduct(product);
    // Optionally scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="admin-grid">
        <div className="admin-section">
        <ProductForm 
            onProductCreated={handleProductCreated}
            onProductUpdated={handleProductUpdated}
            editingProduct={editingProduct}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <div className="admin-section">
          <ProductList 
            products={products} 
            loading={loading}
            onProductDeleted={handleProductDeleted}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
