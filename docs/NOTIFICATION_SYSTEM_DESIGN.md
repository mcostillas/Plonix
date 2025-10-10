# Notification System - Design Specification

## Design Principles

### Keep It Simple
- Clean, minimal UI matching Plounix's existing design
- Use lucide-react icons (already installed)
- Follow shadcn/ui patterns (already in use)
- No emojis, no clutter, no unnecessary animations
- Consistent with your card-based layouts

---

## Component Designs

### 1. Toast Notifications (sonner)

**Installation:**
```bash
npm install sonner
```

**Configuration in `app/layout.tsx`:**
```tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
        <Analytics />
      </body>
    </html>
  )
}
```

**Usage Examples:**
```tsx
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

// Success
toast.success('Transaction added successfully', {
  description: '₱500 expense added to Food category'
})

// Error
toast.error('Failed to save profile', {
  description: 'Please check your connection and try again'
})

// Warning
toast.warning('Budget limit reached', {
  description: 'You have spent 90% of your monthly budget'
})

// Info
toast.info('New learning module available', {
  description: 'Check out "Credit Cards Explained"'
})
```

**Visual Style:**
- Clean white background with subtle shadow
- Icon on the left (lucide-react)
- Title + description layout
- Close button (X) on the right
- Auto-dismiss after 4 seconds
- Smooth slide-in from top-right

---

### 2. Notification Bell (Navbar)

**Design:**
```tsx
// Simple bell icon with badge
<button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
  <Bell className="w-5 h-5 text-gray-600" />
  {unreadCount > 0 && (
    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</button>
```

**Dropdown Panel:**
```tsx
<div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
  {/* Header */}
  <div className="p-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-gray-900">Notifications</h3>
      {unreadCount > 0 && (
        <button className="text-sm text-indigo-600 hover:text-indigo-700">
          Mark all as read
        </button>
      )}
    </div>
  </div>

  {/* Notification List */}
  <div className="max-h-96 overflow-y-auto">
    {notifications.map(notification => (
      <div 
        key={notification.id}
        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
          !notification.is_read ? 'bg-indigo-50' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* Icon based on type */}
          <div className={`p-2 rounded-lg ${getIconBgColor(notification.type)}`}>
            {getIcon(notification.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatTimeAgo(notification.created_at)}
            </p>
          </div>
          
          {/* Unread indicator */}
          {!notification.is_read && (
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Footer */}
  <div className="p-3 border-t border-gray-200">
    <button className="w-full text-sm text-center text-gray-600 hover:text-gray-900">
      View all notifications
    </button>
  </div>
</div>
```

**Icon mapping:**
```tsx
function getIcon(type: string) {
  const iconClass = "w-4 h-4"
  
  switch (type) {
    case 'bill_reminder':
      return <Calendar className={iconClass + " text-red-600"} />
    case 'learning':
      return <BookOpen className={iconClass + " text-blue-600"} />
    case 'achievement':
      return <Trophy className={iconClass + " text-yellow-600"} />
    case 'budget_alert':
      return <AlertCircle className={iconClass + " text-orange-600"} />
    case 'system':
      return <Info className={iconClass + " text-gray-600"} />
    default:
      return <Bell className={iconClass + " text-gray-600"} />
  }
}

function getIconBgColor(type: string) {
  switch (type) {
    case 'bill_reminder':
      return 'bg-red-50'
    case 'learning':
      return 'bg-blue-50'
    case 'achievement':
      return 'bg-yellow-50'
    case 'budget_alert':
      return 'bg-orange-50'
    default:
      return 'bg-gray-50'
  }
}
```

---

### 3. Bill Due Date Badges

**In MonthlyBillsManager component:**

```tsx
function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  let dueDate = new Date(currentYear, currentMonth, dueDay)
  if (currentDay > dueDay) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay)
  }
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getDueDateBadge(daysUntil: number) {
  if (daysUntil === 0) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Due Today
      </Badge>
    )
  } else if (daysUntil === 1) {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
        <Clock className="w-3 h-3 mr-1" />
        Due Tomorrow
      </Badge>
    )
  } else if (daysUntil <= 3) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        <Calendar className="w-3 h-3 mr-1" />
        Due in {daysUntil} days
      </Badge>
    )
  } else if (daysUntil <= 7) {
    return (
      <Badge variant="outline" className="text-gray-600">
        <Calendar className="w-3 h-3 mr-1" />
        Due in {daysUntil} days
      </Badge>
    )
  }
  return null // Don't show badge if more than 7 days away
}
```

