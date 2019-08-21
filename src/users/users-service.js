const REGEX_UPPER_LOWER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const bcrypt = require("bcryptjs");
const xss = require("xss");

const UsersService = {
  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password length must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password Cannot Start or End with a space";
    }
    if (!REGEX_UPPER_LOWER_SPECIAL.test(password)) {
      return "Password must have at least one uppercase character, lowercase character, number, and special character";
    }
    return null;
  },

  hasUserWithUserName(db, user_name) {
    return db("users")
      .where({ user_name })
      .first()
      .then(user => !!user);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("users")
      .returning("*")
      .then(([user]) => user);
  },
  hasUserWithSameEmail(db, user_email) {
    return db("users")
      .where({ user_email })
      .first()
      .then(email => !!email);
  },
  serializeUser(user) {
    return {
      id: user.id,
      first_name: xss(user.first_name),
      last_name: xss(user.last_name),
      user_name: xss(user.user_name),
      password: xss(user.password),
      user_email: xss(user.user_email)
    };
  }
};

module.exports = UsersService;
