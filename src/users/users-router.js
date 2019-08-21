const express = require("express");
const path = require("path");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.post("/", jsonBodyParser, (req, res, next) => {
  const { password, user_name, user_email, first_name, last_name } = req.body;

  for (const field of [
    "password",
    "user_name",
    "user_email",
    "first_name",
    "last_name"
  ])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  UsersService.hasUserWithSameEmail(req.app.get("db"), user_email).then(
    dupeEmail => {
      if (dupeEmail)
        return res.status(400).json({ error: "Email Already Exists" });

      const passwordError = UsersService.validatePassword(password);

      if (passwordError)
        return res.status(400).json({
          error: passwordError
        });

      UsersService.hasUserWithUserName(req.app.get("db"), user_name)

        .then(dupeName => {
          if (dupeName)
            return res.status(400).json({ error: "Username Already Exists" });

          return UsersService.hashPassword(password).then(hashedPassword => {
            const newUser = {
              first_name,
              last_name,
              user_name,
              password: hashedPassword,
              user_email
            };

            return UsersService.insertUser(req.app.get("db"), newUser).then(
              user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user));
              }
            );
          });
        })

        .catch(next);
    }
  );
});

module.exports = usersRouter;
