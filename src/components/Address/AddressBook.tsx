import { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import '../../styles/address-book.css';

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Farm", "Office"
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  isDefault: boolean;
}

interface AddressBookProps {
  addresses: Address[];
  onAddressAdd: (address: Omit<Address, 'id'>) => void;
  onAddressUpdate: (id: string, address: Partial<Address>) => void;
  onAddressDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const zimbabweProvinces = [
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands'
];

export default function AddressBook({
  addresses,
  onAddressAdd,
  onAddressUpdate,
  onAddressDelete,
  onSetDefault
}: AddressBookProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: 'Harare',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      label: '',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: 'Harare',
      isDefault: false
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      onAddressUpdate(editingId, formData);
    } else {
      onAddressAdd(formData);
    }
    
    resetForm();
  };

  const handleEdit = (address: Address) => {
    setFormData(address);
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      onAddressDelete(id);
    }
  };

  return (
    <div className="address-book">
      <div className="address-book-header">
        <h3>Delivery Addresses</h3>
        {!isAdding && (
          <button className="btn-add-address" onClick={() => setIsAdding(true)}>
            <Plus size={20} />
            Add New Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {isAdding && (
        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h4>{editingId ? 'Edit Address' : 'Add New Address'}</h4>
            <button type="button" className="btn-close-form" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="label">Address Label *</label>
              <input
                id="label"
                type="text"
                placeholder="e.g., Home, Farm, Office"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                placeholder="Recipient's full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                placeholder="+263 xxx xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="addressLine1">Street Address *</label>
              <input
                id="addressLine1"
                type="text"
                placeholder="House number and street name"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="addressLine2">Apartment, suite, etc. (optional)</label>
              <input
                id="addressLine2"
                type="text"
                placeholder="Additional address information"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City / Town *</label>
              <input
                id="city"
                type="text"
                placeholder="e.g., Harare"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="province">Province *</label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                required
              >
                {zimbabweProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <span>Set as default delivery address</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Check size={20} />
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      <div className="address-list">
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <MapPin size={48} />
            <p>No delivery addresses yet</p>
            <span>Add your first address to get started</span>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              {address.isDefault && <span className="default-badge">Default</span>}
              
              <div className="address-content">
                <div className="address-header">
                  <h4>{address.label}</h4>
                  <div className="address-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(address)}
                      title="Edit address"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(address.id)}
                      title="Delete address"
                      disabled={address.isDefault}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="address-details">
                  <p className="recipient-name">{address.fullName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.province}</p>
                  <p className="phone">{address.phone}</p>
                </div>

                {!address.isDefault && (
                  <button
                    className="btn-set-default"
                    onClick={() => onSetDefault(address.id)}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
