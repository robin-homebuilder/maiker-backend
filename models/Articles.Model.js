const mongoose = require("mongoose");

const ExternalLinksSchema = new mongoose.Schema(
  {
    title: String,
    url: String
  }
);

const ArticleSchema = new mongoose.Schema(
  {
    title: String,
    sub_title: String,
    slug: String,
    author: String,
    content: String,
    with_sidebar: Boolean,
    image: String,
    order: Number,
    banner: String,
    external_links: [ExternalLinksSchema]
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", ArticleSchema);

module.exports = { Article };