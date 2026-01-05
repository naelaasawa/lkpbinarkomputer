# LKP Binar Komputer - Learning Management System

> Modern Learning Management System (LMS) built with Next.js 16, TypeScript, Prisma, and Clerk Authentication

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## 🎯 Overview

LKP Binar Komputer is a comprehensive Learning Management System designed for online education. It provides separate interfaces for administrators and students, with features including course management, quiz assignments, progress tracking, and certificate generation.

## 🛠 Tech Stack

### Core Technologies
- **Framework**: Next.js 16.1.1 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Database**: MySQL/MariaDB with Prisma ORM 7.2.0
- **Authentication**: Clerk 6.36.5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React 0.562.0

### Key Dependencies
- `@prisma/adapter-mariadb` - MariaDB adapter for Prisma
- `csv-parse` - CSV file parsing
- `dotenv` - Environment variable management
- `react` 19.2.3 & `react-dom` 19.2.3

## ✨ Features

### Admin Features
- **Course Management**: Create, edit, and manage courses with modules and lessons
- **Quiz Management**: Create quizzes with multiple question types
- **Quiz Assignment**: Share quizzes via email and assign to registered users
- **User Management**: View and manage registered users
- **Analytics**: View enrollment statistics and user progress
- **Backup**: Export data for backup purposes

### Student Features
- **Course Enrollment**: Browse and enroll in available courses
- **Learning Dashboard**: Track progress, assigned quizzes, and achievements
- **Quiz Taking**: Complete assigned quizzes with time limits
- **Progress Tracking**: Monitor course completion and earned certificates
- **Profile Management**: Update personal information and settings
- **Certificate Generation**: Earn certificates upon course completion

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- MySQL/MariaDB database
- Clerk account for authentication

### Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd lkpbinarkomputer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Create a \`.env\` file in the root directory:
   \`\`\`env
   # Database
   DATABASE_HOST=localhost
   DATABASE_USER=your_db_user
   DATABASE_PASSWORD=your_db_password
   DATABASE_NAME=lkpbinarkomputer
   DATABASE_URL="mysql://user:password@localhost:3306/lkpbinarkomputer"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # App
   NODE_ENV=development
   \`\`\`

4. **Generate Prisma Client**
   \`\`\`bash
   npx prisma generate
   \`\`\`

5. **Run database migrations**
   \`\`\`bash
   npx prisma db push
   \`\`\`

6. **Seed the database (optional)**
   \`\`\`bash
   # Add your seed script if available
   \`\`\`

7. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

8. **Build for production**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## 🗄 Database Schema

### Models

#### User
Stores user authentication and profile information.
\`\`\`prisma
model User {
  id              String            @id @default(uuid())
  clerkId         String            @unique
  email           String            @unique
  role            String            @default("USER")
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  enrollments     Enrollment[]
  quizAssignments QuizAssignment[]
}
\`\`\`

#### Category
Course categories with icons and colors.
\`\`\`prisma
model Category {
  id      String   @id @default(uuid())
  name    String   @unique
  icon    String
  color   String
  courses Course[]
}
\`\`\`

#### Course
Course information and metadata.
\`\`\`prisma
model Course {
  id                 String       @id @default(uuid())
  title              String
  description        String       @db.Text
  price              Decimal      @default(0.00)
  level              String
  imageUrl           String?
  published          Boolean      @default(false)
  categoryId         String
  certificateEnabled Boolean      @default(false)
  enrollmentType     String       @default("open")
  visibility         String       @default("draft")
  category           Category     @relation(...)
  enrollments        Enrollment[]
  modules            Module[]
}
\`\`\`

#### Module
Course modules containing lessons.
\`\`\`prisma
model Module {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  order       Int
  courseId    String
  lessons     Lesson[]
  course      Course   @relation(...)
}
\`\`\`

#### Lesson
Individual lessons within modules.
\`\`\`prisma
model Lesson {
  id          String   @id @default(uuid())
  title       String
  contentType String
  content     String?  @db.Text
  duration    Int?
  order       Int
  moduleId    String
  quizId      String?
  module      Module   @relation(...)
  quiz        Quiz?    @relation(...)
}
\`\`\`

#### Quiz
Quizzes with configurations.
\`\`\`prisma
model Quiz {
  id           String           @id @default(uuid())
  title        String
  description  String?          @db.Text
  type         String           @default("practice")
  timeLimit    Int?
  attemptLimit Int?
  passingScore Int              @default(70)
  randomize    Boolean          @default(false)
  status       String           @default("draft")
  questions    Question[]
  assignments  QuizAssignment[]
}
\`\`\`

#### Question
Quiz questions with answers.
\`\`\`prisma
model Question {
  id            String   @id @default(uuid())
  quizId        String
  type          String
  question      String   @db.Text
  options       String?  @db.LongText
  correctAnswer String   @db.Text
  explanation   String?  @db.Text
  score         Int      @default(1)
  order         Int
  quiz          Quiz     @relation(...)
}
\`\`\`

#### Enrollment
Student course enrollments.
\`\`\`prisma
model Enrollment {
  id        String   @id @default(uuid())
  userId    String
  courseId  String
  progress  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)
  course    Course   @relation(...)
  @@unique([userId, courseId])
}
\`\`\`

#### QuizAssignment
Quiz assignments to users.
\`\`\`prisma
model QuizAssignment {
  id          String    @id @default(uuid())
  userId      String
  quizId      String
  status      String    @default("assigned")
  score       Int?
  createdAt   DateTime  @default(now())
  completedAt DateTime?
  user        User      @relation(...)
  quiz        Quiz      @relation(...)
  @@unique([userId, quizId])
}
\`\`\`

## 📡 API Documentation

### Authentication
All API routes require Clerk authentication unless otherwise specified.

---

### Admin APIs

#### Users Management

**GET /api/admin/users**
- Fetch all users with pagination
- Admin only
- Response: \`{ users: User[], total: number }\`

**GET /api/admin/users/[id]**
- Get specific user details
- Admin only
- Response: \`User\`

---

### Courses

**GET /api/courses**
- List all published courses
- Public access
- Response: \`Course[]\`

**POST /api/courses**
- Create a new course
- Admin only
- Body: \`{ title, description, categoryId, price, level }\`
- Response: \`Course\`

**GET /api/courses/[id]**
- Get course details with modules
- Response: \`Course & { modules: Module[] }\`

**PUT /api/courses/[id]**
- Update course
- Admin only
- Body: Course fields to update
- Response: \`Course\`

**DELETE /api/courses/[id]**
- Delete course
- Admin only
- Response: \`{ success: true }\`

**POST /api/courses/[id]/enroll**
- Enroll current user in course
- Authenticated users
- Response: \`Enrollment\`

**GET /api/courses/[id]/modules**
- Get all modules for a course
- Response: \`Module[]\`

**POST /api/courses/[id]/modules**
- Create module in course
- Admin only
- Body: \`{ title, description, order }\`
- Response: \`Module\`

---

### Modules

**GET /api/modules/[id]**
- Get module details
- Response: \`Module\`

**PUT /api/modules/[id]**
- Update module
- Admin only
- Body: Module fields to update
- Response: \`Module\`

**DELETE /api/modules/[id]**
- Delete module
- Admin only
- Response: \`{ success: true }\`

**GET /api/modules/[id]/lessons**
- Get all lessons in module
- Response: \`Lesson[]\`

**POST /api/modules/[id]/lessons**
- Create lesson in module
- Admin only
- Body: \`{ title, contentType, content, duration, order }\`
- Response: \`Lesson\`

---

### Lessons

**GET /api/lessons/[id]**
- Get lesson details
- Response: \`Lesson\`

**PUT /api/lessons/[id]**
- Update lesson
- Admin only
- Body: Lesson fields to update
- Response: \`Lesson\`

**DELETE /api/lessons/[id]**
- Delete lesson
- Admin only
- Response: \`{ success: true }\`

---

### Quizzes

**GET /api/quizzes**
- List all quizzes
- Admin: all quizzes, Users: published only
- Response: \`Quiz[]\`

**POST /api/quizzes**
- Create quiz
- Admin only
- Body: \`{ title, description, type, timeLimit, passingScore }\`
- Response: \`Quiz\`

**GET /api/quizzes/[id]**
- Get quiz details
- Response: \`Quiz & { questions: Question[] }\`

**PUT /api/quizzes/[id]**
- Update quiz
- Admin only
- Body: Quiz fields to update
- Response: \`Quiz\`

**DELETE /api/quizzes/[id]**
- Delete quiz
- Admin only
- Response: \`{ success: true }\`

---

### Questions

**GET /api/quizzes/[id]/questions**
- Get all questions for a quiz
- Response: \`Question[]\`

**POST /api/quizzes/[id]/questions**
- Add question to quiz
- Admin only
- Body: \`{ type, question, options, correctAnswer, explanation, score, order }\`
- Response: \`Question\`

**PUT /api/quizzes/[id]/questions/[questionId]**
- Update question
- Admin only
- Body: Question fields to update
- Response: \`Question\`

**DELETE /api/quizzes/[id]/questions/[questionId]**
- Delete question
- Admin only
- Response: \`{ success: true }\`

---

### Quiz Assignments

**GET /api/quiz-assignments**
- Get quiz assignments for current user
- Response: \`QuizAssignment[] & { quiz: Quiz }\`

**POST /api/quiz-assignments**
- Assign quiz to users
- Admin only
- Body: \`{ quizId: string, userIds: string[] }\`
- Response: \`QuizAssignment[]\`

---

### User Data

**GET /api/my-enrollments**
- Get current user's enrollments
- Response: \`Enrollment[] & { course: Course }\`

**GET /api/my-stats**
- Get current user's learning statistics
- Response: \`{ totalEnrollments, coursesInProgress, certificatesEarned, hoursSpent, xpPoints }\`

**POST /api/user/sync**
- Sync Clerk user with database
- Creates user record if doesn't exist
- Response: \`User\`

---

### Categories

**GET /api/categories**
- List all categories
- Response: \`Category[]\`

**POST /api/categories**
- Create category
- Admin only
- Body: \`{ name, icon, color }\`
- Response: \`Category\`

---

### Statistics

**GET /api/stats**
- Get platform statistics
- Admin only
- Response: \`{ totalUsers, totalCourses, totalEnrollments, activeUsers }\`

---

### Backup

**GET /api/backup**
- Export database data
- Admin only
- Response: JSON export of all data

---

### Users List

**GET /api/users**
- Get all registered users (for sharing features)
- Response: \`{ id, email }[]\`

---

## 📁 Project Structure

\`\`\`
lkpbinarkomputer/
├── app/
│   ├── (admin)/           # Admin routes
│   │   └── admin/
│   │       ├── courses/   # Course management
│   │       ├── quizzes/   # Quiz management
│   │       ├── users/     # User management
│   │       └── backup/    # Data backup
│   ├── (client)/          # Client routes
│   │   ├── dashboard/     # Student dashboard
│   │   ├── courses/       # Course browsing & learning
│   │   ├── quizzes/       # Quiz taking
│   │   ├── my-learning/   # Learning progress
│   │   ├── profile/       # User profile
│   │   ├── settings/      # User settings
│   │   └── certificate/   # Certificate viewing
│   └── api/               # API routes
│       ├── courses/       # Course APIs
│       ├── quizzes/       # Quiz APIs
│       ├── modules/       # Module APIs
│       ├── lessons/       # Lesson APIs
│       ├── categories/    # Category APIs
│       ├── users/         # User APIs
│       └── ...
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ...
├── lib/                  # Utilities
│   ├── prisma.ts         # Prisma client
│   └── generated/        # Generated Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── package.json

\`\`\`

## 🔐 Environment Variables

### Required Variables

\`\`\`env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=lkpbinarkomputer
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Application
NODE_ENV=development
\`\`\`

### Optional Variables

\`\`\`env
# Clerk URLs (customize if needed)
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
\`\`\`

## 🚀 Development

### Available Scripts

\`\`\`bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
\`\`\`

### Database Management

\`\`\`bash
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma format        # Format schema file
\`\`\`

## 📝 Notes

- **Authentication**: Clerk handles authentication. Configure webhooks for user creation/updates.
- **File Uploads**: Currently uses placeholder images. Integrate cloud storage (e.g., Cloudinary, S3) for production.
- **Email**: Mailto links used for quiz sharing. Consider integrating email service (SendGrid, Resend) for production.
- **Database**: Uses MySQL/MariaDB. Connection pooling configured with limit of 5.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Support

For support, contact the development team or open an issue in the repository.

---

**Built with ❤️ for LKP Binar Komputer**
