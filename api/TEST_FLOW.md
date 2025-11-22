# API Testing Flow

This document provides a complete testing flow for the StockMaster API.

## Prerequisites

1. Server running on `http://localhost:4000`
2. Database migrated and running
3. SMTP configured for email verification

## Test Flow

### 1. Owner Registration & Setup

#### Step 1.1: Register Owner
```http
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "owner@stockmaster.in",
  "password": "SecurePass123!",
  "name": "System Owner",
  "role": "owner"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "userId": "cuid_xxx",
    "email": "owner@stockmaster.in",
    "name": "System Owner",
    "role": "OWNER"
  }
}
```

#### Step 1.2: Verify Email
Check email inbox for verification link, then:
```http
GET http://localhost:4000/auth/verify-email?token=VERIFICATION_TOKEN&email=owner@stockmaster.in
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

#### Step 1.3: Login as Owner
```http
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "owner@stockmaster.in",
  "password": "SecurePass123!"
}
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "cuid_xxx",
      "email": "owner@stockmaster.in",
      "name": "System Owner",
      "role": "OWNER",
      "emailVerified": true
    }
  }
}
```

**Save the `accessToken` for subsequent requests**

---

### 2. Warehouse Creation

#### Step 2.1: Create Main Warehouse
```http
POST http://localhost:4000/warehouses
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "123 Storage Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postalCode": "400001"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Warehouse created successfully.",
  "data": {
    "warehouse": {
      "id": "warehouse_id_xxx",
      "name": "Main Warehouse",
      "code": "WH001",
      ...
    }
  }
}
```

**Save the `warehouse.id` for subsequent requests**

#### Step 2.2: Get All Warehouses
```http
GET http://localhost:4000/warehouses
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected**: Owner sees all warehouses

---

### 3. Create Locations

#### Step 3.1: Create Location
```http
POST http://localhost:4000/warehouses/WAREHOUSE_ID/locations
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Main Storage",
  "code": "A1",
  "aisle": "A",
  "rack": "1",
  "shelf": "1",
  "bin": "A"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Location created successfully.",
  "data": {
    "location": {
      "id": "location_id_xxx",
      "name": "Main Storage",
      "code": "A1",
      ...
    }
  }
}
```

**Save the `location.id` for stock operations**

---

### 4. User Invitation Flow

#### Step 4.1: Register Manager User
```http
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "manager@stockmaster.in",
  "password": "ManagerPass123!",
  "name": "Warehouse Manager",
  "role": "manager"
}
```

#### Step 4.2: Verify Manager Email
```http
GET http://localhost:4000/auth/verify-email?token=MANAGER_TOKEN&email=manager@stockmaster.in
```

#### Step 4.3: Add Manager to Warehouse (as Owner)
```http
POST http://localhost:4000/warehouses/WAREHOUSE_ID/members
Authorization: Bearer OWNER_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "manager_user_id",
  "role": "MANAGER"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Member added successfully.",
  "data": {
    "member": {
      "id": "member_id",
      "warehouseId": "warehouse_id",
      "userId": "manager_user_id",
      "role": "MANAGER",
      "user": {
        "id": "manager_user_id",
        "email": "manager@stockmaster.in",
        "name": "Warehouse Manager"
      }
    }
  }
}
```

#### Step 4.4: Manager Login
```http
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "manager@stockmaster.in",
  "password": "ManagerPass123!"
}
```

#### Step 4.5: Manager Gets Warehouses
```http
GET http://localhost:4000/warehouses
Authorization: Bearer MANAGER_ACCESS_TOKEN
```

**Expected**: Manager sees only warehouses they're members of

---

### 5. Staff Invitation Flow

#### Step 5.1: Register Staff User
```http
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "staff@stockmaster.in",
  "password": "StaffPass123!",
  "name": "Warehouse Staff",
  "role": "staff"
}
```

#### Step 5.2: Verify Staff Email
```http
GET http://localhost:4000/auth/verify-email?token=STAFF_TOKEN&email=staff@stockmaster.in
```

#### Step 5.3: Add Staff to Warehouse (as Manager)
```http
POST http://localhost:4000/warehouses/WAREHOUSE_ID/members
Authorization: Bearer MANAGER_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "staff_user_id",
  "role": "STAFF"
}
```

#### Step 5.4: Staff Login
```http
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "staff@stockmaster.in",
  "password": "StaffPass123!"
}
```

---

### 6. Product Management

#### Step 6.1: Create Product Category (as Manager)
```http
POST http://localhost:4000/products/categories
Authorization: Bearer MANAGER_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic items and components"
}
```

