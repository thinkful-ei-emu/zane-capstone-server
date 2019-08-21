const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Inventory Endpoints", function() {
  let db;

  const { testUsers, testItems } = helpers.makeItemsFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  beforeEach("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("Protected endpoints Unhappy", () => {
    beforeEach("insert Items", () => {
      return helpers.seedZapTables(db, testUsers, testItems);
    });
    const protectedEndpoints = [
      {
        name: "GET /api/invetory/:itemid",
        path: "/api/inventory/1"
      }
    ];

    protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
        it("responds with 401 'Missing basic token'when no bearer token", () => {
          return supertest(app)
            .get(endpoint.path)
            .expect(401, { error: "Missing bearer token" });
        });

        it("responds 401 'Unauthorized request' when invalid JWT secret", () => {
          const validUser = testUsers[0];
          const invalidSecret = "bad-secret";
          return supertest(app)
            .get(endpoint.path)
            .set(
              "Authorization",
              helpers.makeAuthHeader(validUser, invalidSecret)
            )
            .expect(401, { error: "Unauthorized request" });
        });

        it("responds 401 'Unauthorized request' when invalid sub in payload", () => {
          const invalidUser = { user_name: "not-existy", id: 1 };
          return supertest(app)
            .get(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: "No User Unauthorized request" });
        });

        context("Given there are things in the database", () => {
          it("responds with 200 and the specified thing", () => {
            const itemId = 1;

            return supertest(app)
              .get(`/api/inventory/${itemId}`)
              .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
              .expect(200, testItems[0]);
          });
        });
      });
    });
  });
  describe("GET /api/inventory", () => {
    context("Given no items", () => {
      beforeEach(() => {
        helpers.seedUsers(db, testUsers);
      });
      it("responds with 200 and an empty list", () => {
        return supertest(app)
          .get("/api/inventory")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context("Given there are things in the database", () => {
      beforeEach("insert things", () =>
        helpers.seedZapTables(db, testUsers, testItems)
      );

      it("responds with 200 and all of the things", () => {
        const expectedItems = testItems.map(item =>
          helpers.makeExpectedItem(testUsers, item)
        );
        return supertest(app)
          .get("/api/inventory")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [
            {
              id: 1,
              item_name: "First test item!",
              description: "http://placehold.it/500x500",
              quantity: 6,
              location:
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
              unit_type: "pcs",
              price: "10.00"
            }
          ]);
      });
    });

    context("Given an XSS attack thing", () => {
      const testUser = helpers.makeUsersArray()[1];
      const { maliciousItem, expectedItem } = helpers.makeMaliciousItem(
        testUser
      );

      beforeEach("insert malicious thing", () => {
        return helpers.seedMaliciousItem(db, testUser, maliciousItem);
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get("/api/inventory")
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].item_name).to.eql(expectedItem.item_name);
            expect(res.body[0].description).to.eql(expectedItem.description);
          });
      });
    });
  });
});
