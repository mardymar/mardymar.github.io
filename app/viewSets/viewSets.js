var sets = [], cards = [], selectedCards = [], selectedSets = [];

//Basic set object
var Set = function (title, objectId) {
    this.title = title;
    this.objectId = objectId;
};

//Basic card object
var Card = function (term, definition, setId, objectId) {
    this.term = term;
    this.definition = definition;
    this.setTitle = setId.get('title');
    this.setId = setId.id;
    this.objectId = objectId;
};

//Called when the Create Groups button is clicked. The old groups and group details need to be deleted before a call is made to recreate them.
var deleteGroups = function () {

    //Query the Groups table
    var Groups = Parse.Object.extend("Groups");
    var groupsQuery = new Parse.Query(Groups);

    //Filter query by user
    groupsQuery.equalTo("userId", Parse.User.current());

    groupsQuery.find({
        success: function (results1) {

            //Now that the groups are found ... delete them
            Parse.Object.destroyAll(results1, {
                success: function (success) {

                    //Query the Group_Detail table
                    var GroupDetail = Parse.Object.extend("Group_Detail");
                    var groupDetailQuery = new Parse.Query(GroupDetail);

                    //Filter query by user
                    groupDetailQuery.equalTo("userId", Parse.User.current());

                    groupDetailQuery.find({
                        success: function (results2) {

                            //Now that the group details have been found ... delete them
                            Parse.Object.destroyAll(results2, {
                                success: function (success) {

                                    //Groups and group details have been created, now call createGroups to repopulate them
                                    createGroups();
                                }, error: function (error) {
                                    alert(error.message);
                                }
                            });
                        },
                        error: function (error) {
                            alert('Failed to remove old group_details, with error code: ' + error.message);
                        }
                    });
                }, error: function (error) {
                    alert('Failed to remove old groups, with error code: ' + error.message);
                }
            });
        },
        error: function (error) {
            alert('Failed to query old groups, with error code: ' + error.message);
        }
    });
};

//Called after DeleteGroups has been completed.
//This will shuffle the current cards, split them into groups of 5, then create the new group and group details
var createGroups = function () {

    //First shuffle the cards
    var shuffledCards = _.shuffle(selectedCards);
    var groupDetailArr = [];

    //Now calculate how many groups will be needed
    var groupsOf = 5;
    var groupsQuant = Math.floor((shuffledCards.length - 1) / groupsOf + 1);
    var groupsArr;

    var GroupDetail = Parse.Object.extend("Group_Detail");
    var Groups = Parse.Object.extend("Groups");

    //Use my times method to create a groupsQuant number of new groups object specific to the user
    groupsArr = times(groupsQuant, function () {
            var gs = new Groups();
            gs.set("userId", Parse.User.current());
            return gs;
        }
    );

    //Now save the new groups
    Parse.Object.saveAll(groupsArr, {
        success: function (gA) {

            //Populate the group details table evenly to each of the groups with the shuffled cards
            groupDetailArr = _.map(shuffledCards, function(theCard, i){
                var gd = new GroupDetail();
                gd.set("groupId", gA[i % gA.length]);
                gd.set("userId", Parse.User.current());
                gd.set("term", theCard.term);
                gd.set("definition", theCard.definition);
                return gd;
            });

            //Now save the group details4
            Parse.Object.saveAll(groupDetailArr, {
                success: function (gda) {

                    //Group details created. Now we can study them.
                    location.href = "../groups/groups.html";
                },
                error: function (gda, error) {
                    alert('Failed to create new group detail, with error code: ' + error.message);
                }
            });
        },
        error: function (cs, error) {
            alert('2-Failed to create new card, with error code: ' + error.message);
        }
    });
};

//Called on load and after sets are deleted
var getSets = function () {

    //Clear the sets, cards, selectedCards, and selectedSets
    sets = [];
    cards = [];
    selectedCards = [];
    selectedSets = [];

    //Execute a query for the sets given to a particular user
    var SetsObject = Parse.Object.extend("Sets");
    var query = new Parse.Query(SetsObject);
    query.equalTo("userID", Parse.User.current());
    query.find({
        success: function (results) {

            //Sets found, now save the sets and sort them
            sets = _.map(results, function (aSet) {
                return new Set(aSet.get("title"), aSet.id);
            });
            sets.sort(compare);

            //Can now get the cards that belong to the sets
            getCards();
        },
        error: function (error) {
            alert(error.message)
        }
    });
};

//Called after sets are reset
var getCards = function () {

    //Create a query for the cards
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    //Populate the query to filter for sets belonging to the user
    query.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sets[0].objectId
    });
    _.each(sets, function (aSet) {
        var tempQuery = new Parse.Query(CardsObject);
        tempQuery.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: aSet.objectId
        });
        query = Parse.Query.or(query, tempQuery);
    });

    //Execute the query
    query.find({
        success: function (results) {

            //Cards found, now populate the cards array
            cards = _.map(results, function (i) {
                var aCard = new Card(i.get("term"), i.get("definition"), i.get("setsID"), i.id);
                return aCard;
            });

            //Sets and cards retrieved. Now call populateSets() to update the DOM
            populateSets();
        },
        error: function (error) {
            alert(error.message);
        }
    });
};

