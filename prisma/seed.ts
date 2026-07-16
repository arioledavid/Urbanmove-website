import "dotenv/config";
import { hash } from "bcryptjs";
import type { JobStatus, ServiceType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { enquiryService } from "../src/lib/services/enquiry-service";

const prisma = new PrismaClient();

type CalendarSeedJob = {
  key: string;
  contactName: string;
  serviceType: ServiceType;
  fromAddress: string;
  toAddress: string;
  postcodeFrom: string;
  postcodeTo: string;
  title: string;
  status: JobStatus;
  startsAt: Date;
  endsAt: Date;
  notes?: string;
};

function setAt(
  base: Date,
  dayOffset: number,
  hour: number,
  minute = 0,
): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function seedCalendarJobs(actorId: string): Promise<void> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Multiple jobs intentionally share the same day to stress-test calendar overlap rendering.
  const jobs: CalendarSeedJob[] = [
    {
      key: "alpha",
      contactName: "Amelia Fraser",
      serviceType: "REMOVAL",
      fromAddress: "Rosemount Place, Aberdeen",
      toAddress: "Westburn Road, Aberdeen",
      postcodeFrom: "AB25 2XE",
      postcodeTo: "AB25 3QJ",
      title: "2-bed flat move (city centre)",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 8, 8, 0),
      endsAt: setAt(currentMonthStart, 8, 12, 30),
    },
    {
      key: "bravo",
      contactName: "Jamie McLean",
      serviceType: "REMOVAL",
      fromAddress: "King Street, Aberdeen",
      toAddress: "Bridge of Don, Aberdeen",
      postcodeFrom: "AB24 5AX",
      postcodeTo: "AB22 8TT",
      title: "House move with packing support",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 8, 9, 30),
      endsAt: setAt(currentMonthStart, 8, 15, 0),
    },
    {
      key: "charlie",
      contactName: "Noah Singh",
      serviceType: "COURIER",
      fromAddress: "Altens Industrial Estate, Aberdeen",
      toAddress: "Dyce, Aberdeen",
      postcodeFrom: "AB12 3LE",
      postcodeTo: "AB21 0AF",
      title: "Commercial pallet run",
      status: "IN_PROGRESS",
      startsAt: setAt(currentMonthStart, 8, 10, 0),
      endsAt: setAt(currentMonthStart, 8, 13, 0),
    },
    {
      key: "delta",
      contactName: "Olivia Brown",
      serviceType: "REMOVAL",
      fromAddress: "Cults, Aberdeen",
      toAddress: "Bieldside, Aberdeen",
      postcodeFrom: "AB15 9QB",
      postcodeTo: "AB15 9EP",
      title: "Family move with storage drop",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 10, 8, 0),
      endsAt: setAt(currentMonthStart, 10, 14, 0),
    },
    {
      key: "echo",
      contactName: "Isla Kerr",
      serviceType: "OTHER",
      fromAddress: "Torry, Aberdeen",
      toAddress: "Peterhead",
      postcodeFrom: "AB11 8XY",
      postcodeTo: "AB42 1AA",
      title: "Waste clearance and disposal",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 10, 11, 0),
      endsAt: setAt(currentMonthStart, 10, 16, 30),
    },
    {
      key: "foxtrot",
      contactName: "Lucas Reid",
      serviceType: "REMOVAL",
      fromAddress: "Inverurie",
      toAddress: "Ellon",
      postcodeFrom: "AB51 4EZ",
      postcodeTo: "AB41 9BA",
      title: "Weekend relocation",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 13, 8, 30),
      endsAt: setAt(currentMonthStart, 13, 13, 30),
    },
    {
      key: "golf",
      contactName: "Mia Duncan",
      serviceType: "CARGO",
      fromAddress: "Aberdeen Harbour",
      toAddress: "Portlethen",
      postcodeFrom: "AB11 5PW",
      postcodeTo: "AB12 4XP",
      title: "Cargo transfer to depot",
      status: "IN_PROGRESS",
      startsAt: setAt(currentMonthStart, 13, 9, 0),
      endsAt: setAt(currentMonthStart, 13, 12, 0),
    },
    {
      key: "hotel",
      contactName: "Callum Paterson",
      serviceType: "COURIER",
      fromAddress: "Union Square, Aberdeen",
      toAddress: "Stonehaven",
      postcodeFrom: "AB11 5RG",
      postcodeTo: "AB39 2AA",
      title: "Same-day parcel route",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 16, 10, 0),
      endsAt: setAt(currentMonthStart, 16, 13, 0),
    },
    {
      key: "india",
      contactName: "Sophie Murray",
      serviceType: "REMOVAL",
      fromAddress: "Oldmeldrum",
      toAddress: "Aberdeen",
      postcodeFrom: "AB51 0BW",
      postcodeTo: "AB10 1XG",
      title: "Long-distance inbound move",
      status: "SCHEDULED",
      startsAt: setAt(currentMonthStart, 16, 11, 30),
      endsAt: setAt(currentMonthStart, 16, 18, 0),
    },
  ];

  let createdOrUpdated = 0;
  for (const item of jobs) {
    const enquiryReference = `ENQ-SEED-CAL-${item.key.toUpperCase()}`;
    const jobReference = `JOB-SEED-CAL-${item.key.toUpperCase()}`;
    const contactEmail = `calendar+${item.key}@urbanmovelogistics.co.uk`;

    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { reference: enquiryReference },
      select: { id: true },
    });

    const enquiry = existingEnquiry
      ? await prisma.enquiry.update({
          where: { id: existingEnquiry.id },
          data: {
            status: "SCHEDULED",
            serviceType: item.serviceType,
            contactName: item.contactName,
            contactEmail,
            contactPhone: "+447700000000",
            fromAddress: item.fromAddress,
            toAddress: item.toAddress,
            postcodeFrom: item.postcodeFrom,
            postcodeTo: item.postcodeTo,
            moveDate: item.startsAt,
            payload: {
              seed: true,
              seedType: "calendar",
              key: item.key,
            },
            source: "seed",
          },
        })
      : await prisma.enquiry.create({
          data: {
            reference: enquiryReference,
            status: "SCHEDULED",
            serviceType: item.serviceType,
            contactName: item.contactName,
            contactEmail,
            contactPhone: "+447700000000",
            fromAddress: item.fromAddress,
            toAddress: item.toAddress,
            postcodeFrom: item.postcodeFrom,
            postcodeTo: item.postcodeTo,
            moveDate: item.startsAt,
            payload: {
              seed: true,
              seedType: "calendar",
              key: item.key,
            },
            source: "seed",
          },
        });

    const existingJob = await prisma.job.findUnique({
      where: { reference: jobReference },
      select: { id: true },
    });

    const job = existingJob
      ? await prisma.job.update({
        where: { id: existingJob.id },
        data: {
          status: item.status,
          title: item.title,
          serviceType: item.serviceType,
          scheduledStart: item.startsAt,
          scheduledEnd: item.endsAt,
          addressFrom: item.fromAddress,
          addressTo: item.toAddress,
          notes: item.notes ?? "Calendar seed job",
          assignedStaffIds: [],
          enquiryId: enquiry.id,
        },
      })
      : await prisma.job.create({
        data: {
          reference: jobReference,
          status: item.status,
          title: item.title,
          serviceType: item.serviceType,
          scheduledStart: item.startsAt,
          scheduledEnd: item.endsAt,
          addressFrom: item.fromAddress,
          addressTo: item.toAddress,
          notes: item.notes ?? "Calendar seed job",
          assignedStaffIds: [],
          enquiryId: enquiry.id,
        },
      });

    createdOrUpdated += 1;
    await prisma.activity.create({
      data: {
        type: "JOB_UPDATED",
        entityType: "Job",
        entityId: job.id,
        entityReference: jobReference,
        message: `Seeded calendar job ${jobReference}`,
        actorId,
        metadata: {
          seed: true,
          day: item.startsAt.toISOString().slice(0, 10),
          status: item.status,
        },
      },
    });
  }

  console.log(`Seeded calendar jobs: ${createdOrUpdated}`);
}

