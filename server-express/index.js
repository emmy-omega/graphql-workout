let express = require('express');
let graphqlHTTP = require('express-graphql');
let cors = require('cors');

let {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt
} = require('graphql');

let fakeBooks = [
  {
    id: 1,
    title: 'The Long Earth',
    genre: 'Sci-Fi',
    authorId: 3
  },
  {
    id: 2,
    title: 'The Color of Magic',
    genre: 'Fantasy',
    authorId: 3
  },
  {
    id: 3,
    title: 'The Light Fantastic',
    genre: 'Fantasy',
    authorId: 3
  },
  {
    id: 4,
    title: 'The Final Empire',
    genre: 'Fantasy',
    authorId: 2
  },
  {
    id: 5,
    title: 'The Hero of Ages',
    genre: 'Fantasy',
    authorId: 2
  },
  {
    id: 6,
    title: 'The Name of the Wind',
    genre: 'Fantasy',
    authorId: 1
  }
];

let fakeAuthors = [
  {
    id: 1,
    name: 'Patrick Rothfuss',
    age: 44
  },
  {
    id: 2,
    name: 'Brandon Sanderson',
    age: 42
  },
  {
    id: 3,
    name: 'Terry Pratchett',
    age: 66
  }
];

// specify the types
let bookType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: authorType,
      resolve: b => fakeAuthors.find(a => a.id == b.authorId)
    }
  })
});

let authorType = new GraphQLObjectType({
  name: 'Author',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(bookType),
      resolve: a => fakeBooks.filter(b => b.authorId == a.id)
    }
  }
});

let bookInput = new GraphQLInputObjectType({
  name: 'BookInput',
  fields: {
    title: { type: GraphQLString },
    genre: { type: GraphQLString },
    authorId: { type: GraphQLID }
  }
});

let authorInput = new GraphQLInputObjectType({
  name: 'AuthorInput',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt }
  }
});

let queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    books: {
      type: new GraphQLList(bookType),
      resolve: () => fakeBooks
    },
    book: {
      type: bookType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => {
        console.log('fakebooks', fakeBooks);
        return fakeBooks.find(book => book.id == id);
      }
    },
    authors: {
      type: new GraphQLList(authorType),
      resolve: () => fakeAuthors
    },
    author: {
      type: authorType,
      args: { id: { type: GraphQLID } },
      resolve: (_, { id }) => fakeAuthors.find(author => author.id == id)
    }
  }
});

let mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addBook: {
      type: bookType,
      args: {
        book: { type: bookInput }
      },
      resolve: (_, { book }) => {
        let nuBook = { id: fakeBooks.length + 1, ...book };
        console.log('server:book', book);

        fakeBooks.push(nuBook);
        console.log('nufakebooks', fakeBooks);
        return nuBook;
      }
    },
    updateBook: {
      type: bookType,
      args: {
        id: { type: GraphQLID },
        book: { type: bookInput }
      },
      resolve: (_, { id, book }) => {
        let i = fakeBooks.indexOf({ id });
        return (fakeBooks[i] = Object.assign(fakeBooks[i], book));
      }
    }
  }
});

let schema = new GraphQLSchema({ query: queryType, mutation: mutationType });

let app = express();

app.use(cors());
app.use(
  '/gql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});
