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
let getEndTag = tagName => `(?:<(?<isClosing>${sps}\/${sps})?${tagName}${sps})`;

const getRegAttribute = (attributeName) =>
  `(?:${spa}${attributeName}(?:="[^"]*?")?${sps})`;
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

const idSearch = 'data-element_id=';
let spaceBegin = `(?<spaceBegin>${spa})`;
let spaceEnd = `(?<spaceEnd>${sps})`;
let attValue = `(?:(?:="(?<attValue>[^"]*?)")|${spa})`
let attributeList = new RegExp(`${spaceBegin}(?<att>(?<attName>[a-z0-9\-\_]+)(${attValue})?)${spaceEnd}`, 'gis');


let textdomfr = new Map(),
  textdomfa = new Map();

let extraMeta = new RegExp(`(="")|${space}`, 'g');

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

  // 2 functions should be supported 


}
domHtmlManipulator.prototype.reset = function reset() {
  this.atEn = null, this.atSt = null, this.atVSt = null, this.atVSt = null;
  this.tagStPos = null;
  this.tagStAfPos = null;
  this.tagStClPos = null;
  this.tagStClAfPos = null;
  this.tagEnPos = null;
  this.tagEnClAfPos = null;
  this.isOmission = null;
  this.tagNameEnd = null;
  this.haveClosingTag = null;
}
domHtmlManipulator.prototype.setCallback = function setCallback({ addCallback, removeCallback }) {

  this.removeCallback = function(param) {
    if (!param)
      return false;
    textdomfr.set(param.from * param.to, true);
    this.html = this.html.removeAt(param.from, param.to);
    removeCallback.call(null, param)
  };
  this.addCallback = function(param) {
    if (!param)
      return false;

    textdomfa.set(param.position + param.value, true);
    this.html = this.html.replaceAt(param.position, param.value)
    addCallback.call(null, param)
  };

}

domHtmlManipulator.prototype.findStartTagById = function findStartTagById() {

  let sch = `(?:${sps}data-element_id\=\"${this.param.target}\"${sps})`;
  let reg = `(?<tagWhole>${tgs}${at}*?${sch}${at}*?${the})`;
  let tagStart = this.html.match(new RegExp(reg, "is"));

  if (!tagStart)
    return false;


  this.target = this.param.target;
  this.tagName = tagStart.groups.tagName.toUpperCase();


  this.tagStPos = tagStart.index;
  this.tagStAfPos = tagStart.index + this.tagName.length + 1;
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
  return true;
};

domHtmlManipulator.prototype.getWholeElement = function getWholeElement() {
  if (this.findStartTagById()) {
    this.findClosingTag()
    return { from: this.tagStPos, to: this.tagEnClAfPos || this.tagStClAfPos };
  }
  else
    return false;
};


domHtmlManipulator.prototype.findClosingTag = function findClosingTag() {

  let match = this.html.substr(this.tagStClAfPos)
    .matchAll(new RegExp(`(?<tagWhole>${getEndTag(this.tagName)}${at}*?${the})`, 'gi'));

  if (!match) throw new Error('could find any closing tag');

  let nest = 0;

  for (let i of match) {
    if (i.groups.isClosing) {
      if (!nest) {
        this.tagEnPos = this.tagStClAfPos + i.index;
        this.tagEnClAfPos = this.tagStClAfPos + i.index + i[0].length;
        this.tagClosingNameStart = 1 + i.groups.isClosing.length + this.tagEnPos;
        this.tagClosingNameEnd = this.tagClosingNameStart + this.tagName.length;
        return true;

      }
      else
        nest--;

    }
    else
      nest++;
  }

}

