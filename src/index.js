/*global DOMParser*/
// tag name & attribute names are case-insensetive


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

const idSearch = 'data-element_id=';
let spaceBegin = `(?<spaceBegin>${spa})`;
let spaceEnd = `(?<spaceEnd>${sps})`;
let attValue = `(?:(?:="(?<attValue>[^"]*?)")|${spa})`
let attributeList = new RegExp(`${spaceBegin}(?<att>(?<attName>[a-z0-9\-\_]+)(${attValue})?)${spaceEnd}`, 'gis');

function domHtmlManipulator(html, domHtml) {

  this.html = html;
  this.domHtml = domHtml;
  this.param = {}

  // metadata
  this.tagStPos;
  this.tagStAfPos;
  this.tagStClPos;
  this.tagStClAfPos;
  this.tagEnPos;
  this.tagEnClAfPos;
  this.atSt;
  this.atEn;

}


domHtmlManipulator.prototype.findStartTagById = function findStartTagById() {




  let sch = `(?:${sps}data-element_id\=\"${this.param.target}\"${sps})`;
  let reg = `(?<tagWhole>${tgs}${at}*?${sch}${at}*?${the})`;
  let tagStart = this.html.match(new RegExp(reg, "is"));

  if (!tagStart)
    return false;
    // if (this.html.indexOf(idSearch + `"${this.param.target}"`) === -1)
    //   throw new Error("findPosition: element can not be found. id:" + this.param.target);
    // else
    //   throw new Error("findPosition: element could be found but can not parse the element. id:" + this.param.target);

  this.target = this.param.target;
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
    this.isOmission = true; // if the tag doesn't have closing counterpart
  }
};

domHtmlManipulator.prototype.getWholeElement = function getWholeElement() {
  if (!this.tagStPos) this.findStartTagById();
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
    if (!this.tagStPos) this.findStartTagById();
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

    if (!this.tagStAfPos) this.findStartTagById();

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
  if (!this.tagStPos) this.findStartTagById();
  this.findClosingTag();

  return { from: this.tagStClAfPos, to: this.tagEnPos };
}



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








domHtmlManipulator.prototype.getId = function getId(pos) {
  let attWrapper = this.html[pos];
  let endWrapper = this.html.indexOf(attWrapper, pos + 1)
  return this.html.substring(pos + 1, endWrapper);
}

domHtmlManipulator.prototype.isPosOnEl = function isPosOnEl(elementIdPos, pathArray) {
  this.param.target = this.getId(elementIdPos + idSearch.length);

  try {
    this.findStartTagById();
    this.findClosingTag();
    // pathArray.push(Object.assign({}, this))

    let tagStartPos = this.tagStPos;
    let tagEndPos = this.tagEnClAfPos || this.tagStClAfPos;


    if (this.pos > tagStartPos && this.pos < tagEndPos) {
      return true
    }
  }
  catch (err) {
    return false;
  }


  // tofo: test performance efficiency more variable or more logic
  // if (this.pos >= this.tagStClAfPos && this.pos <= this.tagEnClAfPos) {
  //   return true;
  // }
}

domHtmlManipulator.prototype.parseAll = function parseAll(str) {
  let mainTag = str.match(/\<(?<tag>[a-z0-9]+)(.*?)?\>/).groups.tag;
  if (!mainTag)
    console.error('find position: can not find the main tag');
  let doc = new DOMParser().parseFromString(str, "text/html");
  switch (mainTag) {
    case 'html':
      return [doc.body.parentElement];
    case 'body':
      return [doc.body];
    case 'head':
      return [doc.head];

    default:
      if (doc.head.children.length) return doc.head.children;
      else return doc.body.children;
  }

}



