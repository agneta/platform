module.exports = function() {
    return {
        "name": "Search_Position",
        "base": "PersistedModel",
        "idInjection": true,
        "options": {},
        "properties": {
            "value": {
                "type": "Number",
                "required": true
            },
            "original": {
                "type": "String",
                "required": true
            },
            "fieldId": {
                "type": "String",
                "required": true
            },
            "keywordId": {
                "type": "String",
                "required": true
            },
            "pageId": {
                "type": "String",
                "required": true
            }
        },
        "relations": {
            "page": {
                "type": "belongsTo",
                "model": "Search_Page",
                "foreign_key": "pageId"
            },
            "keyword": {
                "type": "belongsTo",
                "model": "Search_Keyword",
                "foreign_key": "keywordId"
            },
            "field": {
                "type": "belongsTo",
                "model": "Search_Field",
                "foreign_key": "fieldId"
            }
        },
        "indexes": {
            "page_keyword_index": {
                "pageId": 1,
                "keywordId": 1
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