**Visual in bill list:**
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-4">
    {/* Icon and bill info */}
  </div>
  
  {/* Due date badge */}
  <div className="flex items-center space-x-3">
    {getDueDateBadge(getDaysUntilDue(bill.due_day))}
    <div className="text-right">
      <div className="text-lg font-semibold">
        ₱{Number(bill.amount).toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">/month</div>
    </div>
  </div>
</div>
```

---

### 4. Motivational Modal (Simple)

**Design:**
```tsx
<Dialog open={showMotivationalModal} onOpenChange={setShowMotivationalModal}>
  <DialogContent className="sm:max-w-md">
    {/* Icon */}
    <div className="flex justify-center mb-4">
      <div className="p-4 bg-indigo-50 rounded-full">
        <BookOpen className="w-8 h-8 text-indigo-600" />
      </div>
    </div>
    
    {/* Content */}
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Ready to learn something new?
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        You haven't visited the Learning Hub in 5 days. 
        Your financial knowledge is important!
      </p>
      
      {/* Suggested lesson */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg">
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Emergency Fund Basics
            </p>
            <p className="text-xs text-gray-500">Just 5 minutes</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Actions */}
    <div className="flex space-x-3">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={() => setShowMotivationalModal(false)}
      >
        Maybe Later
      </Button>
      <Button 
        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        onClick={() => router.push('/learning')}
      >
        Let's Learn
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

### 5. Notification Preferences Page

**Clean settings interface:**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <Bell className="w-5 h-5 mr-2 text-indigo-600" />
      Notification Preferences
    </CardTitle>
    <CardDescription>
      Choose which notifications you want to receive
    </CardDescription>
  </CardHeader>
  
  <CardContent className="space-y-6">
    {/* In-App Notifications */}
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        In-App Notifications
      </h3>
      <div className="space-y-3">
        <SettingToggle
          icon={<Calendar className="w-4 h-4" />}
          label="Bill Reminders"
          description="Get notified before bills are due"
          checked={preferences.bill_reminders}
          onChange={(checked) => updatePreference('bill_reminders', checked)}
        />
        
        <SettingToggle
          icon={<AlertCircle className="w-4 h-4" />}
          label="Budget Alerts"
          description="Alerts when approaching budget limits"
          checked={preferences.budget_alerts}
          onChange={(checked) => updatePreference('budget_alerts', checked)}
        />
        
        <SettingToggle
          icon={<BookOpen className="w-4 h-4" />}
          label="Learning Prompts"
          description="Reminders to continue your financial education"
          checked={preferences.learning_prompts}
          onChange={(checked) => updatePreference('learning_prompts', checked)}
        />
        
        <SettingToggle
          icon={<Trophy className="w-4 h-4" />}
          label="Achievement Celebrations"
          description="Notifications when you reach milestones"
          checked={preferences.achievements}
          onChange={(checked) => updatePreference('achievements', checked)}
        />
      </div>
    </div>

    {/* Timing Preferences */}
    <div className="border-t pt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Timing
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="reminder-days">Bill Reminder (days before)</Label>
          <Select 
            value={String(preferences.reminder_days_before)} 
            onValueChange={(value) => updatePreference('reminder_days_before', Number(value))}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    {/* Save Button */}
    <div className="border-t pt-6">
      <Button 
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        onClick={savePreferences}
      >
        Save Preferences
      </Button>
    </div>
  </CardContent>
</Card>
```

**Toggle component:**
```tsx
function SettingToggle({ 
  icon, 
  label, 
  description, 
  checked, 
  onChange 
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <div className="text-gray-600">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-indigo-600' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
```

---

## Database Schema

**Simple and clean:**

```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'bill_reminder', 'learning', 'achievement', 'budget_alert', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bill_reminders BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  learning_prompts BOOLEAN DEFAULT true,
  achievements BOOLEAN DEFAULT true,
  reminder_days_before INT DEFAULT 7,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" 
  ON user_notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON user_notification_preferences FOR ALL 
  USING (auth.uid() = user_id);
```

---

## Icon Reference (lucide-react)

**Already installed, just import:**
```tsx
import { 
  Bell,           // Notification bell
  Calendar,       // Bill reminders, dates
  BookOpen,       // Learning content
  Trophy,         // Achievements
  AlertCircle,    // Warnings, alerts
  Info,           // Information
  CheckCircle,    // Success
  XCircle,        // Error
  Clock,          // Time-related
  Target,         // Goals
  TrendingUp,     // Progress
  DollarSign,     // Money-related
  Wallet          // Financial
} from 'lucide-react'
```

---

## Color System

**Match your existing Plounix colors:**

```tsx
const notificationColors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600'
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: 'text-orange-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600'
  },
  primary: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    icon: 'text-indigo-600'
  }
}
```

---

## Implementation Priority

### Phase 1: MVP (This Week)
1. Install sonner
2. Add Toaster to layout
3. Replace all alerts with toast notifications
4. Add getDaysUntilDue and getDueDateBadge to MonthlyBillsManager

### Phase 2: Core Features (Next Week)
5. Create notification database tables
6. Add bell icon to navbar
7. Build notification dropdown
8. Implement bill reminder logic

### Phase 3: Polish (Following Week)
9. Create notification preferences page
10. Add motivational modal
11. Implement smart timing
12. Testing and refinement

---

## Design Checklist

- [ ] No emojis (icons only)
- [ ] Clean white backgrounds
- [ ] Subtle shadows and borders
- [ ] Consistent spacing (p-3, p-4, space-x-3, etc.)
- [ ] Gray color palette for text (text-gray-600, text-gray-900)
- [ ] Indigo for primary actions (bg-indigo-600)
- [ ] Simple hover states (hover:bg-gray-50)
- [ ] Smooth transitions (transition-colors)
- [ ] Accessible (ARIA labels, focus states)
- [ ] Mobile responsive

This matches your existing design system perfectly - clean, minimal, professional.
