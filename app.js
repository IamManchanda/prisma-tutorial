// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  const posts = await prisma.posts.findMany();

  console.log({ users, posts });
}

main();
