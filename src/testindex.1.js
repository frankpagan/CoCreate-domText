
var HTMLParser = require('fast-html-parser');
 
var root = HTMLParser.parse(`<h1 data-element_id="t3" name="3">te/h1>`);


console.log(root.childNodes[0].value); 