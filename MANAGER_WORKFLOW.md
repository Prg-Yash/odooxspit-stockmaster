# Manager Assignment & Warehouse Access - Complete Implementation

## Overview

Complete implementation of manager assignment with user search, email notifications, and warehouse access validation.

## Backend Changes

### 1. Email Notification System (`api/src/lib/mailer.ts`)

Added `sendWarehouseMemberAddedEmail()` function:

- Sends professional email when user is added to warehouse
- Includes warehouse details (name, code)
- Different permissions list for MANAGER vs STAFF roles
- Link to dashboard for immediate access

### 2. Warehouse Service (`api/src/services/warehouse.service.ts`)

Updated `addMember()` to:

- Send email notification after successful member addition
- Non-blocking email sending (logs error but doesn't fail the operation)
- Returns complete member data including warehouse and user info

### 3. User Search Endpoint (`api/src/controllers/user.controller.ts`)

Added `searchUsers()` endpoint:

- Search users by email (case-insensitive, partial match)
- Only returns verified users (emailVerified = true)
- Includes warehouse membership information
- Limit 10 results
- Shows if user is already in a warehouse

### 4. User Routes (`api/src/routes/user.route.ts`)

Updated routes:

- `GET /user/search?email=xxx` - Search users by email
- `GET /user/me` - Get current user profile
- `PUT /user/update` - Update profile
- `DELETE /user/delete` - Delete account

All routes require authentication (`requireAuth` middleware)

## Frontend Changes

### 1. Removed Development Mode

- Removed `DevLogin` component
- Removed localStorage token fallback
- API client now uses only cookie-based authentication

### 2. User API Service (`frontend/lib/api/user.ts`)

Created new service:

- `searchUsers(email)` - Search for users to invite
- `getCurrentUser()` - Get logged-in user info
- TypeScript interfaces for User and API responses

### 3. Onboarding Page (`frontend/app/onboarding/page.tsx`)

Complete manager assignment UI:

**New Features:**

- User search by email with real-time search
- Search results display with user info
- Visual indication if user is already in another warehouse
- Selected user confirmation
- Proper error handling for "already in warehouse" scenario
- Email notification confirmation message

**User Flow:**

1. Search for user by email
2. Select user from results
3. System validates user isn't in another warehouse
4. Add as MANAGER role
5. User receives email notification
6. Success confirmation

## Complete Manager Workflow

### Step 1: Manager Account Creation

```http
POST http://localhost:4000/auth/register
{
  "email": "manager@company.com",
  "password": "SecurePass123!",
  "name": "John Manager",
  "role": "MANAGER"
}
```

Response: User created, verification email sent

### Step 2: Email Verification

```http
GET http://localhost:4000/auth/verify-email?token=xxx&email=manager@company.com
```

Response: Email verified, user can now log in

### Step 3: Owner/Admin Searches for Manager

Frontend: Owner enters `manager@company.com` in search box

```http
GET http://localhost:4000/user/search?email=manager@company.com
Authorization: Bearer <owner_token>
```

Response:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id_123",
        "email": "manager@company.com",
        "name": "John Manager",
        "role": "MANAGER",
        "warehouseMemberships": [] // Empty - not in any warehouse
      }
    ]
  }
}
```

### Step 4: Owner Adds Manager to Warehouse

Frontend: Owner selects user and clicks "Add Manager"

```http
POST http://localhost:4000/warehouses/<warehouse_id>/members
Authorization: Bearer <owner_token>
{
  "userId": "user_id_123",
  "role": "MANAGER"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Member added successfully.",
  "data": {
    "member": {
      "id": "member_id",
      "warehouseId": "warehouse_id",
      "userId": "user_id_123",
      "role": "MANAGER",
      "user": {
        "id": "user_id_123",
        "email": "manager@company.com",
        "name": "John Manager"
      },
      "warehouse": {
        "id": "warehouse_id",
        "name": "Main Warehouse",
        "code": "WH-001"
      }
    }
  }
}
```

**Backend automatically:**

- ✅ Adds user as warehouse member
- ✅ Sends email notification to manager@company.com
- ✅ Email includes warehouse name, code, and role
- ✅ Email has direct link to dashboard

**Error Response - Already in Warehouse (409):**

```json
{
  "success": false,
  "message": "User is already a member of warehouse \"Other Warehouse\" (WH-002). They must leave that warehouse first.",
  "code": "ALREADY_IN_WAREHOUSE",
  "existingWarehouse": {
    "id": "other_warehouse_id",
    "name": "Other Warehouse",
    "code": "WH-002"
  }
}
```

### Step 5: Manager Receives Email

Email Subject: "You've been added to Main Warehouse - StockMaster"

Email Content:

- Welcome message
- Warehouse details (name, code)
- Role badge (MANAGER)
- List of permissions
- Link to dashboard

### Step 6: Manager Logs In

```http
POST http://localhost:4000/auth/login
{
  "email": "manager@company.com",
  "password": "SecurePass123!"
}
```

Response: Access token + refresh token

### Step 7: Manager Accesses Warehouse

```http
GET http://localhost:4000/warehouses
Authorization: Bearer <manager_token>
```

Response: List of warehouses they're a member of

```http
GET http://localhost:4000/warehouses/<warehouse_id>
Authorization: Bearer <manager_token>
```

Response: Full warehouse details with permissions

## Manager Permissions

### MANAGER Role Can:

- ✅ View warehouse details
- ✅ Add/remove warehouse members
- ✅ Create/edit/delete products
- ✅ Create/edit/delete locations
- ✅ Perform all stock operations (receive, deliver, adjust, transfer)
- ✅ View all reports and analytics
- ✅ Update warehouse settings

### MANAGER Role Cannot:

- ❌ Delete the warehouse
- ❌ Access other warehouses (only their assigned one)
- ❌ Change their own role
- ❌ Access system-wide settings (only OWNER can)

## Validation & Error Handling

### Frontend Validation:

- ✅ Email search requires non-empty string
- ✅ Must select a user before proceeding
- ✅ Visual warning if user already in warehouse
- ✅ Clear error messages with warehouse names

### Backend Validation:

- ✅ User must exist and be verified
- ✅ User cannot be in multiple warehouses
- ✅ Proper error codes for different scenarios
- ✅ Rollback on failure

### Security:

- ✅ All endpoints require authentication
- ✅ Only OWNER or warehouse MANAGER can add members
- ✅ Warehouse access controlled by membership
- ✅ Tokens stored in HTTP-only cookies

## Testing the Complete Flow

### 1. Create Manager Account

```bash
# Register manager
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testmanager@example.com",
    "password": "SecurePass123!",
    "name": "Test Manager",
    "role": "MANAGER"
  }'

