import { PublicProduct, PurchaseResponse } from '../../services/api';
import './PurchaseModal.css';

interface PurchaseModalProps {
  product: PublicProduct | null;
  purchaseResult: PurchaseResponse | null;
  onConfirm: () => void;
  onClose: () => void;
}

function PurchaseModal({ product, purchaseResult, onConfirm, onClose }: PurchaseModalProps) {
  if (purchaseResult) {
    // Show success state with coupon value
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>✅ Purchase Successful!</h2>
          </div>
          
          <div className="modal-body">
            <div className="success-message">
              <p>Your coupon has been purchased successfully!</p>
            </div>

            <div className="coupon-details">
              <div className="detail-row">
                <span className="detail-label">Product ID:</span>
                <span className="detail-value">{purchaseResult.product_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Price Paid:</span>
                <span className="detail-value">${purchaseResult.final_price.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Value Type:</span>
                <span className="detail-value">{purchaseResult.value_type}</span>
              </div>
            </div>

            <div className="coupon-value-box">
              <h3>Your Coupon Code</h3>
              {purchaseResult.value_type === 'STRING' ? (
                <div className="coupon-code">{purchaseResult.value}</div>
              ) : (
                <div className="coupon-image">
                  <img src={purchaseResult.value} alt="Coupon QR Code" />
                </div>
              )}
              <p className="save-instruction">💡 Save this code for your records</p>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (product) {
    // Show confirmation dialog
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Confirm Purchase</h2>
          </div>
          
          <div className="modal-body">
            <div className="product-summary">
              <img src={product.image_url} alt={product.name} />
              <div className="summary-details">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="summary-price">
                  <span>Total:</span>
                  <strong>${product.price.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <p className="confirmation-text">
              Are you sure you want to purchase this coupon?
            </p>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={onConfirm}>
              Confirm Purchase
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PurchaseModal;
