const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo fixtures must not be seeded in production.");
  }
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    console.log("No demo records were created. Set ALLOW_DEMO_SEED=true in development to load fixtures.");
    return;
  }
  const demoSeller = await prisma.seller.create({
    data: { name: "Demo Kulturex Seller", country: "Ghana", category: "Crafts", verified: false },
  });
  await prisma.listing.create({
    data: {
      title: "Demonstration Ankara Fabric", description: "Development-only demonstration product.",
      origin: "Ghana", category: "Fashion", price: 12.5, priceMinor: 1250, stock: 2,
      seller: demoSeller.name, sellerId: demoSeller.id, status: "DEMO_ONLY",
    },
  });
  console.log("Development-only, non-public demo records created.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
