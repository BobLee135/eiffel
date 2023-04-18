'use strict';
import {Meteor} from "meteor/meteor";

import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {validateEventFilterChain, getNestedObjValue} from "../eventFilter/methods";
import {EventSequences} from "./event-sequences";
import {getProperty, setProperty} from "../properties/methods";
import {
    getActivityEventName, getConfidenceLevelEventName,
    getRedirectName, getTestCaseEventName, getTestSuiteEventName,
    isActivityEvent,
    isAnnouncementPublishedEvent,
    isArtifactCreatedEvent,
    isArtifactPublishedEvent,
    isArtifactReusedEvent,
    isCompositionDefinedEvent,
    isConfidenceLevelEvent,
    isConfigurationAppliedEvent,
    isEnvironmentDefinedEvent,
    isFlowContextDefinedEvent,
    isIssueVerifiedEvent,
    isSourceChangeCreatedEvent,
    isSourceChangeSubmittedEvent,
    isTestCaseEvent,
    isTestEvent,
    isTestSuiteEvent,
} from "../events/event-types";
import {EiffelEvents} from "../eiffelevents/eiffelevents";

function getEventSequenceVersion() {
    return '2.0';
}
function getEventSequenceVersionPropertyName() {
    return 'eventSequences.version';
}
function getEventSequenceStartTimePropertyName() {
    return 'eventSequences.time.started';
}

function getEventSequenceFinishTimePropertyName() {
    return 'eventSequences.time.finished';
}

function setEventVersionProperty() {
    setProperty.call({propertyName: getEventSequenceVersionPropertyName(), propertyValue: getEventSequenceVersion()})
}

function invalidateEventVersionProperty() {
    setProperty.call({propertyName: getEventSequenceVersionPropertyName(), propertyValue: undefined})
}

export const eventSequenceVersion = new ValidatedMethod({
    name: 'eventSequenceVersion',
    validate: null,
    run(){
        return getEventSequenceVersion();
    }
});

export const eventSequenceVersionPropertyName = new ValidatedMethod({
    name: 'eventSequenceVersionPropertyName',
    validate: null,
    run(){
        return getEventSequenceVersionPropertyName();
    }
});

export const getTimeSpan = new ValidatedMethod({
    name: 'getTimeSpan',
    validate: null,
    run(){
        return {
            started: getProperty.call({propertyName: getEventSequenceStartTimePropertyName()}),
            finished: getProperty.call({propertyName: getEventSequenceFinishTimePropertyName()})
        };
    }
});

