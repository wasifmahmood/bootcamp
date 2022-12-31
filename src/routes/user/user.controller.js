const express = require("express");
const authHandler = require("../../middleware/auth");
const errorHandler = require("../../middleware/error");
const User = require("../../models/user");
const { generateAuthToken } = require("../../utils/helpers");
const createUserSchema = require("./validationSchema");

const router = express.Router();

// create a get route

router.get(
  "/",
  errorHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).send(users);
  })
);

// create a get one by id route

router.get(
  "/:userId",
  errorHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.userId });

    res.status(200).send(user);
  })
);

//update the user

router.put("/:userId", authHandler, async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  try {
    res.status(200).json({
      status: "Success",
      data: {
        updatedUser,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// create a login route

router.post("/login", authHandler, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send({ message: "Invalid Email or Password" });
  }

  if (req.body.password !== user.password) {
    return res.status(400).send({ message: "Invalid Email or Password" });
  }

  const token = generateAuthToken({
    username: user.username,
    email: user.email,
    id: user._id,
  });

  res.status(200).send({ message: "success", token });
});

// create a get signup route

router.post("/signup", authHandler, async (req, res) => {
  const payload = req.body;

  const { error } = User(payload);

  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  let user = new User(payload);
  user = await user.save();
  res.status(200).send({ user });
});

router.post("/", authHandler, async (req, res) => {
  const payload = req.body;
  const { error } = createUserSchema(payload);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }
  let user = new User(payload);

  user = await user.save();
  res.status(200).send({ user });
});

//delete a user
// now create a delete route

router.delete("/:userId", authHandler, async (req, res) => {
  const id = req.params.userId;
  await User.findByIdAndRemove(id).exec();
  res.send("User Deleted");
});

module.exports = router;
