/*global DOMParser*/
// tag name & attribute names are case-insensetive


function replaceAt(html, index, replacement) {
	return html.substr(0, index) + replacement + html.substr(index);
}

function removeAt(html, index, to) {
	return html.substr(0, index) + html.substr(to);
}

let spaceAll = "\u{0020}|\u{0009}|\u{000A}|\u{000C}|\u{000D}";
let space = "\u{0020}|\u{0009}";
let allAttributeName = `[a-z0-9-_]+?`;
let allStyleName = "[^:]+?";
let allClassName = '[^"]+?';

let sps = `(${space})*?`;
let spa = `(${space})+?`;
let spsa = `(${spaceAll})*?`;
let spaa = `(${spaceAll})+?`;
let tgs = `(?:<(?<tagName>[a-z0-9]+?))`;
let getEndTag = tagName => `(?:<(?<isClosing>${sps}\/${sps})?${tagName}${sps})`;

const getRegAttribute = (attributeName) =>
	`(${spa}(?:(?:${attributeName})((?:="[^"]*?")|${space}|>)))`
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
// let spaceBegin = `(?<spaceBegin>${spa})`;
// let spaceEnd = `(?<spaceEnd>${sps})`;
// let attValue = `(?:(?:="(?<attValue>[^"]*?)")|${spa})`
// let attributeList = new RegExp(`${spaceBegin}(?<att>(?<attName>[a-z0-9\-\_]+)(${attValue})?)${spaceEnd}`, 'gis');


let textdomfr = new Map(),
	textdomfa = new Map();

// let extraMeta = new RegExp(`(="")|${space}`, 'g');
// let html = html;
// let domHtml = domHtml;
// let param = {};

// metadata
let tagName;
let tagStPos;
let tagStAfPos;
let tagStClPos;
let tagStClAfPos;
let tagEnPos;
let tagEnClAfPos;
let atSt;
let atEn;
let atVSt;
let atVEn;
let isOmission;
let tagNameEnd;
let haveClosingTag;
	// 2 functions should be supported 


function reset() {
	atEn = null, atSt = null, atVSt = null, atVSt = null;
	tagStPos = null;
	tagStAfPos = null;
	tagStClPos = null;
	tagStClAfPos = null;
	tagEnPos = null;
	tagEnClAfPos = null;
	isOmission = null;
	tagNameEnd = null;
	haveClosingTag = null;
}

// function setCallback({ addCallback, removeCallback }) {
// }
	
function removeCallback(param) {
	if(!param) return;
	let domTextEl = param.domTextEl;
	let html = domTextEl.domTextHtml;
	// if (param.type != 'innerText')
		textdomfr.set(param.from * param.to, true);
	domTextEl.domTextHtml = removeAt(html, param.from, param.to);
	domTextEl.removeCallback.call(null, param);
}

function addCallback(param) {
	if(!param) return;
	let domTextEl = param.domTextEl;
	let html = domTextEl.domTextHtml;
	// if (param.type != 'innerText')
		textdomfa.set(param.position + param.value, true);
	domTextEl.domTextHtml = replaceAt(html, param.position, param.value);
	domTextEl.addCallback.call(null, param);
}


function findStartTagById(domTextEl, target) {
	let sch = `(?:${sps}element_id\=\"${target}\"${sps})`;
	let reg = `(?<tagWhole>${tgs}${at}*?${sch}${at}*?${the})`;
	let tagStart = domTextEl.domTextHtml.match(new RegExp(reg, "is"));

	if(!tagStart)
		throw new Error('element is not valid or can not be found');

	tagName = tagStart.groups.tagName.toUpperCase();


	tagStPos = tagStart.index;
	tagStAfPos = tagStart.index + tagName.length + 1;
	tagStClPos =
		tagStart.index +
		tagStart.groups.tagWhole.length -
		1 -
		(tagStart.groups.tagSlash ? 1 : 0);
	haveClosingTag = !tagStart.groups.tagSlash;
	tagStClAfPos = tagStart.index + tagStart.groups.tagWhole.length;
	tagNameEnd = tagStAfPos + tagName.length;
	// if it's like <img />
	if(tagStart.groups.tagSlash) {
		tagEnPos = tagStClPos;
		tagEnClAfPos = tagStClAfPos;
		isOmission = true; // if the tag doesn't have closing counterpart
	}
	return true;
}

