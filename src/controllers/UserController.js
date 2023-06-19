const User = require('../models/User');
const bcrypt = require('bcrypt');
const service = require('../services/LoginService');
const mailer = require('../services/MailSender');
const S3Storage = require('../services/S3Storage');

async function updateUserByOwner(req, res, authUser) {
  const { name } = req.body;
  
  try {
    const updatedUser = await User.findOneAndUpdate({
      _id: authUser._id
    }, {
      name: name == null? undefined : name
    }, { new: 1 }).select('-token_list -password');;;
    
    return res.status(200).send(updatedUser);
  } catch(err) {
    return res.status(500).send(err.message)
  }

}

async function updateUserByAdmin(req, res, authUser) {
  const { name, type, userFunction } = req.body;
  const userId = req.params.userId;
  
  try {
    const updatedUser = await User.findOneAndUpdate({
      _id: userId
    }, {
      name: name == null? undefined : name,
      type: type == null? undefined : type,
      userFunction: userFunction == null? undefined : userFunction
    }, { new: 1 }).select('-token_list -password');;;

    return res.status(200).send(updatedUser);
  } catch(err) {
    return res.status(500).send(err.message)
  }

}

module.exports = {
  async createUser(req, res) {
    const admId = req.params.admId;
    const { name, password, email, type, userFunction } = req.body;

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
        type,
        userFunction
      });

      return res.status(201).send({ user });
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },

  async deleteUser(req, res) {
    const userId = req.params.userId;
    const authId = req.params.authId;
  
    const authUser = await User.findOne({ _id: authId });

    if(userId !== authId && authUser.type !== 'adm') {
      return res.status(401).send({ message: 'Apenas o dono da conta ou um ADM podem excluir esta conta' });
    }
  
    try {
      await User.deleteOne({ _id: userId });
  
      return res.sendStatus(204);
    } catch (error) {
      return res.status(422).send(error.message);
    }
  },

  async updateUser(req, res) {
    const authId = req.params.authId;
    const { filename } = req.file || {};
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId });
    const authUser = await User.findOne({ _id: authId });

    if(filename != null){
      if (user.profilePic.key != null ) {
        S3Storage.deleteFile(user.profilePic.key);
      }
      const path = `profile_pic/${authId}/`;
      user.profilePic = await S3Storage.saveFile(filename, path);
      await user.save();
    }

    if (authUser.type === 'adm') {
      return await updateUserByAdmin(req, res, authUser);
    } else {
      return await updateUserByOwner(req, res, authUser);
    }
  },

  async addProfilePicture(req, res) {
    const id = req.params.id;
    const { filename } = req.file;

    try {
      const user = await User.findById(id);

      if (!user) return res.status(400).send({ "message": "Id não encontrado" });

      if (user.profilePic.key != null) {
        S3Storage.deleteFile(user.profilePic.key);
      }

      const path = `profile_pic/${id}/`;
      user.profilePic = await S3Storage.saveFile(filename, path);
      await user.save();

      return res.status(200).send({ "image": user.profilePic.url });

    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  async removeProfilePicture(req, res) {
    const id = req.params.id;

    try {
      const user = await User.findById(id);

      if (!user) return res.status(400).send({ "message": "Id não encontrado" });

      S3Storage.deleteFile(user.profilePic.key);

      user.profilePic.url = null;
      user.profilePic.key = null;
      await user.save();

      return res.status(200).send({ "message": "Imagem removida" });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ message: "Usuario não existe" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).send({ message: "Senha inválida" });

    const token = service.signToken(user);

    await service.pushToken(user, token);

    return res.status(200).send({ user, token });
  },

  async RequestPasswordRecovery(req, res) {
    const email = req.body.email;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ message: "Usuario não existe" });
    }

    const code = Math.floor(Math.random() * (9999 - 1000) + 1000);

    user.code = code;
    await user.save();

    const status = await mailer.sendMail(email, 'Codex Relatorio', 'Olá, ' + user.name + '. Utilize este código para redefinir sua senha: ' + code + "");

    if (status.status !== 200) {
      return res.status(404).send({ error: status.message })
    };

    return res.status(status.status).json(status.message);

  },

  async PasswordRecovery(req, res) {

    const email = req.params.email

    const { code, password, passwordConfirmation } = req.body;

    const user = await User.findOne({ email: email });

    if (code != user.code) {
      return res.status(401).send({ message: "Por favor, verifique se digitou o codigo corretamente" });
    }

    if (!user) {
      return res.status(401).send({ message: "Usuario inexistente" });
    }

    if (password != passwordConfirmation) {
      return res.status(401).send({ message: "Por favor, verifique se digitou a mesma senha em ambos os campos" });
    }


    if (parseInt(code) !== user.code) {
      throw new Error('Código inválido!')
    };

    const encryptedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

    user.password = encryptedPassword;
    user.code = null;
    await user.save();

    return res.status(200).json({ message: "Senha alterada com sucesso!" });

  },

  async getAllUsers(req, res) {
    try {
      const users = await User.find().select('-token_list -password');;

      return res.status(200).send({ users });

    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  },

  async getUserByName(req, res) {
    const { name } = req.params;

    try {
      const regex = new RegExp(name.replace(/\s+/g, ''), 'i');
      const users = await User.find({ name: { $regex: regex } }).select('-token_list -password');
      
      return res.status(200).send({ users });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findById(id).select('-token_list -password');;
      
      return res.status(200).send({ user });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },
  
}