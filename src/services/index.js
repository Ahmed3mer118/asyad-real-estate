// services/AuthService.js
import ApiService from './ApiService.js';

const TOKEN_KEY = 'asyad_token';
const USER_KEY = 'asyad_user';

class AuthService extends ApiService {
  constructor() {
    super('auth');
  }

  async login(email, password) {
    const { data } = await this.client.post('/auth/login', { email, password });
    const token = data?.token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, typeof token === 'string' ? token : JSON.stringify(token));
    }
    return data;
  }

  async register(payload) {
    const { data } = await this.client.post('/auth/register', payload);
    return data;
  }

  async verifyCode(email, code) {
    const { data } = await this.client.post('/auth/verify-code', { email, code });
    return data;
  }

  async forgetPassword(email) {
    const { data } = await this.client.post('/auth/forget-password', { email });
    return data;
  }

  async resetPassword(payload) {
    const { data } = await this.client.post('/auth/reset-password', payload);
    return data;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  }

  getStoredUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}

const authService = new AuthService();


// services/PropertyService.js
import { Property } from '../models/Property.js';

class PropertyService extends ApiService {
  constructor() {
    super('properties');
  }

  async getList(filters = {}) {
    const { data } = await this.client.get('/properties', { params: filters });
    const list = data?.data ?? [];
    const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };
    return {
      data: {
        properties: Property.fromArray(Array.isArray(list) ? list : []),
        ...pagination,
      },
      pagination,
    };
  }

  async getById(id) {
    const { data } = await this.client.get(`/properties/${id}`);
    const raw = data?.data ?? data;
    return { data: { property: new Property(raw || {}) } };
  }

  async getMyProperties(params = {}) {
    const { data } = await this.client.get('/properties', { params: { ...params, ownerId: 'me' } }).catch(() => ({ data: { data: [] } }));
    const list = data?.data ?? [];
    return {
      data: {
        properties: Property.fromArray(Array.isArray(list) ? list : []),
        total: Array.isArray(list) ? list.length : 0,
      },
    };
  }

  async createProperty(payload) {
    const { data } = await this.client.post('/properties', payload);
    const raw = data?.data ?? data;
    return { data: { property: new Property(raw || {}) } };
  }

  async updateProperty(id, payload) {
    const { data } = await this.client.patch(`/properties/${id}`, payload);
    const raw = data?.data ?? data;
    return { data: { property: new Property(raw || {}) } };
  }

  async deactivateProperty(id) {
    const { data } = await this.client.patch(`/properties/${id}/deactivate`);
    return data?.data ?? data;
  }
}

const propertyService = new PropertyService();


// services/UserService.js
import { User } from '../models/User.js';

class UserService extends ApiService {
  constructor() {
    super('users');
  }

  async getMe() {
    const { data } = await this.client.get('/users/me');
    const raw = data?.data ?? data;
    return { data: { user: new User(raw || {}) } };
  }

  async updateMe(payload) {
    const { data } = await this.client.put('/users/me', payload);
    const raw = data?.data ?? data;
    return { data: { user: new User(raw || {}) } };
  }

  async getAllUsers(params = {}) {
    const send = { ...params };
    if (send.search && !send.q) send.q = send.search;
    const { data } = await this.client.get('/users/byAdmin', { params: send });
    const list = data?.data ?? data ?? [];
    const arr = Array.isArray(list) ? list : list?.users ?? [];
    const total = data?.total ?? data?.pagination?.total ?? arr.length;
    return {
      data: {
        users: User.fromArray(arr),
        total: typeof total === 'number' ? total : arr.length,
      },
    };
  }

  async getById(id) {
    const { data } = await this.client.get(`/users/${id}`);
    const raw = data?.data ?? data;
    return { data: { user: new User(raw || {}) } };
  }

  async updateStatus(identifier) {
    const payload = identifier.includes('@') ? { email: identifier } : { id: identifier };
    const { data } = await this.client.put('/users/update-status', payload);
    return data;
  }

