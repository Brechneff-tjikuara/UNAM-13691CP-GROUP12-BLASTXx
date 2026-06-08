# Firebase Setup Guide for BlastX

This document provides step-by-step instructions to set up the Firebase backend for the BlastX mobile application, following a multi-tenant NoSQL architecture.

---

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `BlastX`.
3. Enable Authentication (Email/Password) and Cloud Firestore.

## 2. Environment Configuration
Create a `.env` file in the root of your project:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Database Schema (Firestore)

### 1. `users` Collection
Stores global profile data for every registered user.
- **Document ID:** User's unique `uid`.
- **Fields:**
  - `name`: string
  - `email`: string
  - `minePosition`: string (e.g., "Mining Engineer", "Technician")
  - `companyCode`: string
  - `role`: "admin" | "member"
  - `canCreateBlasts`: boolean (Permission flag)

### 2. `companies` Collection
Siloed data for each mining company.
- **Document ID:** Unique `companyCode`.
- **Fields:**
  - `name`: string
  - `mineType`: string (e.g., "open_pit", "underground")
  - `location`: string (e.g., "Kalgoorlie, WA")
  - `registeredBy`: string (UID of the creator)
  - `rbacEnabled`: boolean (Toggle for Role-Based Access)
  - `createdAt`: ISO Timestamp

#### **Sub-collections:**
- **`blasts`**: All blast records for this company.
  - `{blastId}`: title, targetArea, status, etc.
- **`team`**: Mirrored user profiles for this company's members.
  - `{uid}`: Profile details copied from the `users` collection.
- **`favorites`**: User-specific bookmarked blasts.
  - `{uid}`: List of blast IDs.
- **`settings`**: Configuration documents (e.g., `rbacEnabled` can also be stored here).

## 4. RBAC Logic Layer
The app enforces access based on `minePosition` and `role`:
- **Admins:** Full access to manage team, company settings, and toggle RBAC.
- **Editors:** Users with positions including **Engineer**, **Specialist**, or **Analyst** can create/edit blasts.
- **Viewers:** All other positions (e.g., **Technician**, **Supervisor**) have read-only access.
- *Note:* If `rbacEnabled` is toggled **OFF**, all company members gain edit access.

## 5. Security Rules
Copy these into your Firebase Console (Build > Firestore > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global User Profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Multi-tenant Company Silos
    match /companies/{companyCode} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Refine to check if user belongs to company
      
      match /team/{uid} { allow read, write: if request.auth != null; }
      match /blasts/{id} { allow read, write: if request.auth != null; }
      match /favorites/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }
    }
  }
}


