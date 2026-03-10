// components/property/PropertyCard.jsx — Tailwind CSS version
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/index';
import { favoriteService } from '../../services/index.js';
import { getToken } from '../../utils/authUtils.js';
import { toast } from 'react-toastify';

const PropertyCard = ({ property, onFavoriteChange }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!getToken();
  const [favorited, setFavorited] = useState(property.isFavorited);
  const [toggling, setToggling] = useState(false);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (toggling) return;
    setToggling(true);
    try {
      if (favorited) await favoriteService.remove(property.id);
      else await favoriteService.add(property.id);
      setFavorited((f) => !f);
      onFavoriteChange?.();
    } catch { toast.error('Failed to update favorites'); }
    finally { setToggling(false); }
  };

  return (
    <div
      className="bg-white border border-border rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 hover:-translate-y-[5px] hover:shadow-lg hover:border-transparent group"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      {/* Image */}
      <div className="relative h-[220px] overflow-hidden bg-gradient-to-br from-[#c8dded] to-[#e8f0f8]">
        {property.thumbnail ? (
          <img
            src={property.thumbnail}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[56px] text-[#c0cfe0]">🏠</div>
        )}

        {/* Badge */}
        <Badge
          color={property.isForSale ? 'gray' : 'blue'}
          className="absolute top-[14px] left-[14px] text-[11px] tracking-[0.8px] uppercase"
        >
          {property.badgeText}
        </Badge>

        {/* Favorite button */}
        <button
          className={`absolute top-3 right-3 w-9 h-9 rounded-full
            bg-white/90 backdrop-blur-sm flex items-center justify-center
            text-base transition-all duration-200 cursor-pointer border-none
            hover:scale-[1.15] hover:bg-white
            ${favorited ? 'animate-pulse-once' : ''}`}
          onClick={handleFavorite}
          disabled={toggling}
        >
          {favorited ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pt-[18px] pb-5">
        <p className="text-[20px] font-bold text-blue mb-1">{property.formattedPrice}</p>
        <h3 className="text-[16px] font-semibold text-dark mb-[5px] whitespace-nowrap overflow-hidden text-ellipsis">{property.title}</h3>
        <p className="text-[13px] text-gray">📍 {property.shortLocation}</p>
        <div className="h-px bg-border my-3" />
        <p className="text-[13px] text-dark">{property.specsSummary}</p>
      </div>
    </div>
  );
};

export default PropertyCard;