# Verify email (check inbox for token)
curl "http://localhost:4000/auth/verify-email?token=<TOKEN>&email=testmanager@example.com"
```

### 2. Owner Logs In

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "OwnerPass123!"
  }'

# Save the accessToken
```

### 3. Search for Manager

```bash
curl "http://localhost:4000/user/search?email=testmanager" \
  -H "Authorization: Bearer <owner_token>"
```

### 4. Add Manager to Warehouse

```bash
curl -X POST "http://localhost:4000/warehouses/<warehouse_id>/members" \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<manager_user_id>",
    "role": "MANAGER"
  }'
```

### 5. Manager Logs In and Accesses Warehouse

```bash
# Login as manager
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testmanager@example.com",
    "password": "SecurePass123!"
  }'

# Get warehouses (should see assigned warehouse)
curl "http://localhost:4000/warehouses" \
  -H "Authorization: Bearer <manager_token>"
```

## Email Template Preview

```html
Subject: You've been added to Main Warehouse - StockMaster Hi John Manager,
Great news! You've been added to a warehouse in StockMaster. Warehouse: Main
Warehouse Warehouse Code: WH-001 Your Role: MANAGER Added by: System Owner What
You Can Do: ✅ Manage warehouse members ✅ Create and manage products ✅ Manage
warehouse locations ✅ Perform all stock operations ✅ View reports and
analytics [Go to Dashboard Button] Log in to your account to access the
warehouse!
```

## UI Screenshots Description

### Onboarding Page - Step 2 (Manager Assignment)

1. **Search Section:**

   - Email input field with search icon
   - "Search" button
   - Helper text: "Search for registered and verified users"

2. **Search Results:**

   - List of matching users
   - Each result shows:
     - Name (or email if no name)
     - Email address
     - Role badge
     - Warning icon if already in warehouse
     - Checkmark if selected

3. **Selected User Display:**

   - Green highlighted box
   - Selected manager's name and email
   - "Change" button to select different user

4. **Action Buttons:**
   - "Back" button (outlined)
   - "Add Manager" button (primary, disabled until user selected)

## Database Schema

```prisma
model User {
  id                    String              @id @default(cuid())
  email                 String              @unique
  name                  String?
  role                  UserRole            // OWNER, MANAGER, STAFF
  emailVerified         Boolean             @default(false)
  warehouseMemberships  WarehouseMember[]
}

model Warehouse {
  id       String            @id @default(cuid())
  name     String
  code     String            @unique
  members  WarehouseMember[]
}

model WarehouseMember {
  id          String               @id @default(cuid())
  warehouseId String
  userId      String
  role        WarehouseMemberRole  // MANAGER, STAFF
  warehouse   Warehouse            @relation(...)
  user        User                 @relation(...)

  @@unique([warehouseId, userId])  // User can only be in one warehouse
}
```

## API Endpoints Summary

### User Management

- `POST /auth/register` - Create user account
- `GET /auth/verify-email` - Verify email
- `POST /auth/login` - Login
- `GET /user/search?email=xxx` - Search users ✨ NEW
- `GET /user/me` - Get current user

### Warehouse Management

- `POST /warehouses` - Create warehouse (OWNER only)
- `GET /warehouses` - Get accessible warehouses
- `GET /warehouses/:id` - Get warehouse details
- `POST /warehouses/:id/members` - Add member (OWNER/MANAGER)
- `DELETE /warehouses/:id/members/:userId` - Remove member

### Stock Operations (Manager can access all)

- `POST /stocks/warehouse/:id/receive` - Receive stock
- `POST /stocks/warehouse/:id/deliver` - Deliver stock
- `GET /stocks/warehouse/:id/levels` - View stock levels

## Notes

- ✅ Authentication fully integrated (no dev tokens)
- ✅ Email notifications working
- ✅ User search implemented
- ✅ Warehouse access validation
- ✅ One warehouse per user enforcement
- ✅ Manager can access all warehouse features
- ✅ Proper error handling with user-friendly messages
- ✅ TypeScript type safety throughout
