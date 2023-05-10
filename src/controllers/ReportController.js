const Report = require('@models/Report');
const User = require('@models/User');
const moment = require('moment');

module.exports = {
  async createReport(req, res) {
    const { date, startTime, endTime, text, tags } = req.body;
    const userId = req.params.userId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
      }

      const report = await Report.create({
        user: user._id,
        date: moment(date, 'DD/MM/YYYY').toDate(),
        startTime,
        endTime,
        text,
        tags
      });

      return res.status(201).send({ report });
    } catch (error) {
      return res.status(422).send(error.message);
    }
  }
}
