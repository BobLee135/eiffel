/*Copyright 2019 Evsent

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

const exception = require('../modules/eventSenderException');
const User = require('../models/userModel');
//const JWToken = require('jsonwebtoken');
const messageModule = require('../modules/messageModule');
const dotenv = require('dotenv');
const userDbInterface = require('../modules/userDbInterface');
const bcrypt = require('bcryptjs');
dotenv.config();

/**
 * EXPECTED INPUT: {name: "name", password: "password"}
 * OUTPUT: Success response + token OR error exception.
 * 
 * Uses bcrypt and JSON web token
 */
exports.post = async function (req, res) {

  const user = await userDbInterface.findUser(req.body.name);

  try {
    console.log("POST REQUEST recived on /login");
    if (user != null) {
      console.log("User found in database");
      validPW = await bcrypt.compare(req.body.password, user.password)
      console.log("Valid password: " + validPW);
      if (validPW) {
        console.log("Password is valid");
        console.log(process.env.SECRET_TOKEN);
        const token = "yesthisisatokentrustme"; /*JWToken.sign({ _id: user.id }, process.env.SECRET_TOKEN);*/
        console.log("Token generated: " + token);
        res.header('auth-token', token);
        console.log("Token sent to client");
        messageModule.sendAuthSuccessRespone(res);
        console.log("Success response sent to client");
      } else {
        throw new exception.authorizationException("Wrong password or username", exception.errorType.WRONG_PASSWORD_OR_USERNAME);
      }
    } else {
      throw new exception.authorizationException("Wrong password or username", exception.errorType.WRONG_PASSWORD_OR_USERNAME);
    }
  } catch (e) {
    messageModule.sendFailResponse(res, e);
  }
}
