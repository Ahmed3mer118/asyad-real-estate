// models/Appointment.js — backend: propertyId, customerId, userId, employeeId, startTime, endTime (Date), status: scheduled|completed|cancelled
export class Appointment {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.propertyId = data.propertyId || null;
    this.customerId = data.customerId || null;
    this.userId = data.userId || null;
    this.employeeId = data.employeeId || null;
    this.property = data.property || null;
    this.client = data.customer || data.client || (typeof data.customerId === 'object' ? data.customerId : null) || null;
    this.employee = data.employee || null;
    this.startTime = data.startTime ? new Date(data.startTime) : null;
    this.endTime = data.endTime ? new Date(data.endTime) : null;
    this.status = data.status || 'scheduled';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  get formattedDate() {
    const d = this.startTime || this.createdAt;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  get formattedStartTime() {
    if (!this.startTime) return '—';
    const d = this.startTime instanceof Date ? this.startTime : new Date(this.startTime);
    return d.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' });
  }

  get formattedEndTime() {
    if (!this.endTime) return '—';
    const d = this.endTime instanceof Date ? this.endTime : new Date(this.endTime);
    return d.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' });
  }

  get statusColor() {
    const map = { scheduled: 'blue', completed: 'green', cancelled: 'red' };
    const s = (this.status || '').toLowerCase();
    return map[s] || 'gray';
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Appointment(item));
  }
}

// models/Request.js
export class Request {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.property = data.property || null;
    this.requester = data.requester || null;
    this.type = data.type || 'buy'; // buy | rent
    this.status = data.status || 'Pending'; // Pending | Approved | Rejected | Cancelled
    this.message = data.message || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  get statusColor() {
    const map = { Pending: 'yellow', Approved: 'green', Rejected: 'red', Cancelled: 'gray' };
    return map[this.status] || 'gray';
  }

  get formattedDate() {
    if (!this.createdAt) return '—';
    return this.createdAt.toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Request(item));
  }
}

// models/Payment.js — backend: transactionId, installmentId?, paymentMethod (cash|visa|bank_transfer|check), amount, paymentDate, status
export class Payment {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    const tx = data.transactionId ?? data.transaction;
    this.transactionId = typeof tx === 'object' ? (tx?._id || tx?.id) : tx || null;
    this.transaction = typeof tx === 'object' ? tx : data.transaction || null;
    this.installmentId = data.installmentId || data.installment || null;
    this.amount = data.amount || 0;
    const method = data.paymentMethod || data.method || 'cash';
    this.paymentMethod = method === 'cheque' ? 'check' : method;
    this.method = this.paymentMethod;
    this.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    this.status = data.status || 'paid';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  get formattedAmount() {
    return `EGP ${new Intl.NumberFormat('en-EG').format(this.amount)}`;
  }

  get formattedDate() {
    const d = this.paymentDate || this.createdAt;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  get formattedPaymentDateTime() {
    const d = this.paymentDate || this.createdAt;
    if (!d) return '—';
    return new Date(d).toLocaleString('en-EG', { dateStyle: 'short', timeStyle: 'short' });
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Payment(item));
  }
}

// models/Notification.js
export class Notification {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.title = data.title || '';
    this.message = data.message || '';
    this.isRead = data.isRead ?? false;
    this.type = data.type || 'info';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  get timeAgo() {
    if (!this.createdAt) return '';
    const diff = Date.now() - this.createdAt.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Notification(item));
  }
}

// models/Employee.js — backend: userId, jobTitle, department, salary, commissionRate, currentCommissionRate, hireDate, ...
// currentCommissionRate = current rate for new operations only. commissionRate kept for backward compatibility.
export class Employee {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.userId = data.userId || null;
    this.jobTitle = data.jobTitle || '';
    this.department = data.department || '';
    this.salary = data.salary ?? 0;
    this.commissionRate = data.commissionRate ?? 0;
    this.currentCommissionRate = data.currentCommissionRate ?? data.commissionRate ?? 0;
    this.hireDate = data.hireDate ? new Date(data.hireDate) : null;
    this.employmentType = data.employmentType || ''; // full-time | part-time | contract | hybrid
    this.yearsOfExperience = data.yearsOfExperience ?? 0;
    this.averageRating = data.averageRating ?? 0;
    this.totalSalesAmount = data.totalSalesAmount ?? 0;
    this.totalDeals = data.totalDeals ?? 0;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    const u = data.userId && typeof data.userId === 'object' ? data.userId : null;
    this.name = u?.fullName || u?.userName || data.name || '';
    this.email = u?.email || data.email || '';
    this.phone = u?.phone_number || u?.phone || data.phone || '';
  }

  get initials() {
    return (this.name || 'E').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get formattedDate() {
    if (!this.createdAt) return '—';
    return this.createdAt.toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Employee(item));
  }
}

