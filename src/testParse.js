/*global DOMParser*/
// tag name & attribute names are case-insensetive


String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index);
};
String.prototype.removeAt = function(index, to) {
  return this.substr(0, index) + this.substr(to);
};

let spaceAll = "(?:\u{0020}|\u{0009}|\u{000A}|\u{000C}|\u{000D})";
let space = "(?:\u{0020}|\u{0009})";
let allAttributeName = `[a-z0-9]+?`;
let allStyleName = "[^:]+?";
let allClassName = '[^"]+?';

let sps = `${space}*?`;
let spa = `${space}+?`;
let spsa = `${spaceAll}*?`;
let spaa = `${spaceAll}+?`;
let tgs = `(?:<(?<tagName>[a-z0-9]+?))`;
let getEndTag = tagName => `(?:<(?<isClosing>${sps}\/${sps})?${tagName}${sps})`;

const getRegAttribute = (attributeName) =>
  `(?:${spa}${attributeName}(?:="[^"]*?")?)`;
const getRegStyle = (styleName) =>
  `(?:${sps}${styleName}${sps}\:${sps}[^\;]+?${sps}\;${sps})`;
const getRegClassStyle = (styleName) => `(?:${sps}${styleName}:[^ ]+${sps})`;
const getRegClass = (className) => `(?:${sps}${className}${sps})`;
const getTagClose = (tagName) => `(?:${sps}\/${sps}${tagName}${sps})`;
const getRegTagStart = (tagName) => `(?:<${tagName}${sps})`;



let at = getRegAttribute(allAttributeName);
let anyAtt = getRegAttribute('');
let the = `${sps}(?<tagSlash>\/)?${sps}>`;
let sty = getRegStyle(allStyleName);

let cls = getRegClass(allClassName);
let mcls = `${cls}*?`;
// todo: check with a tag like <a />

const idSearch = 'element_id=';
let spaceBegin = `(?<spaceBegin>${spa})`;
let spaceEnd = `(?<spaceEnd>${sps})`;
let attValue = `(?:(?:="(?<attValue>[^"]*?)")|${spa})`
let attributeList = new RegExp(`${spaceBegin}(?<att>(?<attName>[a-z0-9\-\_]+)(${attValue})?)${spaceEnd}`, 'gis');


let textdomfr = new Map(),
  textdomfa = new Map();
  
let html = `<!DOCTYPE html><html>
  
	<body element_id="body" style="padding:1;">
	<textarea     
	      <h1 name="4"      class="color:red"      \t element_id="445797c5-e01b-42cf-a8a5-f753ab60c8f6" >test 5</h1>
		<h1 element_id="t1" name="1">test 1</h1>
		<h1 element_id="t3" name="3">test 3</h1>
		<h1 element_id="t2" name="2">test 2</h1>
		<h1 element_id="t4" name="4">test 4</h1>
		
		<script>
        var config = {
            apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
            organization_Id: '5de0387b12e200ea63204d6c',
            host: 'wss://server.cocreate.app:8088'
        }
    </script>
    
     <script src="./CoCreate-builder-canvas.js"></script>
        
   
	</body>
</html>`
  
   let sch = `(?:${sps}element_id\=\"445797c5-e01b-42cf-a8a5-f753ab60c8f6\"${sps})`;
  let reg = `(?<tagWhole>${tgs}${at}*?${sch}${at}*?${the})`;
 let r = html.match(new RegExp(`${reg}`,'is'))
  
  console.log(r)