function getWholeElement(domTextEl, target) {
	if(findStartTagById(domTextEl, target)) {
		findClosingTag(domTextEl, target);
		return { start: tagStPos, end: tagEnClAfPos || tagStClAfPos };
	}
	else
		return false;
}


function findClosingTag(domTextEl, target) {
	let match = domTextEl.domTextHtml.substr(tagStClAfPos)
		.matchAll(new RegExp(`(?<tagWhole>${getEndTag(tagName)}${at}*?${the})`, 'gi'));

	if(!match) throw new Error('can not find any closing tag');

	let nest = 0;

	for(let i of match) {
		if(i.groups.isClosing) {
			if(!nest) {
				tagEnPos = tagStClAfPos + i.index;
				tagEnClAfPos = tagStClAfPos + i.index + i[0].length;
				// let tagClosingNameStart = 1 + i.groups.isClosing.length + tagEnPos;
				// let tagClosingNameEnd = tagClosingNameStart + tagName.length;
				return true;

			}
			else
				nest--;
		}
		else
			nest++;
	}
	throw new Error('closing tag and openning tag order does not match');
}

function removeElement({ domTextEl, target }) {

	let pos = getWholeElement(domTextEl, target);
	if(!pos)
		throw new Error('removeElement: element not found');

	findStartTagById(domTextEl, target);

	let insertPos;
	if(pos) {
		if(pos.end < insertPos)
			insertPos = insertPos - (pos.end - pos.start);
		removeCallback({domTextEl, ...pos});
	}


}

function insertAdjacentElement({ domTextEl, target, position, element, elementValue }) {

	let pos;
	if(!elementValue) {
		pos = getWholeElement(domTextEl, element);
		if(!pos)
			throw new Error('insertAdjacentElement: element not found');
		elementValue = domTextEl.domTextHtml.substring(pos.start, pos.end);

	}

	findStartTagById(domTextEl, target);


	let insertPos;
	switch(position) {
		case "beforebegin":
		case "afterbegin":
			insertPos = (position == 'beforebegin' ? tagStPos : tagStClAfPos);
			break;
		case "beforeend":
		case "afterend":
			findClosingTag(element, target);
			insertPos = (position == 'beforeend' ? tagEnPos : tagEnClAfPos);
			break;
	}
	if(pos) {
		if(pos.end < insertPos)
			insertPos = insertPos - (pos.end - pos.start);
		removeCallback({domTextEl, ...pos});
	}
	addCallback({ domTextEl, value: elementValue, position: insertPos });
}


function setClass({ domTextEl, target, classname }) {
	findAttribute( domTextEl, target, "class");

	if(atVEn) {
		let positions = findClassPos( domTextEl, target, classname);
		if(positions.end)
			removeCallback({domTextEl, ...positions});

		addCallback({ domTextEl, position: positions.start, value: classname });
	}
	else {
		addCallback({ domTextEl, position: atSt, value: ` class="${classname}"` });
	}

}

function setClassStyle({ domTextEl, target, classname, value, unit }) {
	findAttribute(domTextEl, target, "class");
	let classnameStr = value ? ` ${classname}:${value+unit}` : ' ' + classname;
	if(atVEn) {
		let positions = findClassPos(domTextEl, classname);
		if(positions.end)
			removeCallback({domTextEl, ...positions});
		if(value)
			addCallback({ domTextEl, position: positions.start, value: classnameStr });
	}
	else if(value) {
		addCallback({ domTextEl, position: atSt, value: ` class="${classnameStr}"` });
	}

}


