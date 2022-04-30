const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // pass parent as placeholder
        // get a user by id or username
        user: async (parent, { user = null, params}) => {
            return User.findOne({$or: [{ _id: user ? user.id : params.id }, { username: params.username }]})
            // populate
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            if (!user) {
                throw new Error('Something went wrong!');
            };

            return { token, user };
        },
        // login a user, sign a token, and send it back to LoginForm.js
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        // save a book to a users 'savedBooks' field by adding it to the set
        saveBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    // using addToSet instead of push to prevent duplicates
                    { $addToSet: { savedBooks: bookId } },
                    { new: true, runValidators: true}
                )
                //.populate(savedBooks);
                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        // remove book from savedBooks
        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId }}},
                    { new: true }
                )
                
                if (!updatedUser) {
                    return res.status(404).json({ message: "Couldn't find user with this id!"})
                }

                return updatedUser;
            }
        }
    }
};

module.exports = resolvers;