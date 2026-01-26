# Fitness Content Backend Implementation Guide

## 📋 Overview
You now have a complete fitness content system where **admins can post fitness content** and **users can view and interact with it**. Both users and admins can upload profile pictures.

---

## 🏗️ Architecture & Files Created

### 1. **Model** - [src/models/fitnessContent.model.ts](src/models/fitnessContent.model.ts)
Defines the fitness content database structure with:
- **Basic Info**: title, description, content (main body)
- **Media**: image URL, video URL
- **Admin Info**: adminId (reference to User), adminName
- **Metadata**: tags (cardio, strength, yoga, etc.), difficulty level, duration
- **Engagement**: likes, views counters
- **Status**: isPublished flag
- **Timestamps**: createdAt, updatedAt

### 2. **DTO (Validation)** - [src/dtos/fitnessContent.dto.ts](src/dtos/fitnessContent.dto.ts)
Zod schemas for request validation:
- **CreateFitnessContentDTO**: For admins creating new content
- **UpdateFitnessContentDTO**: For admins updating their content
- Validates all fields with proper error messages

### 3. **Repository** - [src/repositories/fitnessContent.repository.ts](src/repositories/fitnessContent.repository.ts)
Data access layer with methods for:
- `createContent()` - Create new fitness content
- `getContentById()` - Fetch single content
- `getAllPublishedContent()` - Fetch all published content with pagination
- `getContentByAdmin()` - Fetch content by specific admin
- `getContentByTag()` - Filter by tags (cardio, strength, etc.)
- `updateContent()` - Update existing content
- `deleteContent()` - Delete content
- `incrementViews()` - Track view count
- `incrementLikes()` - Track likes

### 4. **Service** - [src/services/fitnessContent.service.ts](src/services/fitnessContent.service.ts)
Business logic layer handling:
- Authorization checks (admin-only operations)
- Content creation with admin validation
- Ownership verification (admins can only edit/delete their own)
- View/like tracking
- Admin statistics (total views, likes, average engagement)
- Tag validation

### 5. **Controller** - [src/controllers/fitnessContent.controller.ts](src/controllers/fitnessContent.controller.ts)
HTTP request handlers with methods:
- **Admin Operations**:
  - `createContent()` - Create new fitness content (admin only)
  - `updateContent()` - Update content (admin, owner only)
  - `deleteContent()` - Delete content (admin, owner only)
  - `getAdminStats()` - View personal statistics (admin only)
  
- **Public/User Operations**:
  - `getAllContent()` - Browse all published content
  - `getContentById()` - View single content (increments views)
  - `getContentByTag()` - Filter by topic
  - `getContentByAdmin()` - View specific admin's content
  - `likeContent()` - Like content (authenticated users)

### 6. **Routes** - [src/routes/fitness.route.ts](src/routes/fitness.route.ts)
API endpoints organized by access level:

**Public Routes (No Auth)**:
```
GET    /api/fitness                  - Get all fitness content
GET    /api/fitness/tag/:tag         - Get content by tag
GET    /api/fitness/admin/:adminId   - Get admin's content
GET    /api/fitness/:contentId       - Get single content
```

**Protected Routes (Auth Required)**:
```
POST   /api/fitness/:contentId/like  - Like content
```

**Admin Routes (Auth + Admin Role)**:
```
POST   /api/fitness                  - Create new content
PUT    /api/fitness/:contentId       - Update own content
DELETE /api/fitness/:contentId       - Delete own content
GET    /api/fitness/stats/all        - Get personal stats
```

### 7. **Main Entry Point** - [src/index.ts](src/index.ts)
Updated to:
- Import fitness routes
- Register fitness routes at `/api/fitness`
- Added static file serving for uploads at `/uploads`

---

## 👥 Access Control

### **For Users**:
✅ View all published fitness content
✅ View content by tag
✅ View specific admin's content
✅ Like content
✅ Upload/manage profile picture
❌ Cannot create, edit, or delete fitness content

