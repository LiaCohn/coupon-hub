import { useState } from 'react';
import { adminService, Coupon } from '../../services/api';
import './ProductList.css';

interface ProductListProps {
  products: Coupon[];
  loading: boolean;
  onProductDeleted: () => void;
  onEdit: (product: Coupon) => void;
}

function ProductList({ products, loading, onProductDeleted, onEdit }: ProductListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await adminService.deleteProduct(id);
      onProductDeleted();
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Products</h2>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Products ({products.length})</h2>
      
      {products.length === 0 ? (
        <p className="no-products">No products yet. Create your first coupon!</p>
      ) : (
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className={`product-item ${product.is_sold ? 'sold' : ''}`}>
              <div className="product-image">
                <img src={product.image_url} alt={product.name} />
              </div>
              
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-pricing">
                  <div className="pricing-row">
                    <span className="label">Cost Price:</span>
                    <span className="value">${product.cost_price.toFixed(2)}</span>
                  </div>
                  <div className="pricing-row">
                    <span className="label">Margin:</span>
                    <span className="value">{product.margin_percentage}%</span>
                  </div>
                  <div className="pricing-row highlight">
                    <span className="label">Min. Sell Price:</span>
                    <span className="value">${product.minimum_sell_price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="product-meta">
                  <span className={`status-badge ${product.is_sold ? 'sold' : 'available'}`}>
                    {product.is_sold ? '❌ Sold' : '✅ Available'}
                  </span>
                  <span className="value-type">{product.value_type}</span>
                </div>

                {product.is_sold && product.reseller_price && (
                  <div className="sold-info">
                    Sold for: ${product.reseller_price.toFixed(2)}
                  </div>
                )}

                <div className="button-group">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(product)}
                    disabled={product.is_sold}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