function findClassPos(domTextEl, classname, isStyle) {
	let prRegClass = isStyle ? getRegClassStyle(classname) : getRegClass(classname);

	let classStart = domTextEl.domTextHtml
		.substring(atVSt, atVEn)
		.match(
			new RegExp(`(?<ourClass>${prRegClass})(?<classstyle>\:[^\"\ ]+)(\ |\")?`, "is")
		);

	if(classStart && classStart.groups.ourClass)
		return {
			start: atVSt + classStart.index,
			end: atVSt +
				classStart.index +
				classStart.groups.ourClass.length +
				classStart.groups.classstyle.length,
		};
	else
		return {
			start: atVEn,
		};
}

function setStyle({ domTextEl, target, styleName }) {
	findAttribute(domTextEl, target, "style");
	if(atVSt === atVEn) return { start: atVSt, context: "value" };

	else if(atVEn) {
		let positions = findStylePos(domTextEl, target, styleName);
		if(positions.end)
			this.removeCallback({domTextEl, ...positions});

		this.addCallback({ domTextEl, position: positions.start, value: styleName });
	}
	else {
		// attribute styleName not exist
		this.addCallback({ domTextEl, position: this.atSt, value: ` style="${styleName}"` });
	}
}

function findStylePos(domTextEl, target, style) {
	let prRegStyle = getRegStyle(style);

	let styleStart = domTextEl.domTextHtml
		.substring(atVSt, atVEn)
		.match(
			new RegExp(`^(?<styleWhole>${sty})*?(?<ourStyle>${prRegStyle})`, "is")
		);
	if(styleStart && styleStart.groups.ourStyle) {
		let stlWleLen = styleStart.groups.styleWhole ?
			styleStart.groups.styleWhole.length :
			0;
		return {
			start: atVSt + stlWleLen,
			end: atVSt + stlWleLen + styleStart.groups.ourStyle.length,
		};
	}
	else
		return {
			start: atVEn,
		};
}


// findAttribute
function findAttribute(domTextEl, target, property) {
	if(!findStartTagById(domTextEl, target))
		throw new Error('attribute can not be found');

	let prRegAttr = getRegAttribute(property);
	let regex = `^(?<beforeAtt>${at}*?)${prRegAttr}`;

	let attStart = domTextEl.domTextHtml.substr(tagStAfPos).match(new RegExp(regex, "is"));

	if(attStart) {
		atSt = tagStAfPos + attStart.groups.beforeAtt.length;

		atVSt = atSt + 3 + property.length;
		atEn = tagStAfPos + attStart[0].length;
		atVEn = atEn - 1;
	}
	else {
		atSt = tagStClPos;
	}
}


function setAttribute({ domTextEl, target, name, value }) {
	findAttribute(domTextEl, target, name);
	if(atEn)
		removeCallback({ domTextEl, start: atSt, end: atEn });
	if(value)
		addCallback({ domTextEl, position: atSt, value: ` ${name}="${value}"` });
}

function removeAttribute({ domTextEl, target, name }) {
	findAttribute(domTextEl, target, name);
	if(atEn)
		removeCallback({ domTextEl, start: atSt, end: atEn });
}

function setInnerText({ domTextEl, target, value, start, end, avoidTextToDom, metadata }) {
	let type = 'innerText';

	if(findStartTagById(domTextEl, target))
		findClosingTag(domTextEl, target);
	else
		return false;

	start = tagStClAfPos + start;
	end = tagStClAfPos + end;

	if(start != end) {
		removeCallback({ domTextEl, start, end, avoidTextToDom, metadata, type });
	}
	if(value == "Backspace" || value == "Tab" || value == "Enter") {
		if(value == "Backspace" && start == end) {
			removeCallback({ domTextEl, start: start - 1, end, avoidTextToDom, metadata, type });
		}
		if(value == 'Tab') {
			addCallback({ domTextEl, position: start, value: "\t", avoidTextToDom, metadata, type });
		}
		if(value == "Enter") {
			addCallback({ domTextEl, position: start, value: "\n", avoidTextToDom, metadata, type });
		}
	}
	else {
		addCallback({ domTextEl, position: start, value, avoidTextToDom, metadata, type });
	}
	return true;
}


