# StockMaster API

A complete warehouse and inventory management system built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication System** - JWT-based authentication with refresh tokens, email verification, and password reset
- **Warehouse Management** - Create and manage warehouses with role-based member access
- **Product Management** - CRUD operations for products with categories and SKU tracking
- **Inventory Management** - Real-time stock tracking with location-based inventory
- **Stock Movements** - Complete audit trail of all inventory transactions
- **Low Stock Alerts** - Automatic monitoring of reorder levels

## Architecture

The application follows a clean **Controller → Service → Model** architecture:

```
api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── routes/                # Route definitions
│   ├── middlewares/           # Auth & authorization
│   ├── types/                 # TypeScript types & DTOs
│   ├── lib/                   # Utilities (prisma, auth, mailer)
│   └── server.ts              # Express app entry point
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SMTP server (for email verification)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Server
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stockmaster

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@stockmaster.com
```

### Database Migration

After updating the schema, run migrations:

```bash
npx prisma migrate dev --name initial_setup
npx prisma generate
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## Permission Model

### User Roles (System-wide)
- **OWNER** - Full system access, can manage all warehouses
- **MANAGER** - Can be assigned as warehouse manager
- **STAFF** - Can be assigned as warehouse staff

### Warehouse Member Roles
- **MANAGER** - Full warehouse control (manage members, locations, products, stock)
- **STAFF** - Stock operations only (receive, deliver, transfer, view)

### Permission Rules
- System **OWNER** has access to all warehouses automatically
- Warehouse **MANAGER** can add/remove members, manage products and locations
- Warehouse **STAFF** can perform stock operations but cannot modify warehouse settings
- Users can only access warehouses they are members of (except OWNER)

## Complete User & Warehouse Flow

### 1. Initial Setup (Owner Registration)
```
1. Owner registers → POST /auth/register
   {
     "email": "owner@company.com",
     "password": "SecurePass123!",
     "name": "John Owner",
     "role": "owner"
   }

2. Owner receives verification email

3. Owner verifies email → GET /auth/verify-email?token=xxx&email=owner@company.com

4. Owner logs in → POST /auth/login
   Response includes: accessToken, refreshToken, and user data with role: "OWNER"
```

### 2. Warehouse Creation (Owner)
```
5. Owner creates warehouse → POST /warehouses
   Authorization: Bearer <owner_access_token>
   {
     "name": "Main Warehouse",
     "code": "WH001",
     "address": "123 Storage St",
     "city": "Mumbai",
     "state": "Maharashtra",
     "country": "India",
     "postalCode": "400001"
   }
```

### 3. Inviting Users (Owner/Manager)
```
6. First, invited users must register:
   → POST /auth/register
   {
     "email": "manager@company.com",
     "password": "SecurePass123!",
     "name": "Sarah Manager",
     "role": "manager"  // or "staff"
   }

7. They verify their email → GET /auth/verify-email?token=xxx&email=manager@company.com

8. Owner/Manager adds them to warehouse → POST /warehouses/:warehouseId/members
   {
     "userId": "user_id_from_step_6",
     "role": "MANAGER"  // or "STAFF"
   }
```

### 4. Member Access Flow
```
9. Manager logs in → POST /auth/login
   {
     "email": "manager@company.com",
     "password": "SecurePass123!"
   }

10. Manager gets their warehouses → GET /warehouses
    Returns only warehouses they're members of

11. Manager can now:
    - View warehouse details
    - Add/remove staff members (if MANAGER role)
    - Manage products and locations (if MANAGER role)
    - Perform stock operations (all roles)
```

### 5. Role-Based Operations

**OWNER (System Role)**:
- ✅ Access ALL warehouses automatically
- ✅ Create new warehouses
- ✅ Delete any warehouse
- ✅ Add/remove members to any warehouse
- ✅ Full control over all operations

**MANAGER (Warehouse Role)**:
- ✅ Access assigned warehouses only
- ✅ Add/remove warehouse members
- ✅ Create/edit/delete locations
- ✅ Create/edit/delete products
- ✅ All stock operations
- ❌ Cannot create new warehouses
- ❌ Cannot delete warehouses

**STAFF (Warehouse Role)**:
- ✅ Access assigned warehouses only
- ✅ View warehouse details
- ✅ View products and locations
- ✅ Perform stock operations (receive, deliver, adjust, transfer)
- ❌ Cannot add/remove members
- ❌ Cannot create/edit locations or products
- ❌ Cannot delete anything

## API Endpoints

### Authentication

All endpoints except auth routes require authentication via JWT token in `Authorization: Bearer <token>` header.

---

### Auth Routes (`/auth`)

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "staff"  // "owner", "manager", or "staff"
}
```

