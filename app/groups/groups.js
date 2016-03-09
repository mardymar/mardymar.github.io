var groups = [];
var groupsDetail = [];
var selectedGroups = [];
var selectedGroupDetail = [];
var currCard;
var wrongTimes = 0;

document.getElementById('flashCard').innerHTML = 'Choose a group';
document.getElementById('answer').onkeypress = function (e) {
    var event = e || window.event;
    var charCode = event.which || event.keyCode;
    if (charCode == '13') {
        testAnswer();
        return false;
    }
};

getGroups();

function testAnswer() {
    if (document.getElementById('answer').value == currCard.term) {
        document.getElementById('answer').className = 'col-xs-4 form-control speller-green';
        document.getElementById('flashCard').innerHTML = currCard.term + ' = ' + currCard.definition;
        setTimeout(function () {
            document.getElementById('answer').className = 'col-xs-4 form-control speller-blue';
            currIndex = Math.floor(Math.random() * selectedGroupDetail.length);
            currCard = selectedGroupDetail[currIndex];
            document.getElementById('answer').value = "";
            document.getElementById('definition').innerHTML = currCard.definition;
            document.getElementById('answer').value = "";
        }, 1000);
    } else {
        wrongTimes++;
        document.getElementById('answer').className = 'col-xs-4 form-control speller-red';
        if (wrongTimes > 1) {
            document.getElementById('flashCard').innerHTML = "The answer is: " + currCard.term;
        }
        document.getElementById('answer').value = "";
    }
}

var Group = function (length, objectId) {
    this.length = length;
    this.objectId = objectId;
};

var Group_Detail = function (groupId, term, definition, objectId) {
    this.groupId = groupId;
    this.term = term;
    this.definition = definition;
    this.objectId = objectId;
};

function getGroups() {
    var GroupsObject = Parse.Object.extend("Groups");
    var query = new Parse.Query(GroupsObject);

    query.equalTo("userId", Parse.User.current());
    query.find({
        success: function (results) {
            if (results.length <= 0) {
                alert("You need to create groups first.")
                location.href = "../newSet/newSet.html";
            }
            for (var i in results) {
                var aGroup = new Group(results.length, results[i].id);
                groups.push(aGroup);
            }
            getGroupDetail();
        },
        error: function (error) {
            alert(error.message);
        }
    });
}

function getGroupDetail() {
    var GroupDetailObject = Parse.Object.extend("Group_Detail");
    var query = new Parse.Query(GroupDetailObject);


    query.equalTo("groupId", {
        __type: "Pointer",
        className: "Groups",
        objectId: groups[0].objectId
    });

    for (ss = 1; ss < groups.length; ss++) {
        var tempQuery = new Parse.Query(GroupDetailObject);
        tempQuery.equalTo("groupId", {
            __type: "Pointer",
            className: "Groups",
            objectId: groups[ss].objectId
        });
        query = Parse.Query.or(query, tempQuery);
    }

    query.find({
        success: function (results) {
            for (var i in results) {
                var aGroupDetail = new Group_Detail(results[i].get("groupId").id, results[i].get("term"), results[i].get("definition"), results.id);
                groupsDetail.push(aGroupDetail);
            }
            populateGroups();
        },
        error: function (error) {
            alert(error.message);
        }
    });
}

function setSelectedGroups(cb, group) {
    if (cb.checked) {
        selectedGroups.push(group);
    } else {
        selectedGroups = selectedGroups.filter(function (key) {
            return !(key.objectId == group.objectId);
        });
    }
    filterGroupDetail();
    selectedGroupDetail = shuffle(selectedGroupDetail);
    if (selectedGroupDetail.length > 0) {
        document.getElementById('flashCard').innerHTML = 'Good Luck!';
        currCard = selectedGroupDetail[0];
        document.getElementById("definition").innerHTML = currCard.definition;
    } else {
        document.getElementById("definition").innerHTML = "";
        document.getElementById('flashCard').value = 'Choose a group';
    }
}

function populateGroups() {
    for (var i = 0; i < groups.length; i++) {
        (function () {
            var j = i;
            var parent = document.getElementById("sidebar-wrapper");
            var input1 = document.createElement('input');
            input1.type = "checkbox";
            input1.addEventListener('click', function () {
                setSelectedGroups(this, groups[j]);
            }, false);
            var label2 = document.createElement('label');
            var iPlus1 = i + 1;
            label2.innerHTML = "Group " + iPlus1;
            var label1 = document.createElement('label');
            label1.id = 'mast';
            label1.className = 'list-group-item';
            label1.appendChild(input1);
            label1.appendChild(label2);
            parent.appendChild(label1);
        })()
    }
}

var filterGroupDetail = function () {
    selectedGroupDetail = [];

    groupsDetail.forEach(function (g) {
        selectedGroups.forEach(function (s) {
            if (g.groupId == s.objectId) {

                selectedGroupDetail.push(g);
            }
        });
    });
};

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