function getId(domTextEl, pos) {
	let attWrapper = domTextEl.domTextHtml[pos];
	let endWrapper = domTextEl.domTextHtml.indexOf(attWrapper, pos + 1);
	return domTextEl.domTextHtml.substring(pos + 1, endWrapper);
}

function isPosOnEl(domTextEl, elementIdPos, pos) {

	let target = getId(domTextEl, elementIdPos + idSearch.length);
	if(!findStartTagById(domTextEl, target))
		return false;

	findClosingTag(domTextEl, target);
	let tagStartPos = tagStPos;
	let tagEndPos = tagEnClAfPos || tagStClAfPos;


	if(pos > tagStartPos && pos < tagEndPos) {
		return true;
	}

	// tofo: test performance efficiency more variable or more logic
	// if (this.pos >= this.tagStClAfPos && this.pos <= this.tagEnClAfPos) {
	//   return true;
	// }
}

function parseAll(str) {
	let mainTag = str.match(/\<(?<tag>[a-z0-9]+)(.*?)?\>/).groups.tag;
	if(!mainTag)
		throw new Error('find position: can not find the main tag');
	let doc = new DOMParser().parseFromString(str, "text/html");
	switch(mainTag) {
		case 'html':
			return [doc.documentElement];
		case 'body':
			return [doc.body];
		case 'head':
			return [doc.head];

		default:
			if(doc.head.children.length) return doc.head.children;
			else return doc.body.children;
	}

}


function addToDom({ domTextEl, pos, changeStr }) {

	let key = pos + changeStr;
	if(textdomfa.has(key)) {
		textdomfa.delete(key);
		return;

	}
	// this.html = this.html.replaceAt(pos, changeStr)
	changeDom({ domTextEl, pos, changeStr });


}
/**
 * apply a remove change for a html to its counterpart dom
 * 
 * @param {Object} config - the config
 * @param {Number} config.pos - position of the change that happened
 * @param {Number} condif.removeLength - the added string to the config.pos
 */
function removeFromDom({ domTextEl, pos, removeLength }) {

	let key = pos * (removeLength + pos);
	if(textdomfr.has(key)) {
		textdomfr.delete(key);
		return;

	}
	// this.html = this.html.removeAt(pos, pos + removeLength);
	changeDom({ domTextEl, pos, removeLength });


}

function changeDom({ domTextEl, target, pos, changeStr, removeLength }) {
	if(pos < 0 || pos > domTextEl.domTextHtml.length)
		throw new Error('position is out of range');

	changeStr = changeStr;
	removeLength = removeLength;
	pos = pos;

	try {

		findElByPos(domTextEl, pos) ? rebuildByElement(domTextEl, target) : rebuildByDocument(domTextEl);

	}
	catch(err) {
		throw new Error("domText failed to apply the change " + err.message, err.name);
	}


}

function findElByPos(domTextEl, pos) {

	let pos1 = pos - idSearch.length;
	let pos2 = pos + idSearch.length;


	pos1 = domTextEl.domTextHtml.indexOf(idSearch, pos1 + idSearch.length);
	if(pos1 !== -1 && isPosOnEl(domTextEl, idSearch, pos))
		return true;

	while(true) {
		pos2 = domTextEl.domTextHtml.lastIndexOf(idSearch, pos2 - idSearch.length);

		if(pos2 !== -1) {
			if(isPosOnEl(domTextEl, idSearch, pos))
				return true;
		}
		else return false;
	}

}

function rebuildByElement(domTextEl, target) {

	let newChangeInEl =
		domTextEl.domTextHtml.substring(tagStPos, tagEnClAfPos || tagStClAfPos);
	if(!newChangeInEl) return;

	let [editorEl, ...rest] =
	parseAll(newChangeInEl);

	for(let el of rest)
		realDomTarget.insertAdjacentElement('afterend', el);

	let realDomTarget =
		domTextEl.querySelector(`[element_id="${target}"]`);

	// todo: recognize html tag either by nesting rebuildDom or by itself as a selector as html is unique
	rebuildDom(domTextEl, editorEl, realDomTarget);



}

