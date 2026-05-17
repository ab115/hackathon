import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Localization context for managing language and locale-specific formatting.
 * Supports English and Hindi with India-specific currency and date formatting.
 */

export type Locale = 'en';

export interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatPhone: (phone: string) => string;
  formatDate: (date: Date) => string;
  formatLongDate: (date: Date) => string;
  isValidPhone: (phone: string) => boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Localization strings
const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    // Common
    app_name: 'Scalegrad',
    welcome: 'Welcome to Scalegrad',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',

    // Authentication
    auth_title: 'Authentication',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    confirm_password: 'Confirm Password',
    forgot_password: 'Forgot Password?',
    remember_me: 'Remember me',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',
    login_success: 'Login successful!',
    registration_success: 'Registration successful! Please login.',
    invalid_credentials: 'Invalid email or password',
    email_already_exists: 'Email already registered',

    // Hackathons
    hackathons: 'Hackathons',
    browse_hackathons: 'Browse Hackathons',
    create_hackathon: 'Create Hackathon',
    join_hackathon: 'Join Hackathon',
    registration_fee: 'Registration Fee',
    participants: 'Participants',

    // Payments
    payment: 'Payment',
    pay_now: 'Pay Now',
    registering: 'Registering...',
    amount: 'Amount',
    currency: 'Currency',
    total_amount: 'Total Amount',
    subtotal: 'Subtotal',
    gst: 'GST (18%)',
    payment_success: 'Payment successful! Registration confirmed.',
    payment_failed: 'Payment failed. Please try again.',

    // Messages
    something_went_wrong: 'Something went wrong. Please try again.',
    please_login: 'Please login to continue',
    unauthorized: 'Unauthorized access',
  },
};

/**
 * Format amount in Indian currency format with lakhs and crores.
 * Examples: 5,00,000 (5 lakhs), 1,23,45,678 (1 crore 23 lakhs)
 */
function formatIndianCurrency(amount: number, currency: string = 'INR'): string {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const parts = amount.toString().split('.');
  const integerPart = parts[0];
  const decimals = parts[1] || '00';

  // Add commas in Indian format
  let formattedInteger = '';
  if (integerPart.length <= 3) {
    formattedInteger = integerPart;
  } else {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);

    // Add commas every 2 digits for remaining part
    let formattedRemaining = '';
    for (let i = remaining.length - 1; i >= 0; i--) {
      if ((remaining.length - i - 1) > 0 && (remaining.length - i - 1) % 2 === 0) {
        formattedRemaining = ',' + formattedRemaining;
      }
      formattedRemaining = remaining[i] + formattedRemaining;
    }

    formattedInteger = formattedRemaining + ',' + lastThree;
  }

  return `${currencySymbol}${formattedInteger}.${decimals}`;
}

/**
 * Format Indian phone number: +91-XXXXX-XXXXX
 */
function formatIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  // Remove country code if present
  let cleaned = digits;
  if (digits.startsWith('91') && digits.length === 12) {
    cleaned = digits.slice(2);
  } else if (digits.length > 10) {
    cleaned = digits.slice(-10);
  }

  if (cleaned.length !== 10) {
    return phone; // Return original if can't format
  }

  return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
}

/**
 * Validate Indian phone number (10 digits, starts with 6-9)
 */
function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  let cleaned = digits;
  if (digits.startsWith('91')) {
    cleaned = digits.slice(2);
  }

  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
}

/**
 * Format date in DD/MM/YYYY format (Indian standard)
 */
function formatIndianDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date with month name
 */
function formatLongIndianDate(date: Date, locale: Locale = 'en'): string {
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const day = date.getDate().toString().replace(/^0/, '');
  const month = monthNamesEn[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check localStorage for saved locale
    const saved = localStorage.getItem('scalegrad_locale');
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'ta' || saved === 'te')) {
      return saved;
    }
    // Default to English
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('scalegrad_locale', newLocale);
    // Set HTML lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  useEffect(() => {
    // Set lang attribute on mount or locale change
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key: string): string => {
    return STRINGS[locale][key as keyof typeof STRINGS['en']] || STRINGS.en[key as keyof typeof STRINGS['en']] || key;
  }, [locale]);

  const formatCurrency = useCallback((amount: number, currency: string = 'INR'): string => {
    return formatIndianCurrency(amount, currency);
  }, []);

  const formatPhone = useCallback((phone: string): string => {
    return formatIndianPhone(phone);
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return formatIndianDate(date);
  }, []);

  const formatLongDate = useCallback((date: Date): string => {
    return formatLongIndianDate(date, locale);
  }, [locale]);

  const isValidPhone = useCallback((phone: string): boolean => {
    return isValidIndianPhone(phone);
  }, []);

  const value: LocalizationContextType = {
    locale,
    setLocale,
    t,
    formatCurrency,
    formatPhone,
    formatDate,
    formatLongDate: formatLongDate,
    isValidPhone,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};

export default LocalizationContext;
