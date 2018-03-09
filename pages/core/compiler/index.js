module.exports = function(locals){
  locals.project.compiler = {
    script: require('./script')(locals),
    style: require('./style')(locals)
  };
};