  async updateUserByAdmin(userId, payload) {
    const { data } = await this.client.patch(`/users/${userId}`, payload);
    const raw = data?.data ?? data;
    return { data: { user: new User(raw || {}) } };
  }

  getRoleFromToken() {
    try {
      const tokenStr = localStorage.getItem('asyad_token');
      if (!tokenStr) return null;
      const token = typeof tokenStr === 'string' && tokenStr.startsWith('{') ? JSON.parse(tokenStr) : tokenStr;
      const str = typeof token === 'string' ? token : (token?.token ?? '');
      const base64Url = str.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.role || null;
    } catch {
      return null;
    }
  }
}

const userService = new UserService();

// services/AppointmentService.js
import { Appointment } from '../models/index.js';

class AppointmentService extends ApiService {
  constructor() {
    super('appointments');
  }

  async getMyAppointments(params = {}) {
    const { data } = await this.client.get('/appointments/me', { params });
    const list = data?.data ?? [];
    return { data: { appointments: Appointment.fromArray(Array.isArray(list) ? list : []) } };
  }

  async getAllAppointments(params = {}) {
    const { data } = await this.client.get('/appointments', { params });
    const list = data?.data ?? data?.appointments ?? [];
    const arr = Array.isArray(list) ? list : [];
    const total = data?.total ?? data?.pagination?.total ?? arr.length;
    return {
      data: {
        appointments: Appointment.fromArray(arr),
        total: typeof total === 'number' ? total : arr.length,
      },
    };
  }

  async getAppointmentsByProperty(propertyId) {
    const { data } = await this.client.get(`/appointments/property/${propertyId}`);
    const list = data?.data ?? [];
    return { data: { appointments: Appointment.fromArray(Array.isArray(list) ? list : []) } };
  }

  async getById(id) {
    const { data } = await this.client.get(`/appointments/${id}`);
    const raw = data?.data ?? data;
    return { data: { appointment: new Appointment(raw || {}) } };
  }

  async book(payload) {
    const { data } = await this.client.post('/appointments/book', payload);
    const raw = data?.data ?? data;
    return { data: { appointment: new Appointment(raw || {}) } };
  }

  async updateStatus(id, status) {
    const { data } = await this.client.put(`/appointments/${id}/status`, { status });
    return data?.data ?? data;
  }
}

const appointmentService = new AppointmentService();


// services/RequestService.js
import { Request } from '../models/index.js';

class RequestService extends ApiService {
  constructor() {
    super('requests');
  }

  async getMyRequests(params = {}) {
    const { data } = await this.client.get('/requests/mine', { params });
    return {
      ...data,
      data: { ...data.data, requests: Request.fromArray(data.data?.requests || []) },
    };
  }

  async getAllRequests(params = {}) {
    const res = await this.client.get('/requests', { params });
    const data = res?.data ?? {};
    const list = data?.data ?? data?.requests ?? [];
    const arr = Array.isArray(list) ? list : [];
    const total = data?.total ?? data?.pagination?.total ?? arr.length;
    return {
      data: {
        requests: Request.fromArray(arr),
        total: typeof total === 'number' ? total : arr.length,
      },
    };
  }

  async createRequest(payload) {
    const res = await this.create(payload);
    return { ...res, data: { request: new Request(res.data?.request || {}) } };
  }

  async updateStatus(id, status) {
    const { data } = await this.client.patch(`/requests/${id}/status`, { status });
    return data;
  }
}

const requestService = new RequestService();


// services/PaymentService.js
import { Payment } from '../models/index.js';

class PaymentService extends ApiService {
  constructor() {
    super('payments');
  }

  async getAllPayments(params = {}) {
    const { data } = await this.client.get('/payments', { params });
    const list = data?.data ?? [];
    return { data: { payments: Payment.fromArray(Array.isArray(list) ? list : []) } };
  }

