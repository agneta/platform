const chai = require('chai');

module.exports = function() {

    describe('/GET book', () => {
        it('it should GET all the books', (done) => {
            chai.request('http://')
                .get('/book')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

};
