# UI/UX Components Quick Start Guide

## 🚀 Getting Started

All new UI/UX components are ready to use! Simply import them into your pages.

---

## 📦 Component Imports

### All-in-One Import
```tsx
import { 
  Skeleton,
  SkeletonCard,
  FormInput,
  FormTextarea,
  validators,
  EmptyState,
  NoOrdersState,
  ErrorBoundary,
  ProgressBar,
  CircularProgress,
  LazyImage,
  Avatar
} from '@/components/UI';
```

### Individual Imports
```tsx
import { Skeleton } from '@/components/UI/Skeleton';
import { FormInput } from '@/components/UI/FormInput';
import { LazyImage } from '@/components/UI/LazyImage';
```

---

## 🎯 Common Use Cases

### 1. Loading States

**Replace loading spinners with skeletons:**
```tsx
{isLoading ? (
  <SkeletonCard />
) : (
  <ProductCard product={data} />
)}
```

### 2. Form Validation

**Enhanced input with validation:**
```tsx
<FormInput
  label="Email"
  type="email"
  placeholder="your@email.com"
  showValidation
  onValidate={validators.email}
  onChange={(value) => setEmail(value)}
  required
/>

<FormInput
  label="Password"
  type="password"
  showValidation
  onValidate={validators.password}
  onChange={(value) => setPassword(value)}
  required
/>
```

**Combine multiple validators:**
```tsx
<FormInput
  label="Username"
  onValidate={validators.combine(
    validators.required,
    validators.minLength(3),
    validators.maxLength(20)
  )}
/>
```

### 3. Empty States

**Show when no data:**
```tsx
{orders.length === 0 ? (
  <NoOrdersState />
) : (
  orders.map(order => <OrderCard key={order.id} order={order} />)
)}
```

### 4. Progress Indicators

**Linear progress:**
```tsx
<ProgressBar value={uploadProgress} max={100} showLabel />
```

**Circular progress:**
```tsx
<CircularProgress value={75} color="success" showLabel />
```

**Step progress:**
```tsx
<StepProgress 
  steps={['Cart', 'Shipping', 'Payment', 'Confirm']}
  currentStep={2}
/>
```

### 5. Lazy Images

**Optimized image loading:**
```tsx
<LazyImage
  src={product.image}
  alt={product.name}
  aspectRatio="16/9"
  objectFit="cover"
/>
```

**Avatar with fallback:**
```tsx
<Avatar 
  src={user.avatar}
  alt={user.name}
  size="lg"
  fallback={user.name.charAt(0)}
/>
```

### 6. Error Boundaries

**Wrap components to catch errors:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 🎨 Styling Classes

### Animations
- `.stagger-item` - Staggered fade-in animation
- `.touch-ripple` - Touch ripple effect
- `.scroll-snap-x` - Horizontal scroll snap
- `.fade-in` - Simple fade in

### Accessibility
- `.visually-hidden` - Hide visually but keep for screen readers
- `.skip-to-content` - Skip navigation link
- `.keyboard-only` - Show only on keyboard focus

### Mobile
- `.hide-mobile` - Hide on mobile devices
- `.hide-desktop` - Hide on desktop
- `.safe-area-bottom` - Add safe area padding

---

## 🔧 Custom Hooks

### Responsive Design
```tsx
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';

const isMobile = useIsMobile();
const isTablet = useIsTablet();
const isDesktop = useIsDesktop();
```

### Scroll Tracking
```tsx
import { useScrollPosition, useIsScrolled } from '@/hooks/useScrollPosition';

const { y } = useScrollPosition();
const isScrolled = useIsScrolled(100); // true if scrolled > 100px
```

### Performance
```tsx
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

// Use debouncedSearch for API calls
useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch);
  }
}, [debouncedSearch]);
```

### Visibility Detection
```tsx
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const [ref, isVisible] = useIntersectionObserver();

return (
  <div ref={ref}>
    {isVisible && <ExpensiveComponent />}
  </div>
);
```

---

## 💡 Best Practices

### 1. Always Use Skeletons for Loading
❌ **Don't:**
```tsx
{isLoading && <div>Loading...</div>}
```

✅ **Do:**
```tsx
{isLoading ? <SkeletonCard /> : <ProductCard />}
```

### 2. Validate Forms Properly
❌ **Don't:**
```tsx
<input type="email" />
```

✅ **Do:**
```tsx
<FormInput 
  type="email" 
  showValidation 
  onValidate={validators.email}
/>
```

### 3. Handle Empty States
❌ **Don't:**
```tsx
{items.length === 0 && <p>No items</p>}
```

✅ **Do:**
```tsx
{items.length === 0 && <NoItemsState />}
```

### 4. Optimize Images
❌ **Don't:**
```tsx
<img src={url} alt="Product" />
```

✅ **Do:**
```tsx
<LazyImage src={url} alt="Product" aspectRatio="16/9" />
```

---

## 🎯 Example: Complete Form

```tsx
import { FormInput, FormTextarea, validators } from '@/components/UI';
import { useState } from 'react';

function CreateListingForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    email: ''
  });

  return (
    <form>
      <FormInput
        label="Product Title"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        onValidate={validators.combine(
          validators.required,
          validators.minLength(5)
        )}
        showValidation
        required
      />

      <FormTextarea
        label="Description"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        maxLength={500}
        showCharCount
        required
      />

      <FormInput
        label="Price"
        type="number"
        value={formData.price}
        onChange={(value) => setFormData({ ...formData, price: value })}
        onValidate={validators.positiveNumber}
        showValidation
        required
      />

      <FormInput
        label="Contact Email"
        type="email"
        value={formData.email}
        onChange={(value) => setFormData({ ...formData, email: value })}
        onValidate={validators.email}
        showValidation
        required
      />

      <button type="submit" className="btn-primary">
        Create Listing
      </button>
    </form>
  );
}
```

---

## 📱 Mobile Optimizations

All components are mobile-optimized by default:
- Touch-friendly tap targets (44px minimum)
- Bottom sheet modals on mobile
- Swipe gestures support
- Safe area insets for notched devices
- No zoom on input focus (iOS)

---

## ♿ Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- High contrast mode
- Reduced motion support

---

## 🎨 Dark Mode

All components automatically support dark mode via the existing `ThemeContext`:
```tsx
import { useTheme } from '@/context/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

---

## 📚 Full Documentation

See `UI_UX_IMPROVEMENTS.md` for complete documentation of all features.

---

*MAKEFARMHUB - Enhanced UI/UX Components*
