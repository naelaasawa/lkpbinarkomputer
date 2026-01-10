# LKP Binar Komputer - Learning Management System

> Modern Learning Management System (LMS) built with Next.js 16, TypeScript, Prisma, and Clerk Authentication

![LMS Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-green)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🎯 Overview

LKP Binar Komputer is a comprehensive Learning Management System designed for online education. It provides separate interfaces for administrators and students, with features including course management, quiz assignments, progress tracking, and certificate generation.

The system is built with modern web technologies and follows best practices for scalability, security, and user experience.

## 🛠 Tech Stack

### Core Technologies
- **Framework**: Next.js 16.1.1 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Database**: MySQL/MariaDB with Prisma ORM 7.2.0
- **Authentication**: Clerk 6.36.5
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Tailwind
- **Icons**: Lucide React 0.562.0
- **Form Handling**: React Hook Form
- **Validation**: Zod

### Key Dependencies
- `@prisma/adapter-mariadb` - MariaDB adapter for Prisma
- `@prisma/client` - Type-safe database client
- `csv-parse` - CSV file parsing
- `dotenv` - Environment variable management
- `react` 19.2.3 & `react-dom` 19.2.3
- `date-fns` - Date manipulation

## ✨ Features

### Admin Features
- **Dashboard Analytics**: Real-time insights on users, courses, and enrollments
- **Course Management**: Create, edit, publish, and manage courses with modules and lessons
- **Quiz Management**: Create quizzes with multiple question types (multiple choice, true/false, etc.)
- **Quiz Assignment**: Share quizzes via email and assign to registered users
- **User Management**: View and manage registered users, roles, and permissions
- **Category Management**: Organize courses by categories with custom icons and colors
- **Content Management**: Rich text editor for course content
- **Progress Tracking**: Monitor student progress and completion rates
- **Backup System**: Export data for backup purposes
- **Bulk Operations**: Import/export functionality for course data

### Student Features
- **Course Catalog**: Browse and filter available courses by category, level, and price
- **Course Enrollment**: Enroll in published courses
- **Learning Dashboard**: Track progress, assigned quizzes, and achievements
- **Interactive Learning**: Mark lessons as complete, track progress
- **Quiz Taking**: Complete assigned quizzes with time limits and automatic scoring
- **Progress Tracking**: Visual progress indicators for courses and modules
- **Profile Management**: Update personal information and settings
- **Certificate Generation**: Earn and download certificates upon course completion
- **Achievements**: Earn badges and recognition for milestones
- **Learning History**: View completed courses and quiz results

### Platform Features
- **Role-Based Access Control**: Admin, Instructor, and Student roles
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Progress tracking and status updates
- **Search & Filter**: Advanced search capabilities
- **Multi-language Support**: Ready for internationalization
- **Accessibility**: WCAG compliant components
- **Performance Optimization**: Code splitting, image optimization, caching

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- MySQL/MariaDB 10.5+ database
- Clerk account for authentication
- npm or yarn package manager

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/naelaasawa/lkpbinarkomputer
   cd lkpbinarkomputer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_USER=your_db_user
   DATABASE_PASSWORD=your_db_password
   DATABASE_NAME=lkpbinarkomputer
   DATABASE_URL="mysql://user:password@localhost:3306/lkpbinarkomputer?connection_limit=5"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Application
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Optional: File Upload (for production)
   # UPLOADTHING_SECRET=your_uploadthing_secret
   # UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```

4. **Set up Clerk Dashboard**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Create a new application
   - Configure social providers if needed (Google, GitHub, etc.)
   - Copy the API keys to your `.env` file
   - Configure webhook for user sync (optional but recommended)

5. **Initialize Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed initial data (if available)
   # npx prisma db seed
   ```

6. **Verify Prisma Connection**
   ```bash
   # Test database connection
   npx prisma validate
   ```

7. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up as first user (becomes admin by default)
   - Access admin panel at `/admin`

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start

# Or using PM2
pm2 start npm --name "lms" -- start
```

## 🗄 Database Schema

### Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o{ Enrollment : has
    User ||--o{ QuizAssignment : has
    User ||--o{ Review : writes
    User ||--o{ Note : creates
    User ||--o{ UserProgress : tracks

    Category ||--o{ Course : contains

    Course ||--o{ Enrollment : has
    Course ||--o{ Module : contains
    Course ||--o{ Review : receives

    Module ||--o{ Lesson : contains

    Lesson ||--o{ Note : has
    Lesson ||--o{ UserProgress : tracks
    Lesson }o--|| Quiz : "optionally links"

    Quiz ||--o{ Question : contains
    Quiz ||--o{ QuizAssignment : assigned
    Quiz ||--o{ Lesson : "linked from"

    User {
        string id PK
        string clerkId UK
        string email UK
        string role
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name UK
        string icon
        string color
    }

    Course {
        string id PK
        string title
        text description
        decimal price
        string level
        string imageUrl
        boolean published
        string categoryId FK
        string visibility
    }

    Module {
        string id PK
        string title
        text description
        int order
        string courseId FK
    }

    Lesson {
        string id PK
        string title
        string contentType
        text content
        int duration
        int order
        string moduleId FK
        string quizId FK
    }

    Quiz {
        string id PK
        string title
        text description
        string type
        int timeLimit
        int passingScore
        boolean randomize
        string status
    }

    Question {
        string id PK
        string quizId FK
        string type
        text question
        text options
        text correctAnswer
        int score
        int order
    }

    Enrollment {
        string id PK
        string userId FK
        string courseId FK
        int progress
        datetime createdAt
    }

    QuizAssignment {
        string id PK
        string userId FK
        string quizId FK
        string status
        int score
        datetime completedAt
    }

    Review {
        string id PK
        int rating
        text comment
        string userId FK
        string courseId FK
    }

    Note {
        string id PK
        text content
        string userId FK
        string lessonId FK
    }

    UserProgress {
        string id PK
        string userId FK
        string lessonId FK
        boolean isCompleted
        datetime createdAt
    }
```

---

## 🔄 Application Workflow

### System Architecture Overview

```mermaid
flowchart TB
    subgraph Client["🖥️ Client (Browser)"]
        UI[React Components]
        State[Client State]
    end

    subgraph NextJS["⚡ Next.js 16 App Router"]
        Pages["Pages & Layouts"]
        API["API Routes (/api/*)"]
        Middleware["Middleware (Auth)"]
    end

    subgraph Auth["🔐 Authentication"]
        Clerk["Clerk Auth Service"]
    end

    subgraph Database["🗄️ Database Layer"]
        Prisma["Prisma ORM"]
        MySQL["MySQL/MariaDB"]
    end

    subgraph Storage["📁 File Storage"]
        Uploads["public/uploads/"]
    end

    UI --> Pages
    UI --> API
    Pages --> Middleware
    API --> Middleware
    Middleware --> Clerk
    Clerk --> API
    API --> Prisma
    Prisma --> MySQL
    API --> Uploads
```

### User Learning Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant C as 🖥️ Client
    participant A as 🔐 Clerk Auth
    participant S as ⚡ Next.js API
    participant DB as 🗄️ Database

    U->>C: Visit /sign-in
    C->>A: Authenticate
    A-->>C: Session Token
    C->>S: GET /api/courses
    S->>DB: Query published courses
    DB-->>S: Course list
    S-->>C: JSON Response
    C-->>U: Display Course Catalog

    U->>C: Click "Enroll" on Course
    C->>S: POST /api/courses/[id]/enroll
    S->>DB: Create Enrollment
    DB-->>S: Success
    S-->>C: Enrollment confirmed
    C-->>U: Redirect to Course Player

    U->>C: Navigate lessons
    C->>S: GET /api/courses/[id]/progress
    S->>DB: Query UserProgress
    DB-->>S: Completed lesson IDs
    S-->>C: Progress data
    C-->>U: Show progress indicators

    U->>C: Scroll to bottom of lesson
    C->>S: POST /api/courses/[id]/lessons/[lessonId]/progress
    S->>DB: Upsert UserProgress + Update Enrollment
    DB-->>S: Transaction success
    S-->>C: New progress percentage
    C-->>U: Update progress bar
```

### Admin Course Management Flow

```mermaid
flowchart LR
    subgraph Admin["👨‍💼 Admin Panel"]
        Dashboard["📊 Dashboard"]
        CourseBuilder["📝 Course Builder"]
        QuizManager["❓ Quiz Manager"]
        UserManager["👥 User Manager"]
    end

    subgraph Actions["Actions"]
        Create["Create Course"]
        Edit["Edit Modules/Lessons"]
        Upload["Upload Media"]
        Publish["Publish Course"]
        Assign["Assign Quizzes"]
    end

    subgraph API["API Endpoints"]
        CourseAPI["POST /api/courses"]
        ModuleAPI["PATCH /api/courses/[id]"]
        UploadAPI["POST /api/upload"]
        QuizAPI["POST /api/quizzes"]
        AssignAPI["POST /api/quiz-assignments"]
    end

    Dashboard --> CourseBuilder
    CourseBuilder --> Create --> CourseAPI
    CourseBuilder --> Edit --> ModuleAPI
    CourseBuilder --> Upload --> UploadAPI
    CourseBuilder --> Publish --> ModuleAPI
    Dashboard --> QuizManager --> QuizAPI
    QuizManager --> Assign --> AssignAPI
    Dashboard --> UserManager
```

---

## 🆕 Recent Updates (January 2026)

### New Features
- **Real-Time Progress Tracking**: Lesson completion is now tracked in the database via the `UserProgress` model. When a student scrolls to the bottom of a lesson, it's automatically marked as complete.
- **"My Learning" Progress Persistence**: Progress bars on the "My Learning" page now accurately reflect data from the `UserProgress` table, synced with the course player.
- **Scroll-to-Top on Lesson Change**: The Course Player now automatically scrolls to the top when switching lessons or modules.
- **Focus Mode**: A "Focus Mode" toggle hides the header and sidebar for distraction-free learning.
- **Previous/Next Navigation**: Navigation buttons in the course player allow easy traversal between lessons and modules.
- **Docx Quiz Import**: Admins can now create quizzes by uploading `.docx` files. Questions and options are parsed automatically.
- **Image Uploads in Rich Text Editor**: The Tiptap editor now supports image uploads, stored in `public/uploads/materials/courses/[courseId]`.

### Updated APIs

#### `POST /api/courses/[id]/lessons/[lessonId]/progress` (New)
Marks a lesson as complete for the current user, recalculates overall course progress, and updates the `Enrollment` record.

**Request:** None (authenticated via Clerk session).

**Response:**
```json
{
  "success": true,
  "progress": 33,
  "completedLesssonId": "lesson-uuid"
}
```

#### `GET /api/courses/[id]/progress` (New)
Fetches the list of lesson IDs the current user has completed for a specific course.

**Response:**
```json
["lesson-uuid-1", "lesson-uuid-2"]
```

#### `POST /api/utils/parse-docx` (New)
Accepts a `.docx` file upload and returns the extracted raw text content.

**Request:** `multipart/form-data` with `file` field.

**Response:**
```json
{
  "text": "Extracted text content from the .docx file..."
}
```

---

### Detailed Models

#### User
```prisma
model User {
  id              String            @id @default(uuid())
  clerkId         String            @unique
  email           String            @unique
  firstName       String?
  lastName        String?
  profileImage    String?
  role            String            @default("USER") // USER, ADMIN, INSTRUCTOR
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Relations
  enrollments     Enrollment[]
  quizAssignments QuizAssignment[]
  
  @@index([email])
  @@index([clerkId])
}
```

#### Category
```prisma
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?   @db.Text
  icon        String    @default("Book")
  color       String    @default("blue")
  slug        String    @unique
  courses     Course[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([slug])
}
```

#### Course
```prisma
model Course {
  id                 String       @id @default(uuid())
  title              String
  slug              String       @unique
  description        String       @db.Text
  shortDescription  String?
  price             Decimal      @default(0.00) @db.Decimal(10,2)
  level             String       // beginner, intermediate, advanced
  imageUrl          String?
  thumbnailUrl      String?
  published         Boolean      @default(false)
  featured          Boolean      @default(false)
  duration          Int?         // in hours
  certificateEnabled Boolean      @default(false)
  certificateTemplate String?     @db.Text
  enrollmentType    String       @default("open") // open, approval, closed
  visibility        String       @default("draft") // draft, published, archived
  categoryId        String
  instructorId      String?
  
  // Relations
  category          Category     @relation(fields: [categoryId], references: [id])
  enrollments       Enrollment[]
  modules           Module[]
  reviews           Review[]
  
  // Metadata
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  publishedAt       DateTime?
  
  @@index([slug])
  @@index([categoryId])
  @@index([published])
  @@index([featured])
}
```

#### Module
```prisma
model Module {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  order       Int      @default(0)
  courseId    String
  duration    Int?     // in minutes
  
  // Relations
  lessons     Lesson[]
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@index([courseId])
  @@unique([courseId, order])
}
```

#### Lesson
```prisma
model Lesson {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  contentType String   // video, article, quiz, assignment
  content     String?  @db.Text
  videoUrl    String?
  duration    Int?     // in minutes
  order       Int      @default(0)
  moduleId    String
  quizId      String?
  isFree      Boolean  @default(false)
  
  // Relations
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  quiz        Quiz?    @relation(fields: [quizId], references: [id], onDelete: SetNull)
  
  @@index([moduleId])
  @@unique([moduleId, order])
  @@index([slug])
}
```

#### Quiz
```prisma
model Quiz {
  id           String           @id @default(uuid())
  title        String
  description  String?          @db.Text
  type         String           @default("practice") // practice, exam, survey
  timeLimit    Int?             // in minutes
  attemptLimit Int?             @default(1)
  passingScore Int              @default(70)
  randomize    Boolean          @default(false)
  showAnswers  Boolean          @default(false)
  status       String           @default("draft") // draft, published, archived
  
  // Relations
  questions    Question[]
  assignments  QuizAssignment[]
  lesson       Lesson?
  
  // Metadata
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}
```

#### Question
```prisma
model Question {
  id            String   @id @default(uuid())
  quizId        String
  type          String   // multiple_choice, true_false, short_answer
  question      String   @db.Text
  options       String?  @db.LongText // JSON stringified array
  correctAnswer String   @db.Text
  explanation   String?  @db.Text
  score         Int      @default(1)
  order         Int      @default(0)
  
  // Relations
  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  @@index([quizId])
}
```

#### Enrollment
```prisma
model Enrollment {
  id         String   @id @default(uuid())
  userId     String
  courseId   String
  progress   Int      @default(0) // percentage
  completed  Boolean  @default(false)
  completedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // Relations
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Progress tracking
  lastAccessedAt DateTime?
  lastLessonId   String?
  
  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([completed])
}
```

#### QuizAssignment
```prisma
model QuizAssignment {
  id          String    @id @default(uuid())
  userId      String
  quizId      String
  status      String    @default("assigned") // assigned, in_progress, completed, expired
  score       Int?
  maxScore    Int?
  percentage  Float?
  passed      Boolean?
  startedAt   DateTime?
  completedAt DateTime?
  timeSpent   Int?      // in seconds
  
  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz        Quiz      @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  // Answers storage
  answers     String?   @db.LongText // JSON stringified
  
  @@unique([userId, quizId])
  @@index([userId])
  @@index([quizId])
  @@index([status])
  @@index([completedAt])
}
```

#### Additional Models (Optional)
```prisma
model Review {
  id        String   @id @default(uuid())
  userId    String
  courseId  String
  rating    Int      @default(5) // 1-5
  comment   String?  @db.Text
  user      User     @relation(...)
  course    Course   @relation(...)
  createdAt DateTime @default(now())
  
  @@unique([userId, courseId])
}

model Certificate {
  id         String   @id @default(uuid())
  userId     String
  courseId   String
  certificateNumber String @unique
  issuedAt   DateTime @default(now())
  expiryDate DateTime?
  downloadUrl String?
  user       User     @relation(...)
  course     Course   @relation(...)
  
  @@index([userId])
  @@index([courseId])
}
```

## 📡 API Documentation

### Authentication
All API routes (except public endpoints) require Clerk authentication. Include the session token in the Authorization header.

### Base URL
```
http://localhost:3000/api
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Error message",
  "message": "Operation failed"
}
```

### Rate Limiting
- Default: 100 requests per minute per user
- Admin endpoints: 200 requests per minute

---

### 📚 Courses API

#### GET `/api/courses`
List all published courses with pagination.

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 10
- `category` (optional): Filter by category slug
- `level` (optional): Filter by level
- `search` (optional): Search in title/description
- `sort` (optional): Sort field (title, createdAt, price)
- `order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "Course Title",
        "slug": "course-slug",
        "description": "Course description",
        "price": 99.99,
        "level": "beginner",
        "imageUrl": "https://...",
        "category": { "id": "uuid", "name": "Category Name" },
        "enrollmentCount": 150,
        "averageRating": 4.5
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
}
```

#### GET `/api/courses/[slug]`
Get course details by slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "uuid",
      "title": "Course Title",
      "slug": "course-slug",
      "description": "Full description",
      "price": 99.99,
      "level": "beginner",
      "duration": 20,
      "modules": [
        {
          "id": "uuid",
          "title": "Module 1",
          "lessons": [
            {
              "id": "uuid",
              "title": "Lesson 1",
              "contentType": "video",
              "duration": 30,
              "isFree": true
            }
          ]
        }
      ],
      "instructor": {
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "https://..."
      },
      "userEnrollment": null | {
        "progress": 30,
        "completed": false,
        "lastAccessedAt": "2024-01-01T10:00:00Z"
      }
    }
  }
}
```

#### POST `/api/courses`
Create a new course (Admin only).

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "categoryId": "uuid",
  "price": 99.99,
  "level": "beginner",
  "duration": 20,
  "certificateEnabled": true,
  "enrollmentType": "open"
}
```

#### PUT `/api/courses/[id]`
Update course (Admin only).

#### DELETE `/api/courses/[id]`
Delete course (Admin only).

#### POST `/api/courses/[id]/enroll`
Enroll current user in course.

---

### 📂 Categories API

#### GET `/api/categories`
List all categories with course counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Web Development",
      "slug": "web-development",
      "icon": "Code",
      "color": "blue",
      "courseCount": 15,
      "description": "Learn web development"
    }
  ]
}
```

#### POST `/api/categories`
Create category (Admin only).

---

### 👥 Users API

#### GET `/api/users`
Get users list (for sharing/assignment).

**Query Parameters:**
- `role` (optional): Filter by role
- `search` (optional): Search by email/name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  ]
}
```

#### GET `/api/users/me`
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImage": "https://...",
    "role": "USER",
    "createdAt": "2024-01-01T10:00:00Z",
    "stats": {
      "enrolledCourses": 5,
      "completedCourses": 2,
      "ongoingCourses": 3,
      "certificates": 2,
      "totalXp": 450
    }
  }
}
```

---

### 📊 Admin API

#### GET `/api/admin/dashboard`
Get admin dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalCourses": 50,
    "totalEnrollments": 5000,
    "activeUsers": 250,
    "recentEnrollments": [
      {
        "id": "uuid",
        "user": { "email": "user@example.com" },
        "course": { "title": "Course Title" },
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "popularCourses": [
      {
        "id": "uuid",
        "title": "Popular Course",
        "enrollmentCount": 300,
        "completionRate": 65
      }
    ]
  }
}
```

#### GET `/api/admin/users`
List all users with pagination (Admin only).

#### GET `/api/admin/courses`
List all courses including drafts (Admin only).

---

### 🧠 Learning API

#### GET `/api/learning/enrollments`
Get current user's enrollments.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "progress": 65,
      "completed": false,
      "lastAccessedAt": "2024-01-01T10:00:00Z",
      "course": {
        "id": "uuid",
        "title": "Course Title",
        "slug": "course-slug",
        "imageUrl": "https://...",
        "level": "beginner",
        "modulesCount": 10,
        "lessonsCount": 50
      }
    }
  ]
}
```

#### POST `/api/learning/progress`
Update lesson progress.

**Request Body:**
```json
{
  "lessonId": "uuid",
  "completed": true,
  "timeSpent": 300 // seconds
}
```

#### GET `/api/learning/quiz-assignments`
Get user's quiz assignments.

---

### 📝 Quizzes API

#### GET `/api/quizzes/[id]`
Get quiz with questions.

**Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "uuid",
      "title": "Quiz Title",
      "description": "Quiz description",
      "timeLimit": 30,
      "passingScore": 70,
      "questions": [
        {
          "id": "uuid",
          "type": "multiple_choice",
          "question": "What is React?",
          "options": ["Framework", "Library", "Language", "Tool"],
          "score": 1,
          "order": 1
        }
      ],
      "userAssignment": {
        "status": "assigned",
        "score": null,
        "attempts": 0
      }
    }
  }
}
```

#### POST `/api/quizzes/[id]/submit`
Submit quiz answers.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answer": "Library",
      "timeSpent": 30
    }
  ],
  "timeSpent": 600 // total seconds
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 8,
    "total": 10,
    "percentage": 80,
    "passed": true,
    "answers": [
      {
        "questionId": "uuid",
        "correct": true,
        "correctAnswer": "Library",
        "explanation": "React is a JavaScript library"
      }
    ]
  }
}
```

---

### � Notes API

#### GET `/api/notes`
Get note for a specific lesson.

**Query Parameters:**
- `lessonId` (required): Lesson ID

**Response:**
```json
{
  "id": "uuid",
  "content": "My notes for this lesson...",
  "lessonId": "uuid",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

#### POST `/api/notes`
Create or update a note.

**Request Body:**
```json
{
  "lessonId": "uuid",
  "content": "My updated notes..."
}
```

---

### ⭐ Reviews API

#### GET `/api/reviews`
Get reviews for a course.

**Query Parameters:**
- `courseId` (required): Course ID

**Response:**
```json
[
  {
    "id": "uuid",
    "rating": 5,
    "comment": "Great course!",
    "user": { "email": "user@example.com" },
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

#### POST `/api/reviews`
Submit a review.

**Request Body:**
```json
{
  "courseId": "uuid",
  "rating": 5,
  "comment": "Excellent course!"
}
```

---

### �📤 Upload API

#### POST `/api/upload`
Upload a file (images, documents, etc.).

**Request:** `multipart/form-data`
- `file` (required): The file to upload
- `courseId` (optional): If provided, files are stored in `public/uploads/materials/courses/[courseId]`

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/materials/courses/[courseId]/filename.ext"
}
```

#### POST `/api/upload-pdf`
Upload and parse a PDF file.

**Request:** `multipart/form-data`
- `file` (required): PDF file

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/filename.pdf",
  "metadata": { "pageCount": 10 }
}
```

---

### 📊 Stats API

#### GET `/api/stats`
Get platform-wide statistics.

**Response:**
```json
{
  "totalCourses": 50,
  "totalUsers": 1000,
  "totalEnrollments": 5000
}
```

#### GET `/api/my-stats`
Get current user's learning statistics.

**Response:**
```json
{
  "enrolledCourses": 5,
  "completedCourses": 2,
  "totalLessonsCompleted": 45,
  "averageProgress": 65
}
```

---

### 📚 My Enrollments API

#### GET `/api/my-enrollments`
Get current user's course enrollments with progress.

**Response:**
```json
[
  {
    "id": "uuid",
    "courseId": "uuid",
    "progress": 65,
    "createdAt": "2024-01-01T10:00:00Z",
    "course": {
      "id": "uuid",
      "title": "Course Title",
      "imageUrl": "/uploads/...",
      "level": "beginner"
    }
  }
]
```

---

### 📋 Quiz Assignments API

#### GET `/api/quiz-assignments`
Get quizzes assigned to the current user.

**Response:**
```json
[
  {
    "id": "uuid",
    "quizId": "uuid",
    "status": "assigned",
    "score": null,
    "quiz": {
      "id": "uuid",
      "title": "Quiz Title",
      "description": "Quiz description",
      "timeLimit": 30
    }
  }
]
```

#### POST `/api/quiz-assignments`
Assign a quiz to users (Admin only).

**Request Body:**
```json
{
  "quizId": "uuid",
  "userIds": ["user-uuid-1", "user-uuid-2"]
}
```

---

### 📦 Modules API

#### GET `/api/modules/[id]`
Get module details with lessons.

**Response:**
```json
{
  "id": "uuid",
  "title": "Module Title",
  "description": "Module description",
  "order": 1,
  "lessons": [
    {
      "id": "uuid",
      "title": "Lesson 1",
      "contentType": "video",
      "duration": 15
    }
  ]
}
```

#### PATCH `/api/modules/[id]`
Update module (Admin only).

#### DELETE `/api/modules/[id]`
Delete module (Admin only).

---

### 📠 Backup API

#### GET `/api/admin/backup`
Export database data (Admin only).

**Query Parameters:**
- `format` (optional): json, csv (default: json)
- `type` (optional): all, courses, users, enrollments

**Response:** JSON or CSV file download.

---

## 📁 Project Structure

```
lkpbinarkomputer/
├── app/                              # Next.js 16 App Router
│   ├── (admin)/                      # Admin routes (grouped)
│   │   └── admin/                    # Admin panel
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── courses/              # Course management
│   │       │   ├── page.tsx          # Courses list
│   │       │   ├── create/           # Create new course
│   │       │   └── [id]/edit/        # Edit course
│   │       ├── quizzes/              # Quiz management
│   │       │   └── page.tsx          # Quizzes list + builder
│   │       ├── users/                # User management
│   │       └── layout.tsx            # Admin layout
│   ├── (auth)/                       # Authentication routes
│   │   ├── sign-in/                  # Sign in page
│   │   └── sign-up/                  # Sign up page
│   ├── (client)/                     # Client/Student routes
│   │   ├── dashboard/                # User dashboard
│   │   │   └── page.tsx
│   │   ├── courses/                  # Course browsing
│   │   │   ├── page.tsx              # Courses catalog
│   │   │   └── [id]/                 # Course details
│   │   │       ├── page.tsx          # Course overview
│   │   │       └── learn/            # Course player
│   │   │           └── page.tsx
│   │   ├── my-learning/              # Learning dashboard
│   │   │   └── page.tsx              # Enrolled courses + progress
│   │   ├── profile/                  # User profile
│   │   ├── progress/                 # Progress tracking
│   │   └── layout.tsx                # Client layout
│   ├── api/                          # API routes
│   │   ├── courses/                  # Course APIs
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   └── [id]/                 # Course-specific APIs
│   │   │       ├── route.ts          # GET, PATCH, DELETE
│   │   │       ├── enroll/           # POST - Enroll user
│   │   │       ├── progress/         # GET - User's completed lessons
│   │   │       ├── lessons/[lessonId]/progress/  # POST - Mark lesson complete
│   │   │       └── modules/          # Module management
│   │   ├── categories/               # Category APIs
│   │   ├── quizzes/                  # Quiz APIs
│   │   │   ├── route.ts              # GET, POST
│   │   │   └── [id]/                 # Quiz-specific APIs
│   │   │       ├── route.ts          # GET, PATCH, DELETE
│   │   │       └── questions/        # Question management
│   │   ├── users/                    # User list API
│   │   ├── admin/                    # Admin-only APIs
│   │   │   ├── users/                # User management
│   │   │   └── quizzes/              # Quiz admin APIs
│   │   ├── notes/                    # Lesson notes API
│   │   ├── reviews/                  # Course reviews API
│   │   ├── upload/                   # File upload API
│   │   ├── upload-pdf/               # PDF upload + parsing
│   │   ├── my-enrollments/           # User's enrollments
│   │   ├── my-stats/                 # User's learning stats
│   │   ├── quiz-assignments/         # Quiz assignment API
│   │   ├── modules/                  # Module APIs
│   │   ├── stats/                    # Platform statistics
│   │   ├── backup/                   # Data backup API
│   │   └── utils/                    # Utility APIs
│   │       └── parse-docx/           # DOCX parsing for quizzes
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles (Tailwind)
│   └── not-found.tsx                 # 404 page
├── components/                       # Reusable React components
│   ├── admin/                        # Admin-specific components
│   │   ├── CourseBuilder.tsx         # Multi-step course builder
│   │   ├── course-steps/             # Course builder steps
│   │   │   ├── BasicInfoStep.tsx
│   │   │   ├── ModulesStep.tsx
│   │   │   ├── ContentStep.tsx
│   │   │   ├── AssessmentStep.tsx
│   │   │   └── SettingsStep.tsx
│   │   ├── editors/
│   │   │   └── TiptapEditor.tsx      # Rich text editor (Tiptap)
│   │   ├── ShareQuizModal.tsx        # Quiz sharing modal
│   │   └── QuizBuilder.tsx           # Quiz creation interface
│   ├── player/                       # Course player components
│   │   └── CoursePlayer.tsx          # Main learning interface
│   ├── ui/                           # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   └── ...
│   ├── AdminLayout.tsx               # Admin layout wrapper
│   ├── AdminSidebar.tsx              # Admin navigation
│   ├── AppLayout.tsx                 # Client app layout
│   ├── Sidebar.tsx                   # Client sidebar
│   ├── MobileNav.tsx                 # Mobile navigation
│   └── BottomNavigation.tsx          # Mobile bottom nav
├── lib/                              # Utilities and helpers
│   ├── prisma.ts                     # Prisma client instance
│   ├── generated/prisma/             # Generated Prisma client
│   └── utils.ts                      # General utilities
├── prisma/                           # Database configuration
│   └── schema.prisma                 # Prisma schema (models)
├── public/                           # Static assets
│   ├── uploads/                      # User-uploaded files
│   │   └── materials/courses/        # Course-specific uploads
│   ├── images/                       # Static images
│   └── icons/                        # App icons
├── middleware.ts                     # Next.js middleware (Clerk auth)
├── prisma.config.ts                  # Prisma configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # This file
```

## 🔐 Environment Variables

### Required Variables

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=lkpbinarkomputer
DATABASE_URL="mysql://user:password@localhost:3306/lkpbinarkomputer?connection_limit=5"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables

```env
# Clerk Webhook (for user sync)
CLERK_WEBHOOK_SECRET=whsec_...

