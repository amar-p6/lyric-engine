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

    function respond(code, data) {
        return {
            statusCode: code,
            body: JSON.stringify(data),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET",
            }
        }
    }

    try {
        const queryParams = event.multiValueQueryStringParameters;
        if (queryParams.hasOwnProperty('id')) {
            const song = require(`../data/${queryParams.id[0]*1}.json`);
            return respond(200, song);
        }

        const adapter = new JSONFile('./data/db.json');
        const db = new Low(adapter);
        await db.read();

        let result = false;
        if (!_.isEmpty(queryParams)) {
            result = getFilterResults(db.data.songs, queryParams);
        } else {
            result = db.data.songs;
        }

        if (result) {
            return respond(200, result);
        }

        return respond(204, []);
    } catch (error) {
        return respond(500, { msg: error.message });
    }
}