//This updates the sidebar with the sets that belong to this user
var populateSets = function () {

    //First delete any sets already displayed on the sidebar. Needed in the case where one of the sets was deleted
    var deleteThese = document.getElementById("sidebar-wrapper");
    while (deleteThese.firstChild) {
        deleteThese.removeChild(deleteThese.firstChild);
    }

    //Add a line item to the sidebar for each of the sets
    _.each(sets, function (key) {
        var parent = document.getElementById("sidebar-wrapper");
        var input1 = document.createElement('input');
        input1.type = "checkbox";
        input1.addEventListener('click', function () {
            setSelectedSets(this, key);
        }, false);
        var label2 = document.createElement('label');
        label2.innerHTML = key.title;
        var label1 = document.createElement('label');
        label1.id = 'mast';
        label1.className = 'list-group-item';
        label1.appendChild(input1);
        label1.appendChild(label2);
        parent.appendChild(label1);
    });

    //This call is needed in the case where one of the sets was cleared
    populateCards();
};

//Called from the event listener on the sets checkbox in the sidebar
var setSelectedSets = function (cb, set) {

    if (cb.checked) {
        selectedSets.push(set);
    } else {
        selectedSets = _.filter(selectedSets, function (aSet) {
            return aSet != set;
        });
    }

    //A set has now been selected or unselected, so call this method to update the selectedCards
    filterCards(cards, selectedSets);
};

//Called to populate the DOM with the selectedCards when a new set is selected or deselected
var populateCards = function () {

    //First clear the entries already displayed
    clearCards();

    //Add a line item for each of the selectedCards
    selectedCards.forEach(function (key) {
        var parent = document.createElement("tr");
        parent.id = "viewTblRow";
        var td1 = document.createElement('td');
        td1.innerHTML = key.setTitle;
        var td2 = document.createElement('td');
        td2.innerHTML = key.term;
        var td3 = document.createElement('td');
        td3.innerHTML = key.definition;
        var td4 = document.createElement('td');
        var button1 = document.createElement('button');
        button1.type = "button";
        button1.className = "btn btn-info btn-sm";
        button1.innerHTML = 'Edit';
        button1.addEventListener('click', function () {
            editSet(key);
        }, false);
        td4.appendChild(button1);
        var td5 = document.createElement('td');
        var button2 = document.createElement('button');
        button2.type = "button";
        button2.className = "btn btn-danger btn-sm";
        button2.innerHTML = '-';
        button1.addEventListener('click', function () {
            deleteItem(button1);
        }, false);
        td5.appendChild(button2);
        parent.appendChild(td1);
        parent.appendChild(td2);
        parent.appendChild(td3);
        parent.appendChild(td4);
        parent.appendChild(td5);
        var tableBody = document.getElementById("tableBody");
        tableBody.appendChild(parent);
    });
};

//Function to clear all cards from the DOM
var clearCards = function () {
    var deleteThese = document.getElementById("tableBody");
    while (deleteThese.firstChild) {
        deleteThese.removeChild(deleteThese.firstChild);
    }
};

//Called when the edit set button is clicked. Will pass the information of the setId from the card that was selected
var editSet = function (keyCard) {
    sessionStorage.setItem('editSet', keyCard.setId);
    location.href = "../editSet/editSet.html";
};

//Called to sort the sets on the sidebar by name
var compare = function (a, b) {
    return a.title.replace(/ /g, '').localeCompare(b.title.replace(/ /g, ''));
};

//After a set has been selected or unselected, the selectedCards needs to be updated
var filterCards = function (cardArr, setArr) {
    var filtered = [];

    //Iterate over cards and sets and save the cards that match the selected sets
    _.each(cardArr, function (keyCard) {
        _.each(setArr, function (keySet) {
            if (keyCard.setId === keySet.objectId) {
                filtered.push(keyCard);
            }
        })
    });
    selectedCards = filtered;

    //Selected cards now changed, so update the DOM
    populateCards();
};

//Called when the Delete All button is clicked. Will delete all selectedCards and selectedSets
var deleteAllFromParse = function () {

    var SetsObject = Parse.Object.extend('Sets');
    var CardsObject = Parse.Object.extend("Cards");

    //Create a new query for sets and cards
    var setsQuery = new Parse.Query(SetsObject);
    var cardsQuery = new Parse.Query(CardsObject);

    //Filter the query based on the selected sets and all cards that belong to that set
    cardsQuery.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: selectedSets[0].objectId
    });
    setsQuery.equalTo("objectId", selectedSets[0].objectId);

    _.each(selectedSets, function (aSet) {
        var tempSetsQuery = new Parse.Query(SetsObject);
        var tempCardsQuery = new Parse.Query(CardsObject);
        tempCardsQuery.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: aSet.objectId
        });
        cardsQuery = Parse.Query.or(cardsQuery, tempCardsQuery);

        tempSetsQuery.equalTo("objectId", aSet.objectId);
        setsQuery = Parse.Query.or(setsQuery, tempSetsQuery);
    });

    //First find all cards from the query
    cardsQuery.find({
            success: function (results) {

                //And delete the cards from the table
                Parse.Object.destroyAll(results);

                //Now find all sets from the query
                setsQuery.find({
                        success: function (results2) {

                            //Update selected sets by filtering out the sets that are about to be deleted
                            _.each(results2, function (aSet) {
                                selectedSets = _.filter(selectedSets, function (key) {
                                    if (key.objectId == aSet.id) return false;
                                    return true;
                                });
                            });

                            //Now delete the sets
                            Parse.Object.destroyAll(results2);

                            //Sets and cards cleared so clear the DOM for the cards
                            clearCards();

                            //And update the script with the new sets and cards belonging to the user
                            getSets();
                        },
                        error: function (error) {
                            alert('2' + error.message);
                            setsDFD.reject(data);
                        }
                    }
                );
            },
            error: function (error) {
                alert('1' + error.message);
                setsDFD.reject(data);
            }
        }
    );
};

//Takes a function and pushes its result to an array a defined amount of times.
var times = function (num, fun) {
    var results = [];
    for (var i = 0; i < num; i++) {
        results.push(fun())
    }
    return results;
};

//Call on load
getSets();