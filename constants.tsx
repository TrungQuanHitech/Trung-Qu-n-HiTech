
import React from 'react';
import { Product, Contact, ContactType, Transaction, TransactionType } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'iPhone 15 Pro Max', sku: 'IP15PM', category: 'Điện thoại', unit: 'Cái', costPrice: 28000000, salePrice: 32000000, stock: 15, minStock: 5 },
  { id: 'p2', name: 'Samsung S24 Ultra', sku: 'S24U', category: 'Điện thoại', unit: 'Cái', costPrice: 25000000, salePrice: 29000000, stock: 8, minStock: 5 },
  { id: 'p3', name: 'MacBook Air M3', sku: 'MBA-M3', category: 'Laptop', unit: 'Cái', costPrice: 24000000, salePrice: 27500000, stock: 3, minStock: 5 },
  { id: 'p4', name: 'AirPods Pro 2', sku: 'APP2', category: 'Phụ kiện', unit: 'Bộ', costPrice: 5000000, salePrice: 6200000, stock: 25, minStock: 10 },
];

export const INITIAL_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Nguyễn Văn A', phone: '0901234567', type: ContactType.CUSTOMER, balance: 1500000 },
  { id: 'c2', name: 'Trần Thị B', phone: '0987654321', type: ContactType.CUSTOMER, balance: 0 },
  { id: 's1', name: 'Công ty NPP Toàn Cầu', phone: '0281234567', type: ContactType.SUPPLIER, balance: 45000000 },
  { id: 's2', name: 'Xưởng Linh Kiện ABC', phone: '0249876543', type: ContactType.SUPPLIER, balance: 0 },
];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.SALE]: 'Bán hàng',
  [TransactionType.PURCHASE]: 'Nhập hàng',
  [TransactionType.INCOME]: 'Thu ngoài',
  [TransactionType.EXPENSE]: 'Chi ngoài',
  [TransactionType.DEBT_COLLECTION]: 'Thu nợ khách',
  [TransactionType.DEBT_PAYMENT]: 'Trả nợ NCC',
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  [ContactType.CUSTOMER]: 'Khách hàng',
  [ContactType.SUPPLIER]: 'Nhà cung cấp',
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: TransactionType.SALE,
    date: new Date().toISOString(),
    contactId: 'c1',
    contactName: 'Nguyễn Văn A',
    items: [{ productId: 'p1', name: 'iPhone 15 Pro Max', quantity: 1, price: 32000000, total: 32000000 }],
    subtotal: 32000000,
    discount: 0,
    total: 32000000,
    paidAmount: 30500000,
    debtAmount: 1500000,
  },
  {
    id: 't2',
    type: TransactionType.PURCHASE,
    date: new Date().toISOString(),
    contactId: 's1',
    contactName: 'Công ty NPP Toàn Cầu',
    items: [{ productId: 'p2', name: 'Samsung S24 Ultra', quantity: 5, price: 25000000, total: 125000000 }],
    subtotal: 125000000,
    discount: 0,
    total: 125000000,
    paidAmount: 80000000,
    debtAmount: 45000000,
  }
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const generateSKU = (name: string): string => {
  if (!name) return '';
  const str = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const initials = str
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${initials}-${randomPart}`;
};