domHtmlManipulator.prototype.insertAdjacentElement =
  function insertAdjacentElement({ target, position, element, elementValue }) {

    this.param.target = element;
    this.reset();

    let pos;
    if (!elementValue) {
      pos = this.getWholeElement();
      if (!pos)
        throw new Error('insertAdjacentElement: element not found');
      elementValue = this.html.substring(pos.from, pos.to)

    }


    this.param.target = target;
    this.reset();
    if (!this.findStartTagById())
      throw new Error('insertAdjacentElement: target not found');

    let insertPos;
    switch (position) {
      case "beforebegin":
      case "afterbegin":
        insertPos = (position == 'beforebegin' ? this.tagStPos : this.tagStClAfPos);
        break;
      case "beforeend":
      case "afterend":
        if (!this.findClosingTag())
          throw new Error('closing tag could not be found');
        insertPos = (position == 'beforeend' ? this.tagEnPos : this.tagEnClAfPos);
        break;
    }
    if (pos) {
      if (pos.to < insertPos)
        insertPos = insertPos - (pos.to - pos.from);
      this.removeCallback(pos);
    }
    this.addCallback({ value: elementValue, position: insertPos })


  };


domHtmlManipulator.prototype.setClass = function setClass({ target, classname }) {
  this.param.target = target;
  this.reset();
  this.findAttribute("class");

  if (this.atVEn) {
    let positions = this.findClassPos(classname);
    if (positions.to)
      this.removeCallback(positions)

    this.addCallback({ position: positions.from, value: classname })
  }
  else {
    this.addCallback({ position: this.atSt, value: ` class="${classname}"` })
  }

};

domHtmlManipulator.prototype.setClassStyle = function setClassStyle({ target, classname, value, unit }) {
  this.param.target = target;
  this.reset();
  this.findAttribute("class");
  let classnameStr = value ? ` ${classname}:${value+unit}` : ' ' + classname;
  if (this.atVEn) {
    let positions = this.findClassPos(classname);
    if (positions.to)
      this.removeCallback(positions)
    if (value)
      this.addCallback({ position: positions.from, value: classnameStr })
  }
  else if (value) {
    this.addCallback({ position: this.atSt, value: ` class="${classnameStr}"` })
  }

};


domHtmlManipulator.prototype.findClassPos = function findClassPos(classname, isStyle) {
  let prRegClass = isStyle ? getRegClassStyle(classname) : getRegClass(classname);

  let classStart = this.html
    .substring(this.atVSt, this.atVEn)
    .match(
      new RegExp(`(?<ourClass>${prRegClass})(?<classstyle>\:[^\"\ ]+)(\ |\")?`, "is")
    );

  if (classStart && classStart.groups.ourClass)
    return {
      from: this.atVSt + classStart.index,
      to: this.atVSt +
        classStart.index +
        classStart.groups.ourClass.length +
        classStart.groups.classstyle.length,
    };
  else
    return {
      from: this.atVEn,
    };
};
domHtmlManipulator.prototype.setStyle = function setStyle({ target, styleName }) {
  this.param.target = target;
  this.reset();
  this.findAttribute("style");
  if (this.atVSt === this.atVEn) return { from: this.atVSt, context: "value" };

  else if (this.atVEn) {
    // context: value
    let positions = this.findStylePos(styleName);
    if (positions.to)
      this.removeCallback(positions)

    this.addCallback({ position: positions.from, value: styleName })
  }
  else {
    // attribute styleName not exist
    this.addCallback({ position: this.atSt, value: ` style="${styleName}"` })
  }
};

domHtmlManipulator.prototype.findStylePos = function findStylePos(style) {
  let prRegStyle = getRegStyle(style);

  let styleStart = this.html
    .substring(this.atVSt, this.atVEn)
    .match(
      new RegExp(`^(?<styleWhole>${sty})*?(?<ourStyle>${prRegStyle})`, "is")
    );
  if (styleStart && styleStart.groups.ourStyle) {
    let stlWleLen = styleStart.groups.styleWhole ?
      styleStart.groups.styleWhole.length :
      0;
    return {
      from: this.atVSt + stlWleLen,
      to: this.atVSt + stlWleLen + styleStart.groups.ourStyle.length,
    };
  }
  else
    return {
      from: this.atVEn,
    };
};


// findAttribute
domHtmlManipulator.prototype.findAttribute =
  function findAttribute(property) {

    if (!this.findStartTagById())
      return false;

    let prRegAttr = getRegAttribute(property);
    let regex = `^(?<beforeAtt>${at}*?)${prRegAttr}`;

    let attStart = this.html.substr(this.tagStAfPos).match(new RegExp(regex, "is"));

    if (attStart) {
      this.atSt =
        this.tagStAfPos +
        attStart.groups.beforeAtt.length;

      this.atVSt = this.atSt + 3 + property.length;
      this.atEn = this.tagStAfPos + attStart[0].length;
      this.atVEn = this.atEn - 1;
    }
    else {
      this.atSt = this.tagStClPos;
    }
  };




