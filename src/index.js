// tag name & attribute names are case-insensetive



// domHtmlManipulator.prototype.getPosAction =
//   function getPosAction(elPos, pos, changeStr, hasChild, childPos) {
//     if (pos > elPos.tagStPos && pos < elPos.tagStClAfPos) {
//       return 1;
//     }
//     else if (pos > elPos.tagStClAfPos && pos < elPos.tagEnPos) {
//       if (childPos) {
//         return {
//           action: 'innerText',
//           pos: this.minusEl(pos, childPos),
//           changeStr
//         }
//       }
//       else
//         return {
//           action: 'innerText',
//           pos,
//           changeStr
//         }
//     }
//     else {
//       return { pos, ...elPos };

//     }

//   }


// domHtmlManipulator.prototype.minusEl =
//   function minusEl(pos, el) {

//     return pos - el.tagEnd - el.tagStart;

//   }



// domHtmlManipulator.prototype.findElByPos = function findElByPos({ pos, action, changeStr, removeLength }) {
//   if(pos < 0 || pos > this.html.length)
//     throw new Error('position is out of range');

//   this.changeStr = changeStr;
//   this.removeLength = removeLength;
//   this.pos = pos;
//   this.action = action;
//   let iof1pos, iof2pos;
//   let pos1 = pos - idSearch.length,
//     pos2 = pos + idSearch.length;
//   let leftList = [],
//     rightList = [];
// // obsolete: increase pos1 and pos2 if it's out of range of html
//   // if(pos1 > this.html.length)
//   // {
//   //   pos1 = this.html.length;
//   // }

//   // if(pos2 < 0)
//   // {
//   //   pos2 = 0;
//   // }

//   while (true) {
//     //  a mechanism to break the loop
//     if(pos1 === -1 && pos2 === -1)
//       break;


//     // searching minus the idSearch.length as it could match in loop
//     if (pos1 !== -1 )
//       pos1 = this.html.indexOf(idSearch, pos1 +  idSearch.length);
//     if (pos2 !== -1)
//       pos2 = this.html.lastIndexOf(idSearch, pos2 - idSearch.length);

//     if (pos1 !== -1)
//       iof1pos = this.dumpPositions(pos1);


//     if (pos2 !== -1)
//       iof2pos = this.dumpPositions(pos2);
//   // console.log(iof1pos, iof2pos);
//   // return;

//     // todo: rightlist leftlist should be inside iof2pos = this.dumpPositions(pos2); if
//     rightList.push(iof1pos)
//     leftList.push(iof2pos)
//     if (iof1pos && iof1pos.tagStart < pos && iof1pos.tagEnd > pos) {
//       if (iof2pos && iof2pos.tagStart < pos && iof2pos.tagEnd > pos) {
//         if (iof1pos.length < iof2pos.length) {

//           return this.reduceToCommand(iof1pos, leftList);    
//         }
//         else {
//           return this.reduceToCommand(iof2pos, leftList);  
//         }
//       }
//       else {
//         return this.reduceToCommand(iof1pos, leftList);  
//       }

//     }
//     else {
//       if (iof2pos && iof2pos.tagStart < pos && iof2pos.tagEnd > pos) {
//         return this.reduceToCommand(iof2pos, leftList);    
//       }
//       else {
//         continue;
//       }

//     }

//   }


//   // todo: after break, the text is added to end or begining of the html (we can't handle elements without id)
//   // 



// }





String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index);
};
String.prototype.removeAt = function(index, to) {
  return this.substr(0, index) + this.substr(to);
};

let space = "(?:\u{0020}|\u{0009}|\u{000A}|\u{000C}|\u{000D})";
// let space = " ";
let allAttributeName = `[^${space}\=\>]+`;
let allStyleName = "[^:]+?";
let allClassName = '[^"]+?';

