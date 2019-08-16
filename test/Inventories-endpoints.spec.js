const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Inventory Endpoints', function() {
  let db;


  const { testUsers, testItems } = helpers.makeItemsFixtures();

 
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  beforeEach('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('Protected endpoints', () => {
    beforeEach('insert Items', () =>{
      return helpers.seedZapTables(db, testUsers, testItems);}
    );
    const protectedEndpoints=[
      {
        name:'GET /api/invetory/:itemid',
        path: '/api/inventory/1'
      },
      
    ];

    protectedEndpoints.forEach(endpoint=>{
      
        
     
  


      describe(endpoint.name, () => {
        it('responds with 401 \'Missing basic token\'when no bearer token', () => {
          return supertest(app)
            .get(endpoint.path)
            .expect(401, { error: 'Missing bearer token' });
        });

        it('responds 401 \'Unauthorized request\' when invalid JWT secret', () => {
          const validUser=testUsers[0];
          const invalidSecret='bad-secret';
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(validUser,invalidSecret))
            .expect(401, { error: 'Unauthorized request' });
        });

        it('responds 401 \'Unauthorized request\' when invalid sub in payload', () => {
          const invalidUser = { user_name: 'not-existy', id:1 };
          return supertest(app)
            .get(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: 'No User Unauthorized request' });
        });
       
      });
    });
  });
});

