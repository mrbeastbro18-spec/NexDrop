# NexDrop Context

## Project Snapshot
NexDrop is a single Next.js App Router application for file storage and sharing. The app combines authenticated dashboards, admin tools, public share pages, API routes, Prisma persistence, optional Redis, optional SMTP email, optional RabbitMQ email queueing, optional S3 storage, metrics, and Sentry.

The runtime is split into a web process and a separate email worker process. Production packaging targets standalone Next.js output and Docker-based deployment.

## Main Entry Points

## Architecture Notes

## RabbitMQ Status

## File Handling Updates

## Current Quality State

## Current Risk Profile

## Validation State

## Scores

## Recommended Next Steps
1. Run the full test, lint, and build pipeline after the RabbitMQ fixes.
2. Add authorization checks for file download and preview routes.
3. Revoke refresh-token sessions on password reset.
4. Decide whether RabbitMQ should be a first-class deployment dependency or remain an optional fallback.