let sps = `${space}*?`;
let spa = `${space}+?`;
let tgs = `(?:<(?<tagName>[a-z0-9]+?)${sps})`;
let endtgs = `(?:<(?<isClosing>${sps}\/${sps})?(?<tagName>[a-z0-9]+?)${sps})`;

const getRegAttribute = (attributeName) =>
  `(?:${spa}${attributeName}(?:="[^"]*?")?${sps})`;
const getRegStyle = (styleName) =>
  `(?:${sps}${styleName}${sps}\:${sps}[^\;]+?${sps}\;${sps})`;
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
function domHtmlManipulator(html) {


  this.html = html;
  this.param = {}
  // this.id = [];
  this.offset = [];

  // metadata
  this.tagStPos;
  this.tagStAfPos;
  this.tagStClPos;
  this.tagStClAfPos;
  this.tagEnPos;
  this.tagEnClAfPos;
  this.atSt;
  this.atEn;

  this.tagClosingTagName;
  this.tagClosingNameStart;
  this.tagClosingNameEnd;

  this.isOmission;

}


domHtmlManipulator.prototype.findStartTag = function findStartTag() {
  let sch = `(?:${sps}data-element_id\=\"${this.param.target}\"${sps})`;
  let reg = `(?<tagWhole>${tgs}${at}*?${sch}${at}*?${the})`;
  let tagStart = this.html.match(new RegExp(reg, "is"));

  if (!tagStart) throw new Error("findPosition: element can not be found. id:" + this.param.target);
  this.tagName = tagStart.groups.tagName.toUpperCase();
  if (tagStart && this.param.tagName && this.tagName !== this.param.tagName)
    throw new Error(
      "findPosition: tag name didn'tthis.param.tagName match, something is wrong"
    );

  this.tagStPos = tagStart.index;
  this.tagStAfPos = tagStart.index +
    (this.param.tagName ? this.param.tagName.length : 0) + 1;
  this.tagStClPos =
    tagStart.index +
    tagStart.groups.tagWhole.length -
    1 -
    (tagStart.groups.tagSlash ? 1 : 0);
  this.haveClosingTag = !tagStart.groups.tagSlash;
  this.tagStClAfPos = tagStart.index + tagStart.groups.tagWhole.length;
  this.tagNameEnd = this.tagStAfPos + this.tagName.length
  // if it's like <img />
  if (tagStart.groups.tagSlash) {
    this.tagEnPos = this.tagStClPos;
    this.tagEnClAfPos = this.tagStClAfPos;
    this.isOmission = true;
  }
};

domHtmlManipulator.prototype.getWholeElement = function getWholeElement() {
  if (!this.tagStPos) this.findStartTag();
  if (!this.tagEnPos) this.findClosingTag();

  return { from: this.tagStPos, to: this.tagEnClAfPos };
};


domHtmlManipulator.prototype.findClosingTag = function findClosingTag() {

  let match = this.html.substr(this.tagStClAfPos)
    .matchAll(new RegExp(`(?<tagWhole>${endtgs}${at}*?${the})`, 'g'));

  if (!match) throw new Error('could find any closing tag');

  let nest = 0;

  for (let i of match) {
    if (i.groups.isClosing) {
      if (!nest) {
        this.tagEnPos = this.tagStClAfPos + i.index;
        this.tagEnClAfPos = this.tagStClAfPos + i.index + i[0].length;
        this.tagClosingTagName = i.groups.tagName.toUpperCase();
        this.tagClosingNameStart = 1 + i.groups.isClosing.length + this.tagEnPos;
        this.tagClosingNameEnd = this.tagClosingNameStart + i.groups.tagName.length;

        break;

      }
      else
        nest--;

    }
    else
      nest++;
  }

}