export const populateEventSequences = new ValidatedMethod({
    name: 'populateEventSequences',
    validate: null,
    run(){
        console.log("Removing old events-sequences collection for testing.");
        invalidateEventVersionProperty();
        EventSequences.remove({});

        let total = Events.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' events from database. Please wait.');
        let events = Events.find().fetch();

        console.log('Processing events from database. Please wait.');

        let legalTypes = [
            'CAUSE',
            'CONTEXT',
            'FLOW_CONTEXT',
            'ACTIVITY_EXECUTION',
            'PREVIOUS_ACTIVITY_EXECUTION',
            'PREVIOUS_VERSION', //RangeError: Maximum call stack size exceeded
            'COMPOSITION',
            // 'ENVIRONMENT', MongoError: document is larger than the maximum size 16777216
            'ARTIFACT',
            'SUBJECT',
            // 'ELEMENT' MongoError: document is larger than the maximum size 16777216
            // 'BASE', // RangeError: Maximum call stack size exceeded
            'CHANGE',
            'TEST_SUITE_EXECUTION',
            'TEST_CASE_EXECUTION',
            'IUT',
            'TERC',
            'MODIFIED_ANNOUNCEMENT',
            'SUB_CONFIDENCE_LEVEL',
            'REUSED_ARTIFACT',
            'VERIFICATION_BASIS',
        ];

        let dangerousTypes = [
            'ELEMENT',
            'ENVIRONMENT',
            'BASE'
        ];

        // Populate map
        let eventMap = {};
        _.each(events, (event) => {
            // console.log("The events are: " + events)
            // Filtering links that would make us jump between sequences.
            if (event.type !== getRedirectName()) {
                event.targets = _.pluck(_.filter(event.links, function (link) {
                    return _.contains(legalTypes, link.type);
                }), 'target');
                event.dangerousTargets = _.pluck(_.filter(event.links, function (link) {
                    return _.contains(dangerousTypes, link.type);
                }), 'target');
                event.targetedBy = [];
                event.dangerousTargetedBy = [];
                event.dev.checked = false;
            } else {
                total--;
            }
            // console.log("The events collection is "+event.type);
            eventMap[event.id] = event;
        });

        // Find targetedBy
        _.each(events, (event) => {
            console.log(event);
            if (event.type !== getRedirectName()) {
                //console.log("The event type is: " + event.type + " and the ID is: " + event.id)
                //console.log("The Eventmap is: " + JSON.stringify(eventMap))
                _.each(event.targets, (target, index) => {
                    if (eventMap[target] !== undefined) {
                        if (eventMap[target].type === getRedirectName()) {
                            eventMap[event.id].targets[index] = eventMap[target].target;
                            target = eventMap[target].target;
                        }
                        let exists = _.find(eventMap[target].targetedBy, function (id) {
                            return id === event.id;
                        });
                        if (!exists) {
                            (eventMap[target].targetedBy).push(event.id)
                        }
                    }
                    // eventMap[event.id] = event; // This line will basically reset the whole event, losing previously defined targetedBy.
                });

                _.each(event.dangerousTargets, (target, index) => {
                    // console.log(JSON.stringify(eventMap[target]));
                    if (eventMap[target].type === getRedirectName()) {
                        eventMap[event.id].dangerousTargets[index] = eventMap[target].target;
                        target = eventMap[target].target;
                    }
                    let exists = _.find(eventMap[target].dangerousTargetedBy, function (id) {
                        return id === event.id;
                    });
                    if (!exists) {
                        (eventMap[target].dangerousTargetedBy).push(event.id)
                    }
                    // eventMap[event.id] = event; // This line will basically reset the whole event, losing previously defined dangerousTargetedBy.
                });
            }

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 50)) {
                console.log("Finding event parents progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        function getAllLinked(eventId, sequenceId) {
            // if(eventMap[eventId].dev.stop === true){
            //     let linkedEvents = [];
            //     linkedEvents.push(eventId);
            //     return linkedEvents;
            // }
            if (eventMap[eventId] !== undefined) {
                if (eventMap[eventId].dev.checked === true ||
                    eventMap[eventId].type === getRedirectName()) {
                    return [];
                }
                eventMap[eventId].dev.checked = true;
                eventMap[eventId].sequenceId = sequenceId;

                let linkedEvents = [];
                linkedEvents.push(eventId);
                let targets = eventMap[eventId].targets;
                // if (targets) {
                    for (let index = 0; index < targets.length; index++) {
                        linkedEvents = linkedEvents.concat(getAllLinked(targets[index], sequenceId));
                    }
                // }

                let targetedBys = eventMap[eventId].targetedBy;
                // if (targetedBys) {
                    for (let index = 0; index < targetedBys.length; index++) {
                        linkedEvents = linkedEvents.concat(getAllLinked(targetedBys[index], sequenceId));
                    }
                // }

                return linkedEvents;
            }
        }

        let sequencesIds = _.sortBy(_.reduce(events, function (memo, event) {
            let sequence = [];
            if (event.type !== getRedirectName()) {
                sequence = getAllLinked(event.id, memo.length);
            }
            if (sequence.length > 0) { // 10
                memo.push(sequence);
            }
            return memo;
        }, []), 'time.finished').reverse();


        console.log("Generating sequences.");
        let sequences = [];
        _.each(sequencesIds, (sequence) => {

            let timeStart = undefined;
            let timeFinish = undefined;

            let sequenceEvents = _.reduce(sequence, function (memo, eventId) {
                let event = eventMap[eventId];
                if (event !== undefined){
                if (timeStart === undefined || event.time.started < timeStart) {
                    timeStart = event.time.started;
                }
                if (timeFinish === undefined || event.time.finished > timeFinish) {
                    timeFinish = event.time.finished;
                }

            // console.log("The Event is: " + event)
                memo.push(event);}
                return memo;
            }, []);


            sequences.push({
                id: sequenceEvents[0].sequenceId,
                time: {
                    started: timeStart,
                    finished: timeFinish,
                    diff: timeFinish - timeStart
                },
                size: sequenceEvents.length,
                dev: {},
                events: sequenceEvents,
            });
        });

        done = 0;
        lastPrint = ((done / total) * 100);

        _.each(sequences, (sequence) => {
            let connections = [];
            _.each(sequence.events, (event) => {
                _.each(event.dangerousTargets.concat(event.dangerousTargetedBy), (target) => {
                    connections.push(eventMap[target].sequenceId);
                });

                done++;
                let print = Math.floor((done / total) * 100);
                if (print >= (lastPrint + 50)) {
                    console.log("Fining sequences connections: " + print + '% (' + done + '/' + total + ')');
                    lastPrint = print;
                }
            });
            sequence.connections = connections;
        });

        let latestTime = undefined;
        let earliestTime = undefined;

        done = 0;
        lastPrint = ((done / total) * 100);
        _.each(sequences, (sequence) => {
            if (latestTime === undefined || latestTime < sequence.time.finished) {
                latestTime = sequence.time.finished;
            }
            if (earliestTime === undefined || earliestTime > sequence.time.started) {
                earliestTime = sequence.time.started;
            }

            // Calculate confidence for TestSuites.
            _.each(sequence.events, (evt) => {
               if (isTestSuiteEvent(evt.type)) {
                   const tests = sequence.events.filter((obj) => {
                       return isTestCaseEvent(obj.type) && obj.targets.find((id) => {
                            return id === evt.startEvent || id === evt.id;
                       });
                   });
                   let totalTests = 0;
                   let passedTests= 0;
                   _.each(tests, (test) => {
                       ++totalTests;
                       if (test.data.outcome.verdict === 'PASSED') {
                           ++passedTests;
                       }
                   });
                   evt.confidence = Math.round((totalTests > 0) ? (passedTests / totalTests) * 100 : 0);
               }
            });

            //EventSequences._collection.insert(sequence);
            EventSequences.insert(sequence);
            //  console.log("the final sequecne is "+ sequence.events.type);
            done = done + sequence.events.length;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating event-sequence collection progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        setProperty.call({propertyName: getEventSequenceStartTimePropertyName(), propertyValue: earliestTime});
        setProperty.call({propertyName: getEventSequenceFinishTimePropertyName(), propertyValue: latestTime});

        setEventVersionProperty();
        let print = Math.floor((done / total) * 100);
        console.log("Event-sequence collection populated. [" + print + "%] (" + done + "/" + total + ")");

    }
});

/**
 * Function filtering the event sequences (bounding the eventFilter and eventSequences).
 *
 * This function will filter through the event in each sequence to detect and (or) handle
 * these detections by using the filter.eventClash option.
 *
 * Arrays of values are distinguished from the pathIncludesArray value from the evenFilter
 * object returned from the collection. Path that are declared as arrays will be checked if
 * the filter.value is present, if not display the error and modify the sequence accordingly.
 * Otherwise, the value must match or else the same error and modification will be made.
 *
 * Note: The eventSequences parameter will be modified by this function and a deep copy will
 * result in unnecessary complex computation since this object is heavily nested.
 *
 * @param eventSequences    object containing the event sequences
 * @param filter            filter object
 * @return                  object with status, data, warn and conflict (if warn is present)
 */
function filterEventSequences(eventSequences, filter){
    let conflicts = {
        initial: filter.value,
        values: [],
        ids: [],
        sequences: []
    };
    if (filter.chain && filter.chain.length > 0) {
        let detectedEventWithDiffValue = false;
        let keepSequences = [];
        let eventName = filter.chain[0];

        if (filter.chain.length > 1 && filter.value) {

            let validate = validateEventFilterChain.call({filter: filter.chain});
            if (!validate.status) {
                return {status: false, data: eventSequences, detectedEventWithDiffValue: false, conflicts: conflicts};
            }
            let location = validate.data.filterBy;

            _.each(eventSequences, (sequence) => {
                let events = [];
                let removeSequence = false;
                let filterValue = filter.value;
                for (let i = 0; i < sequence.events.length; ++i) {
                    let removeEvent = false;
                    if (sequence.events[i].name === eventName) {
                        const valuesAtPath = getNestedObjValue.call({ obj: sequence.events[i], path: location });
                        if (validate.data.pathIncludesArray) {
                            if (!valuesAtPath.includes(filterValue)) {
                                detectedEventWithDiffValue = true;
                                conflicts.ids.push(sequence.events[i].id);
                                conflicts.sequences.push(sequence.id)
                                switch (filter.eventClash) {
                                    case "include":
                                        conflicts.pathIncludesArray = true;
                                        conflicts.values.push(valuesAtPath);
                                        break;
                                    case "exclude":
                                        removeEvent = true;
                                        break;
                                    case "discard":
                                        removeSequence = true;
                                        break;
                                }
                            }
                        } else {
                            valuesAtPath.forEach((value => {
                                if (value && (value !== filterValue)) {
                                    detectedEventWithDiffValue = true;
                                    conflicts.sequences.push(sequence.id)
                                    conflicts.ids.push(sequence.events[i].id);
                                    switch (filter.eventClash) {
                                        case "include":
                                            conflicts.values.push(value);
                                            break;
                                        case "exclude":
                                            removeEvent = true;
                                            break;
                                        case "discard":
                                            removeSequence = true;
                                            break;
                                    }
                                }
                            }));
                        }
                    }

                    if (!removeEvent) {
                        events.push(sequence.events[i]);
                    }
                }

                sequence.events = events;

                if (!removeSequence) {
                    keepSequences.push(sequence);
                }
            });
            conflicts.values = _.uniq(_.flatten(conflicts.values));
            conflicts.ids = _.uniq(_.flatten(conflicts.ids));
            conflicts.sequences = _.uniq(_.flatten(conflicts.sequences));
            return {status: true, data: keepSequences, detectedEventWithDiffValue: detectedEventWithDiffValue, conflicts: conflicts};
        }
    }

    return {status: false, data: eventSequences, detectedEventWithDiffValue: false, conflicts: conflicts};
}


export const getAggregatedGraph = new ValidatedMethod({
    name: 'getAggregatedGraph',
    validate: null,
    run({from, to, limit, filter}) {
        if (Meteor.isServer) {
            console.log("now aggregating");
            // Below values will fetch events between 2015 and 2018
            // from: 1420070400000 2015
            // to: 1514764800000 2018

            if (limit === 0) {
                return {nodes: [], edges: [], sequences: []};
            }
            // until here the EventSequences are complete events

            // filter is an array. ex ["ArtP", "Release", "Category"]
            let query = {};
            let eventFilter = {};
            console.log("filter", filter);
            if (filter.chain && filter.chain.length > 0) {
                eventFilter["name"] = filter.chain[0];
                if (filter.chain.length > 1 && filter.value) {
                    let validate = validateEventFilterChain.call({filter: filter.chain});
                    if (!validate.status) {
                        throw new Meteor.Error(500, 'Error 500: Not found', validate.msg);
                    }
                    console.log("validateEventFilter data:", validate.data);
                    eventFilter[validate.data.filterBy] = filter.value;
                }
            }

            //query["time.started"] = {$gte: parseInt(from), $lte: parseInt(to)};
            query["events"] = {$elemMatch: eventFilter};

            // Fetch the data.
            let eventSequences = EventSequences.find(
                query,
                {sort: {"time.finished": -1}, limit: limit})
                .fetch();

            console.log("eventSequences pipeline", JSON.stringify([
                { $match: query },
                { $sort: { "time.finished": -1 } },
                { $limit: limit }
            ]));
            console.log("eventSequences size", eventSequences.length);

            // Additional filtering applied here to circumvent the issue with event that (maybe) should be discarded.
            let filterData = filterEventSequences(eventSequences, filter);
            eventSequences = filterData.data;

            if (eventSequences.length === 0) {
                console.log("Empty return");
                return {nodes: [], edges: [], sequences: [], detectedEventWithDiffValue: !filter.detectedEventWithDiffValue};
            }

        //    console.log(JSON.stringify(eventSequences));

            let linkedSequences = {};
            _.each(eventSequences, (eventSequence) => {
                linkedSequences[eventSequence.id] = false;
            });

            _.each(eventSequences, (eventSequence) => {
                _.each(eventSequence.connections, (targetId) => {
                    if (linkedSequences[targetId] === undefined) {
                        linkedSequences[targetId] = EventSequences.findOne({id: targetId}, {})
                    }
                });
            });

            _.each(linkedSequences, (linkedSequence) => {
                if (linkedSequence !== false) {
                    eventSequences.push(linkedSequence);
                }
            });

            let sequencesIds = [];


            let events = _.reduce(eventSequences, function (memo, sequence) {
                sequencesIds.push(sequence.id);
                return memo.concat(sequence.events);
            }, []);
        //    console.log(JSON.stringify(events));

            // Maps individual event node id's to their aggregated node's id and vice versa
            let eventToGroup = {};

            let nodes = [];
            _.each(events, (event) => {
                
                let label = event.name;
                if (event.data.customData !== undefined) {
                    var customData = event.data.customData[0]["value"]
                    label = customData.type;
                    console.log("NEW LABEL MY MAN : " + label + JSON.stringify(customData));
                }
                
                let node = {
                    data: {
                        label: label,
                        id: event.id,
                        event: event,
                        customData: event.data.customData,

                        // This code is only run if there are events
                        // so it is assumed that the first element exists.
                        // The aggregated type is also the same type as every
                        // aggregated event.
                        type: event.type
                    }
                };


                if (isActivityEvent(node.data.type)) {
                    console.log("isActivityEvent - IF");
                    // ActC do not have event.data.outcome, set it to empty string if not.
                    let valueCount = _.countBy(events, (event) => {
                        return (event.data.outcome) ? event.data.outcome.conclusion : "";
                    });
                    node.data.successful = valueCount.hasOwnProperty('SUCCESSFUL') ? valueCount['SUCCESSFUL'] : 0;
                    node.data.unsuccessful = valueCount.hasOwnProperty('UNSUCCESSFUL') ? valueCount['UNSUCCESSFUL'] : 0;
                    node.data.failed = valueCount.hasOwnProperty('FAILED') ? valueCount['FAILED'] : 0;
                    node.data.aborted = valueCount.hasOwnProperty('ABORTED') ? valueCount['ABORTED'] : 0;
                    node.data.timedOut = valueCount.hasOwnProperty('TIMED_OUT') ? valueCount['TIMED_OUT'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                    let totalQueueTime = _.reduce(events, (memo, event) => {
                        // console.log("The actTriggered time is: " + event.time.triggered)
                        return memo + (event.time.started - event.time.triggered);
                    }, 0);
                    let totalRunTime = _.reduce(events, (memo, event) => {
                        return memo + (event.time.finished - event.time.started);
                    }, 0);
                    node.data.avgQueueTime = totalQueueTime / node.data.length;
                    node.data.avgRunTime = totalRunTime / node.data.length;
                }
                else if (isAnnouncementPublishedEvent(node.data.type)) {
                    console.log("isAnnouncementPublishedEvent - IF");
                    let valueCount = _.countBy(events, (event) => event.data.severity);
                    node.data.minor = valueCount.hasOwnProperty('MINOR') ? valueCount['MINOR'] : 0;
                    node.data.major = valueCount.hasOwnProperty('MAJOR') ? valueCount['MAJOR'] : 0;
                    node.data.critical = valueCount.hasOwnProperty('CRITICAL') ? valueCount['CRITICAL'] : 0;
                    node.data.blocker = valueCount.hasOwnProperty('BLOCKER') ? valueCount['BLOCKER'] : 0;
                    node.data.closed = valueCount.hasOwnProperty('CLOSED') ? valueCount['CLOSED'] : 0;
                    node.data.canceled = valueCount.hasOwnProperty('CANCELED') ? valueCount['CANCELED'] : 0;
                }
                else if (isConfidenceLevelEvent(node.data.type)) {
                    console.log("isConfidenceLevelEvent - IF");
                    let valueCount = _.countBy(events, (event) => event.data.value);
                    node.data.passed = valueCount.hasOwnProperty('SUCCESS') ? valueCount['SUCCESS'] : 0;
                    node.data.failed = valueCount.hasOwnProperty('FAILURE') ? valueCount['FAILURE'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                    node.data.name = events[0].data.name;
                }
                else if (isIssueVerifiedEvent(node.data.type)) {
                     console.log("isIssueVerifiedEvent - IF");
                    let typeCount = _.countBy(events, (event) => event.data.issues.type);
                    node.data.bug = typeCount.hasOwnProperty('BUG') ? typeCount['BUG'] : 0;
                    node.data.improvement = typeCount.hasOwnProperty('IMPROVEMENT') ? typeCount['IMPROVEMENT'] : 0;
                    node.data.feature = typeCount.hasOwnProperty('FEATURE') ? typeCount['FEATURE'] : 0;
                    node.data.workItem = typeCount.hasOwnProperty('WORK_ITEM') ? typeCount['WORK_ITEM'] : 0;
                    node.data.requirement = typeCount.hasOwnProperty('REQUIREMENT') ? typeCount['REQUIREMENT'] : 0;
                    node.data.other = typeCount.hasOwnProperty('OTHER') ? typeCount['OTHER'] : 0;

                    let valueCount = _.countBy(events, (event) => event.data.issues.value);
                    node.data.success = valueCount.hasOwnProperty('SUCCESS') ? valueCount['SUCCESS'] : 0;
                    node.data.failure = valueCount.hasOwnProperty('FAILURE') ? valueCount['FAILURE'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                }
                else if (isTestEvent(node.data.type)) {
                     console.log("isTestEvent - IF");
                    let valueCount = _.countBy(events, (event) => event.data.outcome.verdict);
                    let passedCount = valueCount.hasOwnProperty('PASSED') ? valueCount['PASSED'] : 0;
                    let failedCount = valueCount.hasOwnProperty('FAILED') ? valueCount['FAILED'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                    node.data.passed = passedCount;
                    node.data.failed = failedCount;

                    // Need change here - Add avg queue time
                    let totalQueueTime = _.reduce(events, (memo, event) => {
                        // console.log("The actTriggered time is: " + event.time.triggered)
                        return memo + (event.time.started - event.time.triggered);
                    }, 0);
                    let totalRunTime = _.reduce(events, (memo, event) => {
                        // console.log("The triggered time is: " + event.time.triggered + " " + event.type)
                        // console.log("The triggered id is: " + event.id)
                        return memo + (event.time.finished - event.time.started);
                    }, 0);
                    node.data.avgQueueTime = totalQueueTime / node.data.length;
                    node.data.avgRunTime = totalRunTime / node.data.length;
                }
                console.log("AAAAAAAAAAAAAAAAAA : " + JSON.stringify(node));
                nodes.push(node);
                eventToGroup[event.id] = event.id;
            });

            // Construct edges between groups
            let edgesMap = {};

            let edges = [];
            _.each(events, (event) => {
                let source = event.id;
                _.each(event.targets.concat(event.dangerousTargets), (targetId) => {
                    let target = eventToGroup[targetId];
                    let linkType = "";
                    if (event.data.customData !== undefined) {
                        linkType = event.data.customData[0]["value"].linkType;
                    }
                    if (source !== undefined && target !== undefined && linkType !== undefined) {
                        edges.push({
                            data: {
                                source: source,
                                target: target,
                                linkType: linkType,
                            }
                        })
                    } else if (source !== undefined && target !== undefined) {
                        edges.push({
                            data: {
                                source: source,
                                target: target,
                            }
                        })
                    }
                });
            });

            console.log(edges);

            return {nodes: nodes, edges: edges, sequences: sequencesIds, detectedEventWithDiffValue: filterData.detectedEventWithDiffValue, conflicts: filterData.conflicts};
        }
    }
});

export const getEventChainGraph = new ValidatedMethod({
    name: 'getEventChainGraph',
    validate: null,
    run({sequenceId, eventId}) {
        if (sequenceId === undefined) {
            return undefined;
        }
        if (Meteor.isServer) {
            console.log("now chaining graph, sequenceID:", sequenceId);
            let sequence = EventSequences.findOne({id: sequenceId}, {});

            let linkedSequences = {};
            linkedSequences[sequence.id] = false;

            _.each(sequence.connections, (targetId) => {
                if (linkedSequences[targetId] === undefined) {
                    // console.log(targetId);
                    linkedSequences[targetId] = EventSequences.findOne({id: targetId}, {})
                }
            });

            let events = sequence.events;

            let ignored = [];

            _.each(linkedSequences, (eventSequence) => {
                if (eventSequence !== false) {
                    events = events.concat(eventSequence.events);
                }
            });

            let eventsMap = {};
            _.each(events, (event) => {
                eventsMap[event.id] = true;
            });

            let nodes = [];
            let edges = [];

            _.each(events, (event) => {
                let extra = 'null';
                if (eventId === event.id) {
                    extra = 'highlight'
                }
                let node = {
                    data: {
                        label: event.name,
                        id: event.id,
                        version: event.version,
                        events: [event],
                        length: 1,
                        type: event.type,
                        eventData: event.data,
                        extra: extra
                    }
                };
                
                if (isActivityEvent(node.data.type)) {
                    // ActC do not have event.data.outcome, check that first.
                    if (event.data.outcome && event.data.outcome.conclusion === 'SUCCESSFUL') {
                        node.data.successful = 1;
                    } else {
                        node.data.successful = 0;
                    }

                    // Required Eiffel data
                    node.data.timeTriggered = event.time.triggered;
                    node.data.timeStarted = event.time.started;
                    node.data.timeFinished = event.time.finished;

                    // ActC do not have event.data.outcome, set it to "No data" if not.
                    node.data.conclusion = (event.data.outcome) ? event.data.outcome.conclusion : "No data";
                    node.version = event.version;

                    // Non-required Eiffel data
                    // console.log("The event data is: " + event.data.triggers)
                    if (event.data.triggers !== undefined) {
                        node.data.triggers = event.data.triggers;
                        node.data.triggersLength = _.reduce(node.data.triggers, function (memo) {
                            return memo + 1;
                        }, 0);
                    } else {
                        node.data.triggers = 0;
                    }

                    if (event.data.executionType !== undefined) {
                        node.data.executionType = event.data.executionType;
                    } else {
                        node.data.executionType = "No data";
                    }
                }
                else if (isAnnouncementPublishedEvent(node.data.type)) {
                    node.data.heading = event.data.heading;
                    node.data.severity = event.data.severity;
                    node.data.body = event.data.body;
                    node.version = event.version;
                }
                else if (isArtifactCreatedEvent(node.data.type)) {

                    // console.log("The GAV is: ", event.data.gav)
                    if (event.data.gav !== undefined) {

                        node.data.gav_groupId = event.data.gav.groupId;
                        node.data.gav_artifactId = event.data.gav.artifactId;
                        node.data.gav_version = event.data.gav.version;
                        node.version = event.version;

                        if (event.data.name !== undefined) {
                            node.data.name = event.data.name;
                        } else {
                            node.data.name = "No data";
                        }
                    } else {

                        node.id = event.id;
                        node.version = event.version;
                        // console.log("The eventSource is: " + JSON.stringify(event))
                        if (event.source !== null) {
                            if (event.source.name !== undefined || event.data.identity !== undefined) {
                                node.data.identity = event.data.identity;
                                node.data.name = event.source.name;
                            }
                        } else {
                            node.data.name = "No data";
                            node.data.identity = "No data"
                        }

                    }

                }
                else if (isArtifactPublishedEvent(node.data.type)) {
                    node.data.locations = event.data.locations;
                    node.version = event.version;
                    let locationCount = _.reduce(node.data.locations, function (memo) {
                        return memo + 1;
                    }, 0);
                    node.data.location_length = locationCount;
                }
                else if (isArtifactReusedEvent(node.data.type)) {

                }
                else if (isCompositionDefinedEvent(node.data.type)) {
                    node.data.name = event.data.name;
                    node.version = event.version;
                    if (event.data.version !== undefined) {
                        node.data.version = event.data.version;
                    } else {
                        node.data.version = "No data";
                    }
                }
                else if (isConfidenceLevelEvent(node.data.type)) {
                    node.data.name = event.data.name;
                    node.data.value = event.data.value;
                    node.version = event.version;

                    let passedCount = 0;
                    let failedCount = 0;
                    let inconclusiveCount = 0;

                    if (node.data.value === 'SUCCESS') {
                        passedCount++;
                    } else if (node.data.value === 'FAILURE') {
                        failedCount++;
                    } else {
                        inconclusiveCount++;
                    }
                    if (event.data.issuer !== undefined) {
                        if (event.data.issuer.id !== undefined) {
                            node.data.issuer_id = event.data.issuer.id;
                        } else {
                            node.data.issuer_id = "No data";
                        }
                    } else {
                        node.data.issuer_id = "No data";
                    }
                    node.data.inconclusive = inconclusiveCount;
                    node.data.passed = passedCount;
                    node.data.failed = failedCount;

                }
                else if (isConfigurationAppliedEvent(node.data.type)) {
                    node.data.items = event.data.items;
                    node.version = event.version;
                    let itemCount = _.reduce(node.data.items, function (memo) {
                        return memo + 1;
                    }, 0);
                    node.data.items_length = itemCount;
                }
                else if (isEnvironmentDefinedEvent(node.data.type)) {
                    node.data.name = event.data.name;
                    node.version = event.version;

                    // One of [image, uri, host] should be present to describe the environment.
                    node.data.image = (event.data.image) ? event.data.image : "No data";
                    node.data.uri = (event.data.uri) ? event.data.uri : "No data";
                    if (event.data.host) {
                        node.data.hostname = event.data.host.name;
                        node.data.hostuser = event.data.host.user;
                    } else {
                        node.data.hostname = "No data";
                        node.data.hostuser = "No data";
                    }

                }
                else if (isFlowContextDefinedEvent(node.data.type)) {

                }
                else if (isIssueVerifiedEvent(node.data.type)) {
                      node.data.name = event.data.name;
                      node.version = event.version;

                }
                else if (isSourceChangeCreatedEvent(node.data.type)) {
                    node.version = event.version;
                    if (event.data.author !== undefined) {
                        if (event.data.author.name !== undefined) {
                            node.data.authorName = event.data.author.name;
                        } else {
                            node.data.authorName = "No data";
                        }

                        if (event.data.author.id !== undefined) {
                            node.data.authorId = event.data.author.id;
                        } else {
                            node.data.authorId = "No data";
                        }

                        if (event.data.author.group !== undefined) {
                            node.data.authorGroup = event.data.author.group;
                        } else {
                            node.data.authorGroup = "No data";
                        }

                    } else {
                        node.data.authorName = "No data";
                        node.data.authorId = "No data";
                        node.data.authorGroup = "No data";
                    }

                    if (event.data.change !== undefined) {
                        if (event.data.change.tracker !== undefined) {
                            node.data.changeTracker = event.data.change.tracker;
                        } else {
                            node.data.changeTracker = "No data";
                        }

                        if (event.data.change.id !== undefined) {
                            node.data.changeId = event.data.change.id;
                        } else {
                            node.data.changeId = "No data";
                        }
                    } else {
                        node.data.changeTracker = "No data";
                        node.data.changeId = "No data";
                    }

                    if (event.data.gitIdentifier !== undefined) {
                        node.data.gitCommitId = event.data.gitIdentifier.commitId;

                        if (event.data.gitIdentifier.branch !== undefined) {
                            node.data.gitBranch = event.data.gitIdentifier.branch;
                        } else {
                            node.data.gitBranch = "No data";
                        }

                        if (event.data.gitIdentifier.repoName !== undefined) {
                            node.data.gitRepoName = event.data.gitIdentifier.repoName;
                        } else {
                            node.data.gitRepoName = "No data";
                        }
                    } else {
                        node.data.gitCommitId = "No data";
                        node.data.gitBranch = "No data";
                        node.data.gitRepoName = "No data";
                    }

                    let isSubmitted = false;
                    for (const t_evtID of event.targetedBy) {
                        for (const s_evt of events)
                        if (s_evt.id === t_evtID && isSourceChangeSubmittedEvent(s_evt.type)) {
                            isSubmitted = true;
                            node.data.isSubmitted = "Yes";
                            break;
                        }
                    }
                    if (!isSubmitted) {
                        node.data.isSubmitted = "No";
                    }

                }
                else if (isSourceChangeSubmittedEvent(node.data.type)) {
                    node.version = event.version;
                    if (event.data.submitter !== undefined) {
                        if (event.data.submitter.name !== undefined) {
                            node.data.submitterName = event.data.submitter.name;
                        } else {
                            node.data.submitterName = "No data";
                        }

                        if (event.data.submitter.id !== undefined) {
                            node.data.submitterId = event.data.submitter.id;
                        } else {
                            node.data.submitterId = "No data";
                        }

                        if (event.data.submitter.group !== undefined) {
                            node.data.submitterGroup = event.data.submitter.group;
                        } else {
                            node.data.submitterGroup = "No data";
                        }

                    } else {
                        node.data.submitterName = "No data";
                        node.data.submitterId = "No data";
                        node.data.submitterGroup = "No data";
                    }

                    if (event.data.change !== undefined) {
                        if (event.data.change.tracker !== undefined) {
                            node.data.changeTracker = event.data.change.tracker;
                        } else {
                            node.data.changeTracker = "No data";
                        }

                        if (event.data.change.id !== undefined) {
                            node.data.changeId = event.data.change.id;
                        } else {
                            node.data.changeId = "No data";
                        }
                    } else {
                        node.data.changeTracker = "No data";
                        node.data.changeId = "No data";
                    }

                    if (event.data.gitIdentifier !== undefined) {
                        node.data.commitId = event.data.gitIdentifier.commitId;

                        if (event.data.gitIdentifier.branch !== undefined) {
                            node.data.gitBranch = event.data.gitIdentifier.branch;
                        } else {
                            node.data.gitBranch = "No data";
                        }

                        if (event.data.gitIdentifier.repoName !== undefined) {
                            node.data.gitRepoName = event.data.gitIdentifier.repoName;
                        } else {
                            node.data.gitRepoName = "No data";
                        }
                    } else {
                        node.data.commitId = "No data";
                        node.data.gitBranch = "No data";
                        node.data.gitRepoName = "No data";
                    }

                }
                else if (isTestEvent(node.data.type)) {
                    let verdict = event.data.outcome.verdict;
                    let passedCount = 0;
                    let failedCount = 0;
                    let inconclusiveCount = 0;

                    if (verdict === 'PASSED') {
                        passedCount++;
                    } else if (verdict === 'FAILED') {
                        failedCount++;
                    } else {
                        inconclusiveCount++;
                    }
                    node.data.passed = passedCount;
                    node.data.failed = failedCount;
                    node.data.inconclusive = inconclusiveCount;

                    if (isTestCaseEvent(node.data.type)) {
                        // console.log('The testCaseEvent is: ====== ' + node.data.type)
                        node.data.timeTriggered = event.time.triggered;
                        node.data.timeStarted = event.time.started;
                        node.data.timeFinished = event.time.finished;

                        // Data from startedEvent
                        if (event.data.testCase !== undefined) {
                            node.data.testCaseId = event.data.testCase.id;
                        } else {
                            node.data.testCaseId = "No Data";
                        }

                        if (event.data.executor !== undefined) {
                            node.data.executor = event.data.executor;
                        } else {
                            node.data.executor = "No Data";
                        }

                        if (event.data.testCase !== undefined) {
                            node.data.tracker = event.data.testCase.tracker;
                        } else {
                            node.data.tracker = "No Data";
                        }

                        if (event.data.executionType !== undefined) {
                            node.data.executionType = event.data.executionType;
                        } else {
                            node.data.executionType = "No Data";
                        }

                        // Environment data
                        // The "ENVIRONMENT" target link is disabled in eiffel-store.
                        // To go around that we can find the "EiffelTestCaseStartedEvent" and read the link manually.
                        // TestCaseStarted should have one Environment defined event target.
                        const startTestCaseEvt = EiffelEvents.find({"meta.id": event.startEvent}).fetch();
                        let envFound = false;
                        if (startTestCaseEvt && startTestCaseEvt[0].meta.type === "EiffelTestCaseStartedEvent") {
                            for (const t_link of startTestCaseEvt[0].links) {
                                if (t_link.type === "ENVIRONMENT") {
                                    for (const t_event of events) {
                                        if (t_event.id === t_link.target && isEnvironmentDefinedEvent(t_event.type)) {
                                            envFound = true;
                                            node.data.environment = t_event.data.name;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        if (!envFound) {
                            node.data.environment = "No data";
                        }

                        // Data from finishedEvent
                        node.data.verdict = event.data.outcome.verdict;
                        node.data.conclusion = event.data.outcome.conclusion;

                        if (event.data.outcome.description !== undefined) {
                            node.data.outcomeDescription = event.data.outcome.description;
                        } else {
                            node.data.outcomeDescription = "No Data";
                        }
                    }
                    else if (isTestSuiteEvent(node.data.type)) {
                        // Data from startedEvent
                        node.data.name = event.data.name;
                        node.data.timeStarted = event.time.started;
                        node.data.timeFinished = event.time.finished;

                        node.data.confidence = (event.confidence) ? event.confidence + "%": 0 + "%";

                        // Data from finishedEvent
                        if (event.data.outcome !== undefined) {
                            if (event.data.outcome.verdict !== undefined) {
                                node.data.verdict = event.data.outcome.verdict;
                            } else {
                                node.data.verdict = "No data";
                            }

                            if (event.data.outcome.conclusion !== undefined) {
                                node.data.conclusion = event.data.outcome.conclusion;
                            } else {
                                node.data.conclusion = "No data";
                            }
                        } else {
                            node.data.verdict = "No data";
                            node.data.conclusion = "No data";
                        }

                        if (event.data.outcome.description !== undefined) {
                            node.data.outcomeDescription = event.data.outcome.description;
                        } else {
                            node.data.outcomeDescription = "No Data";
                        }
                    }
                }

                nodes.push(node);

                //.concat(event.dangerousTargets)

                let edgesMap = {};
                _.each(event.targets, (target) => {
                    if (edgesMap[event.id + target] === undefined) {
                        if (eventsMap[target] === undefined) {
                            eventsMap[target] = 1;
                            nodes.push({
                                data: {
                                    id: target,
                                    extra: 'hidden'
                                }
                            })
                        }
                        edgesMap[event.id + target] = 1;
                        edges.push(
                            {
                                data: {
                                    label: 'safe',
                                    source: event.id,
                                    target: target
                                }
                            });
                    }
                });
                _.each(event.dangerousTargets, (target) => {
                    if (edgesMap[event.id + target] === undefined) {
                        edgesMap[event.id + target] = 1;
                        if (eventsMap[target] === undefined) {
                            eventsMap[target] = 1;
                            nodes.push({
                                data: {
                                    id: target,
                                    extra: 'hidden'
                                }
                            })
                        }
                        edges.push(
                            {
                                data: {
                                    label: 'dangerous',
                                    source: event.id,
                                    target: target
                                }
                            });
                    }
                });
            });
            return {
                nodes: nodes,
                edges: edges,
                time: sequence.time,
            };
        }
    }
});

export const getSequenceCount = new ValidatedMethod({
    name: 'getSequenceCount',
    validate: null,
    run() {
        return EventSequences.find().count();
    }
});
