//viewSetsModule.controller('viewSetsController', ['$scope', '$q', function ($scope, $q) {

var sets = [];
var cards = [];
var selectedCards = [];
var selectedSets = [];

getSets();

var Set = function (title, objectId) {
    this.title = title;
    this.objectId = objectId;
};

var Card = function (term, definition, setId, objectId) {

    this.term = term;
    this.definition = definition;
    this.setTitle = setId.get('title');
    this.setId = setId.id;
    this.objectId = objectId;
};

function deleteGroups() {
    var Groups = Parse.Object.extend("Groups");
    var groupsQuery = new Parse.Query(Groups);

    groupsQuery.equalTo("userId", Parse.User.current());

    groupsQuery.find({
        success: function (results1) {
            Parse.Object.destroyAll(results1, {
                success: function (success) {
                    var GroupDetail = Parse.Object.extend("Group_Detail");
                    var groupDetailQuery = new Parse.Query(GroupDetail);
                    groupDetailQuery.equalTo("userId", Parse.User.current());
                    groupDetailQuery.find({
                        success: function (results2) {
                            Parse.Object.destroyAll(results2, {
                                success: function (success) {
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
}

function createGroups() {
    var shuffledCards = shuffle(cards);
    var groupDetailArr = [];
    var groupsOf = 5;
    var groupsQuant = Math.floor((shuffledCards.length - 1) / groupsOf + 1);
    var groupsArr = [];

    var GroupDetail = Parse.Object.extend("Group_Detail");
    var Groups = Parse.Object.extend("Groups");

    for (var i = 0; i < groupsQuant; i++) {
        var gs = new Groups();
        gs.set("userId", Parse.User.current());
        groupsArr.push(gs);
    }

    Parse.Object.saveAll(groupsArr, {
        success: function (gA) {
            for (var g in gA) {
                var end = groupsOf * g + groupsOf;
                while (end > shuffledCards.length) {
                    end--;
                }
                for (var i = groupsOf * g; i < end; i++) {
                    var gd = new GroupDetail();
                    gd.set("groupId", gA[g]);
                    gd.set("userId", Parse.User.current());
                    gd.set("term", shuffledCards[i].term);
                    gd.set("definition", shuffledCards[i].definition);
                    groupDetailArr.push(gd);
                }
            }
            Parse.Object.saveAll(groupDetailArr, {
                success: function (gda) {
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
}

function getSets() {

    sets = [];
    cards = [];
    selectedCards = [];
    selectedSets = [];

    var setsArr = [];
    var SetsObject = Parse.Object.extend("Sets");
    var query = new Parse.Query(SetsObject);
    query.equalTo("userID", Parse.User.current());
    query.find({
        success: function (results) {
            results.forEach(function(i){
                var aSet = new Set(i.get("title"), i.id);
                setsArr.push(aSet);
            })
            setsArr.sort(compare);
            sets = setsArr;
            getCards();
        },
        error: function (error) {
            alert(error.message)
        }
    });
}

function clearCards(){
    var deleteThese = document.getElementById("tableBody");4

    while (deleteThese.firstChild) {
        deleteThese.removeChild(deleteThese.firstChild);
    }
}

function setSelectedSets(cb, set){

    if(cb.checked){
        selectedSets.push(set);
    } else {
        selectedSets.remove(set);
    }
    filterCards(cards, selectedSets);
}

function editSet(keyCard){
    sessionStorage.setItem('editSet', keyCard.setId);
    location.href = "../editSet/editSet.html";
}

function populateCards(){
    clearCards();

    selectedCards.forEach(function(key){

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
        button1.addEventListener('click', function() {
            editSet(key);
        }, false);
        td4.appendChild(button1);
        var td5 = document.createElement('td');
        var button2 = document.createElement('button');
        button2.type = "button";
        button2.className = "btn btn-danger btn-sm";
        button2.innerHTML = '-';
        button1.addEventListener('click', function() {
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
}

function populateSets(){
    var deleteThese = document.getElementById("sidebar-wrapper");4

    while (deleteThese.firstChild) {
        deleteThese.removeChild(deleteThese.firstChild);
    }

    sets.forEach(function(key){
        var parent = document.getElementById("sidebar-wrapper");
        var input1 = document.createElement('input');
        input1.type="checkbox";
        input1.addEventListener('click', function() {
            setSelectedSets(this, key);
        }, false);
        var label2=document.createElement('label');
        label2.innerHTML= key.title;
        var label1 = document.createElement('label');
        label1.id='mast';
        label1.className='list-group-item';
        label1.appendChild(input1);
        label1.appendChild(label2);
        parent.appendChild(label1);
    });

    populateCards();
}

function compare(a, b) {
    return a.title.replace(/ /g, '').localeCompare(b.title.replace(/ /g, ''));
}

function getCards() {
    var cardsArr = [];
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    query.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sets[0].objectId
    });

    for (ss = 1; ss < sets.length; ss++) {
        var tempQuery = new Parse.Query(CardsObject);
        tempQuery.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: sets[ss].objectId
        });
        query = Parse.Query.or(query, tempQuery);
    }

    query.find({
        success: function (results) {
            results.forEach(function(i){
                var aCard = new Card(i.get("term"), i.get("definition"), i.get("setsID"), i.id);
                cardsArr.push(aCard);
            });
            cards = cardsArr;
            populateSets();
        },
        error: function (error) {
            alert(error.message);
        }
    });
}

var filterCards = function (cardArr, setArr) {
    var filtered = [];
    cardArr.forEach(function(keyCard){
        setArr.forEach(function(keySet){
            if (keyCard.setId === keySet.objectId) {
                filtered.push(keyCard);
            }
        })
    })
    selectedCards = filtered;
    populateCards();
};

function deleteAllFromParse() {

    var SetsObject = Parse.Object.extend('Sets');
    var CardsObject = Parse.Object.extend("Cards");

    var setsQuery = new Parse.Query(SetsObject);
    var cardsQuery = new Parse.Query(CardsObject);

    cardsQuery.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: selectedSets[0].objectId
    });
    setsQuery.equalTo("objectId", selectedSets[0].objectId);

    for (var ss = 1; ss < selectedSets.length; ss++) {
        var tempSetsQuery = new Parse.Query(SetsObject);
        var tempCardsQuery = new Parse.Query(CardsObject);
        tempCardsQuery.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: selectedSets[ss].objectId
        });
        cardsQuery = Parse.Query.or(cardsQuery, tempCardsQuery);

        tempSetsQuery.equalTo("objectId", selectedSets[ss].objectId);
        setsQuery = Parse.Query.or(setsQuery, tempSetsQuery);
    }

    cardsQuery.find({
            success: function (results) {
                Parse.Object.destroyAll(results);
                setsQuery.find({
                        success: function (results2) {
                            for(r in results2){
                                selectedSets.filter(function(key){
                                    if(key.objectId == results2[r].id) return false;
                                    return true;

                                });
                            }
                            Parse.Object.destroyAll(results2);
                            clearCards();
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
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};