# OTP Password Reset - Quick Start Guide

## 🚀 Setup Instructions

### 1. Database Migration (Already Completed ✅)

The database has been migrated with the new `PasswordResetOTP` table.

### 2. Configure SMTP Email Settings

Update your `.env` file with your SMTP credentials:

```env
# SMTP Configuration (REQUIRED for OTP emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"        # Your Gmail address
SMTP_PASS="xxxx xxxx xxxx xxxx"         # Gmail App Password (16 characters)
FROM_EMAIL="noreply@yourapp.com"
FROM_NAME="StockMaster"
```

### 3. Gmail App Password Setup (if using Gmail)

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** (search for "App passwords")
4. Select:
   - App: **Mail**
   - Device: **Other** (enter "StockMaster API")
5. Click **Generate**
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. Paste it as `SMTP_PASS` in your `.env` file

### 4. Start the Server

```bash
npm run dev
```

Server will run on: `http://localhost:4000`

---

## 📧 Testing the OTP Flow

### Method 1: Using cURL (Command Line)

#### Step 1: Request OTP

```bash
curl -X POST http://localhost:4000/auth/request-password-reset-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-test-email@example.com\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "If an account with that email exists, an OTP has been sent to your email."
}
```

**Check your email** for a 6-digit OTP code (e.g., `123456`)

---

#### Step 2: Verify OTP

```bash
curl -X POST http://localhost:4000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-test-email@example.com\",\"otp\":\"123456\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "data": {
    "resetToken": "abc123def456789..."
  }
}
```

**Save the `resetToken`** from the response!

---

#### Step 3: Reset Password

```bash
curl -X POST http://localhost:4000/auth/reset-password-otp \
  -H "Content-Type: application/json" \
  -d "{\"resetToken\":\"YOUR_RESET_TOKEN_HERE\",\"email\":\"your-test-email@example.com\",\"newPassword\":\"NewPassword123!\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password."
}
```

---

### Method 2: Using Postman or Thunder Client

#### Request 1: Request OTP

- **Method:** POST
- **URL:** `http://localhost:4000/auth/request-password-reset-otp`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "email": "your-test-email@example.com"
}
```

#### Request 2: Verify OTP

- **Method:** POST
- **URL:** `http://localhost:4000/auth/verify-otp`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "email": "your-test-email@example.com",
  "otp": "123456"
}
```

#### Request 3: Reset Password

- **Method:** POST
- **URL:** `http://localhost:4000/auth/reset-password-otp`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "resetToken": "paste-reset-token-from-step-2",
  "email": "your-test-email@example.com",
  "newPassword": "NewSecurePassword123!"
}
```

---

## 🔧 Configuration Options

Adjust these in your `.env` file:

```env
OTP_EXPIRY_MINUTES=10          # OTP valid for 10 minutes
OTP_MAX_ATTEMPTS=5             # 5 attempts to enter correct OTP
OTP_COOLDOWN_SECONDS=60        # 60 seconds before requesting new OTP
```

---

## 🎯 API Endpoints Summary

| Endpoint                           | Method | Purpose                          |
| ---------------------------------- | ------ | -------------------------------- |
| `/auth/request-password-reset-otp` | POST   | Request 6-digit OTP via email    |
| `/auth/verify-otp`                 | POST   | Verify OTP and get reset token   |
| `/auth/reset-password-otp`         | POST   | Reset password using reset token |

---

## ⚠️ Common Issues & Solutions

### ❌ "Email not sent"

**Problem:** SMTP credentials not configured

**Solution:**

1. Check `.env` has correct SMTP settings
2. Use Gmail App Password (not your Gmail account password)
3. Verify SMTP_HOST and SMTP_PORT are correct

---

### ❌ "OTP has expired"

**Problem:** Waited more than 10 minutes

**Solution:**

- Request a new OTP using `/auth/request-password-reset-otp`

---

### ❌ "Maximum verification attempts exceeded"

**Problem:** Entered wrong OTP 5 times

**Solution:**

- Request a new OTP (wait 60 seconds cooldown first)

---

### ❌ "Please wait X seconds before requesting a new OTP"

**Problem:** Rate limiting active

**Solution:**

- Wait for the cooldown period (default 60 seconds)

---

## 📝 Creating a Test User

If you don't have a test user yet, register one first:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"test@example.com\",
    \"password\":\"TestPassword123!\",
    \"name\":\"Test User\",
    \"role\":\"staff\"
  }"
```

Then verify the email through the verification link sent to your inbox.

---

## 🎨 Email Template Preview

The OTP email sent to users looks like:

```
┌─────────────────────────────────┐
│  Password Reset OTP             │
├─────────────────────────────────┤
│                                 │
│  Your Password Reset Code       │
│                                 │
│  ┌─────────────────────────┐   │
│  │      1 2 3 4 5 6        │   │
│  └─────────────────────────┘   │
│                                 │
│  ℹ️ Instructions:               │
│  1. Enter this code             │
│  2. Valid for 10 minutes        │
│  3. Max 5 attempts              │
│                                 │
│  ⚠️ Security Notice:             │
│  If you didn't request this,    │
│  ignore this email.             │
└─────────────────────────────────┘
```

---

## 📚 Next Steps

1. ✅ Configure SMTP settings in `.env`
2. ✅ Start the server with `npm run dev`
3. ✅ Test OTP flow with your email
4. 🔜 Integrate with your frontend application
5. 🔜 Customize email templates (optional)

For detailed documentation, see: `OTP_PASSWORD_RESET.md`

---

## 🆘 Need Help?

- Check server logs for detailed error messages
- Verify database is running: `postgresql://localhost:5432/auth_api`
- Ensure all dependencies are installed: `npm install`
- Read the full documentation: `OTP_PASSWORD_RESET.md`

**Happy coding! 🚀**
