import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import './css/AddresPage.css';
import Checkbox from '@mui/material/Checkbox'; 
import { pink } from '@mui/material/colors'; 
import Box from '@mui/material/Box'; 
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField'; 
import Radio from '@mui/material/Radio'; 
import RadioGroup from '@mui/material/RadioGroup'; 
import FormControlLabel from '@mui/material/FormControlLabel'; 
import CloseIcon from '@mui/icons-material/Close'; 
import api from '../api.js'; 

export default function AddresPage() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    country: '',
    full_name: '',
    mobile_number: '',
    pincode: '',
    flat_house_no_building: '',
    area_street_sector_village: '',
    landmark: '',
    town_city: '',
    state: '',
    default_address: false,
    address_type: 'Apartment',
    weekends_delivery: {
      saturdays: false,
      sundays: false
    },
    delivery_instructions: ''
  });
  const [originalAddress, setOriginalAddress] = useState(null);
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get('/api/addresses', {
          headers: {
            'Authorization': `Bearer ${isAuthenticated}`
        }
        });
        setAddresses(response.data.shipping_add);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]); 
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  const goBack = () => {
    navigate(-1);
  };

  const handleAddAddressClick = () => {
    setEditMode(false);
    setCurrentAddress({
      country: '',
      full_name: '',
      mobile_number: '',
      pincode: '',
      flat_house_no_building: '',
      area_street_sector_village: '',
      landmark: '',
      town_city: '',
      state: '',
      default_address: false,
      address_type: 'Apartment',
      weekends_delivery: {
        saturdays: false,
        sundays: false
      },
      delivery_instructions: ''
    });
    setOriginalAddress(null);
    setShowForm(true);
  };

  const handleEditAddressClick = (address) => {
    setEditMode(true);
    setOriginalAddress(address);
    setCurrentAddress({
      ...address,
      weekends_delivery: {
        saturdays: address.weekends_delivery?.saturdays || false,
        sundays: address.weekends_delivery?.sundays || false
      }
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentAddress({
      country: '',
      full_name: '',
      mobile_number: '',
      pincode: '',
      flat_house_no_building: '',
      area_street_sector_village: '',
      landmark: '',
      town_city: '',
      state: '',
      default_address: false,
      address_type: 'Apartment',
      weekends_delivery: {
        saturdays: false,
        sundays: false
      },
      delivery_instructions: ''
    });
    setOriginalAddress(null);
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    const requiredFields = ['country', 'full_name', 'mobile_number', 'pincode', 'flat_house_no_building', 'area_street_sector_village', 'town_city', 'state', 'address_type'];
  
    // Check if all required fields are filled
    for (let field of requiredFields) {
      if (!currentAddress[field]) {
        alert(`Please fill in the ${field.replace('_', ' ')}`);
        return;
      }
    }
  
    try {
      const updatedAddressData = { ...currentAddress };
      
      if (editMode && originalAddress._id) {
        await api.put('/api/addresses', { id: originalAddress._id, ...updatedAddressData }, {
          headers: {
            'Authorization': `Bearer ${isAuthenticated}`,
          }
        });
      } else {
        await api.post('/api/addresses', updatedAddressData, {
          headers: {
            'Authorization': `Bearer ${isAuthenticated}`,
          }
        });
      }
  
      const response = await api.get('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${isAuthenticated}`,
        }
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please check the console for details.');
    } finally {
      handleCloseForm();
    }
  };
  
 const handleInputChange = (event) => {
  const { name, value, type, checked } = event.target;
  
  if (name.startsWith('weekends_delivery')) {
    const field = name.split('.')[1];
    setCurrentAddress((prevAddress) => ({
      ...prevAddress,
      weekends_delivery: {
        ...prevAddress.weekends_delivery,
        [field]: checked
      }
    }));
  } else {
    setCurrentAddress((prevAddress) => ({
      ...prevAddress,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
};


  const handleShippingAddressChange = (addressId) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) =>
        addr._id === addressId
          ? { ...addr, default_address: true }
          : { ...addr, default_address: false }
      )
    );
    setShippingAddressId(addressId);
  };

  return (
    <div className="address-page">
      <Header />
      <header className="address-header">
        <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
        <h1>Shipping Addresses</h1>
      </header>
      <main className="address-main">
        {addresses.map((address) => (
          <div key={address._id} className="address-card">
            <div className="address-header-card">
              <h3>{address.full_name}</h3>
              <span className="edit-button" onClick={() => handleEditAddressClick(address)}>Edit</span>
            </div>
            <p className="address-details">
              {address.flat_house_no_building}, {address.area_street_sector_village}, {address.landmark}, {address.town_city}, {address.state}, {address.pincode}
            </p>
            <div className="checkbox-container">
              <Checkbox
                checked={address.default_address}
                onChange={() => handleShippingAddressChange(address._id)}
                sx={{
                  color: pink[800],
                  '&.Mui-checked': {
                    color: pink[600],
                  },
                }}
              />
              <span>Use as the shipping address</span>
            </div>
          </div>
        ))}
      </main>

      {!showForm && (
        <Box className="fab-container" sx={{ '& > :not(style)': { m: 1 } }}>
          <Fab
            style={{ color: "white", backgroundColor: "#DB3022" }}
            aria-label="add"
            onClick={handleAddAddressClick}
          >
            <AddIcon />
          </Fab>
        </Box>
      )}

      {showForm && (
        <div className="address-form">
          <button className="close-button" onClick={handleCloseForm}>
            <CloseIcon />
          </button>
          <h2>{editMode ? 'Edit Address' : 'Add New Address'}</h2>
          <div className="address-form-container">
            <form onSubmit={handleSaveAddress}>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                name="full_name"
                value={currentAddress.full_name}
                onChange={handleInputChange}
              />
              <TextField
                label="Mobile Number"
                fullWidth
                margin="normal"
                name="mobile_number"
                value={currentAddress.mobile_number}
                onChange={handleInputChange}
              />
              <TextField
                label="Pincode"
                fullWidth
                margin="normal"
                name="pincode"
                value={currentAddress.pincode}
                onChange={handleInputChange}
              />
              <TextField
                label="Flat/House No."
                fullWidth
                margin="normal"
                name="flat_house_no_building"
                value={currentAddress.flat_house_no_building}
                onChange={handleInputChange}
              />
              <TextField
                label="Area/Street/Sector/Village"
                fullWidth
                margin="normal"
                name="area_street_sector_village"
                value={currentAddress.area_street_sector_village}
                onChange={handleInputChange}
              />
              <TextField
                label="Landmark (Optional)"
                fullWidth
                margin="normal"
                name="landmark"
                value={currentAddress.landmark}
                onChange={handleInputChange}
              />
              <TextField
                label="Town/City"
                fullWidth
                margin="normal"
                name="town_city"
                value={currentAddress.town_city}
                onChange={handleInputChange}
              />
              <TextField
                label="State"
                fullWidth
                margin="normal"
                name="state"
                value={currentAddress.state}
                onChange={handleInputChange}
              />
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                name="country"
                value={currentAddress.country}
                onChange={handleInputChange}
              />
              <div className="radio-group">
                <h3>Address Type</h3>
                <RadioGroup
                  name="address_type"
                  value={currentAddress.address_type}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="Apartment" control={<Radio />} label="Apartment" />
                  <FormControlLabel value="House" control={<Radio />} label="House" />
                </RadioGroup>
              </div>
              <div className="checkbox-group">
                <h3>Weekend Delivery</h3>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentAddress.weekends_delivery.saturdays}
                      onChange={handleInputChange}
                      name="weekends_delivery.saturdays"
                      color="primary"
                    />
                  }
                  label="Saturdays"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentAddress.weekends_delivery.sundays}
                      onChange={handleInputChange}
                      name="weekends_delivery.sundays"
                      color="primary"
                    />
                  }
                  label="Sundays"
                />
              </div>
              <TextField
                label="Delivery Instructions"
                fullWidth
                margin="normal"
                name="delivery_instructions"
                value={currentAddress.delivery_instructions}
                onChange={handleInputChange}
              />
              <button type="submit" className="submit-button">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
