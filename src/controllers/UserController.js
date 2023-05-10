const User = require('../models/User');
const bcrypt = require('bcrypt');
const service = require ('../services/loginService');

module.exports = {
    async createUser(req, res) {
        const admId = req.params.admId;
        const { name, password, email } = req.body;
      
        const admUser = await User.findOne({ _id: admId, type: 'adm' });
        if (!admUser) {
          return res.status(401).send({ message: 'Apenas ADMs podem criar usuários' });
        }
      
        const emailAlreadyExists = await User.findOne({ email });
        if (emailAlreadyExists) {
          return res.status(400).send({ message: 'Email já cadastrado' });
        }
      
        try {
          const encryptedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
          const user = await User.create({
            name,
            password: encryptedPassword,
            email: email.toLowerCase(),
            type
          });
      
          return res.status(201).send({ user });
        } catch (error) {
          return res.status(422).send(error.message);
        }
      },
    async login(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if(!user){
            return res.status(401).send({ message: "Usuario não existe" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(401).send({ message: "Senha inválida" });

        const token = service.signToken(user);

        await service.pushToken(user, token);

        return res.status(200).send( {user, token} );
    }
}