function rebuildByDocument(domTextEl) {
	// let editorEl = new DOMParser().parseFromString(domTextEl.domTextHtml, "text/html");
	rebuildDom(domTextEl, domTextEl.domTextHtml, domTextEl);
}


function isTextOrEl(el) {
	if(el.constructor.name === 'Text')
		return true;
	else if(el.constructor.name.indexOf('Element'));
		return false;
}

function elIndexOf(id, elList, from) {
	for(let i = 0; i < elList.length; i++) {
		if(isTextOrEl(elList[i]) === false && elList[i].getAttribute('element_id') == id)
			return i;
	}

	return -1;
}

function cloneByCreate(el) {
	let newEl = document.createElement(el.tagName);
	newEl.innerHTML = el.innerHTML;
	assignAttributes(el, newEl);
	return newEl;
}

function mergeTextNode(textNode1, textNode2) {
	if(isTextOrEl(textNode1) === true && textNode2 && isTextOrEl(textNode2) === true) {
		textNode2.data += textNode1.data;
		textNode1.remove();
	}
}

function textInsertAdajcentClone(target, element, position) {

	let func = position === "beforebegin" ? target.before : target.after;
	// if (element.tagName === "SCRIPT")
	//   func.call(target, cloneByCreate(element))
	// else
	//   func.call(target, element.cloneNode(true))
	let cloned = element.cloneNode(true);
	if(cloned.tagName === "SCRIPT")
		cloned = cloneByCreate(cloned);

	cloned.querySelectorAll('script').forEach(el => {
		el.replaceWith(cloneByCreate(el));
	});
	func.call(target, cloned);
}


function insertAdajcentClone(target, element, position) {

	let cloned = element.cloneNode(true);
	if(cloned.tagName === "SCRIPT")
		cloned = cloneByCreate(cloned);
	cloned.querySelectorAll('script').forEach(el => {
		el.replaceWith(cloneByCreate(el));
	});

	target.insertAdjacentElement(position, cloned);
}

