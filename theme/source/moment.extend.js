moment.fn.hourOfYear = function(value) {

    if (value) {
        var dayOfYear = Math.ceil(value / 24);
        var hour = value % 24;
        this.dayOfYear(dayOfYear);
        this.hour(hour);
        return this;
    }

    return ((this.dayOfYear() - 1) * 24) + this.hour();

};
