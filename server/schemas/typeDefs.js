// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create typeDefs
const typeDefs = gql`
    type Query {
        me: User
    }

    type Mutation {
        login(email: Sring!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveBook()
        removeBook(bookId: ID!): User
    }

    type User {
        _id: ID
        username: String
        email: String
        bookCount: Int
        savedBooks: [Book]
    }

    type: Book {
        bookId: ID
        authors: [String]
        description: String
        title: String
        image: String
        link: String
    }

    type Auth {
        token: ID!
        user: User
    }
`;

// export typeDefs
module.exports = typeDefs;