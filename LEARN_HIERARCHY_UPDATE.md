# Learn Page Hierarchy Update

## Overview
Updated the Learn page to display the complete learning hierarchy: **Topics → Lessons → Sections → Questions**

## Changes Made

### Frontend

#### 1. New Components Created

**`LessonCard.tsx`**
- Displays individual lesson details with expandable sections
- Shows lesson type icons (Reading, Listening, Speaking, etc.)
- Color-coded by lesson type
- Displays progress bar and completion status
- Expandable to show all sections within the lesson
- Each section shows:
  - Section number/title
  - Question count
  - Completion status
  - "Học" or "Xem lại" button

**`EnhancedTopicCard.tsx`**
- Enhanced topic card with expandable lesson list
- Shows topic status badge (completed, current, locked)
- Displays progress statistics
- Auto-expands for current topic
- Lists all lessons using LessonCard component
- Quick action button when collapsed

#### 2. Updated Components

**`Learn.tsx`**
- Added stats dashboard showing:
  - Topics completed (X/Total)
  - Overall progress percentage
  - Current topic number
- Integrated EnhancedTopicCard
- Enhanced empty states and loading indicators
- Updated navigation to support section-level routing

#### 3. Updated Types

**`types/learning.ts`**
- Extended `TopicInTopicOut` interface:
  - Added `description` field
  - Added `order_index` field
  - Added `sections` array field
- Added new `LessonSectionSummary` interface:
  - `id`, `title`, `order_index`
  - `question_count` - number of questions
  - `completed` - section completion status

### Backend

#### 1. Schema Updates (`schemas/learning.py`)

**New Schema: `LessonSectionSummary`**
```python
class LessonSectionSummary(BaseModel):
    id: int
    title: str
    order_index: int
    question_count: int = 0
    completed: bool = False
```

**Updated: `LessonInTopicOut`**
- Added `description` field
- Added `order_index` field
- Added `sections` list field (List[LessonSectionSummary])

#### 2. Repository Updates (`repositories/lessonRepository.py`)

**New Method: `get_sections_with_progress()`**
- Fetches all sections for a lesson
- Includes question count per section (via JOIN with Question table)
- Includes completion status per section (via JOIN with UserProgress table)
- Returns ordered list of sections with all required data

**How it works:**
1. Joins LessonSection with Question (to count questions)
2. Joins with UserProgress (to check if section completed)
3. Groups by section ID
4. Orders by section order_index
5. Returns dict with: id, title, order_index, question_count, completed

#### 3. API Updates (`api/learning/learning.py`)

**Updated Endpoint: `GET /topics/{topic_id}/lessons`**
- Now calls `get_sections_with_progress()` for each lesson
- Includes section data in response
- Maintains backward compatibility (sections array can be empty)

## Features

### Visual Hierarchy
```
📚 Topic Card (Expandable)
  ├─ 📖 Lesson 1 (Expandable)
  │   ├─ 📄 Section 1 (5 câu hỏi) [Học]
  │   ├─ 📄 Section 2 (3 câu hỏi) [✓ Xem lại]
  │   └─ 📄 Section 3 (4 câu hỏi) [Học]
  ├─ 📖 Lesson 2 (Expandable)
  │   └─ ...
  └─ ...
```

### Lesson Type Icons & Colors
- 📝 **READING** - Blue
- 🎧 **LISTENING** - Purple
- 🎤 **SPEAKING** - Orange
- ✍️ **WRITING** - Green
- 📚 **VOCABULARY** - Pink
- ⚡ **GRAMMAR** - Yellow
- ⭐ **TEST** - Red

### Progress Tracking
- **Topic Level**: Shows % completion based on completed lessons
- **Lesson Level**: Shows % completion based on completed sections
- **Section Level**: Shows completed/not completed status
- **Overall Stats**: Dashboard cards show aggregate progress

### Status System
- **Topics**: `completed`, `current`, `locked`
- **Lessons**: `available`, `completed`
- **Sections**: `completed` (boolean)

### User Interactions
1. Click topic header → Expand/collapse lessons
2. Click lesson header → Expand/collapse sections
3. Click "Bắt đầu" on lesson → Navigate to lesson
4. Click "Học" on section → Navigate to specific section
5. Current topic auto-expands on page load

## Navigation Routes

### Lesson Only
```
/dashboard/lessons/{lessonId}
```
Starts from first available section

### Specific Section
```
/dashboard/lessons/{lessonId}/sections/{sectionId}
```
Jumps directly to a specific section

## Database Performance

### Optimizations
- Uses LEFT OUTER JOINs for optional relationships
- Aggregates question counts at query level (no N+1)
- Single query per lesson to fetch all sections
- Indexes on foreign keys improve JOIN performance

### Query Complexity
- Topics: 1 query (existing)
- Lessons per topic: 1 query (existing)
- Sections per lesson: 1 query per lesson (new)
- Total queries: `1 + 1 + N` where N = number of lessons

## Backward Compatibility
- Old API responses still work (sections array defaults to empty)
- Existing routes unchanged
- New section navigation is additive
- Components gracefully handle missing section data

## UI/UX Improvements
1. **Visual Depth**: Clear nesting shows learning structure
2. **Progress Visibility**: Multiple levels of progress tracking
3. **Quick Access**: Can jump directly to any section
4. **Smart Defaults**: Current topic auto-expands
5. **Status Indicators**: Color-coded badges and icons
6. **Responsive**: Works on mobile and desktop

## Testing Checklist
- [ ] Topics load correctly
- [ ] Lessons expand/collapse
- [ ] Sections display with question counts
- [ ] Progress percentages calculate correctly
- [ ] Navigation to lessons works
- [ ] Navigation to sections works
- [ ] Locked topics stay locked
- [ ] Current topic auto-expands
- [ ] Completed items show checkmarks
- [ ] Empty states display properly