# File Upload Configuration
NEXT_PUBLIC_UPLOADTHING_URL=https://uploadthing.com
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=app_...

# Email Service (for quiz sharing)
RESEND_API_KEY=re_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# Analytics
NEXT_PUBLIC_UMAMI_WEBSITE_ID=uuid
NEXT_PUBLIC_UMAMI_URL=https://analytics.example.com

# Feature Flags
NEXT_PUBLIC_ENABLE_CERTIFICATES=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_DISCUSSIONS=true
```

## 🚀 Development

### Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run dev --turbo   # Start with Turbopack (faster)

# Build & Production
npm run build         # Build for production
npm run start         # Start production server
npm run preview       # Preview production build

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type check
npm run format        # Format code with Prettier
npm run format:check  # Check formatting

# Database
npx prisma generate   # Generate Prisma Client
npx prisma db push    # Push schema changes
npx prisma migrate dev # Create and apply migrations
npx prisma studio     # Open database GUI
npx prisma db seed    # Seed database

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate test coverage
```

### Development Workflow

1. **Start Development Environment**
   ```bash
   # Start database (if using Docker)
   docker-compose up -d

   # Install dependencies
   npm install

   # Set up environment
   cp .env.example .env.local
   # Edit .env.local with your values

   # Initialize database
   npx prisma generate
   npx prisma db push

   # Start development server
   npm run dev
   ```

