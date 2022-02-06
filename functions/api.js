const _ = require('lodash');
const jsonQuery = require('json-query')
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

exports.handler = async (event, context) => {

    function getJsonQuery(queryParams) {
        let query = [];

        _.forOwn(queryParams, function(searchQueries, likeKey) {
            const isLike = /_like$/.test(likeKey);
            if (isLike) {
                const key = likeKey.replace('_like', '');
                console.log("like key: " + key);

                _.forEach(searchQueries, function(searchQuery) {
                    query.push('[*' + key + '~/.*' + searchQuery + '/i]'); 
                });
            }
        });

        return query.join('');
    }

    function getDatabase() {
        const adapter = new FileSync('db.json')
        const db = low(adapter);
        return db;
    }

    try {
        const loadDatabase = async () => getDatabase()
        const db = await loadDatabase();
        const queryParams = event.multiValueQueryStringParameters;

        let result = [];
        if (queryParams.hasOwnProperty('id')) {
            result = db.get('songs').find({id: queryParams.id*1}).value();
        } else if (!_.isEmpty(queryParams)) {
            result = db.get('songs').value();
            query = getJsonQuery(queryParams);
            result = jsonQuery(query, {data: result, allowRegexp: true}).value
        } else {
            result = db.get('songs').value();
        }


        return {
            statusCode: 200,
            body: JSON.stringify(result),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: error.message }),
        }
    }
}