**Required Fields**:
- `email` - Valid email address
- `password` - Minimum 8 characters, must contain uppercase, lowercase, number, and special character (@$!%*?&_)
- `name` - User's display name (minimum 1 character)
- `role` - User role: "owner", "manager", or "staff"

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STAFF"
  }
}
```

**Note**: A verification email is automatically sent to the registered email address

#### Verify Email
```http
GET /auth/verify-email?token=verification_token&email=user@example.com
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

#### Resend Verification Email
```http
POST /auth/resend-verification-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Verification email sent successfully. Please check your inbox."
}
```

**Note**: Rate limited to 1 request per 2 minutes per email

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "STAFF",
      "emailVerified": true
    }
  }
}
```

**Note**: 
- Refresh token is also set in HTTP-only cookie
- Email must be verified before login
- Rate limited (20 requests per 15 minutes)

#### Refresh Access Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Or** (refresh token from cookie):
```http
POST /auth/refresh-token
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

**Note**: 
- Old refresh token is revoked (token rotation)
- New refresh token is set in cookie

#### Logout
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**Or** (refresh token from cookie):
```http
POST /auth/logout
Cookie: refreshToken=refresh_token_here
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Note**: Revokes refresh token and clears cookie

#### Request Password Reset
```http
POST /auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Note**: Always returns success to prevent user enumeration

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Note**: 
- Revokes all refresh tokens (logs out all devices)
- Password must be at least 8 characters

---

### User Routes (`/user`)

**All user routes require authentication**

#### Get Current User Profile
```http
GET /user/me
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "role": "STAFF",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

#### Update Profile
```http
PUT /user/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "newemail@example.com",
  "password": "newPassword123",
  "currentPassword": "currentPassword123"
}
```

**Fields**:
- `name` (optional) - Update display name
- `email` (optional) - Update email (requires re-verification)
- `password` (optional) - New password (requires `currentPassword`)
- `currentPassword` (required if changing password) - Current password for verification

**Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully. A verification email has been sent to your new email address.",
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "newemail@example.com",
      "name": "Jane Doe",
      "emailVerified": false,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-20T14:22:00.000Z"
    }
  }
}
```

**Notes**:
- Changing email sets `emailVerified` to false
- Changing password logs out all devices
- Email format is validated
- Password must be at least 8 characters

#### Delete Account
```http
DELETE /user/delete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "currentPassword123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Account deleted successfully."
}
```

**Note**: 
- Requires password confirmation
- Permanently deletes user and all associated data (cascade delete)
- Clears refresh token cookie

---

### Warehouses

#### Create Warehouse
```http
POST /warehouses
Authorization: Bearer <token>

{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "123 Storage St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postalCode": "400001"
}
```

#### Get All Warehouses (for user)
```http
GET /warehouses
Authorization: Bearer <token>
```

**Returns**: All warehouses accessible by the user (OWNER sees all, others see only their memberships)

#### Get Warehouse Details
```http
GET /warehouses/:warehouseId
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

#### Update Warehouse
```http
PUT /warehouses/:warehouseId
Authorization: Bearer <token>

{
  "name": "Updated Warehouse Name",
  "isActive": true
}
```

**Permission**: Warehouse MANAGER or OWNER

#### Delete Warehouse
```http
DELETE /warehouses/:warehouseId
Authorization: Bearer <token>
```

**Permission**: Warehouse MANAGER or OWNER  
**Note**: Cascade deletes all members, locations, products, stock levels, and movements

### Warehouse Members

**Member Invitation Flow**:
1. System OWNER creates their account with role "owner"
2. OWNER creates a warehouse
3. OWNER invites users by adding them as members with specific roles (MANAGER or STAFF)
4. Members can only access warehouses they're explicitly added to
5. System OWNER has automatic access to all warehouses

#### Get Members
```http
GET /warehouses/:warehouseId/members
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "member_id",
        "warehouseId": "warehouse_id",
        "userId": "user_id",
        "role": "MANAGER",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z",
        "user": {
          "id": "user_id",
          "email": "manager@example.com",
          "name": "John Manager",
          "role": "MANAGER"
        }
      }
    ]
  }
}
```

#### Add Member
```http
POST /warehouses/:warehouseId/members
Authorization: Bearer <token>