// models/Transaction.js — backend: propertyId, customerId, employeeId, transactionType (sale|rent), totalAmount, paidAmount, transactionDate
function toIdVal(v) {
  if (v == null) return null;
  if (typeof v === 'object') return v._id || v.id || null;
  return v;
}
export class Transaction {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.propertyId = toIdVal(data.propertyId) || toIdVal(data.property);
    this.customerId = toIdVal(data.customerId) || toIdVal(data.customer) || toIdVal(data.client);
    this.employeeId = toIdVal(data.employeeId) || toIdVal(data.employee);
    this.property = typeof data.propertyId === 'object' ? data.propertyId : (data.property || null);
    this.customer = typeof data.customerId === 'object' ? data.customerId : (data.customer || data.client || null);
    this.transactionType = data.transactionType || 'sale';
    this.transactionDate = data.transactionDate ? new Date(data.transactionDate) : null;
    this.totalAmount = data.totalAmount || 0;
    this.paidAmount = data.paidAmount || 0;
    // Employee commission rate at transaction completion — used for reports and past commissions
    this.commissionRateAtTime = data.commissionRateAtTime ?? data.employeeCommissionRate ?? data.commissionRate ?? null;
    this.employeeCommissionRate = this.commissionRateAtTime; // for dashboard display
    this.employeeCommissionAmount = data.employeeCommissionAmount ?? data.commissionAmount ?? null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  get remainingAmount() {
    return this.totalAmount - this.paidAmount;
  }

  get formattedTotal() {
    return `EGP ${new Intl.NumberFormat('en-EG').format(this.totalAmount)}`;
  }

  get formattedPaid() {
    return `EGP ${new Intl.NumberFormat('en-EG').format(this.paidAmount)}`;
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Transaction(item));
  }
}

// models/Installment.js — backend: transactionId, installmentNo, amount, paidAmount, dueDate, paymentDate, status (due|paid|overdue)
export class Installment {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.transactionId = data.transactionId || null;
    this.installmentNo = data.installmentNo ?? 1;
    this.amount = data.amount || 0;
    this.paidAmount = data.paidAmount ?? 0;
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    this.status = data.status || 'due';
    this.notes = data.notes || '';
  }

  get formattedAmount() {
    return `EGP ${new Intl.NumberFormat('en-EG').format(this.amount)}`;
  }

  get formattedDueDate() {
    if (!this.dueDate) return '—';
    return this.dueDate.toLocaleDateString('en-EG');
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Installment(item));
  }
}

// models/Evaluation.js — backend: employeeId, evaluatorId, appointmentId?, transactionId?, rating (1-5), comments, evaluationDate
export class Evaluation {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.employeeId = data.employeeId || null;
    this.evaluatorId = data.evaluatorId || null;
    this.appointmentId = data.appointmentId || null;
    this.transactionId = data.transactionId || null;
    this.rating = data.rating ?? 0;
    this.comments = data.comments || '';
    this.evaluationDate = data.evaluationDate ? new Date(data.evaluationDate) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Evaluation(item));
  }
}

//els/EmailLog.js
export class EmailLog {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.userId = data.userId || null;
    this.email = data.email || '';
    this.subject = data.subject || '';
    this.message = data.message || '';
    this.status = data.status || 'Sent';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  static fromArray(arr = []) {
    return arr.map((item) => new EmailLog(item));
  }
}

// models/Task — backend: TasksToEmployee (title, propertyId, employeeId, description?, appointmentId?, dueDate, status) | TaskByEmployee (taskNo, data, employeeId, notes, status)
export class Task {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.employeeId = data.employeeId || null;
    this.propertyId = data.propertyId || null;
    this.appointmentId = data.appointmentId || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.taskNo = data.taskNo ?? 0;
    this.data = data.data || '';
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.status = data.status || 'pending'; // backend: pending | accepted | rejected | completed
    this.notes = data.notes || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
  }

  get formattedDueDate() {
    if (!this.dueDate) return '—';
    return this.dueDate.toLocaleDateString('en-EG');
  }

  static fromArray(arr = []) {
    return arr.map((item) => new Task(item));
  }
}
