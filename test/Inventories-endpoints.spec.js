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

  

  // describe('GET /api/inventory', () => {
    
  //   context('Given no items', () => {
  //     beforeEach(()=> helpers.seedUsers(db,testUsers));
  //     afterEach(()=>helpers.cleanTables(db));
  //     it('responds with 200 and an empty list', () => {
  //       console.log('I am a test user', testUsers[0]);
  //       console.log('I am the Auth Token',helpers.makeAuthHeader(testUsers[1]));
  //       return supertest(app)

  //         .get('/api/inventory')
  //         .set('Authorization',helpers.makeAuthHeader(testUsers[1]))
  //         .expect(200, []);
  //     });
  //   });

  //   context('Given there are items in the database', () => {
  //     beforeEach('insert items', () =>
  //       helpers.seedZapTables(db, testUsers, testItems)
        
  //     );
      

  //     it('responds with 200 and all of the Items', () => {
  //       const expectedItem = testItems.map(item =>
  //         helpers.makeExpectedItem(testUsers, item)
  //       );
  //       return supertest(app)
  //         .get('/api/inventory')
  //         .set('Authorization',helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200, expectedItem);
  //     });
  //   });

  //   context('Given an XSS attack item', () => {
  //     const testUser = helpers.makeUsersArray()[1];
  //     const { maliciousItem, expectedItem } = helpers.makeMaliciousItem(
  //       testUser
  //     );

  //     beforeEach('insert malicious item', () => {
  //       return helpers.seedMaliciousItem(db, testUser, maliciousItem);
  //     });
  //     beforeEach(()=>
  //       helpers.seedUsers(db,testUsers));

  //     it('removes XSS attack content', () => {
  //       return supertest(app)
  //         .get('/api/inventory')
  //         .set('Authorization',helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200)
  //         .expect(res => {
  //           expect(res.body[0].title).to.eql(expectedItem.title);
  //           expect(res.body[0].content).to.eql(expectedItem.content);
  //         });
  //     });
  //   });
  // });

  // describe('GET /api/inventory/:item_id', () => {
  //   context('Given no items', () => {
  //     beforeEach(()=>{
  //       helpers.seedUsers(db,testUsers);
  //       helpers.cleanTables(db);});
  //     it('responds with 404', () => {
  //       const itemId = 123456;
  //       return supertest(app)
  //         .get(`/api/inventory/${itemId}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(404, { error: 'Item Not Found' });
  //     });
  //   });

  //   context('Given there are itemss in the database', () => {
  //     beforeEach('insert items', () =>
  //       helpers.seedZapTables(db, testUsers, testItems)
  //     );

  //     it('responds with 200 and the specified item', () => {
  //       const itemId = 2;
  //       const expectedItem = helpers.makeExpectedItem(
  //         testUsers,
  //         testItems[itemId - 1]
          
  //       );

  //       return supertest(app)
  //         .get(`/api/inventory/${itemId}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200, expectedItem);
  //     });
  //   });

  //   context('Given an XSS attack item', () => {
  //     const testUser = helpers.makeUsersArray()[1];
  //     const { maliciousItem, expectedItem } = helpers.makeMaliciousItem(
  //       testUser
  //     );

  //     beforeEach('insert malicious item', () => {
  //       return helpers.seedMaliciousItem(db, testUser, maliciousItem);
  //     });
  //     beforeEach(()=> helpers.seedUsers(db,testUsers));


  //     it('removes XSS attack content', () => {
  //       return supertest(app)
  //         .get(`/api/inventory/${maliciousItem.id}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200)
  //         .expect(res => {
  //           expect(res.body.title).to.eql(expectedItem.title);
  //           expect(res.body.content).to.eql(expectedItem.content);
  //         });
  //     });
  //   });
  // });

  // describe('GET /api/inventory/:thing_id/', () => {
  //   context('Given no things', () => {
  //     beforeEach(()=>
  //     helpers.seedUsers(db,testUsers));
  //     it('responds with 404', () => {
  //       const thingId = 123456;
  //       return supertest(app)
  //         .get(`/api/things/${thingId}/reviews`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(404, {});
  //     });
  //   });

  //   context('Given there are reviews for thing in the database', () => {
  //     beforeEach('insert things', () =>
  //       helpers.seedThingsTables(db, testUsers, testItems)
        
  //     );

  //     it('responds with 200 and the specified reviews', () => {
  //       const thingId = 1;
  //       const expectedReviews = helpers.makeExpectedThingReviews(
  //         testUsers,
  //         thingId
          
  //       );

  //       console.log('this is test reviews',testUsers);

  //       return supertest(app)
  //         .get(`/api/inventory/${thingId}`)
  //         .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
  //         .expect(200, expectedReviews);
});
//   });
// });
// });
