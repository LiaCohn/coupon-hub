import { PublicProduct } from '../../services/api';
import './CouponCard.css';

interface CouponCardProps {
  product: PublicProduct;
  onPurchase: (product: PublicProduct) => void;
}

function CouponCard({ product, onPurchase }: CouponCardProps) {
  return (
    <div className="coupon-card">
      <div className="coupon-image">
        <img src={product.image_url} alt={product.name} />
      </div>
      
      <div className="coupon-content">
        <h3 className="coupon-title">{product.name}</h3>
        <p className="coupon-description">{product.description}</p>
        
        <div className="coupon-footer">
          <div className="coupon-price">
            <span className="price-label">Price</span>
            <span className="price-value">${product.price.toFixed(2)}</span>
          </div>
          
          <button
            className="btn btn-success"
            onClick={() => onPurchase(product)}
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

export default CouponCard;