domHtmlManipulator.prototype.setAttribute = function setAttribute({ target, name, value }) {

  this.param.target = target;
  this.reset();
  this.findAttribute(name);
  if (this.atEn)
    this.removeCallback({ from: this.atSt, to: this.atEn })
  if (value)
    this.addCallback({ position: this.atSt, value: ` ${name}="${value}"` })
};

domHtmlManipulator.prototype.removeAttribute = function removeAttribute({ target, name }) {
  this.param.target = target;
  this.reset();
  this.findAttribute(name);
  if (this.attEn)
    this.removeCallback({ from: this.atSt, to: this.atEn })
};

domHtmlManipulator.prototype.setInnerText = function setInnerText({ target, value }) {
  this.param.target = target;
  this.reset();
  if (this.findStartTagById())
    this.findClosingTag();
  else
    return false;


  this.removeCallback({ from: this.tagStClAfPos, to: this.tagEnPos });
  this.addCallback({ position: this.tagStClAfPos, value });
  return true;
}



domHtmlManipulator.prototype.getId = function getId(pos) {
  let attWrapper = this.html[pos];
  let endWrapper = this.html.indexOf(attWrapper, pos + 1)
  return this.html.substring(pos + 1, endWrapper);
}

domHtmlManipulator.prototype.isPosOnEl = function isPosOnEl(elementIdPos, pathArray) {

  this.param.target = this.getId(elementIdPos + idSearch.length);
  this.reset();
  if (!this.findStartTagById())
    return false;

  this.findClosingTag()
  let tagStartPos = this.tagStPos;
  let tagEndPos = this.tagEnClAfPos || this.tagStClAfPos;


  if (this.pos > tagStartPos && this.pos < tagEndPos) {
    return true
  }

  // tofo: test performance efficiency more variable or more logic
  // if (this.pos >= this.tagStClAfPos && this.pos <= this.tagEnClAfPos) {
  //   return true;
  // }
}

