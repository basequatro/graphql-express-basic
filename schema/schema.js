const graphql = require('graphql');
//const _ = require('lodash');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

// const users = [
//     { id: '23', firstName: 'André', age: 32 },
//     { id: '47', firstName: 'Steve Jobs', age: 27 },
// ]

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(resolve => resolve.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt }, 
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}/`)
                    .then(resolve => resolve.data);
            }
        }
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                // return _.find(users, { id: args.id });
                return axios.get(`http://localhost:3000/users/${args.id}`)
                .then(response => response.data);
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(response => response.data);
            }
        }

    }
});
//

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: { 
                firstName : { type: GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            }, 
            resolve(parentValue, { firstName, age }) {
                return axios.post(`http://localhost:3000/users`, { firstName, age })
                    .then(res => res.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            }
        },
        editUser: {
            type: UserType,
            args: { 
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName : { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            }, 
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data);
            }
            
        }

    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
});

