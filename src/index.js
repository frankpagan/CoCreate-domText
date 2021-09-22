/*global DOMParser*/

// let spaceAll = "\u{0020}|\u{0009}|\u{000A}|\u{000C}|\u{000D}";
let space = "\u{0020}|\u{0009}";
let allAttributeName = `[a-z0-9-_]+?`;
let allStyleName = "[^:]+?";
// let allClassName = '[^"]+?';

let sps = `(${space})*?`;
let spa = `(${space})+?`;
// let spsa = `(${spaceAll})*?`;
// let spaa = `(${spaceAll})+?`;
let tgs = `(?:<(?<tagName>[a-z0-9]+?))`;
let getEndTag = tagName => `(?:<(?<isClosing>${sps}\/${sps})?${tagName}${sps})`;

const getRegAttribute = (attributeName) =>
	`(${spa}(?:(?:${attributeName})((?:="[^"]*?")|${space}|>)))`;
const getRegStyle = (styleName) =>
	`(?:${sps}${styleName}${sps}\:${sps}[^\;]+?${sps}\;${sps})`;
const getRegClassStyle = (styleName) => `(?:${sps}${styleName}:[^ ]+${sps})`;
const getRegClass = (className) => `(?:${sps}${className}${sps})`;
// const getTagClose = (tagName) => `(?:${sps}\/${sps}${tagName}${sps})`;
// const getRegTagStart = (tagName) => `(?:<${tagName}${sps})`;

let at = getRegAttribute(allAttributeName);
// let anyAtt = getRegAttribute('');
let the = `${sps}(?<tagSlash>\/)?${sps}>`;
let sty = getRegStyle(allStyleName);

// let cls = getRegClass(allClassName);
// let mcls = `${cls}*?`;
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
let target;
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
// let isOmission;
// let tagNameEnd;
// let haveClosingTag;
	// 2 functions should be supported 

// function setCallback({ addCallback, removeCallback }) {
// }
	
function removeCallback(param) {
	if(!param) return;
	let domTextEl = param.domTextEl;
	let html = domTextEl.htmlString;
	// if (param.type != 'innerText')
		textdomfr.set(param.from * param.to, true);
	domTextEl.htmlString = removeAt(html, param.from, param.to);
	domTextEl.removeCallback.call(null, param);
}

function addCallback(param) {
	if(!param) return;
	let domTextEl = param.domTextEl;
	let html = domTextEl.htmlString;
	// if (param.type != 'innerText')
		textdomfa.set(param.position + param.value, true);
	domTextEl.htmlString = replaceAt(html, param.position, param.value);
	domTextEl.addCallback.call(null, param);
}

function replaceAt(html, index, replacement) {
	return html.substr(0, index) + replacement + html.substr(index);
}

function removeAt(html, index, to) {
	return html.substr(0, index) + html.substr(to);
}

