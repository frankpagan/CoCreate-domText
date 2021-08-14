import domHtmlManipulator from './index.js';

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index);
};

String.prototype.removeAt = function(index, to) {
    return this.substr(0, index) + this.substr(to);
};

let resetHtml = `<!DOCTYPE html>
<html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">
	
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
       </div>
   
	</body>
</html>`;



let html = resetHtml;








// test 1 remove whole element


// check what?
// create new assert function isHtmlTheSameAsDom(html, document.dom)

function processStr(str) {
    return str.replace(/\/remove\.from\/[^]+?\/remove\.to\//, '')
        // .replace(/\/add\.from\//,'')
        // .replace(/\/add\.to\//,'')
        .replace(/\/pos\//, '');
}

function getPos(str) {

    let r = str.indexOf('/pos/');
    return r;
}

function getRemoveLength(str) {
    let to = str.indexOf('/remove.to/');
    let from = str.indexOf('/remove.from/');
    let pos = from;
    let removeLength = to - from;
    return { pos, removeLength };
}


function test(dec, resetDom, callback) {
    if (resetDom) {
        let doc = new DOMParser().parseFromString(resetDom, "text/html");

        document.body.parentElement.remove();
        document.append(doc.body.parentElement);
    }
    let [{ isError, messages }, ...otherChecks] = callback();

    if (isError || otherChecks.length && otherChecks.some(check => !check)) {
        console.error(dec, 'failed')
        console.error('reason: ')
        messages.forEach(err => {
            console.error(err)
        })
    }
    else
        console.log('%c' + dec + "Pass", "color: green")
}

function assertEqual(html, callback) {
    let doc = new DOMParser().parseFromString(html, "text/html");
    let isError = false;;
    let messages = [];
    doc.querySelectorAll('*').forEach(el => {
        let id = el.getAttribute('element_id')
        if (id) {
            if (!document.querySelector(`[element_id="${id}"]`)) {
                messages.push('real dom doesn\'t have the element with id:' + id)
                isError = true;
            }
        }

    })

    // document.querySelectorAll('*').forEach(el => {
    //     let id = el.getAttribute('element_id')
    //     if (id) {
    //         if (!doc.querySelector(`[element_id="${id}"]`)) {
    //             messages.push('html dom doesn\'t have the element with id:' + id)
    //             isError = true;

    //         }
    //     }

    // })
    if (callback)
        return [{ isError, messages }, ...callback(doc)];
    else
        return { isError, messages };
}


test('remove a whole element', resetHtml, () => {


    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">
	
        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3">test 3</h1>
  /remove.from/ <h1 element_id="t2" name="2">test 2</h1>  /remove.to/
        		<h1 element_id="t4" name="4">test 4</h1>
    			
            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
       </div>
   
	</body>
</html>`;

    let { pos, removeLength } = getRemoveLength(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, removeLength, html });

    return [assertEqual(html), !document.querySelector(`[element_id="2"]`)]


})



test('remove element in a breaking way', resetHtml, () => {


    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">

        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3">test 3</h1>
  <h1 element_id="t2" name="2">test 2<//remove.from/h1>  /remove.to/
        		<h1 element_id="t4" name="4">test 4</h1>

            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let { pos, removeLength } = getRemoveLength(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, removeLength, html });




    return [assertEqual(html), document.querySelector(`[element_id="t2"]`)]

})


test('add an element with document id', resetHtml, () => {

    let changeStr = '<h3 element_id="h333" name="123">asdasd</h3>';
    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">

        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3">test 3</h1>
                <h1 element_id="t2" name="2">test 2</h1>  
                /pos/${changeStr}
        		<h1 element_id="t4" name="4">test 4</h1>

            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let pos = getPos(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, changeStr, html });




    return [assertEqual(html), document.querySelector(`[element_id="h333"]`)]

})





test('add more data to exisitng attribute  ', resetHtml, () => {

    let changeStr = 'some info';
    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">

        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3/pos/${changeStr}">test 3</h1>
                <h1 element_id="t2" name="2">test 2</h1>  
                
        		<h1 element_id="t4" name="4">test 4</h1>

            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let pos = getPos(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, changeStr, html });




    return [assertEqual(html), document.querySelector(`[element_id="t3"]`).getAttribute('name') === "3some info"]

})






test('create new attribute ', resetHtml, () => {

    let changeStr = 'newAtt="fdgdf"';
    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">

        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3">test 3</h1>
                <h1 element_id="t2" name="2" /pos/${changeStr}>test 2</h1>  
                
        		<h1 element_id="t4" name="4">test 4</h1>

            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let pos = getPos(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, changeStr, html });




    return [assertEqual(html), document.querySelector(`[element_id="t2"]`).getAttribute('newAtt') === "fdgdf"]

})






test('remove attribute', resetHtml, () => {


    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">

        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3">test 3</h1>
  <h1 element_id="t2" /remove.from/name="2" /remove.to/>test 2</h1> 
        		<h1 element_id="t4" name="4">test 4</h1>

            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let { pos, removeLength } = getRemoveLength(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, removeLength, html });



    let t2 = document.querySelector(`[element_id="t2"]`);

    return [assertEqual(html), !t2.getAttribute('name')]

})



test('remove begining and ending of sibiling element to merge them into a valid dom', resetHtml, () => {

    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">

        		<h1 element_id="t1" name="1">test 1</h1>
             	<h1 element_id="t3" name="3">test 3</h1>
  <h1 element_id="t2" /remove.from/name="2" >test 2</h1> 
        		<h1 element_id="t4"/remove.to/ name="4">test 4</h1>

            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let { pos, removeLength } = getRemoveLength(html);
    html = processStr(html);


    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, removeLength, html });



    let t2 = document.querySelector(`[element_id="t2"]`);

    return [assertEqual(html), t2.getAttribute('name') === '4']

})




test('add strings between element', resetHtml, () => {

    let changeStr = 'ggg';
    let html = `<!DOCTYPE html><html>
	<head>
	</head>
	<body style="padding:1;">
	    <div element_id="main">
                aaa
        		<h1 element_id="t1" name="1">test 1</h1>bbb
             	<h1 element_id="t3" name="3">test 3</h1>ccc
                <h1 element_id="t2" name="2" >test 2</h1>ddd
        		<h1 element_id="t4" name="4">test 4</h1>eee
                /pos/${changeStr}
            <script element_id="script1">
                var config = {
                  apiKey: 'c2b08663-06e3-440c-ef6f-13978b42883a',
                  securityKey: 'f26baf68-e3a9-45fc-effe-502e47116265',
                  organization_Id: '5de0387b12e200ea63204d6c'
                }
            </script>
      </div>

	</body>
</html>`;

    let pos = getPos(html);
    html = processStr(html);

    let d = new domHtmlManipulator(html, document.body.parentElement);
    let dump = d.changeDom({ pos, changeStr, html });



    let t1 = document.querySelector(`[element_id="t1"]`);
    let t2 = document.querySelector(`[element_id="t2"]`);
    let t3 = document.querySelector(`[element_id="t3"]`);
    let t4 = document.querySelector(`[element_id="t4"]`);

    return [assertEqual(html), t1.previousSibling.data.indexOf('aaa'), t1.nextSibling.data.startsWith('bbb'), t2.nextSibling.data.startsWith('ddd'), t3.nextSibling.data.startsWith('ccc'), t4.nextSibling.data.startsWith('eee')]

})






test('domToText: do insertAdjacentElement', resetHtml, () => {




    let d = new domHtmlManipulator(resetHtml, document.body.parentElement);

    d.removeCallback = function({ from, to }) {
        d.html = d.html.removeAt(from, to)
    }

    d.addCallback = function({ value, position }) {
        d.html = d.html.replaceAt(position, value)
    }

    let dump = d.insertAdjacentElement({ target: 't1', element: 't2', position: 'afterend' })


    return assertEqual(d.html, (document) => {
        let t1 = document.querySelector(`[element_id="t1"]`);
        let t2 = document.querySelector(`[element_id="t2"]`);
        let t3 = document.querySelector(`[element_id="t3"]`);
        return [t1.nextElementSibling === t2, t2.nextElementSibling === t3]
    })




})





test('domToText: do innerText', resetHtml, () => {





    let d = new domHtmlManipulator(resetHtml, document.body.parentElement);

    d.removeCallback = function({ from, to }) {
        d.html = d.html.removeAt(from, to)
    }

    d.addCallback = function({ value, position }) {
        d.html = d.html.replaceAt(position, value)
    }

    let dump = d.setInnerText({ target: 't3',value: 'zxcasdwqe' })


    return assertEqual(d.html, (document) => {

        let t3 = document.querySelector(`[element_id="t3"]`);
        return [t3.innerText === "zxcasdwqe"]
    })




})



test('domToText: set new style', resetHtml, () => {





    let d = new domHtmlManipulator(resetHtml, document.body.parentElement);

    d.removeCallback = function({ from, to }) {
        d.html = d.html.removeAt(from, to)
    }

    d.addCallback = function({ value, position }) {
        d.html = d.html.replaceAt(position, value)
    }

    let dump = d.setStyle({ target: 't3',style: 'background: red' })


    return assertEqual(d.html, (document) => {

        let t3 = document.querySelector(`[element_id="t3"]`);
        return [t3.getAttribute('style').startsWith('background: red')]
    })




})


test('domToText: set new class', resetHtml, () => {





    let d = new domHtmlManipulator(resetHtml, document.body.parentElement);

    d.removeCallback = function({ from, to }) {
        d.html = d.html.removeAt(from, to)
    }

    d.addCallback = function({ value, position }) {
        d.html = d.html.replaceAt(position, value)
    }

    let dump = d.setClass({ target: 't2',classname: 'background:blue' })


    return assertEqual(d.html, (document) => {

        let t2 = document.querySelector(`[element_id="t2"]`);
        return [t2.getAttribute('class').startsWith('background:blue')]
    })




})


test('domToText: set any attribute', resetHtml, () => {





    let d = new domHtmlManipulator(resetHtml, document.body.parentElement);

    d.removeCallback = function({ from, to }) {
        d.html = d.html.removeAt(from, to)
    }

    d.addCallback = function({ value, position }) {
        d.html = d.html.replaceAt(position, value)
    }

    let dump = d.setAttribute({ target: 't2',name: 'aaa', value : 'zxczxc' })


    return assertEqual(d.html, (document) => {

        let t2 = document.querySelector(`[element_id="t2"]`);
        return [t2.getAttribute('aaa') === 'zxczxc']
    })




})




