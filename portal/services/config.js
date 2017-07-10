module.exports = {
    token: {
        name: 'access_portal'
    },
    signinRoles: ['administrator', 'reviewer', 'editor'],
    limiter: {
        global: false
    },
    search: {
        media: {
            models: {
                position: 'Media_Position',
                source: 'Media',
                field: 'Media_Field',
                keyword: 'Media_Keyword'
            }
        }
    }

};