2. **Database Migrations**
   ```bash
   # Create migration after schema changes
   npx prisma migrate dev --name add_feature_name

   # Apply migrations in production
   npx prisma migrate deploy

   # Reset database (development only)
   npx prisma migrate reset
   ```

3. **Component Development**
   ```bash
   # Create new component
   npx @mui/codegen component Button --path components/ui
   ```

### Coding Standards

1. **TypeScript**
   - Use strict typing
   - Avoid `any` type
   - Define interfaces for props
   - Use TypeScript generics where appropriate

2. **Component Structure**
   ```typescript
   // Example component structure
   import { FC } from 'react';
   import { cn } from '@/lib/utils';
   
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary' | 'outline';
     size?: 'sm' | 'md' | 'lg';
     isLoading?: boolean;
   }
   
   export const Button: FC<ButtonProps> = ({
     className,
     variant = 'primary',
     size = 'md',
     isLoading = false,
     children,
     ...props
   }) => {
     return (
       <button
         className={cn(
           'button',
           `button--${variant}`,
           `button--${size}`,
           isLoading && 'button--loading',
           className
         )}
         disabled={isLoading}
         {...props}
       >
         {isLoading ? <LoadingSpinner size="sm" /> : children}
       </button>
     );
   };
   ```

3. **API Route Structure**
   ```typescript
   // Example API route
   import { NextRequest, NextResponse } from 'next/server';
   import { getAuth } from '@clerk/nextjs/server';
   import prisma from '@/lib/prisma';
   import { ApiResponse } from '@/lib/api/response';
   import { courseSchema } from '@/lib/validators/course';
   
   export async function GET(request: NextRequest) {
     try {
       const { userId } = getAuth(request);
       
       if (!userId) {
         return ApiResponse.unauthorized();
       }
       
       const courses = await prisma.course.findMany({
         where: { published: true },
         include: { category: true },
         orderBy: { createdAt: 'desc' },
         take: 10,
       });
       
       return ApiResponse.success(courses);
     } catch (error) {
       return ApiResponse.error('Failed to fetch courses', error);
     }
   }
   
   export async function POST(request: NextRequest) {
     try {
       const { userId } = getAuth(request);
       
       if (!userId) {
         return ApiResponse.unauthorized();
       }
       
       // Check admin role
       const user = await prisma.user.findUnique({ where: { clerkId: userId } });
       if (user?.role !== 'ADMIN') {
         return ApiResponse.forbidden();
       }
       
       const body = await request.json();
       const validated = courseSchema.parse(body);
       
       const course = await prisma.course.create({
         data: {
           ...validated,
           slug: validated.title.toLowerCase().replace(/\s+/g, '-'),
         },
       });
       
       return ApiResponse.created(course);
     } catch (error) {
       return ApiResponse.error('Failed to create course', error);
     }
   }
   ```