async function main() {
  const email = (
    process.env.ADMIN_SEED_EMAIL ?? "admin@urbanmovelogistics.co.uk"
  )
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMeNow!2026";

  if (password.length < 12) {
    throw new Error("ADMIN_SEED_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await hash(password, 12);
  const now = new Date();

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          role: "ADMIN",
          active: true,
          passwordChangedAt: now,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          name: "Admin",
          passwordHash,
          role: "ADMIN",
          active: true,
          passwordChangedAt: now,
        },
      });

  console.log(`Seeded admin user: ${user.email}`);

  const smoke = await enquiryService.create({
    serviceType: "REMOVAL",
    contactName: "Phase 0 Smoke Test",
    contactEmail: "smoke@example.com",
    contactPhone: "+447700000000",
    fromAddress: "Aberdeen",
    toAddress: "Aberdeen",
    postcodeFrom: "AB11 9BH",
    postcodeTo: "AB10 1AB",
    payload: { note: "Phase 0 architecture smoke enquiry" },
    source: "manual",
    actorId: user.id,
  });

  if (!smoke.success) {
    throw new Error(`Smoke enquiry failed: ${smoke.error}`);
  }

  console.log(`Smoke enquiry created: ${smoke.data.reference}`);
  await seedCalendarJobs(user.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