domHtmlManipulator.prototype.getInsertAdjacentElement =
  function getInsertAdjacentElement() {
    if (!this.tagStPos) this.findStartTag();
    switch (this.param.property) {
      case "beforebegin":
        return { from: this.tagStPos };

      case "afterbegin":
        return { from: this.tagStClAfPos };

      case "beforeend":
        this.findClosingTag();
        return { from: this.tagEnPos };

      case "afterend":
        this.findClosingTag();
        return { from: this.tagEnClAfPos };

    }

    // todo: remove line
    // this.html.substr(this.tagStClAfPos);
  };

domHtmlManipulator.prototype.getClass = function getClass() {
  this.findAttribute("class", true);
  if (this.atEn) {
    let positions = this.findClassPos();
    return { ...positions, context: "value" };
  }
  // for set or remove
  else return { from: this.atSt, context: "attribute" };
};
domHtmlManipulator.prototype.findClassPos = function findClassPos() {
  let prRegClass = getRegClass(this.param.property);

  let classStart = this.html
    .substring(this.atSt, this.atEn)
    .match(
      new RegExp(`(?<ourClass>${prRegClass})(?<classstyle>\:[^\"\ ]+)(\ |\")?`, "is")
    );

  if (classStart && classStart.groups.ourClass)
    return {
      from: this.atSt + classStart.index,
      to: this.atSt +
        classStart.index +
        classStart.groups.ourClass.length +
        classStart.groups.classstyle.length,
    };
  else
    return {
      from: this.atEn,
    };
};
domHtmlManipulator.prototype.getStyle = function getStyle() {
  this.findAttribute("style", true);
  if (this.atSt === this.atEn) return { from: this.atSt, context: "value" };
  else if (this.atEn) {
    let positions = this.findStylePos();
    return { ...positions, context: "value" };
  }
  // for set or remove
  else return { from: this.atSt, context: "attribute" };
};

domHtmlManipulator.prototype.findStylePos = function findStylePos() {
  let prRegStyle = getRegStyle(this.param.property);
  // console.log('fffffffffffff',this.atSt, this.atEn, html
  //   .substring(this.atSt, this.atEn));return;
  let styleStart = this.html
    .substring(this.atSt, this.atEn)
    .match(
      new RegExp(`^(?<styleWhole>${sty})*?(?<ourStyle>${prRegStyle})`, "is")
    );
  if (styleStart && styleStart.groups.ourStyle) {
    let stlWleLen = styleStart.groups.styleWhole ?
      styleStart.groups.styleWhole.length :
      0;
    return {
      from: this.atSt + stlWleLen,
      to: this.atSt + stlWleLen + styleStart.groups.ourStyle.length,
    };
  }
  else
    return {
      from: this.atEn,
    };
};


// findAttribute
domHtmlManipulator.prototype.findAttribute =
  function findAttribute(property, isValueOnly) {

    if (!this.tagStAfPos) this.findStartTag();

    let prRegAttr = getRegAttribute(property);
    let regex = `^(?<beforeAtt>${at}*?)${prRegAttr}`;

    let attStart = this.html.substr(this.tagStAfPos).match(new RegExp(regex, "is"));

    if (attStart) {
      this.atSt =
        this.tagStAfPos +
        attStart.groups.beforeAtt.length +
        (isValueOnly ? 3 + property.length : 0);

      this.atEn = this.tagStAfPos + attStart[0].length - (isValueOnly ? 1 : 0);
    }
    else {
      this.atSt = this.tagStClPos;
    }
  };

domHtmlManipulator.prototype.getSetAttribute = function getSetAttribute(type) {
  switch (type) {
    case "get":
    case "set":
      this.findAttribute(this.param.property, true);
      break;
    case "remove":
      this.findAttribute(this.param.property);
      break;
  }
  return { from: this.atSt, to: this.atEn };
};


domHtmlManipulator.prototype.getInnerText = function getInnerText() {
  if (!this.tagStPos) this.findStartTag();
  this.findClosingTag();

  return { from: this.tagStClAfPos, to: this.tagEnPos };
}

// param type
//     {
//   tagName: realTagName, // optional
//   target,



