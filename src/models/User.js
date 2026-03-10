// models/User.js
export class User {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.fullName = data.fullName || data.userName || '';
    this.email = data.email || '';
    this.phoneNumber = data.phone_number ?? data.phoneNumber ?? '';
    this.role = data.role?.name || data.role || 'Tenant';
    this.isActive = data.isActive ?? true;
    this.isEmailVerified = data.isEmailVerified ?? false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
  }

  get initials() {
    return this.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get isAdmin() {
    return (this.role || '').toLowerCase() === 'admin';
  }

  get isOwner() {
    return (this.role || '').toLowerCase() === 'owner';
  }

  get isTenant() {
    const r = (this.role || '').toLowerCase();
    return r === 'tenant' || r === 'user';
  }

  get formattedDate() {
    if (!this.createdAt) return '—';
    return this.createdAt.toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  toJSON() {
    return {
      userName: this.fullName,
      email: this.email,
      phone_number: this.phoneNumber,
    };
  }

  static fromArray(arr = []) {
    return arr.map((item) => new User(item));
  }
}
