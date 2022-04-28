const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  // verify JWT in headers
  authMiddleware: function (req, res, next) {
    // allows token to be sent via req.body or req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // separate "Bearer" from "<tokenvalue>"
    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // if no token, respond with error message
    if (!token) {
      return res.status(400).json({ message: 'You have no token!' });
    }

    // verify token and get user data out of it
    try {
      // decode and attach user data to request object
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      return res.status(400).json({ message: 'invalid token!' });
    }

    // send to next endpoint
    next();
  },

  // exports a user object and will add the payload properties to the token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
