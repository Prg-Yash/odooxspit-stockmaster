# 🧪 Testing Quick Reference Card

## One-Time Setup
```bash
# 1. Create test database
createdb stockmaster_test

# 2. Add to .env file
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/stockmaster_test

# 3. Run migrations on test DB
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy

# 4. Seed test data
npm run seed
```

## Daily Usage
```bash
# Run all tests
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# Visual UI
npm run test:ui

# With coverage report
npm run test:coverage
```

## Test Credentials
```
Owner:   owner@test.com   / Owner@123
Manager: manager@test.com / Manager@123  
Staff:   staff@test.com   / Staff@123
```

## File Structure
```
tests/
├── setup/              # Test utilities
│   ├── test-env.ts    # Env config
│   ├── test-db.ts     # DB setup
│   ├── seed.ts        # Test data
│   └── auth-helper.ts # Auth utils
└── modules/           # Test suites
    ├── auth.test.ts
    ├── warehouse.test.ts
    ├── vendors.test.ts
    ├── products.test.ts
    ├── stock.test.ts
    ├── receipts.test.ts
    ├── deliveries.test.ts
    └── move-history.test.ts
```

## Quick Commands

### Run specific test file
```bash
npx vitest run tests/modules/auth.test.ts
```

### Run specific test
```bash
npx vitest run -t "should create warehouse"
```

### Debug single test
```bash
npx vitest run --reporter=verbose tests/modules/auth.test.ts
```

### Reseed database
```bash
npm run seed
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check PostgreSQL is running |
| Database not found | Create test database |
| Tests timeout | Increase timeout in vitest.config.ts |
| Permission denied | Verify DB user permissions |
| Stale data | Run `npm run seed` |

## Test Pattern Example
```typescript
describe('Module Name', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    seededData = await seedTestDatabase();
    ownerToken = (await getOwnerTokens(app)).accessToken;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should do something', async () => {
    const response = await request(app)
      .post('/endpoint')
      .set(authHeader(ownerToken))
      .send({ data: 'value' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Test Coverage
- ✅ Auth (12+ tests)
- ✅ Warehouse (15+ tests)  
- ✅ Vendors (10+ tests)
- ✅ Products (18+ tests)
- ✅ Stock (15+ tests)
- ✅ Receipts (12+ tests)
- ✅ Deliveries (12+ tests)
- ✅ Move History (15+ tests)

**Total: 100+ tests**

## Documentation
- 📖 README.md - Full API & testing docs
- 📘 TESTING.md - Comprehensive guide
- 📝 TEST_IMPLEMENTATION_SUMMARY.md - Implementation details

## Support Files
- ✅ vitest.config.ts - Vitest configuration
- ✅ .env.example - Environment template
- ✅ package.json - Test scripts

---

💡 **Tip**: Keep tests running in watch mode while developing!

🚀 **Ready to test?** Run `npm test` to start!
