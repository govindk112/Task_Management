Frontend Documentation (UI Side)
This documentation explains how the frontend of the Dashboard application is structured, focusing on the UI side only. It describes the tech stack, modules, state management, and design principles.

Tech Stack
Framework: Next.js (v15.4.6)
•	Used for server-side rendering (SSR), static site generation (SSG), and optimized routing.
•	Provides an App Router structure for modular and scalable UI development.
•	Ensures performance and SEO benefits with hybrid rendering.
UI Library: React (v19.1.0) + TailwindCSS (^3.x)
•	React powers the component-based structure. React 19 introduces improved concurrent rendering and better developer ergonomics.
•	TailwindCSS is used for styling with utility-first classes, keeping design consistent and fast to implement.
•	tailwind-merge helps avoid conflicting Tailwind classes, and clsx allows for conditional styling (e.g., active/inactive states).
UI Components: Radix UI
•	Provides accessible, unstyled components that integrate well with Tailwind.
•	Used for key UI interactions:
o	react-dialog: Modals for forms (e.g., Create Project, Edit Task).
o	react-dropdown-menu: Menus for user actions (edit, delete, assign).
o	react-avatar: User profile icons and member lists.
o	react-select: Dropdowns for filtering, role selection, task status.
o	react-label: Accessible labels for form inputs.
o	react-progress: Visual progress indicators for projects and tasks.
Icons: Lucide React
•	Provides modern SVG icons (e.g., Bell, Plus, Edit, Trash).
•	Fully customizable with Tailwind classes.
Charts & Analytics: Recharts
•	A charting library used for analytics dashboards.
•	Provides Bar, Line, and Pie charts for visualizing:
o	Project progress
o	Task completion rate
o	User activity statistics
State Management: Zustand
•	Lightweight, scalable state management solution.
•	Stores will be defined for projects, tasks, users, and notifications.
•	Provides global state without heavy boilerplate.
Utilities
•	date-fns: Used for formatting dates (e.g., task deadlines, notification timestamps).
•	uuid: Generates unique IDs for projects, tasks, and notifications.

 Dashboard Structure (UI Layout)
Sidebar Navigation
•	Persistent sidebar for navigation between modules.
•	Contains links for: Projects, Tasks, Users, Analytics, Notifications.
•	Icons from Lucide React for visual clarity.
Top Navbar
•	Contains search bar, quick actions, and theme switch.
•	User Avatar Dropdown for profile and logout.
•	Bell Icon for notifications, with a badge showing unread count.

Modules

1. Projects Management
Purpose: Manage and monitor projects within the system.
•	Project List View: Displays all projects with filter options (by status, member, creation date).
•	CRUD Operations:
o	Create Project (Dialog with form: name, description, members).
o	Edit Project (Update details and assigned members).
o	Delete Project (Confirmation dialog).
•	Members: Add/remove users to a project. Members are displayed as avatars.
•	Progress Tracking: Uses Radix Progress to show completion % of tasks within the project.
•	Drag & Drop: Reorder projects using @hello-pangea/dnd.

2. User Management
Purpose: Manage application users and their roles.
•	User List/Grid View: Displays all users with details (avatar, name, role).
•	CRUD Operations:
o	Add User (Dialog with form: name, email, role).
o	Edit User (Change role, update details).
o	Delete User (Confirmation dialog).
•	Roles Management: Assign roles (Admin, Member, Viewer) via dropdown.
•	User Profiles: Avatar + profile card with activity details.

3. Task Management
Purpose: Manage tasks associated with projects.
•	Task Board View: Kanban-style board with columns for statuses (To Do, In Progress, Completed, Blocked).
•	CRUD Operations:
o	Create Task (Dialog: title, description, due date, assignee, status).
o	Edit Task (Update status, due date, assignee).
o	Delete Task (Confirmation dialog).
•	Drag & Drop: Move tasks between columns to update status.
•	Task Assignments: Assign one or multiple members (avatars shown).
•	Due Dates: Display formatted dates using date-fns.

4. Notifications
Purpose: Keep users updated on system events.
•	Dropdown Notification Panel: Opened via bell icon in navbar.
•	Notification Items: Each notification shows event type, description, timestamp.
•	Unread/Read State: Unread notifications are highlighted.
•	Actions: Mark as read, clear single notification, or clear all.
•	State: Managed via Zustand (useNotificationStore).

5. Analytics & Reports
Purpose: Visualize project and task performance.
•	Charts (Recharts):
o	Bar Chart: Task completion per project.
o	Line Chart: User activity over time.
o	Pie Chart: Distribution of tasks by status.
•	Stats Cards: Display totals (e.g., total projects, active tasks, users).
•	Progress Indicators: Radix Progress used for visual performance tracking.

