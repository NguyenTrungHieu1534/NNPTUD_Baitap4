var express = require("express");
var router = express.Router();

let slugify = require("slugify");
let { IncrementalId } = require("../utils/IncrementalIdHandler");
let { data: categories } = require("../utils/categories");
let { data: products } = require("../utils/data");

// GET /api/v1/categories?name=...
router.get("/", function (req, res) {
  let nameQ = req.query.name ? String(req.query.name) : "";
  let result = categories.filter(function (c) {
    return (
      !c.isDeleted && c.name.toLowerCase().includes(nameQ.toLowerCase())
    );
  });
  res.status(200).send(result);
});

// GET /api/v1/categories/slug/:slug
router.get("/slug/:slug", function (req, res) {
  let slug = req.params.slug;
  let result = categories.find(function (c) {
    return !c.isDeleted && c.slug === slug;
  });

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({ message: "SLUG NOT FOUND" });
  }
});

// GET /api/v1/categories/:id
router.get("/:id", function (req, res) {
  let result = categories.find(function (c) {
    return !c.isDeleted && c.id == req.params.id;
  });

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

// POST /api/v1/categories
router.post("/", function (req, res) {
  let name = req.body?.name;
  let image = req.body?.image;

  if (!name) {
    return res.status(400).send({ message: "name is required" });
  }

  let nowIso = new Date(Date.now()).toISOString();

  let newObj = {
    id: IncrementalId(categories),
    name: name,
    slug: slugify(name, { replacement: "-", lower: true, locale: "vi" }),
    image: image || "",
    creationAt: nowIso,
    updatedAt: nowIso,
  };

  categories.push(newObj);
  res.status(201).send(newObj);
});

// PUT /api/v1/categories/:id
router.put("/:id", function (req, res) {
  let result = categories.find(function (c) {
    return !c.isDeleted && c.id == req.params.id;
  });

  if (!result) {
    return res.status(404).send({ message: "ID NOT FOUND" });
  }

  let body = req.body || {};
  let keys = Object.keys(body);
  for (const key of keys) {
    if (key === "id" || key === "creationAt") continue;
    result[key] = body[key];
  }

  if (body.name && !body.slug) {
    result.slug = slugify(body.name, {
      replacement: "-",
      lower: true,
      locale: "vi",
    });
  }

  result.updatedAt = new Date(Date.now()).toISOString();
  res.status(200).send(result);
});

// DELETE /api/v1/categories/:id
router.delete("/:id", function (req, res) {
  let result = categories.find(function (c) {
    return !c.isDeleted && c.id == req.params.id;
  });

  if (!result) {
    return res.status(404).send({ message: "ID NOT FOUND" });
  }

  result.isDeleted = true;
  result.updatedAt = new Date(Date.now()).toISOString();
  res.status(200).send(result);
});

// GET /api/v1/categories/:id/products
router.get("/:id/products", function (req, res) {
  let categoryId = Number(req.params.id);
  if (Number.isNaN(categoryId)) {
    return res.status(400).send({ message: "category id must be a number" });
  }

  let result = products.filter(function (p) {
    return (
      !p.isDeleted &&
      p.category &&
      Number(p.category.id) === categoryId
    );
  });

  res.status(200).send(result);
});

module.exports = router;

