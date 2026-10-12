import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CivicPulse Database Seeding...');

  // Clear existing data safely
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.resolutionFeedback.deleteMany();
  await prisma.complaintEvidence.deleteMany();
  await prisma.complaintUpdate.deleteMany();
  await prisma.complaintAssignment.deleteMany();
  await prisma.outageAffectedUser.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.electricityOutageIncident.deleteMany();
  await prisma.complaintCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 1. Create Departments
  const elecDept = await prisma.department.create({
    data: {
      name: 'Electricity Distribution Board',
      code: 'ELEC',
      description: 'Manages grid distribution, outage restoration, transformers and street electrical wiring.',
      contactEmail: 'outages@civicpulse-elec.gov',
    },
  });

  const roadDept = await prisma.department.create({
    data: {
      name: 'Public Works & Roads Department',
      code: 'ROAD',
      description: 'Handles road maintenance, pothole patching, asphalt paving and sidewalk repairs.',
      contactEmail: 'roads@civicpulse-pwd.gov',
    },
  });

  const saniDept = await prisma.department.create({
    data: {
      name: 'Sanitation & Solid Waste Management',
      code: 'SANI',
      description: 'Collects municipal waste, manages dumpsters, street sweeping and public hygiene.',
      contactEmail: 'sanitation@civicpulse-clean.gov',
    },
  });

  const waterDept = await prisma.department.create({
    data: {
      name: 'Water Supply & Sewage Board',
      code: 'WATR',
      description: 'Manages drinking water distribution pipelines, storm drainage and sewerage treatment.',
      contactEmail: 'water@civicpulse-water.gov',
    },
  });

  const lightDept = await prisma.department.create({
    data: {
      name: 'Municipal Street Lighting Bureau',
      code: 'LGT',
      description: 'Installs and repairs public streetlights, LED lamps, and lighting control boxes.',
      contactEmail: 'lighting@civicpulse-infra.gov',
    },
  });

  // 2. Create Complaint Categories
  const catElec = await prisma.complaintCategory.create({
    data: {
      name: 'Electricity & Outages',
      code: 'electricity',
      description: 'Power interruptions, voltage fluctuations, sparking transformers, wire hazards.',
      SLAHours: 12,
      icon: 'Zap',
    },
  });

  const catRoads = await prisma.complaintCategory.create({
    data: {
      name: 'Roads & Potholes',
      code: 'roads',
      description: 'Damaged asphalt, dangerous potholes, uneven road surface, cave-ins.',
      SLAHours: 48,
      icon: 'Construction',
    },
  });

  const catGarbage = await prisma.complaintCategory.create({
    data: {
      name: 'Garbage & Sanitation',
      code: 'garbage',
      description: 'Overflowing bins, uncollected trash, illegal dumping, biohazard accumulation.',
      SLAHours: 24,
      icon: 'Trash2',
    },
  });

  const catDrainage = await prisma.complaintCategory.create({
    data: {
      name: 'Drainage & Waterlogging',
      code: 'drainage',
      description: 'Blocked storm drains, street flooding, sewage overflow, stagnant rainwater.',
      SLAHours: 24,
      icon: 'Droplets',
    },
  });

  const catLights = await prisma.complaintCategory.create({
    data: {
      name: 'Streetlights',
      code: 'streetlights',
      description: 'Dark streetlights, flickering lamps, broken poles, night safety hazards.',
      SLAHours: 48,
      icon: 'Lightbulb',
    },
  });

  const catWater = await prisma.complaintCategory.create({
    data: {
      name: 'Water Supply',
      code: 'water',
      description: 'Low water pressure, pipeline leaks, dirty water contamination, dry taps.',
      SLAHours: 24,
      icon: 'GlassWater',
    },
  });

  const catInfra = await prisma.complaintCategory.create({
    data: {
      name: 'Public Infrastructure',
      code: 'infrastructure',
      description: 'Damaged bus shelters, broken park benches, missing manhole covers, bridge issues.',
      SLAHours: 72,
      icon: 'Building2',
    },
  });

  const catOther = await prisma.complaintCategory.create({
    data: {
      name: 'Other Civic Issues',
      code: 'other',
      description: 'General public concerns requiring local government intervention.',
      SLAHours: 48,
      icon: 'AlertCircle',
    },
  });

  // 3. Create Password Hashes
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 4. Create Demo Users
  const citizen = await prisma.user.create({
    data: {
      name: 'Anand Sharma (Demo Citizen)',
      email: 'citizen@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      area: 'Pappampatti Pirivu',
      phone: '+91 98765 43210',
    },
  });

  const officer = await prisma.user.create({
    data: {
      name: 'Officer Rajesh Kumar (Demo Officer)',
      email: 'officer@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'OFFICER',
      departmentId: elecDept.id,
      area: 'Central District Zone 4',
      phone: '+91 98765 88888',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Controller (Demo Admin)',
      email: 'admin@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      area: 'Municipal Headquarters',
      phone: '+91 98765 00000',
    },
  });

  console.log('✅ Demo Users Created:');
  console.log('   Citizen: citizen@civicpulse.org / Password123!');
  console.log('   Officer: officer@civicpulse.org / Password123!');
  console.log('   Admin: admin@civicpulse.org / Password123!');

  // 5. Create Electricity Outage Incidents
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const threeHoursInFuture = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const incident1 = await prisma.electricityOutageIncident.create({
    data: {
      title: 'Unexpected Power Cut at Pappampatti Pirivu',
      locality: 'Pappampatti Pirivu',
      startTime: twoHoursAgo,
      isCurrentlyOff: true,
      weatherCondition: 'Heavy Rainfall & High Wind Gusts',
      outageCategory: 'RAIN_STORM',
      affectedHouseholds: 45,
      status: 'INVESTIGATING',
      confirmedReason: null, // "Official reason pending verification"
      expectedRestoration: null,
      departmentId: elecDept.id,
    },
  });

  const incident2 = await prisma.electricityOutageIncident.create({
    data: {
      title: 'Scheduled Grid Maintenance Work - Gandhi Nagar',
      locality: 'Gandhi Nagar',
      startTime: oneHourAgo,
      isCurrentlyOff: true,
      weatherCondition: 'Clear Sky',
      outageCategory: 'PLANNED',
      affectedHouseholds: 120,
      status: 'REPAIRING',
      confirmedReason: 'Substation 33kV Line Replacement & Transformer Overhaul',
      expectedRestoration: threeHoursInFuture,
      departmentId: elecDept.id,
    },
  });

  // Link citizen to affected outage
  await prisma.outageAffectedUser.create({
    data: {
      incidentId: incident1.id,
      userId: citizen.id,
      reportedAt: twoHoursAgo,
    },
  });

  // 6. Create Complaints
  const complaint1 = await prisma.complaint.create({
    data: {
      refNumber: 'CP-2026-00001',
      title: 'Unannounced Power Shutdown After Heavy Rainfall',
      description: 'Electricity supply snapped abruptly 2 hours ago during storm. Multiple homes on 3rd Main Road are without power. Refrigerator and fan units stopped working.',
      categoryId: catElec.id,
      userId: citizen.id,
      locationName: 'Pappampatti Pirivu',
      address: 'House #42, 3rd Main Road, Pappampatti Pirivu',
      latitude: 11.0168,
      longitude: 76.9558,
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
      isEmergency: false,
      affectedCount: 45,
      isOutage: true,
      outageIncidentId: incident1.id,
      createdAt: twoHoursAgo,
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      refNumber: 'CP-2026-00002',
      title: 'HAZARD: Fallen Live Cable Sparking Near Primary School',
      description: 'Heavy rain tree branch snapped electrical line. Live wire is hanging loose over water puddle near Govt Primary School main gate. Sparking sound reported!',
      categoryId: catElec.id,
      userId: citizen.id,
      locationName: 'Pappampatti Pirivu',
      address: 'Govt Primary School Gate, School Road',
      latitude: 11.0182,
      longitude: 76.9571,
      priority: 'URGENT',
      status: 'ASSIGNED',
      isEmergency: true,
      affectedCount: 150,
      isOutage: true,
      outageIncidentId: incident1.id,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
    },
  });

  const complaint3 = await prisma.complaint.create({
    data: {
      refNumber: 'CP-2026-00003',
      title: 'Deep Pothole Causing Traffic Hazards & Vehicle Damage',
      description: 'Large 2-foot deep crater opened up on Gandhi Nagar main junction road. Two two-wheelers skid yesterday night. Immediate asphalt patching required.',
      categoryId: catRoads.id,
      userId: citizen.id,
      locationName: 'Gandhi Nagar Junction',
      address: 'Opposite State Bank Branch, Main Rd',
      latitude: 11.0250,
      longitude: 76.9620,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      isEmergency: false,
      affectedCount: 12,
      createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
    },
  });

  const complaint4 = await prisma.complaint.create({
    data: {
      refNumber: 'CP-2026-00004',
      title: 'Overflowing Municipal Garbage Dumpster',
      description: 'Garbage bin overflowing for 3 consecutive days. Foul odor spreading into residential apartments. Stray dogs scattering waste on road.',
      categoryId: catGarbage.id,
      userId: citizen.id,
      locationName: 'Nehru Nagar',
      address: 'Corner of 5th Cross & Commercial Street',
      latitude: 11.0310,
      longitude: 76.9700,
      priority: 'MEDIUM',
      status: 'RESOLVED',
      isEmergency: false,
      affectedCount: 30,
      createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
  });

  const complaint5 = await prisma.complaint.create({
    data: {
      refNumber: 'CP-2026-00005',
      title: 'Blocked Stormwater Drain Flooding Low-Lying Homes',
      description: 'Drainage pipe clogged with plastic waste. Rainwater standing ankle-deep in front of residential driveways.',
      categoryId: catDrainage.id,
      userId: citizen.id,
      locationName: 'Civil Aerodrome Post Area',
      address: 'Block B, Aerodrome Layout',
      latitude: 11.0380,
      longitude: 77.0010,
      priority: 'MEDIUM',
      status: 'SUBMITTED',
      isEmergency: false,
      affectedCount: 8,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    },
  });

  const complaint6 = await prisma.complaint.create({
    data: {
      refNumber: 'CP-2026-00006',
      title: 'Entire Streetlight String Unlit Along 4th Cross Street',
      description: 'All 6 pole lamps are dark after sunset. High safety risk for pedestrians returning home after 8 PM.',
      categoryId: catLights.id,
      userId: citizen.id,
      locationName: 'Pappampatti Pirivu',
      address: '4th Cross Street, West Extension',
      latitude: 11.0155,
      longitude: 76.9540,
      priority: 'LOW',
      status: 'AWAITING_INFO',
      isEmergency: false,
      affectedCount: 20,
      createdAt: new Date(now.getTime() - 50 * 60 * 60 * 1000),
    },
  });

  // 7. Assignments
  await prisma.complaintAssignment.create({
    data: {
      complaintId: complaint2.id,
      departmentId: elecDept.id,
      officerId: officer.id,
      assignedByUserId: admin.id,
      notes: 'URGENT SAFETY HAZARD! Dispatch emergency linesman squad immediately.',
    },
  });

  await prisma.complaintAssignment.create({
    data: {
      complaintId: complaint3.id,
      departmentId: roadDept.id,
      assignedByUserId: admin.id,
      notes: 'Assigned to PWD road maintenance team for cold-mix asphalt filling.',
    },
  });

  // 8. Updates (Official remarks vs Citizen observations)
  await prisma.complaintUpdate.create({
    data: {
      complaintId: complaint1.id,
      authorId: citizen.id,
      authorRole: 'CITIZEN',
      statusChange: 'SUBMITTED',
      officialRemark: null,
      isOfficial: false,
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: complaint1.id,
      authorId: officer.id,
      authorRole: 'OFFICER',
      statusChange: 'UNDER_REVIEW',
      officialRemark: 'Emergency patrol dispatched to verify feeder line trip at Pappampatti 11kV Substation. Official reason pending feeder test.',
      isOfficial: true,
      estimatedRestoration: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: complaint2.id,
      authorId: officer.id,
      authorRole: 'OFFICER',
      statusChange: 'ASSIGNED',
      officialRemark: 'Linesman team has isolated the 11kV section. Power supply cut to line for safety. Repair crew on site.',
      isOfficial: true,
      estimatedRestoration: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
    },
  });

  await prisma.complaintUpdate.create({
    data: {
      complaintId: complaint4.id,
      authorId: officer.id,
      authorRole: 'OFFICER',
      statusChange: 'RESOLVED',
      officialRemark: 'Municipal compactor truck deployed. Waste cleared, bin sanitized and sprayed with lime powder.',
      isOfficial: true,
    },
  });

  // 9. Feedback for Resolved Complaint
  await prisma.resolutionFeedback.create({
    data: {
      complaintId: complaint4.id,
      userId: citizen.id,
      rating: 5,
      comment: 'Prompt response! Compactor cleared the trash within 24 hours of reporting.',
    },
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: citizen.id,
        title: 'Electricity Outage Update',
        message: 'Officer Rajesh Kumar added official remark: Substation feeder inspection in progress.',
        link: `/complaints/${complaint1.id}`,
      },
      {
        userId: citizen.id,
        title: 'Urgent Hazard Complaint Assigned',
        message: 'Your emergency report CP-2026-00002 has been assigned to Linesman Emergency Crew.',
        link: `/complaints/${complaint2.id}`,
      },
      {
        userId: citizen.id,
        title: 'Complaint Resolved',
        message: 'Garbage dump report CP-2026-00004 has been marked as Resolved. Tap to leave feedback!',
        link: `/complaints/${complaint4.id}`,
      },
    ],
  });

  // 11. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        userRole: 'ADMIN',
        action: 'ASSIGN_COMPLAINT',
        entityType: 'Complaint',
        entityId: complaint2.id,
        details: 'Assigned complaint CP-2026-00002 to Electricity Department Officer Rajesh Kumar',
      },
      {
        userId: officer.id,
        userRole: 'OFFICER',
        action: 'UPDATE_OUTAGE_STATUS',
        entityType: 'ElectricityOutageIncident',
        entityId: incident1.id,
        details: 'Updated status to INVESTIGATING and added patrol remark',
      },
    ],
  });

  console.log('🎉 CivicPulse Database Seeding Successfully Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