State Management (Zustand Stores)
•	useProjectStore
o	State: projects
o	Actions: addProject, editProject, deleteProject, filterProjects
•	useTaskStore
o	State: tasks
o	Actions: addTask, editTask, deleteTask, updateStatus
•	useUserStore
o	State: users
o	Actions: addUser, editUser, deleteUser
•	useNotificationStore
o	State: notifications
o	Actions: addNotification, markAsRead, clearNotifications

Styling & Themes
•	TailwindCSS: Utility-first styling for rapid UI development.
•	clsx + tailwind-merge: Handle conditional classes and avoid conflicts.
•	next-themes: Enables dark/light theme switching.

Notifications (In-app only)
•	No toast libraries (removed earlier).
•	Bell icon shows badge with count of unread notifications.
•	Dropdown opens panel with list of notifications.
•	Notifications managed globally with Zustand.


🚀 Task Management System - Backend API
This repository contains the backend for the Task Management System, a robust API built to manage users, projects, and tasks. It provides a full suite of features including authentication, role-based access control, and a foundation for real-time notifications.

⚙️ Tech Stack
Category
Technology
Runtime
Node.js (v22+)
Framework
Express.js
Database
PostgreSQL
ORM
Prisma
Authentication
JSON Web Tokens (JWT)
Password Security
bcrypt


🛠️ Features
User Authentication: Secure registration and login using JWT.
Role-based Access Control (RBAC): Differentiate permissions for Admin and User roles.
Project Management: Full CRUD (Create, Read, Update, Delete) functionality for projects.
Task Management: Comprehensive task handling including status and priority updates, and user assignments.
Comments: Add and retrieve comments on specific tasks.
Notifications System: A future-ready system for notifying users of key events (e.g., task assignments, updates, comments).
 
📂 Project Structure
server/
│── prisma/              # Prisma schema & migrations
│── src/
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication & role-based access
│   ├── lib/             # Prisma client initialization
│   └── index.js         # Entry point
│── package.json
│── README.md


 
📑 API Endpoints
🔑 Auth Routes
Base URL: /auth
Method
Endpoint
Description
Access
POST
/register
Register a new user
Public
POST
/login
Login a user and return a JWT
Public

 
👤 User Profile
Base URL: /profile
Method
Endpoint
Description
Access
GET
/
Get the current user's profile
User

 
📁 Project Routes
Base URL: /projects
Method
Endpoint
Description
Access
POST
/
Create a new project
Admin
GET
/
Get all projects
Admin
GET
/:id
Get a project by ID
Admin
PUT
/:id
Update a project
Admin
DELETE
/:id
Delete a project
Admin

 
✅ Task Routes
Base URL: /projects/:projectId/tasks
Method
Endpoint
Description
Access
POST
/
Create a new task for a project
Admin
GET
/
Get all tasks for a project
Admin/User
GET
/tasks/:id
Get a specific task by ID
User
PUT
/tasks/:id
Update a task (User: status only; Admin: all fields)
User/Admin
DELETE
/tasks/:id
Delete a task
Admin

 
💬 Comment Routes
Base URL: /tasks/:taskId/comments
Method
Endpoint
Description
Access
POST
/
Add a comment to a task
User
GET
/
Get all comments for a task
User

 
🔔 Notification Routes
Base URL: /notifications
Method
Endpoint
Description
Access
GET
/
Get all notifications for a user
User
PUT
/:id
Mark a notification as read
User

 
🔐 Authentication & Roles
This API uses JWT for authentication. A valid token is required for all private endpoints. The system enforces Role-based Access Control (RBAC) to manage permissions:
Admin: Has full CRUD access to projects and tasks, and can manage members.
User: Can view projects, update the status of their assigned tasks, add comments, and receive notifications.
 
📊 Database Schema (Prisma)
Key models:
User: name, email, password (hashed), role (ADMIN/USER), avatar


Project: owned by a user, contains tasks & members


Task: linked to a project, can be assigned to a user


Comment: linked to a task & user


Notification: tracks actions like task assignment, updates, and comments




🛠️ Getting Started
Prerequisites
Node.js (v22 or newer)
npm
PostgreSQL
Installation
Clone the repository:
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


Install the dependencies:
npm install


Environment Variables
Create a .env file in the root directory and add the following variables:
DATABASE_URL="postgresql://user:password@localhost:5432/task-management-db"
JWT_SECRET="your_secret_key_for_jwt"


Database Setup
Run the Prisma migration to create the database schema:
npx prisma migrate dev --name init


Running the Server
Start the server in development mode:
npm run dev


The API will be running on http://localhost:3000.
