//. crdt listen
/**
 * event: {
 *	detail: [{
 *		retain, //. position for insert and delete case
 *		insert, //. insert string
 *		delete, //. delete length
	}]
 * }
 * 
 * ex:	{insert: "testing", retain: 8}
 *		{delete: 10, reatin: 7}
 */
import crdt from '../../CoCreate-crdt/src';  
import  '../../CoCreate-input/src';  
import  '../../CoCreate-text/src';  
import domText from '../../CoCreate-domText/src';
let textArea = document.getElementById('textArea');

// let str = `	<body element_id="body" style="padding:1;">
		
// 		<h1 element_id="t1" name="1">test 4441</h1>
// 		<h1 element_id="t3" name="3">test 3</h1>
// 		<h1 element_id="t2" name="2">test 2</h1>
// 		<h1 element_id="t4" name="4">test 4</h1>`

// function posIdMap(){
//   this.id = [];
//   this.offset = [];
// }

//   const attRegex = /element_id="([^"]+?)"/i;
// posIdMap.prototype.generateMapIdPos = function generateMapIdPos(){
//   let matches = this.html.matchAll(attRegex);
//   for(let match of matches)
//   {
//     console.log(match[1])
//     // domText.findPositionFunc({html: this.html, target: match[1]})
    
//   }
//     // let pos = domTextInsertAdajcent();
//     // get last pos, minus, store offset
// }


// function findIdPos(position)
// {
//   let sum = 0;
//   for(let i = 0;;){
//     sum += mapId[i];
//     if(sum > position)
//       break;

//   }
//   if(i % 2)
//     i--;
    
//   return id[i/2];
// }

// function affectMapId(id){
//   // get id index
//   // get pos from index
// }


let crdtCon = {
  collection: textArea.getAttribute('collection'),
  document_id: textArea.getAttribute('document_id'),
  name: textArea.getAttribute('name'),

};

crdt.init(crdtCon);
const elIdSch = 'element_id="';
const eIdAfter = elIdSch.length;

textArea.addEventListener('cocreate-crdt-update', function(event) {
  var info = event.detail;
   console.log(info)
  // let task, pos = 0, length;
  // if(info[0].retain)
  // {
  //   pos = info[0].retain;
  //   task = Object.keys(info[1])[0];
  //   length = info[1][task];
  // }
  // else
  // {
  //   task = Object.keys(info[1])[0];
  //   length = info[1][task];
  // }
  // if(task =="delete")
  //   pos -= length;
    

  
  // let chunk1, chunk2, html = textArea.value;
  
  // if(pos)
  // {
  //   chunk1 = html.substr(0,pos);
  //   let ch1Index = chunk1.lastIndexOf();
  //   if(ch1Index != -1)
  //   {
  //     let id =  getElId(ch1Index);
  //     // let pos = domTextInsertAdajcent(id);
     
  //   }
  //   let chunk2 = html.substr(pos);
  // }
  // else
  // chunk2 = html;
  
  // let ch1Index = chunk1.IndexOf('element_id="');
  // if(ch1Index != -1)
  //     getElId(ch1Index);
  
  
  
  // if (pos >= pos.from && pos <= pos.to )
  //     {
  //       // change happend inside element=id
  //       // pick up element from to, parse, 
  //       // if parse error throw error
  //       // otherwise find the element in dom and manipulate
  //     }
  //     else if(pos > pos.to && pos < pos2.from)
  //     {
  //       // same as above but manipulate either adjacent or text
  //     }
  //     else (pos >= pos2.from)
  //     {
  //       // same as if but with id=pos2
  //     }
  //     // else
  //     // {
  //     //   // change is outside of an element
  //     //   // ?: parse text what's the result?
  //     //   // if(task == '')
  //     //   // 
  //     // }
  

  
  // console.log(event, pos,task, length)
  

})


function domText() {

}


domText.prototype.init = function init() {

}


function getElId(){
  for (let i = eIdAfter;; i++ ) {
    
  }
}


// {
//   0: 5,
//   1: 13
// }





export default { crdt }