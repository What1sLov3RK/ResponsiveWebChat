import User from '../models/Users.model.js';

class UserRepository {
  static async createUser(email, password, firstname, lastname) {
    try {
      const newUser = await User.create({
        email,
        password,
        firstname,
        lastname,
        refresh_token: '',
        chats: [],
      });
      return newUser;
    } catch (e) {
      console.error('Error creating user:', e);
      throw e;
    }
  }

  static async findOneById(userId) {
    try {
      return await User.findById(userId);
    } catch (e) {
      console.error('Error finding user by ID:', e);
      throw e;
    }
  }

  static async findOneByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (e) {
      console.error('Error finding user by email:', e);
      throw e;
    }
  }
}

export default UserRepository;