// }
//   method,
//   property,
//   nextSibling,
//   skip,

domHtmlManipulator.prototype.setParam = function setParam(param) {

  Object.assign(this.param, param);
  if (param.tagName)
    this.param.tagName = this.param.tagName.toUpperCase();
}


domHtmlManipulator.prototype.logFindPosition = function logFindPosition(p) {
  console.log(this.param,
    "=================start=====================>>>>>>>>>>>>>>>>>>>"
  );
  if (p.to) {
    console.log(
      "%s%c<from>%c%s%c<to>%c%s",
      this.html.substring(p.from - 20, p.from),
      "color: red",
      "color: white",
      this.html.substring(p.from, p.to),
      "color: red",
      "color: white",
      this.html.substring(p.to, p.to + 20)
    );
  }
  else {
    // console.log(html.substring(p.from, p.from + 20));
    console.log(
      "%s%c<here>%c%s",
      this.html.substring(p.from - 20, p.from),
      "color: red",
      "color: white",
      this.html.substring(p.from, p.from + 40)
    );
  }
  console.log("==================end====================");
}

domHtmlManipulator.prototype.logFindPositionNodeJs = function logFindPositionNodeJs(p) {
  console.log(
    this.param,
    "========start=============>>>>>>>>>>>"
  );
  if (p.to) {
    console.log(
      this.html.substring(p.from - 20, p.from) +
      "\x1b[31m<from>\x1b[0m" +
      this.html.substring(p.from, p.to) +
      "\x1b[31m<to>\x1b[0m" +
      this.html.substring(p.to, p.to + 20)
    );
  }
  else {
    console.log(
      this.html.substring(p.from - 20, p.from) +
      "\x1b[31m<here>\x1b[0m" +
      this.html.substring(p.from, p.from + 40)
    );
  }
  console.log("==========end============");
}





domHtmlManipulator.prototype.generateMapIdPos = function generateMapIdPos() {
  let anyat = `(?:${spa}[^${space}\=\>]+(?:="[^"]*?")?${sps})`;
  let scht = `(?:${sps}data-element_id\=\"(?<elID>[^"]+?)\"${sps})`;
  let reg = RegExp(`(.+)(?<tagWhole>${tgs}${anyat}*?${scht}${anyat}*?${the})(.*?)?$`, 'g');;

  let matches = this.html.match(new RegExp(reg, "i"));
  console.log(matches)

}

// search the left for id and resolve start-iof1 otherwise don't search it ever again
// 2: check if start-iof is what we need and return otherwise resolve end-iof1
// check if end-iof is what we need and returen otherwise resolve start-iof2
// check if start-iof2 is what we need and return otherwise resolve end-iof2
// check if end-iof2 is what we need and return otherwise go to step 2 (next iofs)

domHtmlManipulator.prototype.dumpPositions = function dumpPositions(pos) {

  let id = this.scratchId(pos + idSearch.length);
  this.setParam({ target: id });
  this.findStartTag();
  this.findClosingTag();
  let tagStart = this.tagStPos;
  let tagEnd = this.tagEnClAfPos || this.tagStClAfPos;

  return {
    length: tagEnd - tagStart,
    tagStart,
    tagEnd,
    tagName: this.tagName,
    tagNameEnd: this.tagNameEnd,
    tagClosingNameStart: this.tagClosingNameStart,
    tagClosingNameEnd: this.tagClosingNameEnd,
    tagClosingTagName: this.tagClosingTagName,
    tagStPos: this.tagStPos,
    tagStAfPos: this.tagStAfPos,
    tagStClPos: this.tagStClPos,
    tagStClAfPos: this.tagStClAfPos,
    tagEnPos: this.tagEnPos,
    tagEnClAfPos: this.tagEnClAfPos,
    id,
  }


}

