const mongoose = require("mongoose");
const config = require("@config");

module.exports = async () => {
  let DB_URL;
  if (process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "homolog") {
    DB_URL = config.db.production;
  } else if (process.env.NODE_ENV === "dev") {
    DB_URL = config.db.develop;
  } else {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    DB_URL = uri;
  }

  mongoose.connection.on("connected", () => {
    console.log("Conectado com o banco de dados!");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Erro na conexão com o banco de dados: " + err);
  });

  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
