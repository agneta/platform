module.exports = function() {
    return {
        "name": "Search_Field",
        "base": "PersistedModel",
        "idInjection": true,
        "options": {},
        "properties": {
            "value": {
                "type": "String",
                "required": true
            },
            "type": {
                "type": "String",
                "required": true
            }
        },
        "relations": {
            "positions": {
                "type": "hasMany",
                "model": "Search_Position",
                "foreign_key": "fieldId"
            }
        },
        "validations": [],
        "acls": [{
            "accessType": "*",
            "principalType": "ROLE",
            "principalId": "$everyone",
            "permission": "DENY"
        }],
        "methods": {}
    };
};
