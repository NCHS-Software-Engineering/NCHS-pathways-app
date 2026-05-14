# NCHS Pathways App

## Overview

The **NCHS Pathways App** is a web application built for NCHS students to plan, organize, and track their academic journeys. It enables students to select and customize academic pathways, manage course selections, track requirements, and monitor progress toward graduation—no counselor or staff tools are implemented.

---

## What It Does

- Lets students browse and select academic pathways
- Allows students to add or remove courses from their plan
- Tracks student progress toward graduation requirements
- Displays recommended course sequences and prerequisites
- Provides each student with a personalized dashboard

## How It Works

Students register, log in, and interact with their academic pathway in a responsive web interface. All data is securely stored in a MySQL database. Each student sees only their own data. The backend provides secure APIs for pathway management and planning; the frontend is built with React and TypeScript.

---

## Platform Requirements

- **Operating System:** Windows 10/11, macOS 11+, or modern Linux
- **Node.js:** v18.x LTS ([Download](https://nodejs.org/en/download/))
- **npm:** v9.x+ (comes with Node.js) or [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- **MySQL:** v8.x ([Download MySQL Community Edition](https://dev.mysql.com/downloads/mysql/))
- **Web Browser:** Latest Chrome, Firefox, Edge, or Safari

---

## Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/NCHS-Software-Engineering/NCHS-pathways-app.git
cd NCHS-pathways-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install and Configure MySQL

- [Download MySQL Community Edition](https://dev.mysql.com/downloads/mysql/) and complete setup  
- Start your MySQL server (default port: 3306)  
- Create an empty database:
  ```sql
  CREATE DATABASE pathways;
  ```

- Create a MySQL user (if desired) and grant privileges:
  ```sql
  CREATE USER 'pathways'@'localhost' IDENTIFIED BY 'GyAkDphsSCtE!2';
  GRANT ALL PRIVILEGES ON pathways.* TO 'pathways'@'localhost';
  FLUSH PRIVILEGES;
  ```

### 4. Set Up the Database Schema

- Import the MySQL schema provided in `docs/schema.sql` (replace username/password as needed):

  ```bash
  mysql -u nchs_user -p nchs_pathways < docs/schema.sql
  ```

  Or run the SQL file using MySQL Workbench or another tool.

### 5. Configure Environment Variables

- Copy `.env.example` to `.env` and fill in your MySQL credentials:

  ```env
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=

  NEXTAUTH_SECRET=
  NEXTAUTH_URL=http://localhost:3000/

  DB_HOST=
  DB_USER=
  DB_PASSWORD=
  DB_NAME=
  ```

---

## How to Run the Project

Start the development server:

```bash
npm start
# or
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Expected Result:**  
You’ll see a login or registration screen. After logging in, you can create or edit your academic pathway, add/remove courses, and see your progress.

---

## High-Level Architecture

- **Frontend:** React (TypeScript), runs entirely in the browser
- **Backend:** Node.js (Express with TypeScript), provides REST APIs and session management
- **Database:** MySQL (student data only)

```txt
[Student Browser (React)] <─REST─> [Node.js Express API] <─SQL─> [MySQL: student tables only]
```

> Counselors, faculty, or staff accounts do **not** exist. All functionality is for individual student accounts only.

---

## Data Schema

### students

| Field              | Type          | Description               |
| ------------------ | ------------- | ------------------------- |
| Username           | VARCHAR(3500) | Unique username           |
| Stored_Pathways    | VARCHAR(3500) | All starred pathways      |
| Pathway_Progress   | VARCHAR(3500) | All classes toward path   |
| ID                 | INT           | Student Identification #  |
| CreatedAt          | DATETIME      | Date acct was made        |
| UpdatedAt          | DATETIME      | Date acct was updated     |
| User_Email         | VARCHAR(3500) | Email user signed in with |
| Reading_Competency | TINYINT       | boolean for competency    |
| Math_Competency    | TINYINT       | boolean for competency    |
| Profile_Picture    | MEDIUMTEXT    | chosen picture for pfp    |




> See `docs/schema.sql` for full details.

---

## Remaining User Stories (Backlog)

    - As a **Student**, I want to be able to take a custom quiz to recommend me a pathway 

    Trello link: [text](https://trello.com/b/EXIHsk5h/pathways)

---

## Known Issues

- No password reset email yet
- Data is not currently encrypted at rest

Track/fix issues here: [GitHub Issues](https://github.com/NCHS-Software-Engineering/NCHS-pathways-app/issues)

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

_Questions or suggestions? Please open an Issue!_