{
  "userId": "user_id_here",
  "role": "STAFF"  // or "MANAGER"
}
```

**Permission**: Warehouse MANAGER or OWNER

**Response (201)**:
```json
{
  "success": true,
  "message": "Member added successfully.",
  "data": {
    "member": {
      "id": "member_id",
      "warehouseId": "warehouse_id",
      "userId": "user_id",
      "role": "STAFF",
      "createdAt": "2025-01-20T14:30:00.000Z",
      "updatedAt": "2025-01-20T14:30:00.000Z",
      "user": {
        "id": "user_id",
        "email": "staff@example.com",
        "name": "Jane Staff"
      }
    }
  }
}
```

**Notes**:
- User must already be registered in the system
- User cannot be added twice to the same warehouse
- MANAGER role allows full warehouse management
- STAFF role allows only stock operations

#### Update Member Role
```http
PUT /warehouses/:warehouseId/members/:userId
Authorization: Bearer <token>

{
  "role": "MANAGER"
}
```

**Permission**: Warehouse MANAGER or OWNER

#### Remove Member
```http
DELETE /warehouses/:warehouseId/members/:userId
Authorization: Bearer <token>
```

**Permission**: Warehouse MANAGER or OWNER

### Locations

#### Get Locations
```http
GET /warehouses/:warehouseId/locations
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

#### Create Location
```http
POST /warehouses/:warehouseId/locations
Authorization: Bearer <token>

{
  "name": "Main Storage",
  "code": "A1",
  "aisle": "A",
  "rack": "1",
  "shelf": "2",
  "bin": "B"
}
```

**Permission**: Warehouse MANAGER or OWNER

#### Update Location
```http
PUT /warehouses/:warehouseId/locations/:locationId
Authorization: Bearer <token>

{
  "name": "Updated Location",
  "isActive": true
}
```

**Permission**: Warehouse MANAGER or OWNER

#### Delete Location
```http
DELETE /warehouses/:warehouseId/locations/:locationId
Authorization: Bearer <token>
```

**Permission**: Warehouse MANAGER or OWNER  
**Note**: Cannot delete locations with existing stock

### Products

#### Create Category
```http
POST /products/categories
Authorization: Bearer <token>

{
  "name": "Electronics",
  "description": "Electronic items"
}
```

#### Get All Categories
```http
GET /products/categories
Authorization: Bearer <token>
```

#### Get Category
```http
GET /products/categories/:categoryId
Authorization: Bearer <token>
```

#### Update Category
```http
PUT /products/categories/:categoryId
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "isActive": true
}
```

#### Delete Category
```http
DELETE /products/categories/:categoryId
Authorization: Bearer <token>
```

**Note**: Cannot delete categories with existing products

#### Create Product
```http
POST /products/warehouse/:warehouseId
Authorization: Bearer <token>

{
  "sku": "PROD001",
  "name": "Laptop",
  "description": "Dell Laptop",
  "categoryId": "category_id",
  "unitOfMeasure": "PIECE",
  "reorderLevel": 10
}
```

**Permission**: Warehouse MANAGER or OWNER

#### Get Products
```http
GET /products/warehouse/:warehouseId?search=laptop&categoryId=xyz&includeInactive=false
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

#### Get Product
```http
GET /products/:productId
Authorization: Bearer <token>
```

#### Get Product Stock Summary
```http
GET /products/:productId/stock-summary
Authorization: Bearer <token>
```

Returns total stock, low stock status, and stock by location

#### Update Product
```http
PUT /products/:productId
Authorization: Bearer <token>

