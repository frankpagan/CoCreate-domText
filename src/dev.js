
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





