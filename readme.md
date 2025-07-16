# Operation Scheduler for Hospital Management

A web application for managing hospital operation schedules with user authentication and role-based access.

## Features

- User registration and login
- Admin can add new operation schedules
- Staff/Doctors can view upcoming operations
- Each schedule includes:
  - Date and time
  - OT ID
  - Patient name
  - Doctor name
  - Type of anesthesia
  - Optional notes

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore database
4. Copy your Firebase config and replace the values in `js/firebase.js`
5. Set up Firestore security rules (provided in the documentation)

### 2. Local Development

1. Clone this repository
2. Install a local server (e.g., Live Server extension for VSCode)
3. Open `index.html` in your browser via the local server

### 3. First Run

1. Register an admin user (you'll need to manually set the role to 'admin' in Firestore)
2. Login as admin to add operation schedules
3. Register staff/doctor users to view schedules

## Enhancement Suggestions

1. Add user roles management
2. Implement schedule editing and cancellation
3. Add patient medical record integration
4. Implement notifications for upcoming operations
5. Add calendar view for schedules
6. Implement search and filtering for operations
7. Add operation room management
8. Implement approval workflow for schedules
9. Add reporting and analytics
10. Mobile responsive design improvements