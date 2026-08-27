import "dotenv/config";
import { prisma } from "../src/infra/prisma";

async function main() {
  console.log("Seeding... (not implemented yet)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
