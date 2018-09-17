const express = require('express')
const graphqlHTTP = require('express-graphql')
const app = express()
const fetch = require('node-fetch')
const schema = require('./schema.js')
const util = require('util')
const parseXML = util.promisify(require('xml2js').parseString)
const {GraphQLSchema,GraphQLObjectType,GraphQLInt,GraphQLString,GraphQLList} = require('graphql')


const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields:()=>({
    title: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].title[0]
     
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].image_url[0]
    },
    image : {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].image_url[0]
    },
    description: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].description[0]
    },
    publisher: {
      type:GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].publisher[0]
    },
    rating: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].average_rating[0]
    },
    year: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].publication_year[0]
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: (xml, args, context) => {
        const authorElement = xml.GoodreadsResponse.book[0].authors[0].author;
        const ids = authorElement.map(elem => elem.id[0])
        return context.authorLoader.loadMany(ids)
        
      }
    }

  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml =>
        xml.GoodreadsResponse.author[0].name[0]
    },
    books: {
      type: new GraphQLList(BookType),
       resolve:(xml, args, context) =>{
         const ids = xml.GoodreadsResponse.author[0].books[0].book.map(elem => elem.id[0]._)
         return context.bookLoader.loadMany(ids)
         
       }  
    }
    
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args, context) => context.authorLoader.load(args.id)
      }
    })
  })
})