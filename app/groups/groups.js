var groups = [], groupsDetail = [], selectedGroups = [], selectedGroupDetail = [], currCard, wrongTimes = 0;

document.getElementById('flashCard').innerHTML = 'Choose a group';

//When enter is pressed, the speller will submit a request to test the answer
document.getElementById('answer').onkeypress = function (e) {
    var event = e || window.event;
    var charCode = event.which || event.keyCode;
    if (charCode == '13') {
        testAnswer();
        return false;
    }
};

//This will test the current answer entered. Gets called when enter is pressed
var testAnswer = function() {

    //If the entry is correct ...
    if (document.getElementById('answer').value == currCard.term) {

        //Mark the answer as correct
        document.getElementById('answer').className = 'col-xs-4 form-control speller-green';
        document.getElementById('flashCard').innerHTML = currCard.term + ' = ' + currCard.definition;

        //Reset with next card after delay
        _.delay(function () {
            document.getElementById('answer').className = 'col-xs-4 form-control speller-blue';
            selectedGroupDetail = _.shuffle(selectedGroupDetail);
            currCard = selectedGroupDetail[0];
            document.getElementById('answer').value = "";
            document.getElementById('definition').innerHTML = currCard.definition;
            document.getElementById('answer').value = "";
        }, 1000);
    }

    //If the entry is wrong
    else {
        wrongTimes++;
        document.getElementById('answer').className = 'col-xs-4 form-control speller-red';
        if (wrongTimes > 1) {
            document.getElementById('flashCard').innerHTML = "The answer is: " + currCard.term;
        }
        document.getElementById('answer').value = "";
    }
};

//Basic group object
var Group = function (length, objectId) {
    this.length = length;
    this.objectId = objectId;
};

//Basic group_detail object
var Group_Detail = function (groupId, term, definition, objectId) {
    this.groupId = groupId;
    this.term = term;
    this.definition = definition;
    this.objectId = objectId;
};

//This will call to parse to return the groups this user has created and save them in the groups array
var getGroups = function() {

    //Create the query
    var GroupsObject = Parse.Object.extend("Groups");
    var query = new Parse.Query(GroupsObject);

    //Filter the query by user
    query.equalTo("userId", Parse.User.current());

    //Execute the query
    query.find({
        success: function (results) {

            //If no groups were returned, then the user needs to go back to view sets and create them
            if (results.length <= 0) {
                alert("You need to create groups first.");
                location.href = "../viewSets/viewSets.html";
            }

            //Populate the groups array with the results of the query
            for (var i in results) {
                var aGroup = new Group(results.length, results[i].id);
                groups.push(aGroup);
            }

            //The group detail array can now be populated
            getGroupDetail();
        },
        error: function (error) {
            alert(error.message);
        }
    });
};

//This will call to parse to return the group_details and sve the in the groupsDetail array
var getGroupDetail = function() {

    //Create the query
    var GroupDetailObject = Parse.Object.extend("Group_Detail");
    var query = new Parse.Query(GroupDetailObject);

    //Initialize the query with the first group
    query.equalTo("groupId", {
        __type: "Pointer",
        className: "Groups",
        objectId: groups[0].objectId
    });

    //Append the rest of the groups to the query
    for (ss = 1; ss < groups.length; ss++) {
        var tempQuery = new Parse.Query(GroupDetailObject);
        tempQuery.equalTo("groupId", {
            __type: "Pointer",
            className: "Groups",
            objectId: groups[ss].objectId
        });
        query = Parse.Query.or(query, tempQuery);
    }

    //Execute the query
    query.find({
        success: function (results) {

            //Iterate through the results and populate the groupDetail array
            for (var i in results) {
                var aGroupDetail = new Group_Detail(results[i].get("groupId").id, results[i].get("term"), results[i].get("definition"), results.id);
                groupsDetail.push(aGroupDetail);
            }

            //The groups can now be added to the sidebar
            populateGroups();
        },
        error: function (error) {
            alert(error.message);
        }
    });
};

//This adds the groups to the sidebar
var populateGroups = function() {

    //Iterate through each of the groups
    for (var i = 0; i < groups.length; i++) {

        //Closure needed due to asynchronous call on the add event listener, which requires an instance specific value of i
        (function () {
            var j = i;
            var parent = document.getElementById("sidebar-wrapper");
            var input1 = document.createElement('input');
            input1.type = "checkbox";

            //Check when a checkbox is clicked
            input1.addEventListener('click', function () {

                //Execute setSelectedgroups which will take in a parameter of whether the checkbox is true and which group it belongs to
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
};

//Called when a checkbox is checked or unchecked
var setSelectedGroups = function(cb, group) {

    //If the checkbox is checked ...
    if (cb.checked) {

        //Add the group to selectedGroups
        selectedGroups.push(group);
    }

    //If the checkbox is unchecked
    else {

        //Remove the group from selectedGroups
        selectedGroups = selectedGroups.filter(function (key) {
            return !(key.objectId === group.objectId);
        });
    }

    //Call to set the selected group details based on the new group being selected or unselected
    filterGroupDetail();

    //Now that there are new group details, shuffle them for the speller
    selectedGroupDetail = _.shuffle(selectedGroupDetail);

    if (selectedGroupDetail.length > 0) {
        document.getElementById('flashCard').innerHTML = 'Good Luck!';
        currCard = selectedGroupDetail[0];
        console.log(selectedGroupDetail);
        document.getElementById("definition").innerHTML = currCard.definition;
    } else {
        document.getElementById("definition").innerHTML = "";
        document.getElementById('flashCard').value = 'Choose a group';
    }
};

//Called when a group is added or deleted from selectedGroups
var filterGroupDetail = function () {
    selectedGroupDetail = [];

    _.each(groupsDetail, function (g) {
        _.each(selectedGroups, function (s) {
            if (g.groupId === s.objectId) {
                selectedGroupDetail.push(g);
            }
        });
    });
};

//Get groups on load
getGroups();
