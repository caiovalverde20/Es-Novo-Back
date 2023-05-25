const Tag = require('../models/Tag');

module.exports = {
  async createTag(req, res) {
    const { admId } = req.params;
    const { name, color } = req.body;

    const admUser = await User.findOne({ _id: admId, type: 'adm' });
        if (!admUser) {
          return res.status(401).send({ message: 'Apenas ADMs podem criar usuários' });
        }

    try {
      const existingTag = await Tag.findOne({ name });
      if (existingTag) {
        return res.status(400).send({ message: 'A tag já existe' });
      }

      const tag = await Tag.create({
        name,
        color,
      });

      return res.status(201).send({ tag });
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },

  async getAllTags(req, res) {
    try {
      const tags = await Tag.find();

      return res.status(200).send({ tags });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  async getTagByName(req, res) {
    const { name } = req.params;

    try {
      const regex = new RegExp(name.replace(/\s+/g, ''), 'i');
      const tags = await Tag.find({ name: { $regex: regex } });
      
      return res.status(200).send({ tags });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

};
