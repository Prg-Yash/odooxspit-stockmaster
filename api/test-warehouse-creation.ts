/**
 * Test Warehouse Creation API
 * Run with: npx tsx test-warehouse-creation.ts
 */

// Get access token from login
const loginResponse = await fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'yashnimse42@gmail.com',
    password: 'NewSecurePassword123!'
  })
});

const loginData = await loginResponse.json() as any;
console.log('Login response:', JSON.stringify(loginData, null, 2));

if (!loginData.success) {
  console.error('Login failed!');
  process.exit(1);
}

const accessToken = loginData.data.accessToken;
console.log('\n✅ Login successful!');
console.log('Access Token:', accessToken.substring(0, 50) + '...');

// Create warehouse
console.log('\n🏭 Creating warehouse...');
const createResponse = await fetch('http://localhost:4000/warehouses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    name: 'Test Warehouse',
    code: `WH-TEST-${Date.now()}`,
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001'
  })
});

const createData = await createResponse.json() as any;
console.log('Create warehouse response status:', createResponse.status);
console.log('Create warehouse response:', JSON.stringify(createData, null, 2));

if (!createData.success) {
  console.error('❌ Warehouse creation failed!');
  console.error('Error details:', createData);
  process.exit(1);
}

console.log('\n✅ Warehouse created successfully!');
const warehouseId = createData.data.warehouse.id;
console.log('Warehouse ID:', warehouseId);

// Add manager
console.log('\n👤 Adding manager...');
const addMemberResponse = await fetch(`http://localhost:4000/warehouses/${warehouseId}/members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    userId: 'cmi9vntih0000acv5ig1zvom2', // yashnimse92@gmail.com
    role: 'MANAGER'
  })
});

const addMemberData = await addMemberResponse.json() as any;
console.log('Add member response:', JSON.stringify(addMemberData, null, 2));

if (!addMemberData.success) {
  console.error('❌ Adding manager failed!');
  process.exit(1);
}

console.log('\n✅ Manager added successfully!');

// Get warehouse details
console.log('\n📋 Fetching warehouse details...');
const getResponse = await fetch(`http://localhost:4000/warehouses/${warehouseId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const getData = await getResponse.json() as any;
console.log('Warehouse details:', JSON.stringify(getData, null, 2));

console.log('\n🎉 All tests passed!');