{
  "name": "Updated Product",
  "reorderLevel": 15,
  "isActive": true
}
```

#### Delete Product (Soft Delete)
```http
DELETE /products/:productId
Authorization: Bearer <token>
```

Sets `isActive` to false, doesn't delete data

#### Get Low Stock Products
```http
GET /products/warehouse/:warehouseId/low-stock
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

Returns all products where total stock ≤ reorder level

### Stock Management

#### Receive Stock
```http
POST /stocks/warehouse/:warehouseId/receive
Authorization: Bearer <token>

{
  "productId": "product_id",
  "locationId": "location_id",
  "quantity": 100,
  "reference": "PO-12345",
  "notes": "Purchase order delivery"
}
```

**Permission**: Warehouse member (any role) or OWNER  
**Effect**: Adds stock and creates RECEIPT movement

#### Deliver Stock
```http
POST /stocks/warehouse/:warehouseId/deliver
Authorization: Bearer <token>

{
  "productId": "product_id",
  "locationId": "location_id",
  "quantity": 50,
  "reference": "SO-67890",
  "notes": "Sales order fulfillment"
}
```

**Permission**: Warehouse member (any role) or OWNER  
**Effect**: Removes stock and creates DELIVERY movement

#### Adjust Stock
```http
POST /stocks/adjust
Authorization: Bearer <token>

{
  "productId": "product_id",
  "locationId": "location_id",
  "newQuantity": 75,
  "reference": "ADJ-001",
  "notes": "Physical count adjustment"
}
```

**Permission**: Warehouse member (any role) or OWNER  
**Effect**: Sets stock to exact quantity and creates ADJUSTMENT movement

#### Transfer Stock Between Locations
```http
POST /stocks/transfer
Authorization: Bearer <token>

{
  "productId": "product_id",
  "fromLocationId": "location_a",
  "toLocationId": "location_b",
  "quantity": 25,
  "reference": "TRF-001",
  "notes": "Reorganization"
}
```

**Permission**: Warehouse member (any role) or OWNER  
**Effect**: Creates TRANSFER_OUT and TRANSFER_IN movements  
**Note**: Both locations must be in the same warehouse

#### Get Stock Levels
```http
GET /stocks/warehouse/:warehouseId/levels?productId=xyz&locationId=abc&includeZero=false
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

Returns current stock quantities by product and location

#### Get Stock Movements (History)
```http
GET /stocks/warehouse/:warehouseId/movements?productId=xyz&type=RECEIPT&startDate=2025-01-01&limit=50
Authorization: Bearer <token>
```

**Query Parameters**:
- `productId` - Filter by product
- `locationId` - Filter by location
- `userId` - Filter by user who made the movement
- `type` - Filter by movement type (RECEIPT, DELIVERY, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `limit` - Max results (default 100)
- `offset` - Pagination offset

**Permission**: Warehouse member (any role) or OWNER

#### Get Low Stock Alerts
```http
GET /stocks/warehouse/:warehouseId/alerts
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

Returns products where total stock ≤ reorder level with detailed breakdown

#### Get Warehouse Stock Summary
```http
GET /stocks/warehouse/:warehouseId/summary
Authorization: Bearer <token>
```

**Permission**: Warehouse member (any role) or OWNER

Returns overview statistics and recent movements

## Inventory Transaction Flow

All stock changes follow a transactional pattern:

1. **Validation** - Verify product, location, and warehouse relationships
2. **Stock Calculation** - Calculate new quantity (prevent negatives)
3. **Stock Level Update** - Update or create StockLevel record
4. **Movement Logging** - Create StockMovement audit record
5. **Transaction Commit** - All operations succeed or all fail

### Stock Change Pattern

```typescript
await applyStockChange({
  productId: "prod_123",
  warehouseId: "wh_456",
  locationId: "loc_789",
  quantityDelta: 50,  // positive = add, negative = remove
  movementType: "RECEIPT",
  reference: "PO-12345",
  userId: "user_abc"
});
```

### Transaction Safety

- All stock operations use Prisma transactions
- Negative stock is prevented
- Foreign key relationships are validated
- Movement history is immutable
- Cascade deletes maintain referential integrity

## Database Schema Overview

### Core Models

- **Warehouse** - Physical warehouse locations
- **WarehouseMember** - User-to-warehouse role assignments
- **Location** - Storage locations within warehouses
- **ProductCategory** - Optional product categorization
- **Product** - Product definitions with SKU
- **StockLevel** - Current stock quantities (product + location)
- **StockMovement** - Immutable audit log of all stock changes

