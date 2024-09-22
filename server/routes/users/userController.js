import UserModel from '../../models/userModel.js'; 

const searchUsers = async (req, res) => {
  try {
    const query = req.query.username;
    const users = await UserModel.find({ username: { $regex: query, $options: 'i' } }).limit(10);
    return res.json({ status: "success", message:"users found", code:"users_found", data:users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUsers,
};