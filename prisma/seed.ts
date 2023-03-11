import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testUserId = "c00p6qup20000ckkzslahp5pn";
  const firstPostId = "5c03994c-fc16-47e0-bd02-d218a370a078";

  await prisma.user.upsert({
    where: {
      id: testUserId,
    },
    create: {
      id: testUserId,
      name: "Test User",
      username: "testuser",
    },
    update: {},
  });
  await prisma.topic.createMany({
    data: [
      { name: "Oncology" },
      { name: "Neurology" },
      { name: "Dermatology" },
      { name: "Orthodontology" },
      { name: "Anesthesiology" },
      { name: "Cardiology" },
      { name: "Dentistry" },
      { name: "Traumatology" },
      { name: "Pharmacy" },
      { name: "Primary Cares" },
    ],
    skipDuplicates: true,
  });
  await prisma.room.upsert({
    where: {
      id: firstPostId,
    },
    create: {
      id: firstPostId,
      title: "How is cancer pain managed?",
      description:
        "I know that for a tumor that causes pain, removing or destroying all or part of the tumor with chemotherapy or radiation can help. But what medicine should be taken?",
      userId: testUserId,
    },
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
