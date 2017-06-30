module.exports = function() {
    return {
        "name": "Search_Keyword",
        "base": "PersistedModel",
        "idInjection": true,
        "options": {},
        "properties": {
            "value": {
                "type": "String",
                "required": true
            },
            "lang": {
                "type": "String",
                "required": true
            }
        },
        "relations": {
            "positions": {
                "type": "hasMany",
                "model": "Search_Position",
                "foreign_key": "keywordId"
            }
        },
        "validations": [],
        "methods": {},
        "indexes": {
            "ValueLang": {
                "keys": {
                    "value": 1,
                    "lang": 1
                },
                "options": {
                    "unique": true
                }
            }
        }
    };
};
