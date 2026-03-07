import { useState, useEffect } from 'react';
import CouponCard from '../components/Customer/CouponCard';
import PurchaseModal from '../components/Customer/PurchaseModal';
import { customerService, PublicProduct, PurchaseResponse } from '../services/api';
import './CustomerPage.css';

function CustomerPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getAvailableProducts();
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

  const handlePurchase = (product: PublicProduct) => {
    setSelectedProduct(product);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;

    try {
      const result = await customerService.purchaseProduct(selectedProduct.id);
      setPurchaseResult(result);
      loadProducts(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to purchase product');
      setSelectedProduct(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setPurchaseResult(null);
  };

  return (
    <div className="customer-page">
      <div className="hero-section">
        <h1>🎟️ Available Coupons</h1>
        <p>Browse and purchase digital coupons at great prices</p>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {loading ? (
        <div className="loading">Loading coupons...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No coupons available</h2>
          <p>Check back later for new deals!</p>
        </div>
      ) : (
        <div className="grid">
          {products.map(product => (
            <CouponCard
              key={product.id}
              product={product}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}

      {(selectedProduct || purchaseResult) && (
        <PurchaseModal
          product={selectedProduct}
          purchaseResult={purchaseResult}
          onConfirm={handleConfirmPurchase}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default CustomerPage;
