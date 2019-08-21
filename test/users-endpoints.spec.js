const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("User Endpoints", function() {
  let db;

  const { testUsers } = helpers.makeItemsFixtures();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("POST/api/users", () => {
    context("user validation", () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = [
        "password",
        "user_name",
        "user_email",
        "first_name",
        "last_name"
      ];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          password: "test2131",
          user_name: "test",
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };

        it(`responds with a 400 required erronr when ${field}is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });

      it("responds 400'Password must be longer than 8 characters'when empty password", () => {
        const shortUserPassword = {
          password: "test",
          user_name: "test",
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(shortUserPassword)
          .expect(400, { error: "Password must be longer than 8 characters" });
      });
      it("responds 400 'Password be less than 72 characters' when long password", () => {
        const userLongPassword = {
          password: "*".repeat(73),
          user_name: "test",
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };

        return supertest(app)
          .post("/api/users")
          .send(userLongPassword)
          .expect(400, {
            error: "Password length must be less than 72 characters"
          });
      });
      it("responds 400 error when password starts or ends with a space", () => {
        const userPasswordNotComplex = {
          password: " Password321!",
          user_name: "test",
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordNotComplex)
          .expect(400, {
            error: "Password Cannot Start or End with a space"
          });
      });

      it("responds 400 error when password isn't complex enough", () => {
        const userPasswordNotComplex = {
          password: "Password321",
          user_name: "test",
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordNotComplex)
          .expect(400, {
            error:
              "Password must have at least one uppercase character, lowercase character, number, and special character"
          });
      });
      it("responds 400 'User name already taken' when user_name isn't unique", () => {
        const duplicateUser = {
          password: "Password321!",
          user_name: testUser.user_name,
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(duplicateUser)
          .expect(400, { error: "Username Already Exists" });
      });
    });

    context("Happy path", () => {
      it("responds 201, serialized user, storing bcryped password", () => {
        const newUser = {
          password: "Password321!",
          user_name: "steveywonda",
          user_email: "test",
          first_name: "test",
          last_name: "test@email.com"
        };
        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property("id");
            expect(res.body.user_name).to.eql(newUser.user_name);
            expect(res.body.first_name).to.eql(newUser.first_name);
            expect(res.body.last_name).to.eql(newUser.last_name);
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          });
      });
    });
  });
});