domHtmlManipulator.prototype.getAttributeContext = function getAttributeContext(start, end) {
  let attStartPos = this.tagStAfPos + this.tagName.length;
  let attStr = this.html
    .substring(attStartPos, this.tagStClPos);

  for (let match of attStr.matchAll(attributeList)) {

    let attNameStart = attStartPos + match.index + match.groups.spaceBegin.length;
    let attNameEnd = attNameStart + match.groups.attName.length;
    let attValueStart = attNameEnd + 2;
    let attValueEnd = attValueStart + match.groups.attValue ? match.groups.attValue.length : 0;


    if (start >= attNameStart && start <= attNameEnd && end >= attNameStart && end <= attNameEnd)
      return 'attributeName'
    else if (start >= attValueStart && start <= attValueEnd && end >= attValueStart && end <= attValueEnd)
      return 'attributeValue'


  }
  return false;
}


domHtmlManipulator.prototype.getContext = function getContext(start, end) {

  if (start > end)
    ([end, start] = [start, end])


  // todo: is getContext working correctly?
  if (end > this.tagStPos && start <= this.tagStPos)
    return false;
  else if (end > this.tagStClAfPos && start < this.tagStClAfPos)
    return false;

  else if ((start >= this.tagEnPos && start < this.tagClosingNameStart) || (end > this.tagEnPos && end < this.tagClosingNameStart) || (start <= this.tagEnPos && end > this.tagClosingNameStart))
    return false;
  else if (end >= this.tagEnClAfPos && start <= this.tagEnClAfPos)
    return false;
  else if (start > this.tagNameEnd && start < this.tagStClPos || end > this.tagNameEnd && end < this.tagStClPos) {
    return this.getAttributeContext(start, end)
  }

  else
    return true;


  // if (pos >= this.tagStAfPos && pos <= this.tagNameEnd) {
  //   return 'firstTag'
  // }
  // else if (pos >= this.tagClosingNameStart && pos <= this.tagClosingNameEnd) {
  //   return 'endTag'
  // }
  // else if (pos >= this.tagStClAfPos && pos <= this.tagEnPos) {
  //   return 'innerContent'
  // }
  // else if (pos > this.tagNameEnd && pos < this.tagStClAfPos) {
  //   return this.getAttributeContext()
  // }
  // else {
  //   return false;
  // }

}


domHtmlManipulator.prototype.changeDom = function changeDom({ pos, action, changeStr, removeLength, html }) {
  if (pos < 0 || pos > this.html.length)
    throw new Error('position is out of range');




  this.changeStr = changeStr;
  this.removeLength = removeLength;
  this.pos = pos;
  this.action = action;
  this.html = html;

  try {
    if (!this.findElByPos(pos))
      return console.error("change doesn't represent in a new element ");
  }
  catch (err) {
    return console.error("element can not be found")
    // throw new Error("change doesn't represent in a new element ");

  }



  let newChangeInEl = this.html.substring(this.tagStPos, this.tagEnClAfPos)

  // todo: is this needed?
  // context = this.getContext(pos - removeLength, pos);
  // if (!context)
  //   return console.error('breaking change no dom change')




  let [editorEl, ...rest] = this.parseAll(newChangeInEl);
  if (!editorEl)
    return console.error('element not parseable')


  // replacing ="" and all space to compare in more real situation
  let cleaned = editorEl.outerHTML.replace(/(="")|\ /g, '');
  let cleaned2 = newChangeInEl.replace(/(="")|\ /g, '');
  if (cleaned != cleaned2)
    return console.error('breaking change');

  let realDomTarget = this.domHtml.querySelector(`[data-element_id="${this.target}"]`);
  if (!realDomTarget)
    return console.error('target not found on real dom');

  for (let el of rest)
    realDomTarget.insertAdjacentElement('afterend', el)
    
  // todo: do by context
  this.rebuildDom(editorEl, realDomTarget)



  // let secondPoint;
  // if (changeStr) {
  //   secondPoint = pos + changeStr.length;
  //   if (secondPoint <= this.tagStPos && secondPoint >= this.tagEnClAfPos)
  //     this.findElByPos(secondPoint);

  // }
  // else {
  //   secondPoint = pos + removeLength;
  //   if (secondPoint <= this.tagStPos && secondPoint >= this.tagEnClAfPos)
  //     this.findElByPos(secondPoint);

  // }


}

