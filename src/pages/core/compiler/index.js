module.exports = function(locals){
  return locals.project.compiler = {
    script: require('./script')(locals),
    style: require('./style')(locals)
  };
};