function findStartTagById(domTextEl, target) {
	let sch = `(?:${sps}element_id\=\"${target}\"${sps})`;
	let reg = `(?<tagWhole>${tgs}${at}*?${sch}${at}*?${the})`;
	let tagStart = domTextEl.htmlString.match(new RegExp(reg, "is"));

	if(!tagStart)
		throw new Error('element is not valid or can not be found');

	tagName = tagStart.groups.tagName.toUpperCase();

	tagStPos = tagStart.index;
	tagStAfPos = tagStart.index + tagName.length + 1;
	tagStClPos = tagStart.index + tagStart.groups.tagWhole.length - 1 - (tagStart.groups.tagSlash ? 1 : 0);
	// haveClosingTag = !tagStart.groups.tagSlash;
	tagStClAfPos = tagStart.index + tagStart.groups.tagWhole.length;
	// tagNameEnd = tagStAfPos + tagName.length;
	// if it's like <img />
	if(tagStart.groups.tagSlash) {
		tagEnPos = tagStClPos;
		tagEnClAfPos = tagStClAfPos;
		// isOmission = true; // if the tag doesn't have closing counterpart
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
	let match = domTextEl.htmlString.substr(tagStClAfPos)
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

function insertAdjacentElement({ domTextEl, target, position, element, elementValue }) {
	let pos;
	if(!elementValue) {
		pos = getWholeElement(domTextEl, element);
		if(!pos)
			throw new Error('insertAdjacentElement: element not found');
		elementValue = domTextEl.htmlString.substring(pos.start, pos.end);
	}

	findStartTagById(domTextEl, target);

	let insertPos;
	switch(position) {
		case "beforebegin":
			insertPos = tagStPos;
			break;
		case "afterbegin":
			insertPos = tagStClAfPos;
			break;
		case "beforeend":
			findClosingTag(domTextEl, target);
			insertPos = tagEnPos;
			break;		case "afterend":
			findClosingTag(domTextEl, target);
			insertPos = tagEnClAfPos;
			break;
	}
	if(pos) {
		if(pos.end < insertPos)
			insertPos = insertPos - (pos.end - pos.start);
		removeCallback({domTextEl, ...pos});
	}
	addCallback({ domTextEl, value: elementValue, position: insertPos });
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

function setClass({ domTextEl, target, classname }) {
	findAttributePos( domTextEl, target, "class");

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
	findAttributePos(domTextEl, target, "class");
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

	let classStart = domTextEl.htmlString
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
		return { start: atVEn };
}

function setStyle({ domTextEl, target, styleName }) {
	findAttributePos(domTextEl, target, "style");
	if(atVSt === atVEn) return { start: atVSt, context: "value" };

	else if(atVEn) {
		let positions = findStylePos(domTextEl, target, styleName);
		if(positions.end)
			removeCallback({domTextEl, ...positions});

		addCallback({ domTextEl, position: positions.start, value: styleName });
	}
	else {
		// attribute styleName not exist
		addCallback({ domTextEl, position: atSt, value: ` style="${styleName}"` });
	}
}

function findStylePos(domTextEl, target, style) {
	let prRegStyle = getRegStyle(style);

	let styleStart = domTextEl.htmlString
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

function setAttribute({ domTextEl, target, name, value }) {
	findAttributePos(domTextEl, target, name);
	if(atEn)
		removeCallback({ domTextEl, start: atSt, end: atEn });
	if(value)
		addCallback({ domTextEl, position: atSt, value: ` ${name}="${value}"` });
}

function removeAttribute({ domTextEl, target, name }) {
	findAttributePos(domTextEl, target, name);
	if(atEn)
		removeCallback({ domTextEl, start: atSt, end: atEn });
}

function findAttributePos(domTextEl, target, property) {
	if(!findStartTagById(domTextEl, target))
		throw new Error('attribute can not be found');

	let prRegAttr = getRegAttribute(property);
	let regex = `^(?<beforeAtt>${at}*?)${prRegAttr}`;

	let attStart = domTextEl.htmlString.substr(tagStAfPos).match(new RegExp(regex, "is"));

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

function setInnerText({ domTextEl, target, value, start, end, avoidTextToDom, metadata }) {
	let type = 'innerText';

	if(findStartTagById(domTextEl, target))
		findClosingTag(domTextEl, target);
	else return;

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
}

function addToDom({ domTextEl, pos, changeStr }) {
	let key = pos + changeStr;
	if(textdomfa.has(key)) {
		textdomfa.delete(key);
		return;

	}
	changeDom({ domTextEl, pos, changeStr });
}

function removeFromDom({ domTextEl, pos, removeLength }) {
	let key = pos * (removeLength + pos);
	if(textdomfr.has(key)) {
		textdomfr.delete(key);
		return;

	}
	changeDom({ domTextEl, pos, removeLength });
}

function changeDom({ domTextEl, pos, changeStr, removeLength }) {
	if(pos < 0 || pos > domTextEl.htmlString.length)
		throw new Error('position is out of range');

	changeStr = changeStr;
	removeLength = removeLength;
	pos = pos;
	findElByPos(domTextEl, pos) ? rebuildByElement(domTextEl, target) : rebuildByDocument(domTextEl);
}

function findElByPos(domTextEl, pos) {
	let pos1 = pos - idSearch.length;
	let pos2 = pos + idSearch.length;

	pos1 = domTextEl.htmlString.indexOf(idSearch, pos1 + idSearch.length);
	if(pos1 !== -1 && isPosOnEl(domTextEl, pos1, pos))
		return true;

	while(true) {
		pos2 = domTextEl.htmlString.lastIndexOf(idSearch, pos2 - idSearch.length);

		if(pos2 !== -1) {
			if(isPosOnEl(domTextEl, pos2, pos))
				return true;
		}
		else return false;
	}

}

function isPosOnEl(domTextEl, elementIdPos, pos) {
	target = getId(domTextEl, elementIdPos + idSearch.length);

	if(!findStartTagById(domTextEl, target))
		return false;

	findClosingTag(domTextEl, target);
	let tagStartPos = tagStPos;
	let tagEndPos = tagEnClAfPos || tagStClAfPos;

	if(pos > tagStartPos && pos < tagEndPos) {
		return true;
	}
}

function getId(domTextEl, pos) {
	let attWrapper = domTextEl.htmlString[pos];
	let endWrapper = domTextEl.htmlString.indexOf(attWrapper, pos + 1);
	return domTextEl.htmlString.substring(pos + 1, endWrapper);
}


function rebuildByElement(domTextEl) {
	parseHtml(domTextEl);
	let newEl = domTextEl.newHtml.querySelector(`[element_id="${target}"]`);
	let oldEl = domTextEl.oldHtml.querySelector(`[element_id="${target}"]`);
	let domEl = domTextEl.querySelector(`[element_id="${target}"]`);
	rebuildDom(domTextEl, domEl, newEl, oldEl);
}

function rebuildByDocument(domTextEl) {
	parseHtml(domTextEl);
	rebuildDom(domTextEl, domTextEl, domTextEl.newHtml.documentElement, domTextEl.oldHtml.documentElement);
}

function parseHtml(domTextEl) {
	var parser = new DOMParser();
	var dom = parser.parseFromString(domTextEl.htmlString, "text/html");
	if (domTextEl.newHtml) {
		domTextEl.oldHtml = domTextEl.newHtml
	} else {
		domTextEl.oldHtml = dom
	}
	domTextEl.newHtml = dom;
}

function rebuildDom(domTextEl, domEl, newEl, oldEl) {
	// try{
		if(domEl.tagName) {
			if(newEl.tagName !== domEl.tagName) {
				renameTagName(newEl, domEl);
				return;
			}	
			if(domEl.tagName === "SCRIPT" && newEl.src !== domEl.src) {
				domEl.replaceWith(cloneByCreate(newEl));
				return;
			}
			if(oldEl) {
				assignAttributes(newEl, oldEl, domEl);
			}
		}
	
		const domElChildren = domEl.childNodes;
		const newElChildren = Array.from(newEl.childNodes);
	
		if(newEl.tagName === "HEAD" && !newElChildren.length) return;
	
		let index = 0, len = newElChildren.length;
		for(; index < len; index++) {
			let textChild = newElChildren[index],
				domChild = domElChildren[index];
			
			if (domChild.nodeName === '#comment') continue;
			let newElIsText = isTextOrEl(textChild);
	
			if(!domChild) {
				if(newElIsText === true)
					domEl.insertAdjacentText('beforeend', textChild.data);
				else if(newElIsText === false)
					insertAdajcentClone(domEl, textChild, 'beforeend');
				else continue;
			}
			else {
				let domElIsText = isTextOrEl(domChild);
				if(domElIsText === undefined) continue;
				// if (domEl.domText == true) continue;
	
				if(newElIsText) {
					if(domElIsText) {
						if(textChild.data.trim() !== domChild.data.trim())
							// if (domEl.domText == true) continue;
							domChild.data = textChild.data;
					}
					else {
						domChild.before(document.createTextNode(textChild.data));
						let domElId = domChild.getAttribute('element_id');
	
						if(domElId) {
							let elIndex = elIndexOf(domElId, domEl.childNodes);
							if(elIndex === -1) {
								domChild.remove();
	
								mergeTextNode(domElChildren[index], domElChildren[index - 1]);
								index--;
								continue;
							}
							else if(domElChildren[elIndex] && domElChildren[elIndex] !== domChild)
								domElChildren[elIndex].before(domChild);
						}
					}
				}
				else {
					if(domElIsText) {
						textInsertAdajcentClone(domChild, textChild, 'beforebegin');
						domChild.remove();
					}
					else {
						if (domChild.nodeName === '#comment') continue;
						let domElId = domChild.getAttribute('element_id');
						let newElId = textChild.getAttribute('element_id');
	
						if(newElId && domElId !== newElId) {
							let elIndex = elIndexOf(newElId, domEl.childNodes);
							if (!elIndex) continue;
							if(elIndex === -1)
								insertAdajcentClone(domChild, textChild, 'beforebegin');
							else
								domChild.insertAdjacentElement('beforebegin', domEl.childNodes[elIndex]);
	
							// new element has been added we should process the new element again at index
							domChild = domElChildren[index];
							domElId = domChild.getAttribute('element_id');
							if(domElId) {
								elIndex = elIndexOf(domElId, domEl.childNodes);
	
								if(elIndex === -1) {
									domChild.remove();
									mergeTextNode(domElChildren[index], domElChildren[index - 1]);
									index--;
									continue;
								}
								else if(domElChildren[elIndex] && domElChildren[elIndex] !== domChild)
									domElChildren[elIndex].before(domChild);
							}
						}
						else {
							rebuildDom(domTextEl, domChild, textChild );
						}
					}
				}
			}
		}
	
		// remove rest of the child in the element
		while(domElChildren[index]) {
			domElChildren[index].remove();
		}
	// }
	// catch(err) {
	// 	throw new Error("domText failed to apply the change " + err.message, err.name);
	// }
}

function cloneByCreate(el) {
	let newEl = document.createElement(el.tagName);
	newEl.innerHTML = el.innerHTML;
	assignAttributes(el, newEl, newEl);
	return newEl;
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

function textInsertAdajcentClone(target, element, position) {
	if (element.nodeName === '#comment') return;
	let func = position === "beforebegin" ? target.before : target.after;
	let cloned = element.cloneNode(true);
	if(cloned.tagName === "SCRIPT")
		cloned = cloneByCreate(cloned);
	if (cloned.nodeName === '#comment') return;
	cloned.querySelectorAll('script').forEach(el => {
		el.replaceWith(cloneByCreate(el));
	});
	func.call(target, cloned);
}

function mergeTextNode(textNode1, textNode2) {
	if(isTextOrEl(textNode1) === true && textNode2 && isTextOrEl(textNode2) === true) {
		textNode2.data += textNode1.data;
		textNode1.remove();
	}
}

function isTextOrEl(el) {
	if(el.constructor.name === 'Text')
		return true;
	else if(el.constructor.name.indexOf('Element'));
		return false;
}

function elIndexOf(id, elList) {
	for(let i = 0; i < elList.length; i++) {
		if (elList[i].nodeName === '#comment') return;
		if(isTextOrEl(elList[i]) === false && elList[i].getAttribute('element_id') == id)
			return i;
	}
	return -1;
}


function renameTagName(newEl, domEl) {
	let newDomEl = document.createElement(newEl.tagName);
	assignAttributes(newEl, newDomEl, newDomEl);
	newDomEl.replaceChildren(...newEl.childNodes);
	domEl.replaceWith(newDomEl);
}

// overwrite except element_id
function assignAttributes(newEl, oldEl, domEl) {
	for(let newElAtt of newEl.attributes) {
		if(!oldEl.attributes[newElAtt.name] || oldEl.attributes[newElAtt.name].value !== newElAtt.value)
			try {
				domEl.setAttribute(newElAtt.name, newElAtt.value);
			}
		catch(err) {
			throw new Error("assignAttributes: " + err.message, err.name);
		}
	}

	if(newEl.attributes.length !== oldEl.attributes.length) {
		for(let i = 0, len = oldEl.attributes.length; i < len; i++) {
			let oldElAtt = oldEl.attributes[i];
			if(!newEl.attributes[oldElAtt.name]) {
				domEl.removeAttribute(oldElAtt.name);
				i--, len--;
			}

		}

	}
}

export default {insertAdjacentElement, removeElement, setInnerText, setAttribute, removeAttribute, setClass, setStyle, setClassStyle, addToDom, removeFromDom};
