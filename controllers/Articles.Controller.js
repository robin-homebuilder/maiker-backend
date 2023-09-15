const { Article } = require("../models/Articles.Model");
const slugify = require("slugify");

exports.createArticle = async (req, res) => {
  const { title, sub_title, author, content } = req.body;

  try {
    const titleWithoutSpecialChars = title ? title.replace(/[^\w\s]/gi, '') : "";
    const itemSlug = slugify(titleWithoutSpecialChars ?? "" , { lower: true });

    let uniqueSlug = itemSlug; 

    const checkSlug = await Article.findOne({ slug: itemSlug });

    if (checkSlug) {
        let count = 1;
        let newSlug = itemSlug;
        while (true) {
          newSlug = `${itemSlug}-${count}`;
          const checkNewSlug = await Article.findOne({ slug: newSlug });
          if (!checkNewSlug) {
            uniqueSlug = newSlug;
            break;
          }
          count++;
        }
    }

    const newArticle = new Article({
      title, 
      sub_title, 
      slug: uniqueSlug,
      author, 
      content
    });

    await newArticle.save();
    
    res.status(200).json(1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find({}).select("-_id title sub_title slug image").sort({ order: 1});
    
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getArticleBySlug = async (req, res) => {
  const slug = req.params.articleID;
  
  try {
    const article = await Article.findOne({ slug: slug });
    const otherSlug = await Article.find({ slug: {$ne: slug} }).select("-_id title slug");

    res.status(200).json({article, otherSlug});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}