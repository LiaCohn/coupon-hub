import { useState, useEffect } from 'react';
import { adminService, Coupon, CreateCouponDTO } from '../../services/api';
import './ProductForm.css';

interface ProductFormProps {
  onProductCreated: (message: string) => void;
  onProductUpdated: (message: string) => void;
  editingProduct?: Coupon | null;
  onCancelEdit?: () => void;
}

function ProductForm({ onProductCreated, onProductUpdated, editingProduct, onCancelEdit }: ProductFormProps) {
  
  const [formData, setFormData] = useState<CreateCouponDTO>({
    name: '',
    description: '',
    image_url: '',
    cost_price: 0,
    margin_percentage: 0,
    value: '',
    value_type: 'STRING',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!editingProduct;
  // Update form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        image_url: editingProduct.image_url,
        cost_price: editingProduct.cost_price,
        margin_percentage: editingProduct.margin_percentage,
        value: editingProduct.value,
        value_type: editingProduct.value_type,
      });
    } else {
      // Reset form if not editing
      setFormData({
        name: '',
        description: '',
        image_url: '',
        cost_price: 0,
        margin_percentage: 0,
        value: '',
        value_type: 'STRING',
      });
    }
    setError(null);
  }, [editingProduct]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost_price' || name === 'margin_percentage'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingProduct) {
        // Update existing product
        const result = await adminService.updateProduct(editingProduct.id, formData);
        const calculatedPrice = result.minimum_sell_price;
        
        onProductUpdated(
          `Product updated successfully! Minimum sell price: $${calculatedPrice.toFixed(2)}`
        );
      } else {
        // Create new product
        const result = await adminService.createCoupon(formData);
        const calculatedPrice = result.minimum_sell_price;
        
        onProductCreated(
          `Product created successfully! Minimum sell price: $${calculatedPrice.toFixed(2)}`
        );
        
        // Reset form only when creating
        setFormData({
          name: '',
          description: '',
          image_url: '',
          cost_price: 0,
          margin_percentage: 0,
          value: '',
          value_type: 'STRING',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{editingProduct ? 'Edit Coupon' : 'Create New Coupon'}</h2>
      
      {editingProduct && (
        <div className="edit-mode-banner">
          <span>Editing: <strong>{editingProduct?.name}</strong></span>
          <button type="button" onClick={onCancelEdit} className="btn-cancel">
            Cancel Edit
          </button>
        </div>
      )}
      
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL *</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            className="form-control"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cost_price">Cost Price ($) *</label>
            <input
              type="number"
              id="cost_price"
              name="cost_price"
              className="form-control"
              value={formData.cost_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="margin_percentage">Margin (%) *</label>
            <input
              type="number"
              id="margin_percentage"
              name="margin_percentage"
              className="form-control"
              value={formData.margin_percentage}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="value">Coupon Value *</label>
          <input
            type="text"
            id="value"
            name="value"
            className="form-control"
            value={formData.value}
            onChange={handleChange}
            placeholder="e.g., ABCD-1234-EFGH"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="value_type">Value Type *</label>
          <select
            id="value_type"
            name="value_type"
            className="form-control"
            value={formData.value_type}
            onChange={handleChange}
            required
          >
            <option value="STRING">String</option>
            <option value="IMAGE">Image</option>
          </select>
        </div>

        {formData.cost_price > 0 && formData.margin_percentage >= 0 && (
          <div className="price-preview">
            <strong>Calculated Minimum Sell Price:</strong> $
            {(formData.cost_price * (1 + formData.margin_percentage / 100)).toFixed(2)}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Coupon' : 'Create Coupon')}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
