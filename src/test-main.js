
import crdt from '../../CoCreate-crdt/src';  
import  '../../CoCreate-input/src';  
import  '../../CoCreate-text/src';  
// import domText from '../../CoCreate-domText/src';
let textArea = document.getElementById('textArea');
import domHtmlManipulator from './refactored.1.js'


function replaceText(html){

}

// let html = `	<body data-element_id="body" style="padding:1;">
		
// 		<h1 data-element_id="t1" name="1">test 4441</h1>
// 		<h1 data-element_id="t3" name="3">test 3<h1 data-element_id="t5" name="5">test 5</h1> still test 3 <h1 data-element_id="t6" name="6">test 6</h1>hhhhhh </h1>
// 		<h1 data-element_id="t2" name="2">test 2</h1>
// 		<h1 data-element_id="t4" name="4">test 4</h1>`;

  // crdt.replaceText({
  //   collection: "apples",
  //   document_id: "603ffc2dc975bd2c3cfe6b5f",
  //   name: "html2",
  //   value: html,
  // })

let isInit = false;
 let d;
function init(info){
  isInit = true;
  d = new domHtmlManipulator(info[0].insert);
}




 function add({ pos, changeStr }) {



  console.log({ pos, action: 'add' , changeStr })
  if (typeof process === 'object')
    d.logFindPositionNodeJs({ from: pos, })
  else
    d.logFindPosition({ from: pos, })
  let dump = d.findElByPos({ pos, action: 'add', changeStr });
  console.log('result: ', dump);
  if (typeof process === 'object')
    d.logFindPositionNodeJs({ from: pos, to: pos + changeStr.length });
  else
    d.logFindPosition({ from: pos, to: pos + changeStr.length });
  console.log('\n\n');
  return dump;
}

  function remove({ pos, removeLength }) {

  console.log({ pos, action: 'remove', removeLength })
  if (typeof process === 'object')
    d.logFindPositionNodeJs({ from: pos, })
  else
    d.logFindPosition({ from: pos, })
  let dump = d.findElByPos({ pos, action: 'remove', removeLength });

  console.log('result: ', dump);
  if (typeof process === 'object')
    d.logFindPositionNodeJs({ from: pos - removeLength, })
  else
    d.logFindPosition({ from: pos - removeLength, })
  console.log('\n\n');
  return dump;
}



let crdtCon = {
  collection: textArea.getAttribute('collection'),
  document_id: textArea.getAttribute('document_id'),
  name: textArea.getAttribute('name'),

};

crdt.init(crdtCon);


textArea.addEventListener('cocreate-crdt-update', function(event) {
  var info = event.detail;
  let pos = isFinite(info[0].retain)? info[0].retain : 0;
  if(!isInit)
  return init(info)
     
  if(info[1].insert)
  {
    let changeStr =  info[1].insert;
     console.log(pos, changeStr );
     add({pos, changeStr})
     
  }
  else
  {
    let removeLength = info[1].delete;
         console.log(pos , removeLength);
  }
  
   

})




export default { crdt }