  /** Payments for current user (transactions where user is customer) */
  async getMyPayments(params = {}) {
    try {
      const { data } = await this.client.get('/payments/me', { params });
      const list = data?.data ?? data?.payments ?? [];
      const arr = Array.isArray(list) ? list : [];
      return { data: { payments: Payment.fromArray(arr), total: arr.length } };
    } catch (e) {
      return { data: { payments: [], total: 0 } };
    }
  }

  /**
   * Record a payment. Payload: { transactionId, installmentId?, amount, paymentMethod, notes? }.
   * Backend should: for non-admin users, allow only if transaction.customerId === req.user.id;
   * then create Payment, set installment status to paid, update transaction.paidAmount.
   */
  async recordPayment(payload) {
    const { data } = await this.client.post('/payments', payload);
    const raw = data?.data?.payment ?? data?.data ?? data;
    return { data: { payment: new Payment(raw || {}), transaction: data?.data?.transaction, installment: data?.data?.installment } };
  }
}

const paymentService = new PaymentService();

// services/InstallmentService.js — backend: create (transactionId, installmentNo, amount, dueDate); generate (transactionId, startDate, numberOfInstallments, frequency: monthly|quarterly|semi_annual|yearly)
class InstallmentService extends ApiService {
  constructor() {
    super('installments');
  }

  async getInstallments(params = {}) {
    const { data } = await this.client.get('/installments', { params });
    const list = data?.data ?? [];
    return { data: { installments: Array.isArray(list) ? list : [] } };
  }

  /** Installments for current user's transactions */
  async getMyInstallments(params = {}) {
    try {
      const { data } = await this.client.get('/installments/me', { params });
      const list = data?.data ?? data?.installments ?? [];
      const arr = Array.isArray(list) ? list : [];
      return { data: { installments: arr, total: arr.length } };
    } catch (e) {
      return { data: { installments: [], total: 0 } };
    }
  }

  async createInstallment(payload) {
    const { data } = await this.client.post('/installments', payload);
    const raw = data?.data ?? data;
    return { data: { installment: raw } };
  }

  async updateInstallment(id, payload) {
    const { data } = await this.client.patch(`/installments/${id}`, payload);
    return data?.data ?? data;
  }

  /**
   * Generate installments for a transaction.
   * Payload: { transactionId, startDate, numberOfInstallments, frequency, replaceExisting? }.
   * If replaceExisting is true, backend should delete existing installments for this transaction first, then create the new schedule (avoids duplicates when changing date).
   */
  async generateInstallments(payload) {
    const { data } = await this.client.post('/installments/generate', payload);
    return { data: data?.data ?? data, count: data?.count } ?? {};
  }
}

const installmentService = new InstallmentService();


// services/NotificationService.js
import { Notification } from '../models/index.js';

class NotificationService extends ApiService {
  constructor() {
    super('notifications');
  }

  // async getMyNotifications(params = {}) {
  //   const res = await this.getAll(params);
  //   return {
  //     ...res,
  //     data: {
  //       ...res.data,
  //       notifications: Notification.fromArray(res.data?.notifications || []),
  //       unreadCount: res.data?.unreadCount || 0,
  //     },
  //   };
  // }

  // async markOneRead(id) {
  //   const { data } = await this.client.patch(`/notifications/${id}/read`);
  //   return data;
  // }

  // async markAllRead() {
  //   const { data } = await this.client.patch('/notifications/read-all');
  //   return data;
  // }

  // async deleteOne(id) {
  //   return this.delete(id);
  // }
}

const notificationService = new NotificationService();


// services/EmployeeService.js
import { Employee } from '../models/index.js';

class EmployeeService extends ApiService {
  constructor() {
    super('employees');
  }

  async getAllEmployees(params = {}) {
    const send = { ...params };
    if (send.search && !send.q) send.q = send.search;
    const { data } = await this.client.get('/employees', { params: send });
    const list = data?.data ?? data?.employees ?? [];
    const arr = Array.isArray(list) ? list : [];
    const total = data?.total ?? data?.pagination?.total ?? arr.length;
    return {
      data: {
        employees: Employee.fromArray(arr),
        total: typeof total === 'number' ? total : arr.length,
      },
    };
  }

