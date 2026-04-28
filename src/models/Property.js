// Aligned with backend Property.model: name, statusSaleRent, availability, propertyType, area, category, ownerId, details, location, images
import { normalizeAssetUrl } from '../utils/assetUrl.js';

export class Property {
  static normalizeImages(images) {
    if (images == null) return [];
    const arr = Array.isArray(images) ? images : [images];
    const out = arr.map((item, i) => {
      if (typeof item === 'string') {
        return { url: normalizeAssetUrl(item), isMain: false, order: i };
      }
      const url = normalizeAssetUrl(item?.url || item?.path || '');
      return {
        ...item,
        url,
        isMain: Boolean(item?.isMain),
        order: item?.order ?? i,
      };
    });
    if (out.length && !out.some((x) => x.isMain)) {
      out[0] = { ...out[0], isMain: true };
    }
    return out;
  }

  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.price = data.price || 0;
    this.statusSaleRent = data.statusSaleRent || 'sale'; // backend: "rent" | "sale"
    this.availability = data.availability || 'available'; // backend: "available" | "sold"
    this.propertyType = data.propertyType || '';
    this.area = data.area || 0;
    this.features = data.features || '';
    this.category = data.category || 'residential'; // residential | commercial | industrial
    this.ownerId = data.ownerId || null;
    this.details = {
      bedrooms: data.details?.bedrooms ?? 0,
      bathrooms: data.details?.bathrooms ?? 0,
      area: data.details?.area ?? data.area ?? 0,
      furnished: data.details?.furnished ?? false,
    };
    this.location = {
      country: data.location?.country || 'Egypt',
      city: data.location?.city || '',
      address: data.location?.address || '',
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null,
      googleMapsUrl: data.location?.googleMapsUrl || data.location?.googleMapUrl || data.location?.mapUrl || '',
    };
    this.images = Property.normalizeImages(
      Array.isArray(data.images) ? data.images : data.images ? [data.images] : []
    );
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    this.owner = data.owner || null;
    this.isFavorited = Boolean(
      data.isFavorited
      ?? data.isFavorite
      ?? data.favorited
      ?? data.favorite
      ?? data.isInFavorites
      ?? data.inFavorites
      ?? false
    );
  }

  get title() {
    return this.name;
  }

  get status() {
    return this.statusSaleRent === 'rent' ? 'for_rent' : 'for_sale';
  }

  get formattedPrice() {
    const formatted = new Intl.NumberFormat('en-EG').format(this.price);
    return this.statusSaleRent === 'rent' ? `EGP ${formatted}/mo` : `EGP ${formatted}`;
  }

  get badgeText() {
    return this.statusSaleRent === 'sale' ? 'FOR SALE' : 'FOR RENT';
  }

  get isForSale() {
    return this.statusSaleRent === 'sale';
  }

  get thumbnail() {
    const list = this.images || [];
    const main = list.find((i) => i?.isMain);
    const first = list[0];
    return main?.url || (typeof first === 'string' ? first : first?.url) || null;
  }

  get shortLocation() {
    return [this.location?.address, this.location?.city].filter(Boolean).join(', ') || '—';
  }

  get specsSummary() {
    const parts = [];
    if (this.details?.bedrooms) parts.push(`🛏 ${this.details.bedrooms} Beds`);
    if (this.details?.bathrooms) parts.push(`🚿 ${this.details.bathrooms} Baths`);
    if (this.area || this.details?.area) parts.push(`📐 ${this.area || this.details?.area}m²`);
    return parts.join('  ') || '—';
  }

  get ageLabel() {
    if (!this.createdAt) return '';
    const days = Math.floor((Date.now() - new Date(this.createdAt)) / 86400000);
    if (days === 0) return 'Added today';
    if (days === 1) return 'Added yesterday';
    return `Added ${days} days ago`;
  }

  toPayload() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      statusSaleRent: this.statusSaleRent,
      availability: this.availability,
      propertyType: this.propertyType,
      area: this.area,
      features: this.features,
      category: this.category,
      ownerId: this.ownerId,
      details: this.details,
      location: this.location,
      images: this.images,
    };
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Property(item));
  }
}
