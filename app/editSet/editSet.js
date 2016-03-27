var sessionSetId = sessionStorage.getItem('editSet'), cards = [], theSet;

//Basic card object
var Card = function(term, definition, objectId) {
    this.term = term;
    this.definition = definition;
};

//Basic set object
var Set = function(setId, title) {
    this.setId = setId;
    this.title = title;
};

//Initialize the input lines in the form with the values from the cards array retrieved from Parse
var makeLines = function() {
    _.each(cards, function (key) {
        var parent = document.getElementById("parent");

        //Term input
        var input1 = document.createElement('input');
        input1.type = "text";
        input1.id = "term";
        input1.className = "form-control";
        //Set value of term to card term property
        input1.value = key.term;
        input1.autofocus = "";
        input1.autocomplete = "off";
        input1.tabIndex = "2";

        //Definition input
        var input2 = document.createElement('input');
        input2.type = "text";
        input2.id = "definitionInput";
        input2.className = "form-control";
        //Set value of definition to card definition property
        input2.value = key.definition;
        input2.autofocus = "";
        input2.autocomplete = "off";
        input2.tabIndex = "2";

        //Term div with bootstrap
        var div1 = document.createElement('div');
        div1.className = "col-xs-5";
        div1.id = "termEntry";
        div1.appendChild(input1);

        //Definition div with bootstrap
        var div2 = document.createElement('div');
        div2.className = "col-xs-5";
        div2.id = "definitionEntry";
        div2.appendChild(input2);

        //Delete button with bootstrap
        var span1 = document.createElement('span');
        span1.className = "glyphicon glyphicon-minus";
        var button1 = document.createElement('button');
        button1.className = 'btn btn-danger';
        button1.type = 'button';
        button1.appendChild(span1);
        button1.addEventListener('click', function () {
            deleteItem(button1);
        }, false);
        var div3 = document.createElement('div');
        div3.className = "col-xs-2";
        div3.appendChild(button1);

        //Append the card to the parent
        var cardsEntry = document.createElement('div');
        cardsEntry.className = 'cardsEntry';
        cardsEntry.appendChild(div1);
        cardsEntry.appendChild(div2);
        cardsEntry.appendChild(div3);
        parent.appendChild(cardsEntry);
    });
};

//Called after the add button is clicked
function addLine() {
    var parent = document.getElementById("parent");

    //Term input
    var input1 = document.createElement('input');
    input1.type = "text";
    input1.id = "term";
    input1.className = "form-control";
    input1.placeholder = "Term";
    input1.autofocus = "";
    input1.autocomplete = "off";
    input1.tabIndex = "2";

    //Definition input
    var input2 = document.createElement('input');
    input2.type = "text";
    input2.id = "definitionInput";
    input2.className = "form-control";
    input2.placeholder = "Definition";
    input2.autofocus = "";
    input2.autocomplete = "off";
    input2.tabIndex = "2";

    //Term div with bootstrap
    var div1 = document.createElement('div');
    div1.className = "col-xs-5";
    div1.id = "termEntry";
    div1.appendChild(input1);

    //Definition div with bootstrap
    var div2 = document.createElement('div');
    div2.className = "col-xs-5";
    div2.id = "definitionEntry";
    div2.appendChild(input2);

    //Delete button with bootstrap and onClick event to deleteItem()
    var span1 = document.createElement('span');
    span1.className = "glyphicon glyphicon-minus";
    var button1 = document.createElement('button');
    button1.className = 'btn btn-danger';
    button1.type = 'button';
    button1.appendChild(span1);
    button1.addEventListener('click', function () {
        deleteItem(button1);
    }, false);

    //Delete button div with bootstrap
    var div3 = document.createElement('div');
    div3.className = "col-xs-2";
    div3.appendChild(button1);

    //Append the new line to the parent
    var cardsEntry = document.createElement('div');
    cardsEntry.className = 'cardsEntry';
    cardsEntry.appendChild(div1);
    cardsEntry.appendChild(div2);
    cardsEntry.appendChild(div3);
    parent.appendChild(cardsEntry);
}

//Called when the delete button is clicked
function deleteItem(button) {

    //Find the cards with the term that is going to be deleted and remove them from the cards array
    cards = _.filter(cards, function (c) {
        return button.parentNode.parentNode.children[0].children[0].value != c.term;
    });

    //Remove the div that contains the line with the button
    button.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode);
}

//Called on load. Calls on Parse for the sets created by a particular user and populates the sets array
var getSet = function() {
    var SetsObject = Parse.Object.extend("Sets");
    var query = new Parse.Query(SetsObject);

    //Filter query based on user
    query.equalTo("objectId", sessionSetId);

    //Execute query and return results
    query.find({
        success: function (results) {

            //Populate sets array
            theSet = new Set(results[0].id, results[0].get("title"));

            //Initialize title value
            document.getElementById("setName").value = theSet.title;

            //Can now populate cards array
            getCards();
        },
        error: function (error) {
            alert(error.message);
        }
    });
};

//Called after sets are returned from Parse
var getCards = function() {
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    //Filter cards based on cards created by a particular user
    query.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sessionSetId
    });

    //Execute query
    query.find({
        success: function (results) {

            //Populate cards array
            cards = _.map(results, function(c){
                return new Card(c.get("term"), c.get("definition"), c.get("setsID"), c.id);
            });

            //Can now initialize the lines on the entry form
            makeLines();
        },
        error: function (error) {
            alert(error.message);
        }
    });
};

//Called when the submit button is clicked
var submitCards = function(){
    event.preventDefault();

    //Get the cards entry form and create an array of its elements
    var elements = document.getElementsByClassName("cardsEntry");
    //Cast elements to array
    var elementsArr =  Array.prototype.slice.call(elements);

    //Use the elementsArr to get data from form and save the term and definitions to a new array of cards
    cards = _.map(elementsArr, function(item){
        return new Card(item.children[0].children[0].value, item.children[1].children[0].value);
    });

    //Call submitToParse to save the newly cards in parse
    submitToParse();
};

//Call to parse to create new set name and cards
var submitToParse = function() {
    var CardsObject = Parse.Object.extend("Cards");
    var SetObject = Parse.Object.extend("Sets");
    var cardsQuery = new Parse.Query(CardsObject);

    //Filter cards based on the set id
    cardsQuery.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: theSet.setId
    });

    //Find the set in Parse then rewrite its title
    var saveSet = new SetObject();
    saveSet.id = theSet.setId;
    saveSet.set("title", theSet.title);

    //Submit the title change to the set
    saveSet.save(null, {
        success: function () {

            //Find all cards in the set and delete them
            cardsQuery.find({
                    success: function (results) {
                        Parse.Object.destroyAll(results);

                        //Repopulate the cards table with the cards array
                        var cardArr = _.map(cards, function (c) {
                            var cs = new CardsObject;
                            cs.set("term", c.term);
                            cs.set("definition", c.definition);
                            cs.set('setsID', {
                                __type: "Pointer",
                                className: "Sets",
                                objectId: theSet.setId
                            });
                            return cs;
                        });

                        //Save the updated cards
                        Parse.Object.saveAll(cardArr, {
                            success: function () {
                                //Edit is finished. Go back to viewSets.
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
};

//function to execute on load
getSet();