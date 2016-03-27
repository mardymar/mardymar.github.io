
//Called when the submit button is clicked
var submitCards = function(){
    event.preventDefault();

    //Get the cards entry form and create an array of its elements
    var elements = document.getElementsByClassName("cardsEntry");
    //Cast elements to array
    var elementsArr =  Array.prototype.slice.call(elements);

    //Use the elementsArr to get data from form and save the term and definitions to a new array of cards
    var cards = _.map(elementsArr, function(item){
        return [item.children[0].children[0].value, item.children[1].children[0].value];
    });

    //Call submitToParse to save the newly cards in parse
    submitToParse(cards, document.getElementById('setName').value);
};

//Called once when the add button is clicked. Gets called twice on load. Will create one new line.
var addLine = function(){
    var parent = document.getElementById("parent");

    //Term input
    var input1 = document.createElement( 'input' );
    input1.type="text";
    input1.id="term";
    input1.className="form-control";
    input1.placeholder = "Term";
    input1.autofocus = "";
    input1.autocomplete="off";
    input1.tabIndex="2";

    //Definition input
    var input2 = document.createElement( 'input' );
    input2.type="text";
    input2.id="definitionInput";
    input2.className="form-control";
    input2.placeholder = "Definition";
    input2.autofocus = "";
    input2.autocomplete="off";
    input2.tabIndex="2";

    //Term div with bootstrap
    var div1 = document.createElement('div');
    div1.className="col-xs-5";
    div1.id="termEntry";
    div1.appendChild(input1);

    //Definition div with bootstrap
    var div2 = document.createElement('div');
    div2.className="col-xs-5";
    div2.id="definitionEntry";
    div2.appendChild(input2);

    //Delete button with bootstrap and onClick event to deleteItem()
    var span1 = document.createElement('span');
    span1.className="glyphicon glyphicon-minus";
    var button1 = document.createElement('button');
    button1.className='btn btn-danger';
    button1.type='button';
    button1.appendChild(span1);
    button1.addEventListener('click', function() {
        deleteItem(button1);
    }, false);

    //Delete button div with bootstrap
    var div3 = document.createElement('div');
    div3.className="col-xs-2";
    div3.appendChild(button1);

    //Append the new line to the parent
    var cardsEntry = document.createElement('div');
    cardsEntry.className = 'cardsEntry';
    cardsEntry.appendChild(div1);
    cardsEntry.appendChild(div2);
    cardsEntry.appendChild(div3);
    parent.appendChild(cardsEntry);
};

//Called when the delete button is clicked
var deleteItem = function(button) {

    //Get the Grandparent of the button and delete it to delete the line
    button.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode);
};

var submitToParse = function(cards, title){

    console.log(cards);
    //Save the new set first
    var setsObject = Parse.Object.extend("Sets");
    var sO = new setsObject();
    sO.set("title", title);
    sO.set("userID", Parse.User.current());

    sO.save(null, {
        success: function (setId) {

            //Now save the cards
            var cardArr = [];
            var cardsObject = Parse.Object.extend("Cards");

            console.log(cards);
            //Populate the cards array
            _.each(cards, function(c){
                console.log(c);
                var cO = new cardsObject();
                cO.set("term", c[0]);
                cO.set("definition", c[1]);
                cO.set('setsID', setId);
                cardArr.push(cO);
            });
            //console.log(cardArr);

            //Save the cards array
            Parse.Object.saveAll(cardArr, {
                success: function () {

                    //Success saving cards! Now go to viewSets
                    //location.href="../viewSets/viewSets.html";
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
};

//Add two new lines on load
addLine();
addLine();