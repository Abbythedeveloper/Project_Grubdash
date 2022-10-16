const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /dishes handlers needed to make the tests pass
// List all dishes
function list(req, res) {
  res.json({ data: dishes });
}
// Middleware / Validation: if requirements not met will return error message

function priceExists(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  } else if (price <= 0 || typeof price != "number") {
    next({
      status: 400,
      message: "Dish must hav a price that is an integer greater than 0",
    });
  }
  return next();
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

//POST /dishes
// This route will save the dish and respond with the newly created dish.
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = nextId();
  const newdish = {
    id: newId,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newdish);
  res.status(201).json({ data: newdish });
}

////// list a dish ////////

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const dishPaste = dishes.find((dish) => dish.id === dishId);
  if (dishPaste) {
    res.locals.dish = dishPaste;
    console.log(res.locals);
    return next();
  }
  next({
    status: 404,
    message: `dish id not found: ${dishId}`,
  });
}

function read(req, res) {
  const { dishId } = req.params;
  const dishPaste = dishes.find((dish) => dish.id === dishId);
  res.json({ data: dishPaste });
}

// Anytime you need to assign a new id to an order or dish, use the nextId function exported from src/utils/nextId.js

/////// put request ///////////////////////////////////
//This route will update the dish where id === :dishId or return 404 if no matching dish is found.
function update(req, res, next) {
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  // Note: The id property isn't required in the body of the request, but if it is present, it must match :dishId from the route.
  if (!id || dishId === id) {
    const updatedDish = {
      id: dishId,
      name,
      description,
      price,
      image_url,
    };
    res.json({ data: updatedDish });
  }

  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceExists,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    priceExists,
    update,
  ],
};
