var sessionSetId = sessionStorage.getItem('editSet');
var cards = [];
var theSet;

getSet();

function Card(term, definition, setId, objectId) {
    this.term = term;
    this.definition = definition;
    this.setId = setId;
    this.objectId = objectId;
}

function Set(setId, title) {
    this.setId = setId;
    this.title = title;
}

function makeLines() {
    cards.forEach(function (key) {
        var parent = document.getElementById("parent");
        var input1 = document.createElement('input');
        input1.type = "text";
        input1.id = "termEntry";
        input1.className = "form-control";
        input1.value = key.term;
        input1.autofocus = "";
        input1.autocomplete = "off";
        input1.tabIndex = "2";
        var input2 = document.createElement('input');
        input2.type = "text";
        input2.id = "definitionEntry";
        input2.className = "form-control";
        input2.value = key.definition;
        input2.autofocus = "";
        input2.autocomplete = "off";
        input2.tabIndex = "2";
        var div1 = document.createElement('div');
        div1.className = "col-xs-5";
        div1.id = "contusername";
        div1.appendChild(input1);
        var div2 = document.createElement('div');
        div2.className = "col-xs-5";
        div2.id = "contemail";
        div2.appendChild(input2);
        var span1 = document.createElement('span');
        span1.className = "glyphicon glyphicon-minus";
        var button1 = document.createElement('button');
        button1.className = 'btn btn-danger';
        button1.type = 'button';
        button1.onclick = 'removeLine()';
        button1.appendChild(span1);
        button1.addEventListener('click', function () {
            deleteItem(button1);
        }, false);
        var div3 = document.createElement('div');
        div3.className = "col-xs-2";
        div3.appendChild(button1);
        var cardsEntry = document.createElement('div');
        cardsEntry.name = 'cardsEntry';
        cardsEntry.appendChild(div1);
        cardsEntry.appendChild(div2);
        cardsEntry.appendChild(div3);
        parent.appendChild(cardsEntry);
    });
}

function addLine() {
    var parent = document.getElementById("parent");
    var input1 = document.createElement('input');
    input1.type = "text";
    input1.id = "term";
    input1.className = "form-control";
    input1.placeholder = "Term";
    input1.autofocus = "";
    input1.autocomplete = "off";
    input1.tabIndex = "2";
    var input2 = document.createElement('input');
    input2.type = "text";
    input2.id = "definition";
    input2.className = "form-control";
    input2.placeholder = "Definition";
    input2.autofocus = "";
    input2.autocomplete = "off";
    input2.tabIndex = "2";
    var div1 = document.createElement('div');
    div1.className = "col-xs-5";
    div1.id = "contusername";
    div1.appendChild(input1);
    var div2 = document.createElement('div');
    div2.className = "col-xs-5";
    div2.id = "contemail";
    div2.appendChild(input2);
    var span1 = document.createElement('span');
    span1.className = "glyphicon glyphicon-minus";
    var button1 = document.createElement('button');
    button1.className = 'btn btn-danger';
    button1.type = 'button';
    button1.onclick = 'removeLine()';
    button1.appendChild(span1);
    button1.addEventListener('click', function () {
        deleteItem(button1);
    }, false);
    var div3 = document.createElement('div');
    div3.className = "col-xs-2";
    div3.appendChild(button1);
    var cardsEntry = document.createElement('div');
    cardsEntry.name = 'cardsEntry';
    cardsEntry.appendChild(div1);
    cardsEntry.appendChild(div2);
    cardsEntry.appendChild(div3);
    parent.appendChild(cardsEntry);
}

var deleteItem = function (button) {
    cards = cards.filter(function (key) {
        if (button.parentNode.parentNode.children[0].children[0].value == key.term) return false;
        return true;
    });
    button.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode);
    console.log(cards);
};

function getCards() {
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    query.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sessionSetId
    });


    query.find({
        success: function (results) {
            for (var i in results) {
                var aCard = new Card(results[i].get("term"), results[i].get("definition"), results[i].get("setsID"), results[i].id);
                cards.push(aCard);
            }

            makeLines();
        },
        error: function (error) {
            alert(error.message);
        }
    });
}

function getSet() {
    var SetsObject = Parse.Object.extend("Sets");
    var query = new Parse.Query(SetsObject);

    query.equalTo("objectId", sessionSetId);

    query.find({
        success: function (results) {
            for (var i in results) {
                theSet = new Set(results[i].id, results[i].get("title"));
            }
            document.getElementById("setName").value = theSet.title;
            getCards();
        },
        error: function (error) {
            alert(error.message);
        }
    });
}

function submitToParse() {
    event.preventDefault();
    var CardsObject = Parse.Object.extend("Cards");
    var SetObject = Parse.Object.extend("Sets");
    var cardsQuery = new Parse.Query(CardsObject);

    cardsQuery.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: theSet.setId
    });

    var point = new SetObject();
    point.id = theSet.setId;
    point.set("title", theSet.title);

    point.save(null, {
        success: function () {
            console.log('Point set');
            cardsQuery.find({
                    success: function (results) {
                        console.log("start");
                        console.log(results);
                        Parse.Object.destroyAll(results);
                        var cardArr = [];
                        cards.forEach(function (key) {
                            var cs = new CardsObject;
                            cs.set("term", key.term);
                            cs.set("definition", key.definition);
                            cs.set('setsID', {
                                __type: "Pointer",
                                className: "Sets",
                                objectId: theSet.setId
                            });
                            cardArr.push(cs);
                        });

                        Parse.Object.saveAll(cardArr, {
                            success: function (cs) {
                                // Execute any logic that should take place after the object is saved.
                                location.href = "../viewSets/viewSets.html";
                            },
                            error: function (cs, error) {
                                // Execute any logic that should take place if the save fails.
                                // error is a Parse.Error with an error code and message.
                                alert('2-Failed to create new card, with error code: ' + error.message);
                            }
                        });
                    },
                    error: function (error) {
                        alert('1-Failed to find cards, with error code: ' + error.message);
                    }
                }
            );
        },
        error: function (cs, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('1-Failed to update title, with error code: ' + error.message);
        }
    });
}