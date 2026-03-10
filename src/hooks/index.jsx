// hooks/useAsync.js — Generic async state hook
import React, { useState,useEffect, useCallback, useRef } from 'react';
import { propertyService } from '../services/index.js';
import { notificationService } from '../services/index.js';


export const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  return { loading, error, run };
};


// hooks/usePagination.js
export const usePagination = (initialPage = 1, initialLimit = 12) => {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (n) => setPage(n);

  return { page, limit, total, setTotal, totalPages, nextPage, prevPage, goToPage };
};


// hooks/useDebounce.js

export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};


// hooks/useProperties.js

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const { loading, error, run } = useAsync();
  const pagination = usePagination(1, 12);

  const fetch = async () => {
    await run(async () => {
      const res = await propertyService.getList({ ...filters, page: pagination.page, limit: pagination.limit });
      setProperties(res.data?.properties || []);
      const total = res.data?.total ?? res.pagination?.total ?? 0;
      pagination.setTotal(total);
    });
  };

  useEffect(() => { fetch(); }, [pagination.page, JSON.stringify(filters)]);

  return { properties, loading, error, pagination, refetch: fetch };
};


// hooks/useNotifications.js — safe when backend has no notifications API
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationService.markOneRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* no notifications API */ }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* no notifications API */ }
  };

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetch };
};
