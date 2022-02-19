import { _ } from 'lodash'
import { Low, JSONFile } from 'lowdb'

exports.handler = async (event, context) => {


    function getFilterResults(songs, queryParams) {
        const jsonQuery = require('json-query');
        const query = buildQuery(queryParams);

        return jsonQuery(query, {data: songs, allowRegexp: true}).value;
    }

    function buildQuery(queryParams) {
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

    try {
        const adapter = new JSONFile('./data/db.json');
        const db = new Low(adapter);
        await db.read();

        const queryParams = event.multiValueQueryStringParameters;

        let result = false;
        if (queryParams.hasOwnProperty('id')) {
            result = _.find(db.data.songs, {id: queryParams.id[0]*1});
        } else if (!_.isEmpty(queryParams)) {
            result = getFilterResults(db.data.songs, queryParams);
        } else {
            result = db.data.songs;
        }

        if (result) {
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            }
        }

        return {
            statusCode: 204,
            body: JSON.stringify([]),
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: error.message }),
        }
    }
}