### Enums

- **UserRole**: OWNER, MANAGER, STAFF
- **WarehouseMemberRole**: MANAGER, STAFF
- **UnitOfMeasure**: PIECE, KG, GRAM, LITER, ML, METER, CM, BOX, PACK
- **StockMovementType**: RECEIPT, DELIVERY, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT

## Security Features

### Authentication
- **JWT Access Tokens** - Short-lived (15 minutes) for API requests
- **Refresh Token Rotation** - Long-lived tokens (30 days) with automatic rotation
- **HTTP-Only Cookies** - Refresh tokens stored securely in cookies
- **Email Verification** - Required before login
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&_)

### Authorization
- **Role-Based Access Control (RBAC)** - System-wide user roles
- **Warehouse-Level Permissions** - Granular access per warehouse
- **Member Validation** - Users can only access warehouses they belong to
- **Owner Bypass** - System owners have access to all resources

### Data Protection
- **Password Hashing** - Bcrypt with salt
- **Token Signing** - HMAC SHA-256
- **Cascade Deletes** - Proper cleanup of related data
- **Transaction Safety** - Stock operations use database transactions
- **Rate Limiting** - 100 requests/15min general, 20 requests/15min auth
- **Input Validation** - Zod schema validation on all inputs

### Session Management
- **Device Tracking** - Track user sessions by device
- **Session Revocation** - Logout invalidates refresh tokens
- **Password Change** - Revokes all sessions
- **Multi-Device Support** - Users can be logged in on multiple devices

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request / validation error
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `429` - Too many requests (rate limited)
- `500` - Internal server error

## Development

### Generate Prisma Client

After schema changes:
```bash
npx prisma generate
```

### Create Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### View Database

```bash
npx prisma studio
```

## Quick Reference

### Common Operations

**1. Register as Owner**
```bash
POST /auth/register
{
  "email": "owner@company.com",
  "password": "SecurePass123!",
  "name": "Owner Name",
  "role": "owner"
}
```

**2. Verify Email & Login**
```bash
GET /auth/verify-email?token=xxx&email=owner@company.com
POST /auth/login { "email": "owner@company.com", "password": "SecurePass123!" }
```

**3. Create Warehouse**
```bash
POST /warehouses
Authorization: Bearer <token>
{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "123 St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postalCode": "400001"
}
```

**4. Add Warehouse Member**
```bash
# First, user registers
POST /auth/register { "email": "staff@company.com", ... }

# Then add to warehouse
POST /warehouses/:warehouseId/members
{ "userId": "user_id", "role": "STAFF" }
```

**5. Create Product**
```bash
POST /products/warehouse/:warehouseId
{
  "sku": "PROD001",
  "name": "Product Name",
  "unitOfMeasure": "PIECE",
  "reorderLevel": 10
}
```

**6. Receive Stock**
```bash
POST /stocks/warehouse/:warehouseId/receive
{
  "productId": "product_id",
  "locationId": "location_id",
  "quantity": 100,
  "reference": "PO-001"
}
```

### Key Endpoints by Role

**Anyone (Unauthenticated)**:
- POST `/auth/register` - Create account
- POST `/auth/login` - Login
- GET `/auth/verify-email` - Verify email

**All Authenticated Users**:
- GET `/user/me` - Get profile
- PUT `/user/update` - Update profile
- POST `/auth/logout` - Logout

**OWNER (System-wide)**:
- All endpoints without restrictions
- GET `/warehouses` - See ALL warehouses

**MANAGER (Warehouse-level)**:
- POST `/warehouses/:id/members` - Add members
- POST `/warehouses/:id/locations` - Create locations
- POST `/products/warehouse/:id` - Create products
- All stock operations

**STAFF (Warehouse-level)**:
- GET `/warehouses/:id` - View warehouse
- POST `/stocks/warehouse/:id/receive` - Receive stock
- POST `/stocks/warehouse/:id/deliver` - Deliver stock
- POST `/stocks/adjust` - Adjust stock
- POST `/stocks/transfer` - Transfer stock

## License

Private project - All rights reserved
