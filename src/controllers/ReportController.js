const Report = require('../models/Report');
const User = require('../models/User');
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
  
      // Parsear a data do relatório
      const reportDate = moment(date, 'DD/MM/YYYY');
      const now = moment();
  
      // Encontrar a próxima segunda-feira ao meio-dia após a data do relatório
      let nextMondayAfterReport;

      if (reportDate.day() === 0) { // se o relatório é de um domingo
        nextMondayAfterReport = moment(reportDate).add(1, 'days').hour(12).minute(0).second(0);
      } else { // se o relatório é de qualquer outro dia
        nextMondayAfterReport = moment(reportDate).day(8).hour(12).minute(0).second(0);
      }
  
      // Verificar se o relatório é atrasado
      let delayed = false;
      
      // se a data atual é posterior à próxima segunda-feira após a data do relatório, então o relatório está atrasado
      if (now.isAfter(nextMondayAfterReport)) {
        delayed = true;
      }
  
      const report = await Report.create({
        user: user._id,
        date: reportDate.toDate(),
        startTime,
        endTime,
        text,
        tags,
        delayed,
      });
  
      return res.status(201).send({ report });
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },
  

  async deleteReport(req, res) {
    const userId = req.params.userId;
    const reportId = req.params.reportId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
      }

      await Report.deleteOne({
        _id: reportId,
        user: user._id,
      });

      return res.sendStatus(204);
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },

  async updateReport(req, res) {
    const { date, startTime, endTime, text, tags } = req.body;
    const userId = req.params.userId;
    const reportId = req.params.reportId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
      }

      const report = await Report.findOneAndUpdate({
        _id: reportId,
        user: user._id,
      }, {
        date: date == null? undefined : moment(date, 'DD/MM/YYYY').toDate(),
        startTime: startTime == null? undefined : startTime,
        endTime: endTime == null? undefined : endTime,
        text: text == null? undefined : text,
        tags: tags == null? undefined : tags
      }, { new: 1 });

      return res.status(200).send({ report });
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
        .sort({user: 1, date: 1, startTime: 1,  })
        .populate('user', '-password -token_list -code');

        return res.status(200).send({ reports });
    } catch (error) {
        return res.status(422).send(error.message);
    }
  },

    async getReportByUserAnalytics(req, res) {
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
          .sort({user: 1, date: 1, startTime: 1})
          .populate('user', '-password -token_list -code');

          const delayedReports = await Report.countDocuments({
              user: user._id,
              delayed: true,
              date: {
                  $gte: moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate(),
                  $lte: moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate()
              }
          });

          const onTimeReports = await Report.countDocuments({
            user: user._id,
            delayed: true,
            date: {
                $gte: moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate(),
                $lte: moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate()
            }
        });

          let missedReports = 0;
          for (let i = 1; i < reports.length; i++) {
              let prevReportDate = moment(reports[i - 1].date);
              let nextMondayPrevReport = prevReportDate.clone().startOf('week').add(1, 'weeks').day(1); // Next Monday for prevReportDate

              let currentReportDate = moment(reports[i].date);
              let nextMondayCurrentReport = currentReportDate.clone().startOf('week').add(1, 'weeks').day(1); // Next Monday for currentReportDate

              // Count the number of days between the next Mondays of the reports
              if (nextMondayCurrentReport.diff(nextMondayPrevReport, 'days') > 7) {
                  missedReports++;
              }
          }

          return res.status(200).send({ onTimeReports, delayedReports, missedReports });
      } catch (error) {
          return res.status(422).send(error.message);
      }
    },

    async getAllReportsAnalytics(req, res) {
      const { userId, dateStart, dateEnd } = req.params;
  
      try {
          const user = await User.find({_id:userId, type: 'adm' });
          const users = await User.find().select('-token_list -password');
  
          if (!user) {
              return res.status(400).send({ message: 'Nenhum usuário encontrado' });
          }
  
          const startDate = moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate();
          const endDate = moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate();
  
          let lateUsers = [];
          let noReportUsers = [];
          let onTimeUsers = [];
  
          for (let user of users) {
              const userReports = await Report.find({
                  user: user._id,
                  date: { $gte: startDate, $lte: endDate }
              })
  
              const delayedReports = userReports.filter(report => report.delayed);
              const onTimeReports = userReports.filter(report => !report.delayed);
  
              if (userReports.length === 0) {
                  noReportUsers.push(user);
              } else if (delayedReports.length > 0 && onTimeReports.length === 0) {
                  lateUsers.push(user);
              } else if (onTimeReports.length > 0) {
                  onTimeUsers.push(user);
              }
          }
  
          return res.status(200).send({ lateUsers, noReportUsers, onTimeUsers });
      } catch (error) {
          return res.status(422).send(error.message);
      }
  },
  


  async getAllReportsByDate(req, res) {
    const { userId, dateStart, dateEnd } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send({ message: 'Usuário não encontrado' });
        }

        if (user.type != "adm") {
          return res.status(400).send({ message: 'Usuário não permitido' });
      }

      const reports = await Report.find({
        date: {
            $gte: moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate(),
            $lte: moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate()
        }
      })
      .sort({user: 1, date: 1, startTime: 1,  })
      .populate('user', '-password -token_list -code');
    

        return res.status(200).send({ reports });
    } catch (error) {
        return res.status(422).send(error.message);
    }
  },

  async getReportsByAllTags(req, res) {
    try {
      const { userId, dateStart, dateEnd, tags } = req.params;
      const tagsArray = tags.split(',').map(tag => tag.trim());

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
    }

      const reports = await Report.find({
        date: {
            $gte: moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate(),
            $lte: moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate()
        },
        tags: { $all: tagsArray }
      })
      .sort({user: 1, date: 1, startTime: 1,  })
      .populate('user', '-password -token_list -code');
  
      return res.status(200).send({ reports });
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },


  async getReportsByAnyTags(req, res) {
    try {
      const { userId, dateStart, dateEnd, tags } = req.params;
      const tagsArray = tags.split(',').map(tag => tag.trim());

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
    }

      const reports = await Report.find({
        date: {
            $gte: moment(dateStart, 'DD/MM/YYYY').startOf('day').toDate(),
            $lte: moment(dateEnd, 'DD/MM/YYYY').endOf('day').toDate()
        },
        tags: { $in: tagsArray }
      })
      .sort({user: 1, date: 1, startTime: 1,  })
      .populate('user', '-password -token_list -code');
  
      return res.status(200).send({ reports });
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },
  

}
