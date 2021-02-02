import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const simpleValidationResult = validationResult.withDefaults({
  formatter: (error) => error.msg,
});

const checkForErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = simpleValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }
  next();
};

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

app.post(
  "/users",
  userValidationRules,
  checkForErrors,
  async function createUser(req: Request, res: Response) {
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

app.get("/users", async function readUsers(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      include: { posts: true },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

app.get("/users/:uuid", async function findUser(req: Request, res: Response) {
  const { uuid } = req.params;
  try {
    const user = await prisma.user.findFirst({
      where: { uuid },
    });

    if (!user) {
      return res.status(404).json({
        user: "User not found",
      });
    }

    return res.status(200).json(user);
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
  async function updateUser(req: Request, res: Response) {
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

app.delete(
  "/users/:uuid",
  async function deleteUser(req: Request, res: Response) {
    const { uuid } = req.params;
    try {
      const user = await prisma.user.findFirst({
        where: { uuid },
      });

      if (!user) {
        return res.status(404).json({
          user: "User not found",
        });
      }

      await prisma.user.delete({ where: { uuid } });
      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  },
);

const postValidationRules = [
  body("title").isLength({ min: 1 }).withMessage("Title must be not empty"),
];

app.post(
  "/posts",
  postValidationRules,
  checkForErrors,
  async function createPost(req: Request, res: Response) {
    const { title, body, userUuid } = req.body;
    try {
      const user = await prisma.user.findFirst({
        where: { uuid: userUuid },
      });

      if (!user) {
        return res.status(404).json({
          user: "User not found",
        });
      }

      const post = await prisma.post.create({
        data: { title, body, user: { connect: { uuid: userUuid } } },
      });
      return res.status(200).json(post);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  },
);

app.get("/posts", async function readPosts(_req: Request, res: Response) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return res.status(200).json(posts);
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