domHtmlManipulator.prototype.parseAll = function parseAll(str) {
  let mainTag = str.match(/\<(?<tag>[a-z0-9]+)(.*?)?\>/).groups.tag;
  if (!mainTag)
    throw new Error('find position: can not find the main tag');
  let doc = new DOMParser().parseFromString(str, "text/html");
  switch (mainTag) {
    case 'html':
      return [doc.documentElement];
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
  let attStartPos = this.tagStAfPos;
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

}

/**
 * apply an add change for a html to its counterpart dom
 * 
 * @param {Object} config - the config
 * @param {Number} config.pos - position of the change that happened
 * @param {String} condif.changeStr - the added string to the config.pos
 * 
 */

domHtmlManipulator.prototype.addToDom = function addToDom({ pos, changeStr }) {

  let key = pos + changeStr;
  if (textdomfa.has(key)) {
    textdomfa.delete(key)
    return;

  }
  // this.html = this.html.replaceAt(pos, changeStr)
  this.changeDom({ pos, changeStr })


}
/**
 * apply a remove change for a html to its counterpart dom
 * 
 * @param {Object} config - the config
 * @param {Number} config.pos - position of the change that happened
 * @param {Number} condif.removeLength - the added string to the config.pos
 */
domHtmlManipulator.prototype.removeFromDom = function removeFromDom({ pos, removeLength }) {

  let key = pos * (removeLength + pos);
  if (textdomfr.has(key)) {
    textdomfr.delete(key)
    return;

  }
  // this.html = this.html.removeAt(pos, pos + removeLength);
  this.changeDom({ pos, removeLength })


}

domHtmlManipulator.prototype.changeDom = function changeDom({ pos, changeStr, removeLength }) {
  if (pos < 0 || pos > this.html.length)
    throw new Error('position is out of range');


  this.changeStr = changeStr;
  this.removeLength = removeLength;
  this.pos = pos;
  //sometimes html is empty when remove everything
  if (!this.html.trim()) {
    // todo: crdt can provide insert and delete in the same deltaChange
    this.domHtml.innerHTML = "";
    this.isLastStateEmpty = true;
    return;
  }


  if (this.isLastStateEmpty) {
    let doc = new DOMParser().parseFromString(this.html, "text/html");
    this.domHtml.replaceChildren(...doc.documentElement.children)
    this.isLastStateEmpty = false;
    return;
  }


  try {
    this.findElByPos(pos) ? this.rebuildByElement() : this.rebuildByDocument()

    // if (!)
    // throw new Error("change doesn't represent in a new element ");
  }
  catch (err) {
    throw new Error("element can not be found")
    // throw new Error("change doesn't represent in a new element ");

  }


}

domHtmlManipulator.prototype.rebuildByElement = function rebuildByElement(id, elList, from) {

  let newChangeInEl =
    this.html.substring(this.tagStPos, this.tagEnClAfPos);
  if (!newChangeInEl) return;
  // todo: is this needed?
  // context = this.getContext(pos - removeLength, pos);
  // if (!context)
  //   return console.error('breaking change no dom change')

  let [editorEl, ...rest] =
  this.parseAll(newChangeInEl)

  if (!editorEl)
    throw new Error('element not parseable')

  for (let el of rest)
    realDomTarget.insertAdjacentElement('afterend', el)

  // replacing ="" and all space to compare in more real situation
  // let cleaned = editorEl.outerHTML.replace(extraMeta, '').toLowerCase();
  // let cleaned2 = newChangeInEl.replace(extraMeta, '').toLowerCase();
  // if (cleaned != cleaned2)
  //   return console.warn('breaking change');

  let realDomTarget =
    this.domHtml.querySelector(`[data-element_id="${this.target}"]`);



  // todo: recognize html tag either by nesting rebuildDom or by itself as a selector as html is unique
  this.rebuildDom(editorEl, realDomTarget)



}

domHtmlManipulator.prototype.rebuildByDocument = function rebuildByDocument(id, elList, from) {

  let editorEl = new DOMParser().parseFromString(this.html, "text/html");
  if (!editorEl)
    throw new Error('element not parseable')

  this.rebuildDom(editorEl.documentElement, this.domHtml)

}



function isTextOrEl(el) {
  if (el.constructor.name === 'Text')
    return true
  else if (el.constructor.name.indexOf('Element'))
    return false
}

domHtmlManipulator.prototype.elIndexOf = function elIndexOf(id, elList, from) {
  for (let i = 0; i < elList.length; i++) {
    if (isTextOrEl(elList[i]) === false && elList[i].getAttribute('data-element_id') == id)
      return i;
  }

  return -1;
  // Array.from(elList).some(el => el.getAttribute('data-element_id') == id)

}



domHtmlManipulator.prototype.rebuildDom = function rebuildDom(leftEl, rightEl) {


  if (rightEl.tagName && leftEl.tagName !== rightEl.tagName) {
    this.renameTagName(leftEl, rightEl);
    // todo: we should break here in theory
  }

  rightEl.tagName && this.overwriteAttributes(leftEl, rightEl);
  // todo: if any change we should break here too


  const rightElChilds = rightEl.childNodes
  const leftElChilds = Array.from(leftEl.childNodes);


  let index = 0,
    len = leftElChilds.length;
  for (; index < len; index++) {
    let leftChild = leftElChilds[index],
      rightChild = rightElChilds[index];


    let leftIsText = isTextOrEl(leftChild)

    if (!rightChild) {
      if (leftIsText === true)
        rightEl.insertAdjacentText('beforeend', leftChild.data)
      else if (leftIsText === false)
        rightEl.insertAdjacentElement('beforeend', leftChild.cloneNode(true))
      else
        continue;
    }
    else {

      let rightIsText = isTextOrEl(rightChild)
      if (rightIsText === undefined)
        continue;

      if (leftIsText) {
        if (rightIsText) {
          if (leftChild.data.trim() !== rightChild.data.trim())
            rightChild.data = leftChild.data;
        }
        else {
          rightChild.before(document.createTextNode(leftChild.data))
          let rightId = rightChild.getAttribute('data-element_id');
          let elIndex = this.elIndexOf(rightId, rightEl.childNodes)
          if (elIndex === -1) {
            rightChild.remove();
            if (isTextOrEl(rightElChilds[index]) === true && rightElChilds[index - 1] && isTextOrEl(rightElChilds[index - 1]) === true) {
              rightElChilds[index - 1].data += rightElChilds[index].data;
              rightElChilds[index].remove()
            }

            index--;
            continue;
          }
          else if (rightElChilds[elIndex] && rightElChilds[elIndex] !== rightChild)
            rightElChilds[elIndex].before(rightChild);


        }
      }
      else {
      

        if (rightIsText) {
          rightChild.before(leftChild.cloneNode(true));
          rightChild.remove();
        }
        else {
          // teleport element if exist otherwise create it
          let rightId = rightChild.getAttribute('data-element_id');
          let leftId = leftChild.getAttribute('data-element_id');

          if ( leftId && rightId !== leftId ) {
            let elIndex = this.elIndexOf(leftId, rightEl.childNodes);

            if (elIndex !== -1)
              rightChild.insertAdjacentElement('beforebegin', rightEl.childNodes[elIndex])
            else
              rightChild.before(leftChild.cloneNode(true))

            // new element has been added we should process the new element again at index

            rightChild = rightElChilds[index];
            rightId = rightChild.getAttribute('data-element_id');
            elIndex = this.elIndexOf(rightId, rightEl.childNodes)
            
            if (elIndex === -1) {
              rightChild.remove()
              if (isTextOrEl(rightElChilds[index]) === true && rightElChilds[index - 1] && isTextOrEl(rightElChilds[index - 1]) === true) {
                rightElChilds[index - 1].data += rightElChilds[index].data;
                rightElChilds[index].remove()
              }


              index--;
              continue;
            }
            else if (rightElChilds[elIndex] && rightElChilds[elIndex] !== rightChild)
              rightElChilds[elIndex].before(rightChild);
          }
          else {
            this.rebuildDom.call(this, leftChild, rightChild)
          }
        }
      }


    }

  }

  // remove rest of the child in the element
  while (rightElChilds[index]) {
    rightElChilds[index].remove()
  }



}



domHtmlManipulator.prototype.renameTagName = function renameTagName(leftEl, rightEl) {

  let newRightEl = document.createElement(leftEl.tagName);
  this.overwriteAttributes(leftEl, newRightEl);
  newRightEl.replaceChildren(...leftEl.childNodes)
  rightEl.replaceWith(newRightEl)

}

// overwrite except data-element_id
domHtmlManipulator.prototype.overwriteAttributes = function overwriteAttributes(leftEl, rightEl) {

  for (let leftAtt of leftEl.attributes) {
    if (!rightEl.attributes[leftAtt.name] || rightEl.attributes[leftAtt.name].value !== leftAtt.value)
      try {
        if (leftAtt.name != 'data-element_id')
          rightEl.setAttribute(leftAtt.name, leftAtt.value)
      }
    catch (err) {}
  }

  if (leftEl.attributes.length !== rightEl.attributes.length) {
    for (let i = 0, len = rightEl.attributes.length; i < len; i++) {
      let rightAtt = rightEl.attributes[i];
      if (!leftEl.attributes[rightAtt.name] && rightAtt.name != 'data-element_id') {
        rightEl.removeAttribute(rightAtt.name)
        i--, len--;
      }




    }

  }
}




domHtmlManipulator.prototype.findElByPos = function findElByPos(pos) {

  let pos1 = pos - idSearch.length;
  let pos2 = pos + idSearch.length;


  pos1 = this.html.indexOf(idSearch, pos1 + idSearch.length);
  if (pos1 !== -1 && this.isPosOnEl(pos1))
    return true;

  while (true) {
    pos2 = this.html.lastIndexOf(idSearch, pos2 - idSearch.length);

    if (pos2 !== -1) {
      if (this.isPosOnEl(pos2))
        return true;
    }
    else return false;
  }

}




export default domHtmlManipulator;
