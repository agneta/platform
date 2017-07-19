/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/details.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
module.exports = function(Model) {

    Model.details = function(id, location) {

        var promise;

        if (id) {
            promise = Model.findById(id);
        }

        if (location) {
            promise = Model.findOne({
                where: {
                    location: Model.__fixPath(location)
                }
            });
        }

        if (!promise) {
            throw new Error('Must provide the file id or location');
        }

        return promise.then(function(object) {
            if (!object) {
                return {
                    notfound: 'Not found on database'
                };
            }

            return Model.__prepareObject(object);
        });

    };

    Model.remoteMethod(
        'details', {
            description: "Get a file details",
            accepts: [{
                arg: 'id',
                type: 'string',
                required: false
            }, {
                arg: 'location',
                type: 'string',
                required: false
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'get',
                path: '/details'
            }
        }
    );
};
