# Admin Learning Modules Management

## Overview

Admin page for creating, editing, and deleting learning modules in the Plounix learning hub. This allows admins to manage educational content without touching the database directly.

---

## 📍 Location

**Page**: `/admin/learning-modules`  
**API**: `/api/admin/learning-modules`

---

## 🔐 Authentication

- **Required**: Admin login (username/password)
- **Protected**: Both page and API use admin authentication middleware
- **Security**: Uses `requireAdmin()` middleware to verify admin session

---

## ✨ Features

### 1. View All Modules
- List all learning modules with full details
- Group by category (Core, Essential, Advanced)
- Real-time stats showing module counts

### 2. Create Module
- Create new learning modules with comprehensive details
- Fields:
  - **Module ID**: Unique identifier (auto-converted to lowercase-hyphenated)
  - **Module Title**: Display name
  - **Description**: Short summary
  - **Category**: Core, Essential, or Advanced
  - **Duration**: Estimated completion time
  - **Total Steps**: Number of learning steps
  - **Key Concepts**: Comma-separated list
  - **Key Takeaways**: Line-separated insights
  - **Practical Tips**: Line-separated actionable advice
  - **Common Mistakes**: Line-separated warnings

### 3. Edit Module
- Update existing module details
- Cannot change module_id (prevents breaking references)
- All other fields are editable

### 4. Delete Module
- Remove modules from the system
- Confirmation dialog to prevent accidents
- Warning about data removal

---

## 🗄️ Database Structure

### Table: `learning_module_content`