## 🚢 Deployment

### Prerequisites for Production

1. **Production Database**
   - Use managed database service (AWS RDS, PlanetScale, etc.)
   - Enable connection pooling
   - Set up regular backups

2. **Authentication**
   - Update Clerk to production keys
   - Configure custom domain
   - Set up email templates

3. **File Storage**
   - Configure S3, Cloudinary, or UploadThing
   - Set up CDN for assets

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure analytics
   - Enable logging

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables will be set in Vercel dashboard
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### Manual Deployment
```bash
# Build
npm run build

# Start
npm start

# Using PM2
pm2 start npm --name "lms" -- start
```

### Production Checklist

- [ ] Update all environment variables for production
- [ ] Configure SSL certificate
- [ ] Set up domain and DNS
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Configure CDN for static assets
- [ ] Implement rate limiting
- [ ] Set up security headers
- [ ] Configure logging and error tracking
- [ ] Test backup restoration process

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connection
   npx prisma db execute --stdin --url="mysql://user:pass@host:port/db"
   
   # Reset connection
   npx prisma generate --force
   ```

2. **Clerk Authentication Issues**
   - Verify API keys in Clerk Dashboard
   - Check webhook configuration
   - Ensure CORS settings are correct

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   rm -rf node_modules/.cache
   
   # Reinstall dependencies
   npm ci
   ```