#### Step 6.2: Create Product (as Manager)
```http
POST http://localhost:4000/products/warehouse/WAREHOUSE_ID
Authorization: Bearer MANAGER_ACCESS_TOKEN
Content-Type: application/json

{
  "sku": "ELEC001",
  "name": "Laptop Dell XPS 15",
  "description": "Dell XPS 15 Laptop",
  "categoryId": "category_id_from_step_6.1",
  "unitOfMeasure": "PIECE",
  "reorderLevel": 5
}
```

**Save the `product.id` for stock operations**

---

### 7. Stock Operations

#### Step 7.1: Receive Stock (as Staff)
```http
POST http://localhost:4000/stocks/warehouse/WAREHOUSE_ID/receive
Authorization: Bearer STAFF_ACCESS_TOKEN
Content-Type: application/json

{
  "productId": "product_id_from_step_6.2",
  "locationId": "location_id_from_step_3.1",
  "quantity": 50,
  "reference": "PO-2025-001",
  "notes": "Initial stock delivery"
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Stock received successfully.",
  "data": {
    "stockLevel": {
      "id": "stock_level_id",
      "productId": "product_id",
      "locationId": "location_id",
      "quantity": 50
    },
    "movement": {
      "id": "movement_id",
      "type": "RECEIPT",
      "quantity": 50,
      "reference": "PO-2025-001"
    }
  }
}
```

#### Step 7.2: Deliver Stock (as Staff)
```http
POST http://localhost:4000/stocks/warehouse/WAREHOUSE_ID/deliver
Authorization: Bearer STAFF_ACCESS_TOKEN
Content-Type: application/json

{
  "productId": "product_id",
  "locationId": "location_id",
  "quantity": 10,
  "reference": "SO-2025-001",
  "notes": "Customer order delivery"
}
```

#### Step 7.3: Check Stock Levels
```http
GET http://localhost:4000/stocks/warehouse/WAREHOUSE_ID/levels
Authorization: Bearer STAFF_ACCESS_TOKEN
```

**Expected**: Shows current stock (40 after receiving 50 and delivering 10)

#### Step 7.4: View Stock Movement History
```http
GET http://localhost:4000/stocks/warehouse/WAREHOUSE_ID/movements
Authorization: Bearer STAFF_ACCESS_TOKEN
```

**Expected**: Shows all RECEIPT and DELIVERY movements

---

### 8. Permission Testing

#### Test 8.1: Staff Cannot Create Products
```http
POST http://localhost:4000/products/warehouse/WAREHOUSE_ID
Authorization: Bearer STAFF_ACCESS_TOKEN
Content-Type: application/json

{
  "sku": "TEST001",
  "name": "Test Product",
  "unitOfMeasure": "PIECE"
}
```

**Expected Response (403)**:
```json
{
  "success": false,
  "message": "Insufficient permissions. Warehouse manager role required."
}
```

#### Test 8.2: Staff Cannot Add Members
```http
POST http://localhost:4000/warehouses/WAREHOUSE_ID/members
Authorization: Bearer STAFF_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "some_user_id",
  "role": "STAFF"
}
```

**Expected Response (403)**: Permission denied

#### Test 8.3: Manager Can Add Members
```http
POST http://localhost:4000/warehouses/WAREHOUSE_ID/members
Authorization: Bearer MANAGER_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "new_user_id",
  "role": "STAFF"
}
```

**Expected Response (201)**: Success

---

## Validation Checklist

- [ ] Owner can register and login
- [ ] Email verification is required before login
- [ ] Owner can create warehouses
- [ ] Owner sees all warehouses
- [ ] Manager/Staff users can register
- [ ] Owner/Manager can add members to warehouse
- [ ] Manager sees only assigned warehouses
- [ ] Staff sees only assigned warehouses
- [ ] Manager can create products and locations
- [ ] Staff cannot create products or locations
- [ ] All roles can perform stock operations
- [ ] Stock movements are tracked correctly
- [ ] Permissions are enforced correctly
- [ ] Refresh token rotation works
- [ ] Password reset flow works
- [ ] User profile updates work

## Common Issues & Solutions

### Issue: "Email and password are required"
**Solution**: Ensure password meets requirements (8+ chars, uppercase, lowercase, number, special char)

### Issue: "Please verify your email before logging in"
**Solution**: Check email inbox and click verification link

### Issue: "Insufficient permissions"
**Solution**: Verify user role and warehouse membership

### Issue: "User not found" when adding member
**Solution**: User must register first before being added to warehouse

### Issue: "Invalid or expired access token"
**Solution**: Refresh the access token using the refresh token endpoint

## Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- System OWNER has automatic access to all warehouses
- Users must be registered before being added to warehouses
- Email verification is required before login
- Stock cannot go negative
- All stock operations are transactional