```sql
CREATE TABLE learning_module_content (
  id UUID PRIMARY KEY,
  module_id TEXT UNIQUE NOT NULL,
  module_title TEXT NOT NULL,
  module_description TEXT,
  duration TEXT,
  category TEXT, -- 'core' | 'essential' | 'advanced'
  key_concepts JSONB, -- Array of concepts
  key_takeaways TEXT[], -- Array of takeaways
  practical_tips TEXT[], -- Array of tips
  common_mistakes TEXT[], -- Array of mistakes
  total_steps INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 🔌 API Endpoints

### GET `/api/admin/learning-modules`
Fetch all learning modules

**Response:**
```json
[
  {
    "id": "uuid",
    "module_id": "budgeting",
    "module_title": "Budgeting Mastery for Students",
    "module_description": "Learn to manage your allowance...",
    "duration": "15 min",
    "category": "core",
    "key_concepts": ["50-30-20 rule", "Needs vs Wants"],
    "key_takeaways": ["Budgeting prevents running out of money"],
    "practical_tips": ["Use 50% for NEEDS"],
    "common_mistakes": ["Not tracking small expenses"],
    "total_steps": 10,
    "created_at": "2025-10-27T...",
    "updated_at": "2025-10-27T..."
  }
]
```

### POST `/api/admin/learning-modules`
Create a new module

**Request Body:**
```json
{
  "module_id": "investing-basics",
  "module_title": "Investing 101",
  "module_description": "Start your investment journey",
  "duration": "20 min",
  "category": "advanced",
  "key_concepts": ["Compound interest", "Risk vs Return"],
  "key_takeaways": ["Start early", "Diversify"],
  "practical_tips": ["Start with index funds"],
  "common_mistakes": ["Trying to time the market"],
  "total_steps": 12
}
```

### PUT `/api/admin/learning-modules`
Update an existing module

**Request Body:**
```json
{
  "id": "uuid-of-module",
  "module_title": "Updated Title",
  "duration": "25 min",
  ...
}
```

### DELETE `/api/admin/learning-modules?id={uuid}`
Delete a module

**Query Params:**
- `id`: UUID of the module to delete

---

## 🎨 UI Components

### Stats Cards
- Total Modules
- Core Modules (Blue)
- Essential Modules (Purple)
- Advanced Modules (Orange)

### Module Cards
Each module shows:
- Title and category badge
- Module ID, duration, and total steps
- Description
- Count of key concepts, takeaways, tips, and mistakes
- Edit and Delete buttons

### Create/Edit Dialog
- Comprehensive form with all module fields
- Input validation
- Helpful placeholders and hints
- Save/Cancel actions

### Delete Confirmation
- Warning about irreversible action
- Clarification that user data (reflections/progress) is preserved
- Confirm/Cancel buttons

---

## 🚀 Usage

### Access the Page
1. Login to admin dashboard
2. Click "Manage Learning Modules" card
3. Or navigate to `/admin/learning-modules`

### Create a Module
1. Click "Create Module" button
2. Fill in all required fields (marked with *)
3. Use comma-separated values for key concepts
4. Use one-per-line for takeaways, tips, mistakes
5. Click "Save Module"

### Edit a Module
1. Find the module in the list
2. Click the pencil icon
3. Update desired fields
4. Click "Save Module"

### Delete a Module
1. Find the module in the list
2. Click the trash icon
3. Confirm deletion in the dialog
4. Module is permanently removed

---

## 💡 Tips

### Module ID Naming
- Use lowercase letters
- Separate words with hyphens
- Examples: `budgeting`, `emergency-fund`, `investing-101`
- Will be automatically converted from spaces/uppercase

### Category Selection
- **Core**: Foundation skills (budgeting, saving, debt)
- **Essential**: Important skills (credit, insurance, taxes)
- **Advanced**: Advanced topics (investing, retirement, entrepreneurship)

### Content Tips
- **Key Concepts**: Short phrases (2-5 words each)
- **Key Takeaways**: Complete sentences with actionable insights
- **Practical Tips**: Specific, actionable advice users can implement
- **Common Mistakes**: What to avoid, written as warnings

---

## 🔗 Integration

### Learning Hub Integration
Modules created here automatically appear in:
- `/learning` - Learning hub main page
- `/learning/[module_id]` - Individual module pages

### AI Integration
Module content is used by:
- AI assistant for providing financial advice
- Context awareness for personalized recommendations
- Learning reflections analysis

---

## 🛡️ Security

- ✅ Admin-only access (requires admin login)
- ✅ Session validation on every request
- ✅ Admin middleware protection
- ✅ Supabase RLS policies
- ✅ Input validation and sanitization

---

## 📊 Example Module Structure

```json
{
  "module_id": "budgeting",
  "module_title": "Budgeting Mastery for Students",
  "module_description": "Learn to manage your allowance and starting salary like a pro",
  "duration": "15 min",
  "category": "core",
  "key_concepts": [
    "50-30-20 rule",
    "Needs vs Wants classification",
    "Monthly budget tracking"
  ],
  "key_takeaways": [
    "Budgeting prevents running out of money before next allowance/payday",
    "The 50-30-20 rule adapts to any income level",
    "Treating savings as a need builds wealth automatically"
  ],
  "practical_tips": [
    "Use 50% for NEEDS (food, transport, supplies)",
    "Allocate 30% for WANTS (entertainment, shopping)",
    "Save 20% automatically every payday"
  ],
  "common_mistakes": [
    "Not tracking small expenses like coffee or snacks",
    "Skipping the savings category",
    "Being too strict and giving up when you overspend"
  ],
  "total_steps": 10
}
```

---

## ✅ Testing Checklist

- [ ] Can view all modules
- [ ] Stats cards show correct counts
- [ ] Create new module works
- [ ] Module ID is auto-formatted correctly
- [ ] Edit existing module works
- [ ] Cannot change module_id when editing
- [ ] Delete module requires confirmation
- [ ] All form validations work
- [ ] Changes reflect on learning hub
- [ ] Non-admin users cannot access page

---

## 🎯 Future Enhancements

- [ ] Bulk import/export modules (JSON/CSV)
- [ ] Module preview before saving
- [ ] Duplicate module functionality
- [ ] Module ordering/priority
- [ ] Module publish/draft status
- [ ] Rich text editor for descriptions
- [ ] Image upload for module covers
- [ ] Module analytics (completion rates)
- [ ] Version history/rollback
- [ ] Module templates

---

## 📝 Notes

- User progress and reflections are NOT affected when modules are deleted
- Module IDs should remain consistent once created (don't change them)
- Changes take effect immediately on the learning hub
- AI assistant will use updated module content automatically

---

**Access**: `/admin/learning-modules`  
**Created**: October 27, 2025  
**Status**: ✅ Production Ready
