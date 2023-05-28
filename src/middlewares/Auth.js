const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv/config');

module.exports = {
  authorizeUser(req, res, next) {
    authorize(req, res, next, "user");
  },

  authorizeAdm(req, res, next) {
    authorize(req, res, next, "adm");
  },

  authorizeObserver(req, res, next) {
    authorize(req, res, next, "observer");
  }
};

authorize = (req, res, next, type) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ error: 'Sem token irmão' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).send({ error: 'Erro de token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token mal formatado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Token inválido' });
    }

    const user = await User.findOne({ _id: decoded.sub });

    if (!user) {
      return res.status(404).send({ error: 'Usuário não existe!' });
    }
    console.log(user)

    const token_list = user.token_list;
    if (!token_list.includes(token)) {
      return res.status(401).send({ error: 'Token inválido' });
    }

    // Libera aq quando sair da fase de teste
    //if (req.params.userId && req.params.userId !== decoded.sub) {
    //  return res.status(403).send({ error: 'Acesso negado: o ID do usuário na rota não corresponde ao ID do usuário do token' });
    //}

    if (user.type == "user" && type == "adm") {
      return res.status(403).send({ error: 'Acesso negado' });
    }
    
    if (user.type == "observer" && (type == "adm" || type == "user")) {
        return res.status(403).send({ error: 'Acesso negado' });
    }

    req.id = decoded.sub;
    req.user = user;
    return next();
  });
};
