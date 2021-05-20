export function logFindPosition(p) {
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

export function logFindPositionNodeJs(p) {
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






export function isElEqual(leftEl, rightEl) {
  if (leftEl.tagName != rightEl.tagName)
    return false;


  if (leftEl.attributes.length != rightEl.attributes.length)
    return false;


  for (let leftAtt of leftEl.attributes) {
    if (!rightEl.attributes[leftAtt.name])
      return false;
    else if (rightEl.attributes[leftAtt.name].value != leftAtt.value)
      return false;
  }

  if (!this.isDomEqul(leftEl, rightEl))
    return false;

  return true;
}


export function isDomEqul(leftEl, rightEl) {
  const rightElChilds = rightEl.childNodes
  const leftElChilds = leftEl.childNodes;


  for (let i = 0; i < leftElChilds.length; i++) {
    if (leftElChilds[i].constructor.name == "Text") {
      if (rightElChilds[i]) {
        if (rightElChilds[i].constructor.name == "Text") {
          if (rightElChilds[i].data.trim() !== leftElChilds[i].data.trim())
            return false;
        }
        else
          return false;
      }
      else
        return false;
    }
    else {
      if (rightElChilds[i]) {
        if (rightElChilds[i].constructor.name != "Text") {
          if (!this.isElEqual(leftElChilds[i], rightElChilds[i]))
            return false;
        }
        else
          return false;
      }
      else
        return false;


    }
  }
  return true;
}
