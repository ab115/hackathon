## Phase 4: Localization & UX - Quick Reference

### Location of Key Files

**Backend Modules**
- `backend/app/core/localization.py` - Indian formatting utilities
- `backend/app/core/i18n_strings.py` - Localization strings
- `backend/app/api/payments.py` - Updated with GST breakdown

**Frontend Modules**
- `frontend/src/context/LocalizationContext.tsx` - Localization state
- `frontend/src/components/LanguageSelector.tsx` - Language switcher
- `frontend/src/styles/designSystem.ts` - Design tokens

---

## Common Tasks

### Use Localization in Frontend Components

```tsx
import { useLocalization } from '../context/LocalizationContext';

export const MyComponent = () => {
  const { locale, setLocale, t, formatCurrency, formatPhone } = useLocalization();
  
  return (
    <>
      <h1>{t('welcome')}</h1>
      <p>Price: {formatCurrency(500)}</p>
      <p>Phone: {formatPhone('9876543210')}</p>
      <button onClick={() => setLocale('hi')}>हिंदी</button>
    </>
  );
};
```

### Add Language Selector to Header

```tsx
import LanguageSelector from '../components/LanguageSelector';

export const Header = () => {
  return (
    <header className="flex justify-between items-center">
      <h1>HackFusion</h1>
      <LanguageSelector variant="dropdown" showIcon={true} />
    </header>
  );
};
```

### Add New Localization String

**1. Add to backend strings** (`backend/app/core/i18n_strings.py`):
```python
STRINGS_EN = {
    ...
    "new_key": "English value",
}

STRINGS_HI = {
    ...
    "new_key": "हिंदी मान",
}
```

**2. Use in frontend**:
```tsx
const { t } = useLocalization();
<p>{t('new_key')}</p>
```

### Format Currency with GST

**Backend**:
```python
from app.core.localization import GSTFormatter, CurrencyFormatter

amount = 500
breakdown = GSTFormatter.format_gst_breakdown(amount, 18)
# breakdown = {
#   'subtotal': 500,
#   'gst_amount': 90,
#   'total': 590
# }

formatted = CurrencyFormatter.format_amount(breakdown['total'])
# formatted = "₹5,90,000"
```

**Frontend**:
```tsx
const { formatCurrency } = useLocalization();
<p>Total: {formatCurrency(590)}</p>
```

### Validate & Format Phone Number

```tsx
const { isValidPhone, formatPhone } = useLocalization();

const handlePhoneChange = (value: string) => {
  if (isValidPhone(value)) {
    setPhone(formatPhone(value));
  } else {
    setError('Invalid phone number');
  }
};
```

### Use Design System Spacing

```tsx
import { SPACING, TYPOGRAPHY } from '../styles/designSystem';

const Card = styled.div`
  padding: ${SPACING.component};
  margin-bottom: ${SPACING.lg};
  
  h2 {
    font-size: ${TYPOGRAPHY.h2.fontSize};
    line-height: ${TYPOGRAPHY.h2.lineHeight};
    margin-bottom: ${SPACING.md};
  }
`;
```

### Switch Language Programmatically

```tsx
const { setLocale } = useLocalization();

// Switch to Hindi
setLocale('hi');

// Switch to English
setLocale('en');

// Switch to Tamil
setLocale('ta');
```

---

## Currency Formatting Examples

```typescript
import { CurrencyFormatter } from '../backend/app/core/localization';

// Basic formatting
CurrencyFormatter.format_amount(500)           // ₹5,00,000
CurrencyFormatter.format_amount(1234567)      // ₹12,34,567
CurrencyFormatter.format_amount(500, 'USD')   // $500

// Parse formatted string
CurrencyFormatter.parse_amount('₹5,00,000')   // 500000

// Format without symbol
CurrencyFormatter.format_amount(500, include_symbol=False)  // 5,00,000
```

---

## Phone Formatting Examples

```typescript
import { PhoneFormatter } from '../backend/app/core/localization';

// Format
PhoneFormatter.format_phone('9876543210')              // +91-98765-43210
PhoneFormatter.format_phone('+919876543210')          // +91-98765-43210
PhoneFormatter.format_phone('919876543210')           // +91-98765-43210

// Validate
PhoneFormatter.is_valid_phone('9876543210')           // true
PhoneFormatter.is_valid_phone('1234567890')           // false (starts with 1)

// Format for API
PhoneFormatter.format_for_api('9876543210')           // 919876543210
```

---

## GST Calculation Examples

```typescript
import { GSTFormatter } from '../backend/app/core/localization';

// Calculate GST on amount
GSTFormatter.calculate_gst(500, 18)                   // 90

// Get total with GST
GSTFormatter.calculate_total_with_gst(500, 18)       // 590

// Get breakdown
GSTFormatter.format_gst_breakdown(500, 18)            // {
                                                        //   'subtotal': 500,
                                                        //   'gst_rate': 18,
                                                        //   'gst_amount': 90,
                                                        //   'total': 590
                                                        // }

// Reverse calculation (from total to original)
GSTFormatter.calculate_amount_from_total(590, 18)     // (500.0, 90.0)
```

