# Privacy Settings Modal - Implementation Guide

## Component Created: `PrivacySettingsModal.tsx`

A modal dialog for managing user privacy preferences and data controls, matching the style of `NotificationSettingsModal`.

## Features

### Privacy Controls
1. **Data Sharing** - Share anonymized data to improve Plounix
2. **AI Learning** - Allow AI to learn from interactions
3. **Analytics** - Share usage statistics

### Data Management
- **Clear AI Memory** - Delete all chat history and AI-learned preferences
  - Includes confirmation step
  - Does NOT delete financial data (transactions, goals)
  - Clears: `chat_history` and `financial_memories` tables

### Security Info
- Displays reassurance about data encryption
- Shows data protection policies

## How to Use

### 1. Import the component
```tsx
import { PrivacySettingsModal } from '@/components/PrivacySettingsModal'
```

### 2. Add state management
```tsx
const [showPrivacyModal, setShowPrivacyModal] = useState(false)
```

### 3. Add the modal to your page
```tsx
<PrivacySettingsModal 
  open={showPrivacyModal} 
  onOpenChange={setShowPrivacyModal} 
/>
```

### 4. Trigger the modal with a button
```tsx
<Button onClick={() => setShowPrivacyModal(true)}>
  <Shield className="w-4 h-4 mr-2" />
  Privacy Settings
</Button>
```

## Example Implementation (Profile Page)

```tsx
'use client'

import { useState } from 'react'
import { PrivacySettingsModal } from '@/components/PrivacySettingsModal'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export default function ProfilePage() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <div>
      {/* Your profile content */}
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Privacy & Security</h2>
        <p className="text-sm text-gray-600">
          Manage your privacy preferences and data
        </p>
        
        <Button 
          variant="outline"
          onClick={() => setShowPrivacyModal(true)}
          className="w-full sm:w-auto"
        >
          <Shield className="w-4 h-4 mr-2" />
          Privacy Settings
        </Button>
      </div>

      {/* Privacy Modal */}
      <PrivacySettingsModal 
        open={showPrivacyModal} 
        onOpenChange={setShowPrivacyModal} 
      />
    </div>
  )
}
```

## Database Schema Requirements

The modal expects these tables to exist:

### `user_profiles` table
```sql
- user_id (uuid, primary key)
- preferences (jsonb) - stores privacy preferences
  {
    "data_sharing": boolean,
    "ai_learning": boolean,
    "analytics": boolean
  }
- updated_at (timestamp)
```

### `chat_history` table (for clearing AI data)
```sql
- user_id (uuid)
- session_id (text)
- message_type (text)
- content (text)
- metadata (jsonb)
- created_at (timestamp)
```

### `financial_memories` table (for clearing AI data)
```sql
- user_id (uuid)
- content (text)
- metadata (jsonb)
- embedding (vector)
- created_at (timestamp)
```

## Styling

- Matches the NotificationSettingsModal design
- Uses Tailwind CSS and shadcn/ui components
- Responsive design with max-width and scrolling
- Toggle switches for settings
- Warning colors (orange) for destructive actions
- Info colors (blue) for security reassurance

## Features to Note

1. **Loading State** - Shows spinner while fetching preferences
2. **Saving State** - Disabled buttons with loading spinner
3. **Delete Confirmation** - Two-step process for clearing AI data
4. **Toast Notifications** - Success/error feedback using Sonner
5. **Responsive** - Works on mobile and desktop
6. **Accessible** - Proper ARIA labels and keyboard navigation

## Next Steps

To integrate into your profile page:
1. Import the component
2. Add state for modal visibility
3. Add a button to trigger the modal
4. Ensure database tables exist with proper structure
