import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../components/UI/Toast';
import AddressBook, { type Address } from '../../components/Address/AddressBook';
import '../../styles/address-settings.css';

export default function AddressSettings() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAppData();
  const { showToast } = useToast();

  const handleAddAddress = (address: Omit<Address, 'id'>) => {
    addAddress(address);
    showToast('success', 'Address added successfully!');
  };

  const handleUpdateAddress = (id: string, address: Partial<Address>) => {
    updateAddress(id, address);
    showToast('success', 'Address updated successfully!');
  };

  const handleDeleteAddress = (id: string) => {
    const address = addresses.find(a => a.id === id);
    if (address?.isDefault && addresses.length > 1) {
      showToast('error', 'Cannot delete default address. Set another address as default first.');
      return;
    }
    deleteAddress(id);
    showToast('success', 'Address deleted successfully!');
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
    showToast('success', 'Default address updated!');
  };

  return (
    <div className="address-settings-page">
      <div className="settings-header">
        <h2>Delivery Addresses</h2>
        <p>Manage your delivery addresses for faster checkout</p>
      </div>

      <AddressBook
        addresses={addresses}
        onAddressAdd={handleAddAddress}
        onAddressUpdate={handleUpdateAddress}
        onAddressDelete={handleDeleteAddress}
        onSetDefault={handleSetDefault}
      />
    </div>
  );
}