  async getEmployeeById(id) {
    const { data } = await this.client.get(`/employees/${id}`);
    const raw = data?.data ?? data;
    return { data: { employee: new Employee(raw || {}) } };
  }

  async createEmployee(payload) {
    const { data } = await this.client.post('/employees', payload);
    const raw = data?.data ?? data;
    return { data: { employee: new Employee(raw || {}) } };
  }

  async updateEmployee(id, payload) {
    const { data } = await this.client.patch(`/employees/${id}`, payload);
    const raw = data?.data ?? data;
    return { data: { employee: new Employee(raw || {}) } };
  }

  async deactivateEmployee(id) {
    const { data } = await this.client.patch(`/employees/${id}/deactivate`);
    return data?.data ?? data;
  }
}

const employeeService = new EmployeeService();


// services/FavoriteService.js

class FavoriteService extends ApiService {
  constructor() {
    super('favorites');
  }

  async getMyFavorites(params = {}) {
    const { data } = await this.client.get('/favorites/me', { params });
    const list = data?.data ?? [];
    const arr = Array.isArray(list) ? list : [];
    const properties = arr.map((f) => f.propertyId || f).filter(Boolean);
    return {
      data: {
        properties: Property.fromArray(properties),
        total: properties.length,
      },
    };
  }

  async add(propertyId) {
    const { data } = await this.client.post('/favorites', { propertyId });
    return data?.data ?? data;
  }

  async remove(propertyId) {
    await this.client.delete(`/favorites/${propertyId}`);
  }

  /** Most popular by favorites count — query: city, limit */
  async getPopularByFavorites(params = {}) {
    const { data } = await this.client.get('/favorites/popular', { params });
    return { data: data?.data ?? [] };
  }

  /** Users who kept a property in favorites for a long time — query: days (default 30) */
  async getLongStandingFavorites(params = {}) {
    const { data } = await this.client.get('/favorites/long-standing', { params });
    return { data: data?.data ?? [] };
  }

  /** Favorite stats for a property: currentFavoriteCount, totalAdded, totalRemoved */
  async getPropertyFavoriteStats(propertyId) {
    const { data } = await this.client.get(`/favorites/stats/${propertyId}`);
    return { data: data?.data ?? null };
  }

  /** Users who currently have this property in favorites (admin) */
  async getFavoritedByUsers(propertyId) {
    const { data } = await this.client.get(`/favorites/favorited-by/${propertyId}`);
    return { data: data?.data ?? [] };
  }
}

const favoriteService = new FavoriteService();


// services/WebhookService.js

class WebhookService extends ApiService {
  constructor() {
    super('webhooks');
    const secret = import.meta.env.VITE_WEBHOOK_SECRET || '';
    this.client.defaults.headers.common['X-Webhook-Secret'] = secret;
  }

  async getStats() {
    const { data } = await this.client.get('/webhooks/stats');
    return data;
  }
}

const webhookService = new WebhookService();

// services/EvaluationService.js — backend: create (employeeId, rating, comments?, appointmentId?, transactionId?); evaluatorId from req.user
import { Evaluation } from '../models/index.js';

class EvaluationService extends ApiService {
  constructor() {
    super('evaluations');
  }

  async getEvaluations(params = {}) {
    const { data } = await this.client.get('/evaluations', { params });
    const list = data?.data ?? [];
    return { data: { evaluations: Evaluation.fromArray(Array.isArray(list) ? list : []) } };
  }

  async createEvaluation(payload) {
    const { data } = await this.client.post('/evaluations', payload);
    const raw = data?.data ?? data;
    return { data: { evaluation: new Evaluation(raw || {}) } };
  }
}
const evaluationService = new EvaluationService();

