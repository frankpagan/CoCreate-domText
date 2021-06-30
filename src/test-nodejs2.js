// test case 1
const domHtmlManipulator = require('./index.js')
// let html = `<b>text1</b><b>text2</b>`;
let html = `<b>text1</b><b aa="22">text2</b>`;

const { DOMParser } = require('xmldom')
// const { JSDOM } = require("jsdom");

const root =new DOMParser().parseFromString( html, 'text/html')

console.log('aa')
console.log(root.childNodes[0].attributes)

// for(let a of {a:2,b:5})
// {
// console.log(a)
// console.log(a)
  
// }
process.exit();

let d = new domHtmlManipulator(html, domHtml);



function add({ pos, changeStr }) {



  console.log({ pos, action: 'add', changeStr })

  d.logFindPositionNodeJs({ from: pos, })

  let dump = d.findElByPos({ pos, action: 'add', changeStr });
  console.log('result: ', dump);

  d.logFindPositionNodeJs({ from: pos, to: pos + changeStr.length });

  console.log('\n\n');
  return dump;
}

function remove({ pos, removeLength }) {

  console.log({ pos, action: 'remove', removeLength })

  d.logFindPositionNodeJs({ from: pos, })

  let dump = d.findElByPos({ pos, action: 'remove', removeLength });

  console.log('result: ', dump);

  d.logFindPositionNodeJs({ from: pos - removeLength, })

  return dump;
}


// change node text
// add({ pos: 8, changeStr: '<b>ff</b>' });
remove({ pos: 15, removeLength:7 });

// there are some changes that happen over time. creates something new


// todo: element_id should be stored somewhere outside html
// todo: all changes that result in to do nothing but rescan should be saved (el_id)
// and be rescan(ed) on consequence change (the ones that are sibiling to the change element)
// if a change went as far as removing multiple element in one move it should be handled somewhere else too


// <b>text1</b><b>t</b><b>text3</b>


// if remove a few char 
  // current html checked
// if remove a whole element
  // 
  
  // resacn should be with new Html
  
  // if it's adding 
    // if it's attribute and non-destructive: do it
    // else rescan
    // if it's tag name and non-destructive: do it
    // else rescan
    // if it's nodeText with html or noraml text 
    // rescan everytime
    
    
  // if it's removing the starting pos and pos + remove-length should both be scanned (as a range)
  // if it's out of context of attribute and tag name , they should be resacnned regardless



/**
 * 1. find the element id that is changed or if it's a remove from pos to any element to pos + removeLength, and find common parent
 * 2. parse it as dom
 * 3. find the respective element in the real dom
 * 4. do comapre and overwrite 
 * 
 * 
*/
