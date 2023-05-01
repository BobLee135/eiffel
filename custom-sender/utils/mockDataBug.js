//import { EventCreator } from './EventCreator.js';
import { EventSender } from './EventSender.js';
import { EiffelEventTypes } from './EiffelEventTypes.js';
import { LinkFinder } from './LinkFinder.js';
import { AddTimeToTimestamp } from './addTimeToTimestamp.js';

//const eventCreator = new EventCreator();
const eventSender = new EventSender("http://16.170.107.18:9000");
const eiffelEventTypes = new EiffelEventTypes();
const linkFinder = new LinkFinder();

var events = [];

var baseTime = new Date().getTime();
var mockTime = new AddTimeToTimestamp();

const dev_makes_branch = eiffelEventTypes.EiffelSourceChangeCreatedEvent([], '', [], 'main branch', baseTime); // main?

// Bug found and issue created in JIRA
const bug = eiffelEventTypes.CustomBugEvent(127, "bug", "Bug ticket #321 created", [dev_makes_branch.meta.id], 'CAUSE', ['weak'], baseTime);


const bug_fixing_task_created = eiffelEventTypes.CustomTrelloEvent(
  11,
  "Dev assigned to task",
  "createCard",
  "Task for bug #321 created",
  [bug.meta.id],
  'CAUSE',
  ['strong'],
  mockTime.addTime(baseTime, 0.25).getTime()
);

// Dev gets assigned to fix bug
const bug_fixing_task = eiffelEventTypes.CustomTrelloEvent(
  11,
  "Dev assigned to task",
  "updateCard",
  "John Doe assigned to task",
  [bug_fixing_task_created.meta.id],
  'CAUSE',
  ['strong'],
  mockTime.addTime(baseTime, 0.25).getTime()
);

// Dev creates bug branch
const new_branch = eiffelEventTypes.EiffelSourceChangeCreatedEvent([dev_makes_branch.meta.id, bug.meta.id], 'BASE', ['weak', 'strong'], 'BUG-321-fix', mockTime.addTime(baseTime, 0.5).getTime());

// Dev debugs faulty source code 

// Dev runs external tests


// Dev pushes new commit
const new_push = eiffelEventTypes.EiffelArtifactCreatedEvent([new_branch.meta.id], 'CAUSE', ['strong'], "#321 Bug fix pushed", mockTime.addTime(baseTime, 4).getTime());

// CI tests run and pass
const test_case_1 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([new_push.meta.id], 'IUT', [''], '', mockTime.addTime(baseTime, 4).getTime());
const test_case_2 = eiffelEventTypes.EiffelTestCaseTriggeredEvent([new_push.meta.id], 'IUT', [''], '', mockTime.addTime(baseTime, 4).getTime());
const test_run_1 = eiffelEventTypes.EiffelTestCaseStartedEvent([test_case_1.meta.id], 'TEST_CASE_EXECUTION', [''], '', mockTime.addTime(baseTime, 4).getTime());
const test_run_2 = eiffelEventTypes.EiffelTestCaseStartedEvent([test_case_2.meta.id], 'TEST_CASE_EXECUTION', [''], '', mockTime.addTime(baseTime, 4).getTime());
const test_done_1 = eiffelEventTypes.EiffelTestCaseFinishedEvent([test_case_1.meta.id], 'TEST_CASE_EXECUTION', [''], 'PASSED', '', mockTime.addTime(baseTime, 4.5).getTime());
const test_done_2 = eiffelEventTypes.EiffelTestCaseFinishedEvent([test_case_2.meta.id], 'TEST_CASE_EXECUTION', [''], 'PASSED', '', mockTime.addTime(baseTime, 4.5).getTime());

// Dev creates pull request
const pr_created = eiffelEventTypes.EiffelActivityTriggeredEvent([test_case_1.meta.id, test_case_2.meta.id], 'CAUSE', ['', ''], "Pull request for bug fix created", mockTime.addTime(baseTime, 5).getTime());
const pr_started = eiffelEventTypes.EiffelActivityStartedEvent([pr_created.meta.id], 'ACTIVITY_EXECUTION', [''], "HELP", mockTime.addTime(baseTime, 5).getTime());

// PR gets reviewed and approved
const pr_finished = eiffelEventTypes.EiffelActivityFinishedEvent([pr_created.meta.id], 'ACTIVITY_EXECUTION', ['', ''], "SUCCESSFUL", "Pull request has been approved by Elon Musk", mockTime.addTime(baseTime, 10).getTime());

// Merge
const merge = eiffelEventTypes.EiffelSourceChangeSubmittedEvent([pr_finished.meta.id], 'CHANGE', ['strong'], "Changes merged to main", mockTime.addTime(baseTime, 10).getTime());

// JIRA task finished
const task_finished = eiffelEventTypes.CustomTrelloEvent(
  11,
  "Task moved to done",
  "updateCard",
  "Task moved to done",
  [merge.meta.id, bug_fixing_task.meta.id],
  'CAUSE',
  ['weak', 'strong'],
  mockTime.addTime(baseTime, 12).getTime()
);

events.push(dev_makes_branch);
events.push(bug);
events.push(bug_fixing_task_created);
events.push(bug_fixing_task);
events.push(new_branch);
events.push(new_push);
events.push(test_case_1);
events.push(test_case_2);
events.push(test_run_1);
events.push(test_run_2);
events.push(test_done_1);
events.push(test_done_2);
events.push(pr_created);
events.push(pr_started);
events.push(pr_finished);
events.push(merge);
events.push(task_finished);


function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

for (let i = 0; i < events.length; i++) {
    eventSender.submitEvent(events[i]);
    await delay(250);
}
