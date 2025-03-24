export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'NextBuy';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Modern e-commerce platform built with Next.js';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT = 4;

export const signInDefaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};