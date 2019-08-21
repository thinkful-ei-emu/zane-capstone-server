const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "test-user-1",
      last_name: "Test user 1",
      user_name: "TU1",
      password: "password",
      user_email: "uniqueemail@blahblabh"
    },
    {
      id: 2,
      first_name: "test-user-2",
      last_name: "Test user 2",
      user_name: "TU2",
      password: "password",
      user_email: "unique@blahblah"
    },
    {
      id: 3,
      first_name: "test-user-3",
      last_name: "Test user 3",
      user_name: "TU3",
      password: "password",
      user_email: "blahblahblah"
    },
    {
      id: 4,
      first_name: "test-user-4",
      last_name: "Test user 4",
      user_name: "TU4",
      password: "password",
      user_email: "plickaplicka"
    }
  ];
}

function makeItemsArray(users) {
  return [
    {
      id: 1,
      item_name: "First test item!",
      description: "http://placehold.it/500x500",
      user_id: 1,
      quantity: 6,
      location:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      unit_type: "pcs",
      price: "10.00"
    },
    {
      id: 2,
      item_name: "Second test item!",
      description: "http://placehold.it/500x500",
      user_id: 2,
      quantity: 6,
      location:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      unit_type: "pcs",
      price: "10.00"
    },
    {
      id: 3,
      item_name: "Third test item!",
      description: "http://placehold.it/500x500",
      user_id: 3,
      quantity: 6,
      location:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      unit_type: "pcs",
      price: "10.00"
    },
    {
      id: 4,
      item_name: "Fourth test item!",
      description: "http://placehold.it/500x500",
      user_id: 4,
      quantity: 6,
      location:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      unit_type: "pcs",
      price: 10
    }
  ];
}

function makeExpectedItem(users, item) {
  const user = users.find(user => user.id === item.user_id);

  return {
    id: item.id,
    item_name: item.item_name,
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    unit_type: item.unit_type,
    location: item.location,

    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      user_name: user.user_name,
      user_email: user.user_email
    }
  };
}

function makeMaliciousItem(user) {
  const maliciousItem = {
    id: 911,
    item_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    description: 'Naughty naughty very naughty <script>alert("xss");</script>',
    location: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    price: 12,
    quantity: 12,
    unit_type: "pcs"
  };
  const expectedItem = {
    ...makeExpectedItem([user], maliciousItem),
    item_name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    description: 'Naughty naughty very naughty <script>alert("xss");</script>',
    location: 'Naughty naughty very naughty <script>alert("xss");</script>',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousItem,
    expectedItem
  };
}

function makeItemsFixtures() {
  const testUsers = makeUsersArray();
  const testItems = makeItemsArray(testUsers);

  return { testUsers, testItems };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      items,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedZapTables(db, users, items) {
  //use a transaction to group the queires and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into("items").insert(items);
    await trx.raw(`SELECT setval('items_id_seq', ?)`, [
      items[items.length - 1].id
    ]);

    //only insert comments if there are some, also update
  });
}

function seedMaliciousItem(db, user, item) {
  return seedUsers(db, [user]).then(() => db.into("items").insert([item]));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeItemsArray,
  makeExpectedItem,
  makeMaliciousItem,

  makeItemsFixtures,
  cleanTables,
  seedZapTables,
  seedMaliciousItem,
  makeAuthHeader,
  seedUsers
};