// todo: optimize but not doing assignAttributes if the editorEl innerHtml changed
// todo: optimize: skip after you canged rightDom as one single unit as changes to textArea happens in one place
function rebuildDom(domTextEl, leftEl, rightEl, flat) {


	// if(rightEl.hasAttribute('contenteditable')) return;
	// let parentCheck = checkParent(rightEl, 'contenteditable');
	// if (parentCheck != rightEl) return;
	
	// if(rightEl.innerHTML == leftEl.innerHTML) return
	if(rightEl.tagName && leftEl.tagName !== rightEl.tagName) {
		renameTagName(leftEl, rightEl);

		// todo: we should break here in theory
	}

	if(rightEl.tagName) {

		if(rightEl.tagName === "SCRIPT" && leftEl.src !== rightEl.src)
			rightEl.replaceWith(cloneByCreate(leftEl));
		// else
		//   assignAttributes(leftEl, rightEl);
	}

	// todo: if any change we should break here too

	if(flat)
		return;

	const rightElChilds = rightEl.childNodes;
	const leftElChilds = Array.from(leftEl.childNodes);

	if(leftEl.tagName === "HEAD" && !leftElChilds.length)
		return;

	let index = 0,
		len = leftElChilds.length;
	for(; index < len; index++) {
		let leftChild = leftElChilds[index],
			rightChild = rightElChilds[index];


		let leftIsText = isTextOrEl(leftChild);

		if(!rightChild) {
			if(leftIsText === true)
				rightEl.insertAdjacentText('beforeend', leftChild.data);
			else if(leftIsText === false)
				insertAdajcentClone(rightEl, leftChild, 'beforeend');
			else
				continue;
		}
		else {

			let rightIsText = isTextOrEl(rightChild);
			if(rightIsText === undefined)
				continue;
			if (rightEl.domText == true) continue;

			if(leftIsText) {
				if(rightIsText) {
					if(leftChild.data.trim() !== rightChild.data.trim())
						if (rightEl.domText == true) continue;
						rightChild.data = leftChild.data;
				}
				else {
					rightChild.before(document.createTextNode(leftChild.data));
					let rightId = rightChild.getAttribute('element_id');

					if(rightId) {
						let elIndex = elIndexOf(rightId, rightEl.childNodes);
						if(elIndex === -1) {
							rightChild.remove();

							mergeTextNode(rightElChilds[index], rightElChilds[index - 1]);
							index--;
							continue;
						}

						else if(rightElChilds[elIndex] && rightElChilds[elIndex] !== rightChild)
							rightElChilds[elIndex].before(rightChild);
					}


				}
			}
			else {


				if(rightIsText) {
					textInsertAdajcentClone(rightChild, leftChild, 'beforebegin');
					rightChild.remove();
				}
				else {
					// teleport element if exist otherwise create it
					let rightId = rightChild.getAttribute('element_id');
					let leftId = leftChild.getAttribute('element_id');

					if(leftId && rightId !== leftId) {
						let elIndex = elIndexOf(leftId, rightEl.childNodes);

						if(elIndex === -1)
							insertAdajcentClone(rightChild, leftChild, 'beforebegin');
						else
							rightChild.insertAdjacentElement('beforebegin', rightEl.childNodes[elIndex]);


						// new element has been added we should process the new element again at index

						rightChild = rightElChilds[index];
						rightId = rightChild.getAttribute('element_id');
						if(rightId) {
							elIndex = elIndexOf(rightId, rightEl.childNodes);

							if(elIndex === -1) {
								rightChild.remove();
								mergeTextNode(rightElChilds[index], rightElChilds[index - 1]);
								index--;
								continue;
							}
							else if(rightElChilds[elIndex] && rightElChilds[elIndex] !== rightChild)
								rightElChilds[elIndex].before(rightChild);

						}


					}
					else {

						rebuildDom.call(domTextEl, leftChild, rightChild, flat);
					}
				}
			}
		}

	}

	// remove rest of the child in the element
	while(rightElChilds[index]) {
		rightElChilds[index].remove();
	}



}

// function checkParent(element, selectors){
//     let parentElement;
//     do {
// 	    if(element.parentElement.closest(selectors)) {
//     		parentElement = element.parentElement.closest(selectors);
// 	    } else {
// 			return element;
// 	    }
// 	    element = parentElement;
//     } while (parentElement);
// }

function renameTagName(leftEl, rightEl) {

	let newRightEl = document.createElement(leftEl.tagName);
	assignAttributes(leftEl, newRightEl);
	newRightEl.replaceChildren(...leftEl.childNodes);
	rightEl.replaceWith(newRightEl);

}


// overwrite except element_id
function assignAttributes(leftEl, rightEl) {

	for(let leftAtt of leftEl.attributes) {
		if(!rightEl.attributes[leftAtt.name] || rightEl.attributes[leftAtt.name].value !== leftAtt.value)
			try {
				rightEl.setAttribute(leftAtt.name, leftAtt.value);

			}
		catch(err) {
			// <st is valid based on w3 but setAttribute throw exception
			// https://www.w3.org/TR/2011/WD-html5-20110525/syntax.html#attributes-0
		}
	}

	if(leftEl.attributes.length !== rightEl.attributes.length) {
		for(let i = 0, len = rightEl.attributes.length; i < len; i++) {
			let rightAtt = rightEl.attributes[i];
			if(!leftEl.attributes[rightAtt.name]) {
				rightEl.removeAttribute(rightAtt.name);
				i--, len--;
			}

		}

	}
}


export default {insertAdjacentElement, removeElement, setInnerText, setAttribute, removeAttribute, setClass, setStyle, setClassStyle, addToDom, removeFromDom};
