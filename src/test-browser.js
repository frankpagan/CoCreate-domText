// test case 1
import crdt from '../../CoCreate-crdt/src';
import '../../CoCreate-input/src';
import '../../CoCreate-text/src';
import domText from '../../CoCreate-domText/src';
import {logFindPosition, logFindPositionNodeJs} from './dev'
import domHtmlManipulator from './index.js';

let textArea = document.getElementById('textArea');



let crdtCon = {
  collection: textArea.getAttribute('collection'),
  document_id: textArea.getAttribute('document_id'),
  name: textArea.getAttribute('name'),

};


crdt.init(crdtCon);

let isInit = true;
let add, remove;
textArea.addEventListener('cocreate-crdt-update', function(event) {

  var info = event.detail;
  console.log(info)
  if (isInit) {

    init(info[0].insert)
    isInit = false;

  }
  else {
    let pos = 0, actionIndex = 0;
    if (info[0].retain) {
      pos = info[0].retain;
      actionIndex = 1;
    }

    if (info[actionIndex].delete)
      remove({ pos, removeLength: info[actionIndex].delete  , html: textArea.value})
    else
      add({ pos, changeStr: info[actionIndex].insert , html: textArea.value})

  }



})





function init(html) {

  let d = new domHtmlManipulator(html, document.body.parentElement);
  
  d.logFindPosition = logFindPosition;
  d.logFindPositionNodeJs = logFindPositionNodeJs;
  
  add = function add({ pos, changeStr , html}) {
    console.log({ pos, action: 'add', changeStr })

    d.logFindPosition({ from: pos, })

    let dump = d.changeDom({ pos, changeStr, html });
    // d.html = html;
    console.log('result: ', dump);

    d.logFindPosition({ from: pos, to: pos + changeStr.length });

    console.log('\n\n');
    return dump;
  }

  remove = function remove({ pos, removeLength, html }) {

    console.log({ pos, action: 'remove', removeLength })

    d.logFindPosition({ from: pos, })

    let dump = d.changeDom({ pos, removeLength, html });
    // d.html = html
    console.log('result: ', dump);

    d.logFindPosition({ from: pos - removeLength, })

    return dump;
  }

}


// // change node text
// add({ pos: 180, changeStr: '<b>ff</b>' });
// add({ pos: 172, changeStr: 'aaaa' });
// remove({ pos: 172, removeLength: 1 });
// add({ pos: 175, changeStr: '=' });
// add({ pos: 180, changeStr: '</h1><h1>' });

// remove({ pos: 187, removeLength: 2});
// remove({ pos: 145, removeLength: 2});





window.refresh = function refresh() {
  //  CoCreate.domText

  crdt.replaceText({
    collection: "apples",
    document_id: "603ffc2dc975bd2c3cfe6b5f",
    name: "html2",
    value: `<!DOCTYPE html><html>
	<head>
	</head>
	<body data-element_id="body" style="padding:1;">
		
		<h1 data-element_id="t1" name="1">test 1</h1>
		<h1 data-element_id="t3" name="3">test 3</h1>
		<h1 data-element_id="t2" name="2">test 2</h1>
		<h1 data-element_id="t4" name="4">test 4</h1>
			
        <script data-element_id="script1">
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

export default { crdt }