const idSearch = 'data-element_id=';
domHtmlManipulator.prototype.getId = function getId(pos) {
  let attWrapper = this.html[pos];
  let endWrapper = this.html.indexOf(attWrapper, pos + 1)
  return this.html.substring(pos + 1, endWrapper);
}

domHtmlManipulator.prototype.findEl = function findEl(pos, pathArray){
        this.param.target = this.getId(pos + idSearch.length);
        this.findStartTag();
        this.findClosingTag()
        // pathArray.push(Object.assign({}, this))
        
        if (this.pos > this.tagStPos && this.pos < this.tagStClAfPos) {
          return true
        }
        
        if (this.pos >= this.tagStClAfPos && this.pos <= this.tagEnClAfPos) {
          return true;
        }
}



domHtmlManipulator.prototype.findElByPos = function findElByPos({ pos, action, changeStr, removeLength }) {
  if (pos < 0 || pos > this.html.length)
    throw new Error('position is out of range');

  this.changeStr = changeStr;
  this.removeLength = removeLength;
  this.pos = pos;
  this.action = action;
  // console.log(this.html.length, pos)
  let pos1 = pos - idSearch.length;
  let pos2 = pos + idSearch.length;
  this.leftList = [];
  this.rightList = [];

  while (true) {
  
      // todo: might create bugs do we check if which instance has less length
      // console.log(pos1 + idSearch.length)
      pos1 = this.html.indexOf(idSearch, pos1 + idSearch.length);
      if (pos1 !== -1 &&   this.findEl(pos1, this.rightList)) {

       return this.reduceToCommand();
       
      }


    
    

  
      pos2 = this.html.lastIndexOf(idSearch, pos2 - idSearch.length);

      if (pos2 !== -1 && this.findEl(pos2,this.leftList) ) {
        
         return this.reduceToCommand();
       
      }

  

    if (pos1 === -1 && pos2 === -1)
      return 'not found'


  }




}




domHtmlManipulator.prototype.renameTag = function renameTag( isStarting) {

  // console.log('aaaaa',this.tagName , this.tagClosingTagName)
  let newValue, tagName = isStarting ? this.tagName : this.tagClosingTagName;

  let at = this.pos - (isStarting ? this.tagStAfPos : this.tagClosingNameStart);
  if (this.action === "add") {

    let ichangeStr = this.changeStr.toUpperCase();
    newValue = tagName.replaceAt(at, ichangeStr)
    this.html = this.html.replaceAt(this.pos, this.changeStr)

  }
  else if (this.action === "remove") {
    // console.log(at, this.removeLength, attName)

    newValue = tagName.removeAt(at - this.removeLength, at)
    // console.log('^^^^^^^^^^^',newValue, this.removeLength)
    this.html = this.html.removeAt(this.pos - this.removeLength, this.pos)
  }


  // console.log('////////////////',at, tagName,this.pos, this,(isStarting ? this.tagClosingTagName : this.tagName), newValue)
  console.log('////////////////', at, (isStarting ? this.tagClosingTagName : this.tagName), newValue)
  if (!this.isOmission && (isStarting ? this.tagClosingTagName : this.tagName) == newValue)
    return {
      command: 'renameTag',
      oldValue: this.tagName,
      newValue,
    }
  else
    return { newTagName: newValue, msg: 'new tag name deosn\'t match counterpart' }




}