domHtmlManipulator.prototype.rebuildDom = function rebuildDom(leftEl, rightEl) {


  if (leftEl.tagName !== rightEl.tagName) {
    this.renameTagName(leftEl, rightEl)
  }
  
  this.overwriteAttributes(leftEl, rightEl);

  const rightElChilds = rightEl.childNodes
  const leftElChilds = Array.from(leftEl.childNodes);


  let index = 0;
  for (; index < leftElChilds.length; index++) {
    let leftChild = leftElChilds[index],
      rightChild = rightElChilds[index];


    if (leftChild.constructor.name === 'Text') {


      if (rightChild) {
        if (rightChild.constructor.name === 'Text') {
          if (leftChild.data.trim() !== rightChild.data.trim()) {
    
            rightChild.data = leftChild.data;
          }
        }
        else {
          if (leftChild.data.replace(/\s|\n|\t/g, '')) {
            // if the change is nothing but space and dest is an element  
            rightChild.after(document.createTextNode(leftChild.data))
          }

        }

      }
      else if (!rightChild)
        rightEl.insertAdjacentText('beforeend', leftChild.data)
    }
    else if (leftChild) {
      if (rightChild) {


        if (rightChild.constructor.name === 'Text') {

          rightChild.remove();
          index--;
          // continue;

        }
        else {
          let leftId = leftChild.getAttribute('data-element_id');
          let rightId = rightChild.getAttribute('data-element_id')
          if (leftId === rightId) {
            // we might skip this as the change of child not matter
            rebuildDom.call(this, leftChild, rightChild) // non-harsh replicating 
          }
          else {
            if (leftId && rightEl.querySelector(`:scope > [data-element_id="${leftId}"]`)) {
              if (!(rightId && leftEl.querySelector(`:scope > [data-element_id="${rightId}"]`))) {
                if (rightElChilds[index].id !== 'textArea') // dev only
                  rightElChilds[index--].remove()
              }
            }
            else
              rightChild.before(leftChild)

          }

        }

      }
      else
        rightEl.insertAdjacentElement('beforeend', leftChild.cloneNode(true))

    }
    else {
      if (rightChild.id !== 'textArea') // dev only
        rightChild.remove();
      index--;
    }

  }

  // remove rest of the child in the element
  while (rightElChilds[index]) {
    if (rightElChilds[index].id !== 'textArea') // dev only
      rightElChilds[index].remove()


    index++;
  }


}

domHtmlManipulator.prototype.renameTagName = function renameTagName(leftEl, rightEl) {

  let newRightEl = document.createElement(leftEl.tagName);
  this.overwriteAttributes(leftEl, newRightEl);
  newRightEl.replaceChildren(...leftEl.childNodes)
  rightEl.replaceWith(newRightEl)

}


domHtmlManipulator.prototype.overwriteAttributes = function overwriteAttributes(leftEl, rightEl) {
  // todo: consider https://developer.mozilla.org/en-US/docs/Web/API/Attr/namespaceURI
  // todo: try to set attribute as it might fail as there are weird parsing on broken html
  for (let leftAtt of leftEl.attributes) {
    if (!rightEl.attributes[leftAtt.name] || rightEl.attributes[leftAtt.name].value !== leftAtt.value)
      rightEl.setAttribute(leftAtt.name, leftAtt.value)
  }

  // todo: begin from last index value of above for
  if (leftEl.attributes.length !== rightEl.attributes.length) {
    for (let rightAtt of rightEl.attributes) {
      if (!leftEl.attributes[rightAtt.name])
        rightEl.removeAttribute(rightAtt.name)
    }

  }
}




domHtmlManipulator.prototype.findElByPos = function findElByPos(pos) {

  let pos1 = pos - idSearch.length;
  let pos2 = pos + idSearch.length;
  this.leftList = [];
  this.rightList = [];

  while (true) {

    pos1 = this.html.indexOf(idSearch, pos1 + idSearch.length);
    if (pos1 !== -1 && this.isPosOnEl(pos1))
      return true;


    pos2 = this.html.lastIndexOf(idSearch, pos2 - idSearch.length);

    if (pos2 !== -1 && this.isPosOnEl(pos2))
      return true;


    if (pos1 === -1 && pos2 === -1)
      return false;

  }


}




export default domHtmlManipulator;
