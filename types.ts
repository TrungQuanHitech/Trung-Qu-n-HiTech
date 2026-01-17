
export enum ContactType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER'
}

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  DEBT_COLLECTION = 'DEBT_COLLECTION',
  DEBT_PAYMENT = 'DEBT_PAYMENT'
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: ContactType;
  balance: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  image?: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  contactId?: string;
  contactName?: string;
  items?: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  debtAmount: number;
  note?: string;
}

export interface PrinterConfig {
  paperSize: 'K80' | 'K58';
  autoPrint: boolean;
  showLogo: boolean;
  copies: number;
}

export interface BarcodeConfig {
  width: number; // mm
  height: number; // mm
  fontSize: number;
  showName: boolean;
  showPrice: boolean;
  labelsPerRow: number;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface BankConfig {
  bankId: string;
  accountNo: string;
  accountName: string;
}

export interface InvoiceConfig {
  storeName: string;
  address: string;
  phone: string;
  footerMessage: string;
}

export type ViewType = 'DASHBOARD' | 'INVENTORY' | 'SALES' | 'PURCHASES' | 'FINANCE' | 'CONTACTS' | 'DEBT' | 'REPORTS' | 'SETTINGS';