// services/EmailLogService.js
class EmailLogService extends ApiService {
  constructor() {
    super('email-logs');
  }
}
const emailLogService = new EmailLogService();

// services/TaskService.js — backend: tasks-to-employees (assign: employeeId, propertyId, title, description?, appointmentId?, dueDate); tasks-by-employees (submit: employeeId, taskNo, data, notes?)
import { Task } from '../models/index.js';

class TaskService extends ApiService {
  constructor() {
    super('');
  }

  async assignTask(payload) {
    const { data } = await this.client.post('/tasks-to-employees', payload);
    const raw = data?.data ?? data;
    return { data: { task: new Task(raw || {}) } };
  }

  async getAssignedTasks(params = {}) {
    const { data } = await this.client.get('/tasks-to-employees', { params });
    const list = data?.data ?? [];
    return { data: { tasks: Task.fromArray(Array.isArray(list) ? list : []) } };
  }

  async updateAssignedTask(id, payload) {
    const { data } = await this.client.patch(`/tasks-to-employees/${id}`, payload);
    return data?.data ?? data;
  }

  async submitTask(payload) {
    const { data } = await this.client.post('/tasks-by-employees', payload);
    const raw = data?.data ?? data;
    return { data: { task: new Task(raw || {}) } };
  }

  async getSubmittedTasks(params = {}) {
    const { data } = await this.client.get('/tasks-by-employees', { params });
    const list = data?.data ?? [];
    return { data: { tasks: Task.fromArray(Array.isArray(list) ? list : []) } };
  }

  async updateSubmittedTask(id, payload) {
    const { data } = await this.client.patch(`/tasks-by-employees/${id}`, payload);
    return data?.data ?? data;
  }
}
const taskService = new TaskService();

// services/TransactionService.js — backend: create (propertyId, customerId, employeeId, transactionType, totalAmount, paidAmount?); getTransactions query customerId, employeeId, propertyId
import { Transaction } from '../models/index.js';

class TransactionService extends ApiService {
  constructor() {
    super('transactions');
  }

  async getTransactions(params = {}) {
    const { data } = await this.client.get('/transactions', { params });
    const list = Array.isArray(data?.data) ? data.data : (data?.data?.transactions ?? data?.transactions ?? []);
    const arr = Array.isArray(list) ? list : [];
    const total = data?.total ?? data?.pagination?.total ?? arr.length;
    return {
      data: {
        transactions: Transaction.fromArray(arr),
        total: typeof total === 'number' ? total : arr.length,
      },
    };
  }

  /** Transactions where current user is the customer (for My Payments page) */
  async getMyTransactions(params = {}) {
    try {
      const { data } = await this.client.get('/transactions/me', { params });
      const list = Array.isArray(data?.data) ? data.data : (data?.data?.transactions ?? data?.transactions ?? []);
      const arr = Array.isArray(list) ? list : [];
      return { data: { transactions: Transaction.fromArray(arr), total: arr.length } };
    } catch (e) {
      return { data: { transactions: [], total: 0 } };
    }
  }

  async getTransactionById(id) {
    const { data } = await this.client.get(`/transactions/${id}`);
    const raw = data?.data ?? data;
    return { data: { transaction: new Transaction(raw || {}) } };
  }

  async createTransaction(payload) {
    const { data } = await this.client.post('/transactions', payload);
    const raw = data?.data ?? data;
    return { data: { transaction: new Transaction(raw || {}) } };
  }

  async updateTransaction(id, payload) {
    const { data } = await this.client.patch(`/transactions/${id}`, payload);
    const raw = data?.data ?? data;
    return { data: { transaction: new Transaction(raw || {}) } };
  }
}
const transactionService = new TransactionService();

export {
  authService,
  propertyService,
  userService,
  appointmentService,
  requestService,
  paymentService,
  installmentService,
  notificationService,
  employeeService,
  favoriteService,
  webhookService,
  evaluationService,
  emailLogService,
  taskService,
  transactionService,
};