---

## Date Formatting Examples

```typescript
import { DateFormatter } from '../backend/app/core/localization';

from datetime import datetime

# Format as DD/MM/YYYY
DateFormatter.format_date(datetime(2026, 1, 15))               # 15/01/2026

# Format long date in English
DateFormatter.format_long_date(datetime(2026, 1, 15), 'en')   # 15 January 2026

# Format long date in Hindi
DateFormatter.format_long_date(datetime(2026, 1, 15), 'hi')   # 15 जनवरी 2026

# Format time
DateFormatter.format_time(datetime(2026, 1, 15, 14, 30))      # 14:30
```

---

## Language Selector Variants

**Dropdown (Default)**:
```tsx
<LanguageSelector />
// Shows: [EN ⌄]
```

**Pills**:
```tsx
<LanguageSelector variant="pills" />
// Shows: [English] [हिंदी] [தமிழ்] [తెలుగు]
```

**Inline**:
```tsx
<LanguageSelector variant="inline" />
// Shows: 🌐 English
```

**Without icon**:
```tsx
<LanguageSelector showIcon={false} />
```

---

## Design System Spacing

| Size | Value | Use Case |
|------|-------|----------|
| xs | 4px | Compact spacing |
| sm | 8px | Small gaps |
| md | 16px | Element space |
| lg | 24px | Component space |
| xl | 32px | Container space |
| 2xl | 40px | Section space |
| 3xl | 48px | Large sections |
| 4xl | 64px | Very large space |
| 5xl | 80px | Full sections |

---

## Typography Scale

```typescript
display1:    56px - Hero text
display2:    48px - Landing page
h1:          40px - Main heading
h2:          32px - Section heading
h3:          24px - Subsection
h4:          20px - Small heading
h5:          16px - Field label
h6:          14px - Label text
body1:       16px - Main body
body2:       15px - Secondary body
body3:       14px - Small body
label:       14px - Form label
caption:     12px - Tiny text
button:      16px - Button text
```

---

## Common Issues & Solutions

**Issue**: Strings not translating
- **Solution**: Ensure key exists in both STRINGS_EN and STRINGS_HI
- Check locale is set correctly: `localStorage.getItem('hackfusion_locale')`

**Issue**: Currency not formatting correctly
- **Solution**: Ensure amount is float/number, not string
- Check currency code is uppercase: 'INR', not 'inr'

**Issue**: Phone number validation failing
- **Solution**: Must be 10 digits, starting with 6-9
- Remove any non-digit characters before validation

**Issue**: Design tokens not applying
- **Solution**: Import from correct file: `../styles/designSystem`
- Use styled-components or CSS-in-JS for dynamic values

**Issue**: Language not persisting on reload
- **Solution**: Check localStorage is enabled
- Verify `LocalizationProvider` wraps entire app

---

## Environment Variables

No new environment variables required for Phase 4. All localization is client/server-side computed.

---

## Testing Checklist

- [ ] Language selector appears in UI
- [ ] All 4 languages selectable (EN, HI, TA, TE)
- [ ] Language change updates all strings
- [ ] Locale persists on page reload
- [ ] Currency formatted with ₹ symbol
- [ ] GST calculated correctly (18%)
- [ ] Phone numbers formatted as +91-XXXXX-XXXXX
- [ ] Spacing consistent across components
- [ ] Typography hierarchy readable
- [ ] Design tokens applied correctly
- [ ] No console errors
- [ ] Mobile responsive

---

## Performance Tips

1. **Memoize locale-dependent calculations**:
   ```tsx
   const formatted = useMemo(() => formatCurrency(amount), [amount, locale]);
   ```

2. **Lazy load translations**:
   ```tsx
   const translations = lazy(() => import('./translations'));
   ```

3. **Use CSS variables for design tokens**:
   ```css
   padding: var(--spacing-lg);
   font-size: var(--font-size-h2);
   ```

---

## Support & Resources

- **Localization strings**: `backend/app/core/i18n_strings.py`
- **Formatting utilities**: `backend/app/core/localization.py`
- **React context**: `frontend/src/context/LocalizationContext.tsx`
- **Design system**: `frontend/src/styles/designSystem.ts`
- **Full documentation**: `backend/PHASE_4_COMPLETE.md`

---

## Contributing Translations

To add a new language:

1. Add language to `Locale` enum
2. Create STRINGS_[CODE] dict in i18n_strings.py
3. Update LocalizationContext.tsx STRINGS object
4. Add to LANGUAGES array in LanguageSelector.tsx
5. Test all 4 variants of LanguageSelector

Example for Marathi (mr):
```python
# i18n_strings.py
STRINGS_MR = {
    "welcome": "HackFusion मध्ये स्वागत आहे",
    ...
}

# LocalizationContext.tsx
const STRINGS: Record<Locale, ...> = {
    ...
    mr: { ... }
}
```
