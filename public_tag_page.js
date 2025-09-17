import React from 'react';
import { notFound } from 'next/navigation';
import GoogleMapsAddress from '../../../components/GoogleMapsAddress';

async function getTag(slug) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tag/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tag:', error);
    return null;
  }
}

export default async function PublicTagPage({ params }) {
  const tag = await getTag(params.slug);
  
  if (!tag) {
    notFound();
  }

  // Prepare address data for the GoogleMapsAddress component
  const addressData = {
    street: tag.street,
    city: tag.city,
    province: tag.province,
    postalCode: tag.postalCode,
    country: tag.country,
    // Fallback to old address field if structured fields are not available
    ...((!tag.street && !tag.city && tag.address) && { address: tag.address })
  };

  // Use structured address if available, otherwise fall back to old address field
  const displayAddress = tag.street || tag.city || tag.province || tag.postalCode || tag.country 
    ? addressData 
    : tag.address;

  return (
    <div className="public-tag-page">
      <div className="container">
        <div className="tag-header">
          <h1 className="tag-title">{tag.name || 'NFC Tag'}</h1>
          <p className="tag-description">{tag.description}</p>
        </div>

        <div className="tag-content">
          {tag.phone && (
            <div className="contact-info">
              <h3>📞 Contact</h3>
              <a href={`tel:${tag.phone}`} className="phone-link">
                {tag.phone}
              </a>
            </div>
          )}

          {tag.email && (
            <div className="contact-info">
              <h3>✉️ Email</h3>
              <a href={`mailto:${tag.email}`} className="email-link">
                {tag.email}
              </a>
            </div>
          )}

          {tag.website && (
            <div className="contact-info">
              <h3>🌐 Website</h3>
              <a href={tag.website} target="_blank" rel="noopener noreferrer" className="website-link">
                {tag.website}
              </a>
            </div>
          )}

          {displayAddress && (
            <div className="address-section">
              <h3>📍 Location</h3>
              <GoogleMapsAddress address={displayAddress} />
            </div>
          )}

          {tag.socialMedia && Object.keys(tag.socialMedia).length > 0 && (
            <div className="social-media">
              <h3>🔗 Social Media</h3>
              <div className="social-links">
                {Object.entries(tag.socialMedia).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .public-tag-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .tag-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }
        
        .tag-title {
          font-size: 2rem;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
        }
        
        .tag-description {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
        }
        
        .tag-content {
          padding: 2rem;
        }
        
        .contact-info, .address-section, .social-media {
          margin-bottom: 2rem;
        }
        
        .contact-info h3, .address-section h3, .social-media h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        
        .phone-link, .email-link, .website-link {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #f3f4f6;
          color: #374151;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .phone-link:hover, .email-link:hover, .website-link:hover {
          background-color: #e5e7eb;
          transform: translateY(-1px);
        }
        
        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .social-link {
          padding: 0.5rem 1rem;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .social-link:hover {
          background-color: #4338ca;
        }
        
        @media (max-width: 640px) {
          .public-tag-page {
            padding: 1rem 0.5rem;
          }
          
          .tag-header {
            padding: 1.5rem;
          }
          
          .tag-title {
            font-size: 1.5rem;
          }
          
          .tag-content {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
