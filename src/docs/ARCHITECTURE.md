# Chat App Architecture Documentation

## Project Overview

This project is a real-time one-to-one chat application built using:

* React (Frontend)
* Supabase Authentication
* Supabase PostgreSQL Database
* Supabase Realtime
* Vercel (Deployment)

The application supports:

* User Registration
* User Login
* User Profiles
* Protected Routes
* One-to-One Conversations
* Real-Time Messaging
* Conversation List
* Last Message Preview
* Unread Messages
* Online Presence
* Typing Indicator

---

# High Level Architecture

```text
React Application
        |
        |
        v
     Supabase
   ┌────────────┐
   │ Auth       │
   │ Database   │
   │ Realtime   │
   │ Presence   │
   └────────────┘
```

Authentication, database operations, realtime updates and presence tracking are handled by Supabase.

---

# Folder Structure

```text
src/
│
├── api/
│   └── supabase.js
│
├── components/
│   ├── ChatWindow.jsx
│   ├── ConversationList.jsx
│   ├── MessageInput.jsx
│   └── NewChat.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│   └── usePresence.js
│
├── pages/
│   ├── Chat.jsx
│   ├── Login.jsx
│   └── Register.jsx
│
├── routes/
│   └── ProtectedRoute.jsx
│
├── services/
│   ├── chatService.js
│   └── messageService.js
│
└── App.jsx
```

---

# Authentication Flow

```text
Register
    |
    v
Supabase Auth
    |
    v
profiles table
```

```text
Login
    |
    v
Supabase Session
    |
    v
AuthContext
```

AuthContext manages the current logged-in user globally.

---

# Database Design

## profiles

Purpose:

Stores application user information.

```sql
profiles
```

| Column     | Type      |
| ---------- | --------- |
| id         | uuid      |
| email      | text      |
| username   | text      |
| created_at | timestamp |

Example:

```text
id: abc123
username: Rahul
email: rahul@test.com
```

---

## chats

Purpose:

Represents a conversation.

```sql
chats
```

| Column     | Type      |
| ---------- | --------- |
| id         | uuid      |
| created_at | timestamp |
| updated_at | timestamp |

One chat record = one conversation.

---

## chat_participants

Purpose:

Connects users and chats.

```sql
chat_participants
```

| Column  | Type |
| ------- | ---- |
| chat_id | uuid |
| user_id | uuid |

Example:

```text
chat_1
 ├── Rahul
 └── Anvay
```

---

## messages

Purpose:

Stores all messages.

```sql
messages
```

| Column     | Type      |
| ---------- | --------- |
| id         | uuid      |
| chat_id    | uuid      |
| sender_id  | uuid      |
| content    | text      |
| created_at | timestamp |
| is_deleted | boolean   |

Example:

```text
Hello Bro
How are you?
See you tomorrow
```

---

## message_reads

Purpose:

Tracks read status.

```sql
message_reads
```

| Column     | Type      |
| ---------- | --------- |
| message_id | uuid      |
| user_id    | uuid      |
| read_at    | timestamp |

Used for:

* Unread Counts
* Read Receipts
* Delivery Tracking

---

# Component Architecture

## Chat.jsx

Main page layout.

Responsibilities:

* Load current profile
* Show sidebar
* Show chat window
* Handle selected conversation
* Handle logout

```text
Chat.jsx
│
├── ConversationList
├── NewChat
└── ChatWindow
```

---

## ConversationList.jsx

Purpose:

Displays:

```text
Rahul
Hello bro...
(2 unread)

Priya
See you tomorrow
```

Responsibilities:

* Load conversations
* Load last message
* Calculate unread count
* Realtime sidebar refresh

---

## NewChat.jsx

Purpose:

Start a new conversation.

Responsibilities:

* Load all users
* Exclude current user
* Open conversation

---

## ChatWindow.jsx

Purpose:

Main messaging interface.

Responsibilities:

* Find/Create chat
* Load messages
* Subscribe to realtime updates
* Send messages
* Mark messages as read
* Online status
* Typing indicator

---

## MessageInput.jsx

Purpose:

Message entry component.

Responsibilities:

* Capture text
* Send message
* Trigger typing event

---

# Service Layer

Business logic is separated from UI.

---

## chatService.js

Purpose:

Chat-related operations.

Functions:

```javascript
findOrCreateChat()
```

Responsibilities:

* Find existing chat
* Create new chat
* Add participants

---

## messageService.js

Purpose:

Message-related operations.

Functions:

```javascript
getMessages()
sendMessage()
markMessagesAsRead()
```

Responsibilities:

* Load messages
* Send messages
* Track reads

---

# Realtime Architecture

Messages use Supabase Realtime.

```text
User A
   |
Insert Message
   |
Supabase
   |
Realtime Event
   |
User B
```

No polling required.

---

# Online Presence Architecture

Uses Supabase Presence.

```text
User Joins
      |
Track Presence
      |
Presence Channel
      |
Online Users List
```

No database writes required.

---

# Typing Indicator Architecture

Uses Broadcast Channels.

```text
User Typing
      |
Broadcast Event
      |
Other User
      |
Show:
"Rahul is typing..."
```

No database writes required.

---

# Current MVP Features

Completed:

* Registration
* Login
* Logout
* User Profiles
* Protected Routes
* Conversation List
* Start New Chat
* Realtime Messaging
* Unread Counts
* Online Status
* Typing Indicator

---

# Future Roadmap (V2)

Possible future features:

* Read Receipts
* Group Chats
* Image Sharing
* File Sharing
* Push Notifications
* Search Messages
* User Blocking
* Message Editing
* Message Deletion
* Voice Notes

---

# Security Improvements Before Production

Current setup uses development policies.

Before production:

* Implement proper RLS
* Restrict message access
* Restrict chat access
* Restrict profile access
* Validate user ownership

This is mandatory before public deployment.

---

# Deployment Architecture

```text
Vercel
   |
React Frontend
   |
Supabase
 ├── Auth
 ├── Database
 ├── Realtime
 └── Presence
```

Cost:

Free Tier

Suitable for:

* Personal Use
* Friend Groups
* MVP Validation

---

# Current Project Status

MVP Status: COMPLETE

Core functionality exists and the application is usable by real users.

Future work should focus on:

1. Security
2. Code Cleanup
3. Deployment
4. Monitoring
5. Optional Features

```
```