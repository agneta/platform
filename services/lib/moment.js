var moment = require("moment");

moment.prototype.hourOfYear = function(value) {

    if (value) {
        var dayOfYear = Math.ceil(value / 24);
        var hour = value % 24;
        if (hour === 0) {
            dayOfYear += 1;
        }
        this.dayOfYear(dayOfYear);
        this.hour(hour);
        return this;
    }

    return ((this.dayOfYear() - 1) * 24) + this.hour();

};

var m = moment().utc().dayOfYear(100).hour(30);
var hourOfYear = m.hourOfYear();
//console.log(hourOfYear);
//console.log(m.hourOfYear(2929).hourOfYear());
