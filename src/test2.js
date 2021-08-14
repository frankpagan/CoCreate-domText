// test case 1
import crdt from '../../CoCreate-crdt/src';
import '../../CoCreate-input/src';
import '../../CoCreate-text/src';
import domText from '../../CoCreate-domText/src';
let textArea = document.getElementById('textArea');

import domHtmlManipulator from './index.js';
const html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body element_id="body" style="padding:1;">
		
		<h1 element_id="t1" name="1">test 1</h1>
		<h1 element_id="t3" name="3">test 3</h1>
		<h1 element_id="t2" name="2">test 2</h1>
		<h1 element_id="t4" name="4">test 4</h1>
			
        <script element_id="script1">
            var config = {
              apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
              securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
              organization_Id: '5de0387b12e200ea63204d6c'
            }
        </script>
        
   
	</body>
</html>`;
// function parseAllNode(str) {
//   let doc = new DOMParser().parseFromString(str, "text/html");
//   return doc.body.parentElement;

// }

// let domHtml = parseAllNode(html)

let d = new domHtmlManipulator(html, document.body.parentElement);



function add({ pos, changeStr }) {



  console.log({ pos, action: 'add', changeStr })

  d.logFindPosition({ from: pos, })

  let dump = d.changeDom({ pos, changeStr });
  d.html = d.html.replaceAt(pos, changeStr)
  console.log('result: ', dump);

  d.logFindPosition({ from: pos, to: pos + changeStr.length });

  console.log('\n\n');
  return dump;
}

function remove({ pos, removeLength }) {

  console.log({ pos, action: 'remove', removeLength })

  d.logFindPosition({ from: pos, })

  let dump = d.changeDom({ pos, removeLength });
  d.html = d.html.removeAt(pos - removeLength, pos)
  console.log('result: ', dump);

  d.logFindPosition({ from: pos - removeLength, })

  return dump;
}




let crdtCon = {
  collection: textArea.getAttribute('collection'),
  document_id: textArea.getAttribute('document_id'),
  name: textArea.getAttribute('name'),

};


// crdt.replaceText({
//     ...crdtCon,
//     value: '',
//   })




// crdt.insertText({
//     ...crdtCon,
//     value: html,
//   })




crdt.init(crdtCon);
const elIdSch = 'element_id="';
const eIdAfter = elIdSch.length;

textArea.addEventListener('cocreate-crdt-update', function(event) {
  var info = event.detail;
  if(info[0]?.insert?.length > 40)
    return; 
  console.log(info)
  let pos = 0,
    actionIndex = 0;
  if (info[0].retain) {
    pos = info[0].retain;
    actionIndex = 1;
  }

  if (info[actionIndex].delete)
    remove({ pos: pos + info[actionIndex].delete, removeLength: info[actionIndex].delete })
  else
    add({ pos, changeStr: info[actionIndex].insert })


})



window.refresh = function refresh() {
  //  CoCreate.domText

  crdt.replaceText({
    collection: "apples",
    document_id: "603ffc2dc975bd2c3cfe6b5f",
    name: "html2",
    value: `<!DOCTYPE html><html>
	<head>
	</head>
	<body element_id="body" style="padding:1;">
		
		<h1 element_id="t1" name="1">test 1</h1>
		<h1 element_id="t3" name="3">test 3</h1>
		<h1 element_id="t2" name="2">test 2</h1>
		<h1 element_id="t4" name="4">test 4</h1>
			
        <script element_id="script1">
            var config = {
              apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
              securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
              organization_Id: '5de0387b12e200ea63204d6c'
            }
        </script>
        
   
	</body>
</html>`,
  })

}

// // change node text
// add({ pos: 180, changeStr: '<b>ff</b>' });
// add({ pos: 172, changeStr: 'aaaa' });
// remove({ pos: 172, removeLength: 1 });
// add({ pos: 175, changeStr: '=' });
// add({ pos: 180, changeStr: '</h1><h1>' });

// remove({ pos: 187, removeLength: 2});
// remove({ pos: 145, removeLength: 2});
export default { crdt }
