import { calculateOutageDuration } from '../outage-calculator';
import { calculateDuplicateScore } from '../duplicate-detector';
import { evaluateEscalation } from '../escalation-engine';

function runUnitTests() {
  console.log('🧪 Starting CivicPulse Business Logic Unit Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Outage Duration Calculation
  console.log('Test Suite 1: Outage Duration Calculator');
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const out1 = calculateOutageDuration(twoHoursAgo);
  assert(out1.isOneHourOrMore === true, 'Outage lasting 2 hours flags isOneHourOrMore as true');
  assert(out1.shouldPromptReport === true, 'Outage lasting 2 hours triggers 1-hour report notification prompt');
  assert(out1.officialReasonDisplay === 'Official reason has not yet been provided.', 'Missing official reason returns transparent placeholder string');
  assert(out1.restorationTimeDisplay === 'Restoration time is not yet available.', 'Missing restoration time returns transparent placeholder string');

  const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);
  const out2 = calculateOutageDuration(halfHourAgo, 'Substation 11kV Feeder Maintenance');
  assert(out2.isOneHourOrMore === false, 'Outage lasting 30 mins flags isOneHourOrMore as false');
  assert(out2.officialReasonDisplay === 'Substation 11kV Feeder Maintenance', 'Provided official reason is displayed correctly');

  // TEST 2: Duplicate Detection Algorithm
  console.log('\nTest Suite 2: Practical Duplicate Detection Engine');
  const dup1 = calculateDuplicateScore(
    {
      title: 'Power Cut in Pappampatti Pirivu',
      description: 'Electricity went off after heavy rain 2 hours ago',
      locationName: 'Pappampatti Pirivu',
      categoryCode: 'electricity',
    },
    {
      id: 'existing-1',
      title: 'Unannounced Power Shutdown After Rain',
      description: 'Multiple households without current in Pappampatti Pirivu',
      locationName: 'Pappampatti Pirivu',
      categoryCode: 'electricity',
      createdAt: new Date(),
      affectedCount: 45,
    }
  );
  assert(dup1.matchScore >= 60, `Matching category, locality & time yields confidence score >= 60% (Actual: ${dup1.matchScore}%)`);

  const dup2 = calculateDuplicateScore(
    {
      title: 'Garbage dump near school',
      description: 'Overflowing bin on street',
      locationName: 'Nehru Nagar',
      categoryCode: 'garbage',
    },
    {
      id: 'existing-2',
      title: 'Pothole on Main Rd',
      description: 'Road damage',
      locationName: 'Gandhi Nagar',
      categoryCode: 'roads',
      createdAt: new Date(),
      affectedCount: 2,
    }
  );
  assert(dup2.matchScore === 0, 'Unrelated complaint category & locality returns 0% match score');

  // TEST 3: SLA & Escalation Rules
  console.log('\nTest Suite 3: SLA Deadline & Priority Escalation');
  const esc1 = evaluateEscalation({
    createdAt: new Date(),
    status: 'SUBMITTED',
    isEmergency: true,
    categorySLAHours: 12,
  });
  assert(esc1.priority === 'URGENT', 'Immediate wire/safety hazard is assigned URGENT priority');

  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const esc2 = evaluateEscalation({
    createdAt: threeDaysAgo,
    status: 'SUBMITTED',
    categorySLAHours: 24,
  });
  assert(esc2.isOverdue === true, 'Ticket age > 24h SLA is marked as Overdue');

  console.log(`\n📊 Test Verification Results: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests();
