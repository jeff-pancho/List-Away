$(document).ready(function () {
    // pointer to container holding the events
    const eventContainer = $("#event-container");
    // pointer to container create new event container
    const createEvent = $("#create-event-container");
    // pointer to create event button
    const createEventButton = $("#create-event-open");
    // pointer to "No Events" messgae
    const noEvents = $("#no-events");
    // pointer to create event modal
    const createEventModal = $("#example-modal");
    // pointer to the create event form
    const eventForm = $("#event-form");
    // pointer to the "Event name" form in the modal thing
    const eventNameForm = $("#event-name");
    // pointer to the "Event date" form in the modal thing
    const eventDateForm = $("#event-date");
    // pointer to the "Select priority" form in the modal thingamajig
    const selectPriority = $("#select-priority");
    // pointer to the "Event description" form in the modal thingabadingaling
    const eventDescriptionForm = $("#event-description")
    // pointer to "Save Changes" button in modal form
    const saveChanges = $("#save-changes");

    // number of events currently loaded
    let eventsCount = 0;

    // Array of event references
    let eventRefs = [];

    // Placeholder event
    const eventItem = $("#placeholder");

    //if user is authenticated
    firebase.auth().onAuthStateChanged(function (user) {
        //pointer to the user's events collection
        let events = db.collection("users").doc(user.uid).collection("events");

        //capture a snapshot of the events collection
        events.get().then(function (docs) {
            if (docs.size > 0) {
                hideNoEventsMessage();
                //execute a function for each child of the event collectin
                docs.forEach(function (child) {
                    let name = child.data().name;
                    let date = child.data().date;
                    let priority = child.data().priority;
                    let description = child.data().description;

                    eventRefs.push(child);

                    //append before #create-event-container
                    createNewEvent(name, date, priority, description);
                });
            }
        });
    });

    // When clicking the "Save Changes" button on the modal.
    $(saveChanges).click(function (e) {
        // validate form to ensure that there is an
        // event name and event date
        if (!$(eventNameForm).val() || !$(eventDateForm).val()) {
            e.preventDefault();
            e.stopPropagation();
            // Add the Bootstrap was-validated class to generate validation feedback
            $(eventForm)[0].classList.add('was-validated');
        } else {
            //save the values of the inputs
            let eventName = $(eventNameForm).val();
            let eventDate = $(eventDateForm).val();
            let eventPriority = $(selectPriority).val();
            let eventDescription = $(eventDescriptionForm).val();


            //save the information into the database
            firebase.auth().onAuthStateChanged(function (user) {
                db.collection("users").doc(user.uid).collection("events").add({
                    "name": eventName,
                    "date": eventDate,
                    "priority": eventPriority,
                    "description": eventDescription
                })
                .then(function (child) {
                    eventRefs.push(child);
                })
            });

            createNewEvent(eventName, eventDate, eventPriority, eventDescription);

            // make sure no events message is hidden if making first event
            hideNoEventsMessage();

            // Reset values of input forms
            // $(eventName).val("");
            // $(date_input).datepicker('update', '');
            // $(eventPriority).val("");
            // $(eventDescription).val("");
            $(eventForm)[0].reset();
            $(eventForm)[0].classList.remove('was-validated');
        }

    });

    /**
     * Create a new event.
     * It will first clone the hidden element to append to the list that stores
     * each event in the page.
     * @param {String} name of the event
     * @param {String} date of the event
     * @param {String} priority of the event
     * @param {String} description of the event
     */
    function createNewEvent(name, date, priority, description) {
        let clone = eventItem.clone().show()
        $(clone).find("#item-name").html(name);
        $(clone).find("#item-date").html(date);
        $(clone).find("#item-priority").html("<b>Priority: </b>" + priority);
        $(clone).find("#item-description").html("<b>Description: </b>" + description);
        $(clone).find(".down").hide();
        $(clone).removeAttr("id");
        $(clone).attr("id", "event-item-" + eventsCount);

        // set unique id for the collapsible
        $(clone).find(".collapse").attr("id", "collapse-" + eventsCount);
        // set target of the button to the unique collapsible id
        $(clone).find(".drop-down-btn").attr("href", "#collapse-" + eventsCount);
        // bind click event to button
        $(clone).find(".drop-down-btn").click(function () {
            // toggle between the up and down image of the dropdown button
            console.log("test")
            if ($(this).find(".up").is(":visible")) {
                $(this).find(".up").hide();
                $(this).find(".down").show();
            } else {
                $(this).find(".up").show();
                $(this).find(".down").hide();
            }
        });
        
        // delete event item
        $(clone).find(".delete-event").click(function () {
            var thisEvent = $(this).closest('li');
            var thisEventID = thisEvent.attr("id");
            var parseID = thisEventID.match(/(\d+)/);
            var index = parseID[0];
            console.log(eventRefs[index]);
            firebase.auth().onAuthStateChanged(function (user) {
                db.collection("users").doc(user.uid).collection("events")
                    .doc(eventRefs[index].id).delete().then(function () {
                        thisEvent.remove();
                        eventRefs.splice(index, 1, null);
                        var afterDelete = eventRefs.filter(doc => doc != null)
                        if (afterDelete.length == 0) {
                            showNoEventsMessage();
                        }
                    })
            })
        });

        $(clone).insertBefore(createEvent);

        eventsCount++;
    }

    // Hides the "No Events" message
    function hideNoEventsMessage() {
        if (noEvents.is(":visible")) {
            noEvents.hide();
        }
    }

    // Makes the "No Events" message visible if all events are deleted
    function showNoEventsMessage() {
        if (noEvents.is(":hidden")) {
            noEvents.show();
        }
    }

    // Datepicker setup
    var date_input = $('input[name="date"]'); //our date input has the name "date"
    // var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
    var options = {
        format: 'mm/dd/yyyy',
        // container: container,
        todayHighlight: true,
        autoclose: true,
        toggleActive: true,
        defaultViewDate: {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            day: new Date().getDate()
        }
    };
    date_input.datepicker(options);

});