4. **Performance Issues**
   - Check database indexes
   - Enable query logging in development
   - Use Prisma extension for query optimization

### Debug Mode

Enable debug logging:
```bash
# Prisma debug
DEBUG=prisma:* npm run dev

# Next.js debug
NEXT_DEBUG=1 npm run dev
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tutorials
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma with MySQL](https://www.prisma.io/docs/orm/overview/databases/mysql)
- [Clerk Integration](https://clerk.com/docs/quickstarts/nextjs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Next.js DevTools](https://nextjs.org/docs/app/building-your-application/configuring/devtools)
- [Tailwind CSS IntelliSense](https://tailwindcss.com/docs/editor-setup)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/naelaasawa/lkpbinarkomputer
   cd lkpbinarkomputer
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure TypeScript compiles without errors

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe the changes
   - Reference any related issues
   - Add screenshots if applicable

### Development Guidelines

- Write meaningful commit messages
- Keep pull requests focused on single features
- Update documentation for API changes
- Add tests for new functionality
- Ensure backward compatibility

## 📄 License

This project is proprietary software. All rights reserved.

**Copyright © 2024 LKP Binar Komputer**

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

## 👥 Support

For support, please contact:

- **Development Team**: dev@lkpbinarkomputer.com
- **Technical Issues**: Create an issue in the repository
- **Documentation**: docs@lkpbinarkomputer.com

### Community
- [GitHub Issues](https://github.com/your-org/lkpbinarkomputer/issues) - Bug reports and feature requests
- [Discussions](https://github.com/your-org/lkpbinarkomputer/discussions) - Questions and discussions

