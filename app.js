const { PrismaClient } = require("@prisma/client");
const express = require("express");

const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.post("/users", async function createUser(req, res) {
  const { name, email, role } = req.body;

  try {
    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

app.listen(port, function bootApp() {
  console.log(`Server running on port ${port}`);
});
