const { User } = require("../models/Users.Model");
const slugify = require("slugify");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {

    const user = await User.findOne({ user_email: email, user_pass: password}).select("-_id user_email user_role");
    
    const result = {
      email: user?.user_email || "",
      role: user?.user_role || ""
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}