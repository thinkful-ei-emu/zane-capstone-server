const xss = require("xss");
const Treeize = require("treeize");
const InventoriesService = {
  getAllInventories(db) {
    return db
      .from("items AS inv")
      .select(
        "inv.id",
        "inv.item_name",
        "inv.description",
        "inv.quantity",
        "inv.unit_type",
        "inv.price"
      )

      .leftJoin("users AS usr", "inv.user_id", "usr.id")
      .groupBy("inv.id", "usr.id");
  },

  getById(db, id) {
    return db
      .from("items")
      .where("id", id)
      .first();
  },
  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into("items")
      .returning("*")
      .then(([inventory]) => inventory);
  },

  getItemsFromTable(db, id) {
    return db
      .from("items")
      .select(
        "id",
        "item_name",
        "description",
        "quantity",
        "unit_type",
        "price",
        "location"
      )
      .where({ user_id: id });
  },
  deleteItemFromTable(db, id) {
    return db
      .from("items")
      .del()
      .where({ id: id });
  },

  UpdateItem(db, id, name, description, quantity, unit_type, price, location) {
    return db
      .from("items")
      .update({
        item_name: name,
        description: description,
        quantity: quantity,
        unit_type: unit_type,
        price: price,
        location: location
      })
      .where({ id: id });
  },
  getSingleItem(db, id) {
    return db
      .from("items")
      .where({ id: id })
      .select(
        "id",
        "item_name",
        "description",
        "quantity",
        "unit_type",
        "price"
      );
  },
  serializeItem(item) {
    return {
      item_name: xss(item.item_name),
      description: xss(item.description),
      quantity: item.quantity,
      unit_type: item.unit_type,
      price: item.price,
      location: xss(item.location)
    };
  }
};

module.exports = InventoriesService;
