const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  await prisma.listing.createMany({ data: [
    { title:"Premium Jollof Rice Spice", origin:"Nigeria", category:"Foodstuff", price:8, seller:"Kulturex Foods" },
    { title:"Handmade Ankara Tote Bag", origin:"Ghana", category:"Fashion", price:35, seller:"Accra Craft Studio" },
    { title:"Online Yoruba Language Session", origin:"Nigeria", category:"Service", price:25, seller:"Culture Tutor" }
  ]});
  await prisma.seller.createMany({ data: [
    { name:"Kulturex Foods", country:"Nigeria", category:"Foodstuff", verified:true },
    { name:"Accra Craft Studio", country:"Ghana", category:"Fashion", verified:true },
    { name:"Culture Tutor", country:"Nigeria", category:"Education", verified:false }
  ]});
  console.log("Kulturex Connect seed complete.");
}
main().catch((e)=>{ console.error(e); process.exit(1); }).finally(async()=>{ await prisma.$disconnect(); });
