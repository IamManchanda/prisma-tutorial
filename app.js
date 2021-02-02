const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { body, validationResult } = require("express-validator");

const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const userValidationRules = [
  body("email")
    .isLength({ min: 1 })
    .withMessage("Email must be not empty")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("name").isLength({ min: 1 }).withMessage("Name must be not empty"),
  body("role")
    .isIn(["USER", "ADMIN", "SUPERADMIN", undefined])
    .withMessage("Role must be one of 'USER', 'ADMIN', or 'SUPERADMIN'"),
];

const simpleValidationResult = validationResult.withDefaults({
  formatter: (error) => error.msg,
});

const checkForErrors = (req, res, next) => {
  const errors = simpleValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }
  next();
};

app.post(
  "/users",
  userValidationRules,
  checkForErrors,
  async function createUser(req, res) {
    const { name, email, role } = req.body;

    try {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          email: "Email already exists",
        });
      }

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
  },
);

app.get("/users", async function readUsers(_req, res) {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

app.put(
  "/users/:uuid",
  userValidationRules,
  checkForErrors,
  async function updateUser(req, res) {
    const { name, email, role } = req.body;
    const { uuid } = req.params;

    try {
      let user = await prisma.user.findFirst({
        where: { uuid },
      });

      if (!user) {
        return res.status(404).json({
          user: "User not found",
        });
      }

      user = await prisma.user.update({
        where: { uuid },
        data: { name, email, role },
      });

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  },
);

app.listen(port, function bootApp() {
  console.log(`Server running on port ${port}`);
});
