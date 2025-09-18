"use client";
import React from 'react';

const GoogleMapsAddress = ({ address }) => {
  // Format the address for Google Maps URL
  const formatAddressForMaps = (addressData) => {
    if (!addressData) return '';
    
    // If it's the old single address field
    if (typeof addressData === 'string') {
      return encodeURIComponent(addressData);
    }
    
    // If it's the new structured address
    const parts = [];
    if (addressData.street) parts.push(addressData.street);
    if (addressData.city) parts.push(addressData.city);
    if (addressData.province) parts.push(addressData.province);
    if (addressData.postalCode) parts.push(addressData.postalCode);
    if (addressData.country) parts.push(addressData.country);
    
    return encodeURIComponent(parts.join(', '));
  };

  // Display formatted address
  const displayAddress = (addressData) => {
    if (!addressData) return 'No address provided';
    
    // If it's the old single address field
    if (typeof addressData === 'string') {
      return addressData;
    }
    
    // If it's the new structured address
    const parts = [];
    if (addressData.street) parts.push(addressData.street);
    if (addressData.city) parts.push(addressData.city);
    if (addressData.province) parts.push(addressData.province);
    if (addressData.postalCode) parts.push(addressData.postalCode);
    if (addressData.country) parts.push(addressData.country);
    
    return parts.join(', ');
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${formatAddressForMaps(address)}`;
  const displayText = displayAddress(address);

  return (
    <div className="google-maps-address">
      <div className="address-text">
        <span className="address-label">Address:</span>
        <span className="address-value">{displayText}</span>
      </div>
      {address && (
        <a 
          href={mapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="maps-link"
        >
          📍 View on Google Maps
        </a>
      )}
      
      <style jsx>{`
        .google-maps-address {
          margin: 1rem 0;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        
        .address-text {
          margin-bottom: 0.5rem;
        }
        
        .address-label {
          font-weight: bold;
          margin-right: 0.5rem;
          color: #333;
        }
        
        .address-value {
          color: #666;
        }
        
        .maps-link {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: #4285f4;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .maps-link:hover {
          background-color: #3367d6;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default GoogleMapsAddress;
