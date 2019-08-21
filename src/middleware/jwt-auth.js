const AuthService = require("../auth/auth-service");

function requireAuth(req, res, next) {
  const authToken = req.get("Authorization") || "";
  console.log("requireAuth");
  let bearerToken;
  if (!authToken.toLowerCase().startsWith("bearer ")) {
    console.log("Missing Bearer Token");
    return res.status(401).json({ error: "Missing bearer token" });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    console.log("verify JWT");
    const payload = AuthService.verifyJwt(bearerToken);
    AuthService.getUserWithUserName(req.app.get("db"), payload.sub)
      .then(user => {
        if (!user) {
          console.log("No User Found");
          return res
            .status(401)
            .json({ error: "No User Unauthorized request" });
        }
        req.user = user;
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    console.log("Line 29", error);

    res.status(401).json({ error: "Unauthorized request" });
  }
}

module.exports = {
  requireAuth
};
