const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // pass parent as placeholder
        // get a user by id or username
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                return userData;
            }
            
            throw new AuthenticationError("You must log in to view this page.")
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
        login: async (parent, { email, password }) => {
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
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    // using addToSet instead of push to prevent duplicates
                    { $addToSet: { savedBooks: newBook } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You must be logged in to perform this action');
        },
        // remove book from savedBooks
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
            throw new AuthenticationError('You must be logged in to perform this action')
        }
    }
};

module.exports = resolvers;