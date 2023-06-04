require("dotenv").config();
const server = require('../../src/server');
const User = require('../../src/models/User');
const chai = require('chai');
const should = chai.should();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const data = require('../data.json');
chai.use(chaiHttp);


const saltRounds = 10;

chai.should();

describe('User Tests', function() {
  let adminUser = null;
  let adminToken = null;

  before(async function () {
    await User.deleteMany({});

    const password = await bcrypt.hash('adminpassword', saltRounds);

    try {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: password,
        type: 'adm',
        userFunction: 'Admin'
      });

      const response = await chai.request(server)
        .post('/login')
        .send({ email: 'admin@example.com', password: 'adminpassword' });
      
      adminToken = response.body.token;
    } catch (error) {
      console.log("Erro na criação do usuário admin: ", error);
    }
  });

  after(async function() {
    // Close the database connection after tests
    await mongoose.connection.close();
  });

  it('Should not create user if request is made by non-adm user', async function() {
    const response = await chai.request(server)
      .post(`/user/${data.default_User._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(data.default_User);
  
    response.should.have.status(401);
    response.body.message.should.include('Apenas ADMs podem criar usuários');
  });
  
  it('Should not create user with existing email', async function() {
    const user = new User(data.default_User);
    await user.save();
  
    const response = await chai.request(server)
      .post(`/user/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(data.default_User);
  
    response.should.have.status(400);
    response.body.message.should.include('Email já cadastrado');
  });
  
  it('Should create user', async function() {
    const newUserData = { ...data.default_User, email: 'newemail@example.com' };
  
    const response = await chai.request(server)
      .post(`/user/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUserData);
  
    response.should.have.status(201);
    response.body.user.should.have.property('name');
    response.body.user.should.have.property('email');
  });  

});
