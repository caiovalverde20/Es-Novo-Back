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
  },

  async getReportByUser(req, res) {
    const { userId, dateStart, dateEnd } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send({ message: 'Usuário não encontrado' });
        }

        const reports = await Report.find({
            user: user._id,
            date: {
                $gte: moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate(),
                $lte: moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate()
            }
        })
        .sort({ date: 1, startTime: 1 });

        return res.status(200).send({ reports });
    } catch (error) {
        return res.status(422).send(error.message);
    }
}
}