domHtmlManipulator.prototype.renameAttribute = function renameAttribute() {
  let attStartPos = this.tagStAfPos + this.tagName.length;
  let attStr = this.html
    .substring(attStartPos, this.tagStClPos);

  // console.log(Array.from(attStr.matchAll(anyAtt1)));
  // return;

  for (let match of attStr.matchAll(anyAtt1)) {

    // console.log(match)
    // let attStart = attStartPos + match.index + match.groups.spaceBegin.length;
    // let attEnd = attStartPos + match.index - match.groups.spaceEnd.length + match.groups.att.length + 1;

    let attNameStart = attStartPos + match.index + match.groups.spaceBegin.length;
    let attNameEnd = attNameStart + match.groups.attName.length;
    let attValueStart = attNameEnd + 2;
    let attValueEnd = attValueStart + match.groups.attValue.length;




    if (this.pos >= attNameStart && this.pos <= attNameEnd) {
      //att Name

      let newValue, attName = match.groups.attName;

      let at = this.pos - attNameStart;
      if (this.action === "add") {
        let ichangeStr = this.changeStr.toUpperCase();
        newValue = attName.replaceAt(at, ichangeStr)
        this.html = this.html.replaceAt(this.pos, ichangeStr)
      }
      else if (this.action === "remove") {
        // console.log(at, this.removeLength, attName)
        newValue = attName.removeAt(at - this.removeLength, at)
        this.html = this.html.removeAt(this.pos - this.removeLength, this.pos)
        // console.log(newValue)

      }

      return {
        command: 'renameAttribute',
        oldValue: match.groups.attName,
        newValue
      }
    }
    else if (this.pos >= attValueStart && this.pos <= attValueEnd) {

      let newValue, attValue = match.groups.attValue;



      let at = this.pos - attValueStart;

      if (this.action === "add") {
        if (this.changeStr.indexOf('"') !== -1) {
          this.changeStr.replace(/\"/, '&quot;')
        }
        newValue = attValue.replaceAt(at, this.wchangeStr)
        this.html = this.html.replaceAt(this.pos, this.changeStr)
      }
      else if (this.action === "remove") {
        // console.log(at, this.removeLength, attName)
        newValue = attValue.removeAt(at - this.removeLength, at)


        this.html = this.html.removeAt(this.pos - this.removeLength, this.pos)


      }

      return {
        command: 'setAttribute',
        oldValue: match.groups.attValue,
        newValue
      }
      // att value
    }
    else {
      // attribute breaking change

      this.rescan();
      break;
    }





  }
  // find attribute

}
domHtmlManipulator.prototype.renameNode = function renameNode( leftList) {

  // start of iof
  let pos = this.pos - this.tagStClAfPos;

  // last element is always iof should be removed
  leftList.reverse().shift();

  // console.log('azzzz', leftList.length)
  // console.log('azz', leftList)

  if (leftList.length) {

    // elements length
    for (let i = 0; i < leftList.length; i++) {
      pos -= leftList[i].length;
    }

    // first nodeTExt length
    pos -= leftList[0].tagStPos - this.tagStClAfPos;
    // rest of the nodeTexts length
    for (let i = 1; i < leftList.length; i++) {
      // console.log('azz', i)
      pos -= leftList[i].tagStPos - leftList[i - 1].tagEnClAfPos;
    }
  }
  if (this.action === "add") {
    this.html = this.html.replaceAt(this.pos, this.changeStr)
    return {
      command: 'renameNode',
      nodeIndex: leftList.length,
      strIndex: pos,
      value: this.changeStr,
      // iof
    };

  }
  else if (this.action === "remove") {

    this.html = this.html.removeAt(this.pos - this.removeLength, this.pos)

    return {
      command: 'renameNode',
      nodeIndex: leftList.length,
      strIndex: pos,
      removeLength: this.removeLength,
      // iof
    };
  }
  //   return this.pos;

}


domHtmlManipulator.prototype.manageNode = function manageNode({
  command,
  nodeIndex,
  strIndex,
  value,
  iof
}) {
  let el = body.querySelector(`[data-element_id="t3"]`);

  // let parsedChange = this.
  console.log(iof.id, el.outerHTML, Array.from(el.children).length)

}

domHtmlManipulator.prototype.parseAllNode = function parseAllNode(str) {
  let doc = new DOMParser().parseFromString(str, "text/html");
  if (doc.head.childNodes.length) return doc.head.childNodes;
  else return doc.body.childNodes;
}

domHtmlManipulator.prototype.rescan = function rescan(iof) {
  // console.trace('11111111111')
  // console.log('lllllllllllll')
  // console.log(iof)



  if (this.action === "add") {

    this.html = this.html.replaceAt(this.pos, this.changeStr)
  }
  else if (this.action === "remove") {
    this.html = this.html.removeAt(this.pos - this.removeLength, this.pos)

  }

  this.setParam({ target: iof.id })
  this.findStartTag();



  // todo: refactor with rename attributes 2 lines of code duplicated 
  let attStartPos = this.tagStAfPos + this.tagName.length;
  let attStr = this.html
    .substring(attStartPos, this.tagStClPos);
  attStr = attStr.slice(0, -1);
  console.log('rescan', attStr)
  // if(this.tagName === element.tagName)
  for (let match of attStr.matchAll(anyAtt1)) {
    // console.log(match);
    // check all attribute


  }

  // compare tag name in addition of attribute //todo: (perhaps load closing tag name)


}

// todo: bug fix attribute regex for findStart, there should be mandetory space before attribute
let spaceBegin = `(?<spaceBegin>${spa})`;
let spaceEnd = `(?<spaceEnd>${sps})`;
let attValue = `(?:(?:="(?<attValue>[^"]*?)")|${spa})`
let anyAtt1 = new RegExp(`${spaceBegin}(?<att>(?<attName>[a-z0-9\-\_]+)(${attValue})?)${spaceEnd}`, 'gis');
domHtmlManipulator.prototype.reduceToCommand = function reduceToCommand() {
  console.log('>>>>>>>', this.param.target)
  return;

  if (this.pos >= this.tagStAfPos && this.pos <= this.tagNameEnd) {
    return this.renameTag( true);
  }
  else if (this.pos >= this.tagClosingNameStart && this.pos <= this.tagClosingNameEnd) {
    return this.renameTag();
  }
  else if (this.pos > this.tagNameEnd && this.pos < this.tagStClAfPos) {


    return this.renameAttribute();
  }
  else if (this.pos >= this.tagStClAfPos && this.pos <= this.tagEnPos) {
    return this.renameNode(this.leftList);
  }
  else {

    return this.rescan( this.leftList);
  }

}


module.exports = domHtmlManipulator;

// const { JSDOM } = require("jsdom");
// const { window: { document: { body } } } = new JSDOM(html);




//spec: browser decide to scape quote(") and change attribute regex
// -> it should be like this (fff="1&quot;3") in codeMirror
// -> the editor should show &quot; as " but the start should have &quot;
// a function to conver quote to ""

//spec: breaking change should not remove anything







// change node value test
// let r = add({ pos: 195, action: 'add', changeStr: '000' })
// d.manageNode(r)
// remove({ pos: 197, action: 'remove', removeLength: 2 })

// add breaking change  test
// let r = add({ pos: 176, action: 'add', changeStr: '"55" other=' })










// test case 1

// let html = `	<body data-element_id="body" style="padding:1;">

// 		<h1 data-element_id="t1" name="1">test 4441</h1>
// 		<h1 data-element_id="t3" name="3">test 3<h1 data-element_id="t5" name="5">test 5</h1> still test 3 <h1 data-element_id="t6" name="6">test 6</h1>hhhhhh </h1>
// 		<h1 data-element_id="t2" name="2">test 2</h1>
// 		<h1 data-element_id="t4" name="4">test 4</h1>`;
// change tag name test
// add({pos: 149, action: 'add', changeStr: 'TTT'})
// add({pos: 193, action: 'add', changeStr: 'tTT'})

// change tag name test
// remove({pos: 149, action: 'remove', removeLength: 1})
// remove({pos: 189, action: 'remove', removeLength: 1})


// change attribute value test
// add({ pos: 169, action: 'add', changeStr: '000' })
// remove({ pos: 169, action: 'remove', removeLength: 2 })
// test case 1