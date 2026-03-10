// Aligned with backend Property.model: name, statusSaleRent, availability, propertyType, area, category, ownerId, details, location, images
export class Property {
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
    };
    this.images = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    this.owner = data.owner || null;
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
    const main = this.images?.find((i) => i?.isMain);
    return main?.url || this.images?.[0]?.url || null;
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
