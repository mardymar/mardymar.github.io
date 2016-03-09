addLine();
addLine();

function submitCards(){
    event.preventDefault();
    var elements = document.getElementsByName("cardsEntry");
    var elementsArr =  Array.prototype.slice.call(elements);
    var arr = elementsArr.map(function(key){
        return [key.children[0].children[0].value, key.children[1].children[0].value];
    });

    console.log(arr[0][0]);
    submitToParse(arr, document.getElementById('setName').value);
}

function addLine(){
    var parent = document.getElementById("parent");
    var input1 = document.createElement( 'input' );
    input1.type="text";
    input1.id="term";
    input1.className="form-control";
    input1.placeholder = "Term";
    input1.autofocus = "";
    input1.autocomplete="off";
    input1.tabIndex="2";
    var input2 = document.createElement( 'input' );
    input2.type="text";
    input2.id="definition";
    input2.className="form-control";
    input2.placeholder = "Definition";
    input2.autofocus = "";
    input2.autocomplete="off";
    input2.tabIndex="2";
    var div1 = document.createElement('div');
    div1.className="col-xs-5";
    div1.id="contusername";
    div1.appendChild(input1);
    var div2 = document.createElement('div');
    div2.className="col-xs-5";
    div2.id="contemail";
    div2.appendChild(input2);
    var span1 = document.createElement('span');
    span1.className="glyphicon glyphicon-minus";
    var button1 = document.createElement('button');
    button1.className='btn btn-danger';
    button1.type='button';
    button1.onclick='removeLine()';
    button1.appendChild(span1);
    button1.addEventListener('click', function() {
        deleteItem(button1);
    }, false);
    var div3 = document.createElement('div');
    div3.className="col-xs-2";
    div3.appendChild(button1);
    var cardsEntry = document.createElement('div');
    cardsEntry.name = 'cardsEntry';
    cardsEntry.appendChild(div1);
    cardsEntry.appendChild(div2);
    cardsEntry.appendChild(div3);
    parent.appendChild(cardsEntry);
}

var deleteItem = function(button) {
    button.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode);
};

function Card(term, definition){
    this.term = term;
    this.definition = definition;
}

function submitToParse(arr, title){

    var Titles = Parse.Object.extend("Sets");
    var ts = new Titles();
    ts.set("title", title);
    ts.set("userID", Parse.User.current());
    console.log(ts);
    ts.save(null, {
        success: function (tts) {
            var cardArr = [];
            var Cards = Parse.Object.extend("Cards");
            for(a in arr){
                console.log("IN parse");
                var cs = new Cards();
                cs.set("term", a[0]);
                cs.set("definition", a[1]);
                cs.set('setsID', tts);
                cardArr.push(cs);
            }

            Parse.Object.saveAll(cardArr, {
                success: function (cs) {
                    location.href="../viewSets/viewSets.html";
                },
                error: function (cs, error) {
                    alert('2-Failed to create new card, with error code: ' + error.message);
                }
            });

        },
        error: function (ts, error) {
            alert('1-Failed to create new set, with error code: ' + error.message);
        }
    });
}
