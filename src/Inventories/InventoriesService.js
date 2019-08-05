

const InventoriesService={
getAllThings(db) {
  return db
    .from('thingful_things AS inv')
    .select(
      'inv.id',
      'inv.title',
      'inv.date_created',
      'inv.content',
      'inv.image',
      ...userFields,
      db.raw(
        `count(DISTINCT rev) AS number_of_reviews`
      ),
      db.raw(
        `AVG(rev.rating) AS average_review_rating`
      ),
    )
    .leftJoin(
      'thingful_reviews AS rev',
      'inv.id',
      'rev.thing_id',
    )
    .leftJoin(
      'thingful_users AS usr',
      'inv.user_id',
      'usr.id',
    )
    .groupBy('inv.id', 'usr.id')
},

getById(db, id) {
  return ThingsService.getAllThings(db)
    .where('inv.id', id)
    .first()
},
}