const queryString = require('query-string');
 

var parameters = {class: [1, 2, 3], skills: "ai"};


var ans = queryString.stringify(parameters);



console.log(ans);
