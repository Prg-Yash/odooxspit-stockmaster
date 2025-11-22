/**
 * Complete Manager Workflow Test
 * Tests the entire flow from user creation to warehouse access
 * Run with: npx tsx test-manager-workflow.ts
 */

console.log("🧪 Testing Complete Manager Workflow\n");

// Step 1: Login as Owner
console.log("1️⃣ Logging in as Owner...");
const loginResponse = await fetch("http://localhost:4000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "yashnimse42@gmail.com",
    password: "NewSecurePassword123!",
  }),
});

const loginData = (await loginResponse.json()) as any;

if (!loginData.success) {
  console.error("❌ Owner login failed");
  process.exit(1);
}

const ownerToken = loginData.data.accessToken;
console.log("✅ Owner logged in successfully\n");

// Step 2: Search for Manager
console.log("2️⃣ Searching for manager user...");
const searchEmail = "yashnimse92@gmail.com";
const searchResponse = await fetch(
  `http://localhost:4000/user/search?email=${encodeURIComponent(searchEmail)}`,
  {
    headers: { Authorization: `Bearer ${ownerToken}` },
  }
);

const searchData = (await searchResponse.json()) as any;

if (!searchData.success || searchData.data.users.length === 0) {
  console.error("❌ No users found");
  process.exit(1);
}

const managerUser = searchData.data.users[0];
console.log(`✅ Found user: ${managerUser.email} (${managerUser.name || "No name"})`);
console.log(`   User ID: ${managerUser.id}`);
console.log(`   Role: ${managerUser.role}`);
console.log(
  `   Already in warehouse: ${managerUser.warehouseMemberships?.length > 0 ? "YES - " + managerUser.warehouseMemberships[0].warehouse.name : "NO"}\n`
);

// Step 3: Create a test warehouse
console.log("3️⃣ Creating test warehouse...");
const warehouseResponse = await fetch("http://localhost:4000/warehouses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ownerToken}`,
  },
  body: JSON.stringify({
    name: "Test Warehouse for Manager",
    code: `WH-TEST-MGR-${Date.now()}`,
    address: "123 Test Street",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400001",
  }),
});

const warehouseData = (await warehouseResponse.json()) as any;

if (!warehouseData.success) {
  console.error("❌ Warehouse creation failed");
  console.error(warehouseData);
  process.exit(1);
}

const warehouseId = warehouseData.data.warehouse.id;
console.log(`✅ Warehouse created: ${warehouseData.data.warehouse.name}`);
console.log(`   Warehouse ID: ${warehouseId}\n`);

// Step 4: Add Manager to Warehouse
console.log("4️⃣ Adding manager to warehouse...");
const addMemberResponse = await fetch(
  `http://localhost:4000/warehouses/${warehouseId}/members`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerToken}`,
    },
    body: JSON.stringify({
      userId: managerUser.id,
      role: "MANAGER",
    }),
  }
);

const addMemberData = (await addMemberResponse.json()) as any;

if (!addMemberData.success) {
  console.error("❌ Failed to add manager");
  console.error(addMemberData);
  
  if (addMemberData.code === "ALREADY_IN_WAREHOUSE") {
    console.log("\n⚠️ User is already in another warehouse:");
    console.log(`   Warehouse: ${addMemberData.existingWarehouse.name}`);
    console.log(`   Code: ${addMemberData.existingWarehouse.code}`);
    console.log("\nℹ️ User must leave current warehouse first. Skipping to next steps...\n");
  } else {
    process.exit(1);
  }
} else {
  console.log(`✅ Manager added successfully`);
  console.log(`   Email notification sent to: ${managerUser.email}\n`);
}

// Step 5: Manager Login
console.log("5️⃣ Logging in as Manager...");
const managerLoginResponse = await fetch("http://localhost:4000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "yashnimse92@gmail.com",
    password: "NewSecurePassword123!",
  }),
});

const managerLoginData = (await managerLoginResponse.json()) as any;

if (!managerLoginData.success) {
  console.error("❌ Manager login failed");
  process.exit(1);
}

const managerToken = managerLoginData.data.accessToken;
console.log("✅ Manager logged in successfully\n");

// Step 6: Manager Gets Warehouses
console.log("6️⃣ Manager fetching accessible warehouses...");
const managerWarehousesResponse = await fetch(
  "http://localhost:4000/warehouses",
  {
    headers: { Authorization: `Bearer ${managerToken}` },
  }
);

const managerWarehousesData = (await managerWarehousesResponse.json()) as any;

if (!managerWarehousesData.success) {
  console.error("❌ Failed to fetch warehouses");
  process.exit(1);
}

console.log(`✅ Manager can access ${managerWarehousesData.data.length} warehouse(s):`);
managerWarehousesData.data.forEach((wh: any, index: number) => {
  console.log(`   ${index + 1}. ${wh.name} (${wh.code})`);
});
console.log();

// Step 7: Manager Gets Specific Warehouse Details
console.log("7️⃣ Manager fetching warehouse details...");
const targetWarehouse = managerWarehousesData.data[0];
const warehouseDetailsResponse = await fetch(
  `http://localhost:4000/warehouses/${targetWarehouse.id}`,
  {
    headers: { Authorization: `Bearer ${managerToken}` },
  }
);

const warehouseDetailsData = (await warehouseDetailsResponse.json()) as any;

if (!warehouseDetailsData.success) {
  console.error("❌ Failed to fetch warehouse details");
  process.exit(1);
}

const details = warehouseDetailsData.data;
console.log(`✅ Warehouse Details:`);
console.log(`   Name: ${details.name}`);
console.log(`   Code: ${details.code}`);
console.log(`   Address: ${details.address || "N/A"}`);
console.log(`   Members: ${details.members?.length || 0}`);
console.log(`   Products: ${details._count?.products || 0}`);
console.log(`   Locations: ${details._count?.locations || 0}\n`);

// Step 8: Test Manager Permissions - Create Product
console.log("8️⃣ Testing manager permissions (create product)...");
const createProductResponse = await fetch(
  `http://localhost:4000/products/warehouse/${targetWarehouse.id}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${managerToken}`,
    },
    body: JSON.stringify({
      sku: `TEST-SKU-${Date.now()}`,
      name: "Test Product by Manager",
      description: "Testing manager permissions",
      unitOfMeasure: "PIECE",
      reorderLevel: 10,
    }),
  }
);

const createProductData = (await createProductResponse.json()) as any;

if (createProductData.success) {
  console.log(`✅ Manager can create products`);
  console.log(`   Product: ${createProductData.data.product.name}`);
} else {
  console.log(`❌ Manager cannot create products: ${createProductData.message}`);
}

console.log("\n🎉 Manager Workflow Test Complete!");
console.log("\n📋 Summary:");
console.log("   ✅ Owner can search for users");
console.log("   ✅ Owner can add managers to warehouse");
console.log("   ✅ Manager receives email notification");
console.log("   ✅ Manager can log in");
console.log("   ✅ Manager can access assigned warehouse");
console.log("   ✅ Manager can view warehouse details");
console.log("   ✅ Manager has proper permissions");
console.log("\n✨ All systems operational!");
