const bcrypt = require("bcrypt");
const userModel = require("../../models/users");
const userValidators = require("../validators/users");

const controller = {
  showRegistrationForm: (req, res) => {
    res.render("pages/register");
  },

  register: async (req, res) => {
    // validations
    const validationResults = userValidators.registerValidator.validate(
      req.body
    );

    if (validationResults.error) {
      res.send(validationResults.error);
      return;
    }

    const validatedResults = validationResults.value;

    console.log(validationResults);
    console.log(validatedResults);
    console.log(validatedResults.password);
    console.log(validatedResults.confirm_password);

    // ensure that password and confirm_password matches
    if (validatedResults.password !== validatedResults.confirm_password) {
      res.send("passwords do not match");
      return;
    }

    // todo: ensure that there is no duplicate email in DB

    // hash the password
    const hash = await bcrypt.hash(validatedResults.password, 10);

    // create the user and store in db
    try {
      await userModel.create({
        name: validatedResults.fullname,
        email: validatedResults.email,
        hash: hash,
      });
    } catch (err) {
      console.log(err);
      res.send("failed to create user");
      return;
    }

    res.redirect("/users/login");
  },

  showLoginForm: (req, res) => {
    res.render("pages/login");
  },

  login: async (req, res) => {
    // validations here ...
    const validatedResults = req.body;
    console.log(validatedResults);

    let user = null;

    // get user with email from DB
    try {
      user = await userModel.findOne({ email: validatedResults.email });
    } catch (err) {
      res.send("failed to get user");
      return;
    }

    // use bcrypt to compare the given password with the one store as has in DB

    console.log(validatedResults.password);

    const pwMatches = await bcrypt.compare(
      validatedResults.password,
      user.hash
    );

    if (!pwMatches) {
      res.send("incorrect password");
      return;
    }

    // check selected radio button
    // const radioButtons = document.getElementByName("flexRadioDefault");
    // console.log(radioButtons);

    // log the user in by creating a session
    req.session.regenerate(function (err) {
      if (err) {
        next(err);
      }

      // store user information in session, typically a user id
      req.session.user = user.email;

      // save the session before redirection to ensure page
      // load does not happen before session is saved
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }

        console.log(req.body.flexRadioDefault[0]);

        // validate login type

        if (validatedResults.flexRadioDefault[0] == "2") {
          res.redirect("/users/user");
        } else if (validatedResults.flexRadioDefault[0] == "1") {
          res.redirect("/users/admin");
        }
      });
    });

    // res.send('login successful')
  },
};

module.exports = controller;