### **For Admins**:
✅ Create fitness content
✅ Edit/delete own content only (not others')
✅ View personal statistics
✅ Upload/manage profile picture
✅ View all published content (for reference)

### **Access Control Implementation**:
- `authorizedMiddelWare` verifies JWT token
- Role check: `req.user?.role !== 'admin'` blocks non-admins
- Ownership check: Admins can only modify content they created

---

## 🎯 How to Use

### **Admin: Create Fitness Content**
```bash
POST /api/fitness
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "HIIT Cardio Workout",
  "description": "High-intensity interval training for maximum calorie burn",
  "content": "Detailed workout instructions...",
  "image": "https://example.com/image.jpg",
  "video": "https://youtube.com/watch?v=...",
  "tags": ["cardio", "hiit"],
  "difficulty": "intermediate",
  "duration": 30,
  "isPublished": true
}
```

### **User: Get All Fitness Content**
```bash
GET /api/fitness?page=1&limit=10
```

### **User: Get Content by Tag**
```bash
GET /api/fitness/tag/cardio?page=1&limit=10
```

### **User: Like Content**
```bash
POST /api/fitness/[contentId]/like
Authorization: Bearer <user_token>
```

### **Admin: View Statistics**
```bash
GET /api/fitness/stats/all
Authorization: Bearer <admin_token>
```

### **Admin: Update Own Content**
```bash
PUT /api/fitness/[contentId]
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "difficulty": "advanced"
}
```

---

## 📊 Pagination

All list endpoints support pagination:
```
GET /api/fitness?page=2&limit=20
```

Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 🏷️ Available Tags

Content can be tagged with:
- `cardio` - Cardio workouts
- `strength` - Strength training
- `yoga` - Yoga sessions
- `flexibility` - Flexibility training
- `hiit` - High-intensity interval training
- `pilates` - Pilates exercises
- `meditation` - Meditation sessions
- `nutrition` - Nutrition tips
- `other` - Miscellaneous

---

## 📱 Frontend Integration Points

### **For Flutter**:
- Bottom navigation: Home, Book Appointment, Profile, Fitness Content
- Fitness Content page: Scrollable list of published content
- Each admin has profile picture visible in content feed
- Users can like content and track views

### **For Web (Next.js)**:
- Sidebar: Link to Fitness Content page
- Admin dashboard: Post fitness content
- Admin analytics: View personal statistics
- Public view: Browse and filter content by tags

---

## ✅ Complete Backend Checklist

- ✅ Profile picture for users (already existed)
- ✅ Profile picture for admins (already existed)
- ✅ Fitness content model with admin reference
- ✅ Admin-only creation of fitness content
- ✅ User/Public view of fitness content
- ✅ Ownership verification for updates/deletes
- ✅ View and like tracking
- ✅ Tag filtering
- ✅ Pagination support
- ✅ Admin statistics endpoint
- ✅ Proper error handling and validation
- ✅ Authorization middleware integration
- ✅ Static file serving for uploaded images

---

## 🚀 Next Steps (Frontend)

1. **Flutter**: 
   - Create bottom nav with fitness content page
   - Display fitness content in scrollable list
   - Show admin profile picture in each content card
   - Add like functionality

2. **Web (Next.js)**:
   - Create fitness content page with sidebar
   - Admin form to post content
   - Analytics dashboard for admins
   - Tag filtering UI

---

## 🐛 Error Handling

The API returns proper HTTP status codes:
- `201` - Content created successfully
- `200` - Success
- `400` - Invalid request (missing/invalid data)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not an admin, not owner)
- `404` - Content not found
- `500` - Server error

---

## 📝 Database Indexes (Recommended)

For better performance, add these indexes to MongoDB:
```javascript
db.fitnesscontent.createIndex({ "adminId": 1 })
db.fitnesscontent.createIndex({ "tags": 1 })
db.fitnesscontent.createIndex({ "isPublished": 1, "createdAt": -1 })
db.fitnesscontent.createIndex({ "views": -1 })
db.fitnesscontent.createIndex({ "likes": -1 })
```

