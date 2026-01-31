---
title: Using Server Sent Events (SSE) to sync Tanstack Db from AWS DynamoDB
date: "2026-01-08 08:15:18"
published: true
summary: Build real-time data synchronization between AWS DynamoDB and TanStack DB using Server-Sent Events. Learn how to stream database changes via DynamoDB Streams, implement SSE endpoints with TanStack Start/Router.
categories: aws
cover_image: ./cover-image.png
tags:
  - aws
  - cdk
  - tanstack
series: tanstack-aws
---

## Introduction

As described in [Simple example of TanStack DB with DynamoDB on AWS with multiple entities](/blog/2025-12-27-tanstack-start-aws-db-multiple-entities), we set up a multi-entity data model using ElectroDB and TanStack DB collections. In this post, we will explore how to keep our TanStack DB in sync with AWS DynamoDB using Server Sent Events (SSE).

TanStack DB has the advantage that it can update specific database entries without needing to refetch all the data. This capability enables real-time synchronization across multiple sessions when another user or process modifies the data. Instead of polling the database constantly or refreshing entire datasets, SSE allows the server to push only the changes that occurred, making the application more efficient and responsive.

> **⚠️ Disclaimer**: This implementation is somewhat hacky and is intended to prove the approach and demonstrate the concept. It has not been battle-tested in production environments and may contain errors or edge cases that haven't been fully addressed.

## Demo Video

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZOf52x9ehYg" title="TanStack DB SSE Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Architecture Overview

The synchronization architecture consists of three main components working together:

1. **DynamoDB Streams**: Captures all data changes from the main DynamoDB table
2. **Event Table**: Stores a change log of all modifications for historical tracking
3. **SSE Endpoint**: Streams these changes to connected clients in real-time

This architecture enables multiple clients to stay synchronized with minimal latency while maintaining a complete audit trail of all data modifications.

## DynamoDB Stream and Event Table

AWS DynamoDB Streams is a powerful feature that captures a time-ordered sequence of item-level modifications in any DynamoDB table. When enabled, DynamoDB Streams records every change (insert, update, delete) made to the table in near real-time.

### How It Works

1. **Stream Capture**: When data changes in the main DynamoDB table, DynamoDB Streams captures these modifications
2. **Lambda Processing**: A Lambda function is triggered by the stream and processes each change event
3. **Event Storage**: The Lambda writes these events to a separate "Events" table, creating a persistent change log
4. **Query by Clients**: The SSE endpoint can query this Events table to find changes since a specific timestamp

This approach provides several benefits:

- **Historical Audit Trail**: All changes are permanently stored in the Events table
- **Efficient Polling**: Clients only need to query for events after their last known event ID
- **Decoupling**: The stream processing is separate from client synchronization logic

For more information, see the [AWS DynamoDB Streams documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html).

### Implementation Links

The complete implementation is available in the repository:

- [DynamoDB stream setup](https://github.com/JohannesKonings/tanstack-aws/blob/2026-01-08-tanstack-start-aws-db-multiple-entities-sse/lib/constructs/dynamo-table.ts) - Table configuration with streams enabled
- [Lambda function for stream processing](https://github.com/JohannesKonings/tanstack-aws/blob/2026-01-08-tanstack-start-aws-db-multiple-entities-sse/lambda/dynamodb-stream/index.ts) - Processes DynamoDB stream events
- [Events table schema and setup](https://github.com/JohannesKonings/tanstack-aws/blob/2026-01-08-tanstack-start-aws-db-multiple-entities-sse/app/entities/events.ts) - ElectroDB entity definition for events

## Server Sent Events (SSE) Setup

[Server-Sent Events (SSE)](https://en.wikipedia.org/wiki/Server-sent_events) is a standard web technology that enables servers to push real-time updates to clients over a single HTTP connection. Unlike WebSockets which provide bidirectional communication, SSE is unidirectional (server to client) and uses simple HTTP, making it easier to implement and more compatible with existing infrastructure like load balancers and proxies.

### Why SSE for Database Synchronization?

SSE is ideal for this use case because:

- **Automatic Reconnection**: The browser's native `EventSource` API handles reconnection automatically
- **Simple Protocol**: Uses standard HTTP, no special server infrastructure needed
- **Efficient**: Keeps a single connection open, pushing updates only when changes occur
- **Last-Event-ID**: Built-in support for resuming from the last received event after reconnection

### SSE Endpoint Implementation

A Server-Sent Events endpoint is created using TanStack Router's `createFileRoute` API. This endpoint streams changes from the Events table to connected clients. Here's how the implementation works:

**Key Features:**

- **Polling Mechanism**: Queries the Events table every 500ms for new changes
- **Heartbeat**: Sends keepalive messages every 15 seconds to prevent connection timeout
- **Graceful Timeout**: Closes the connection before Lambda timeout (14 minutes), allowing automatic reconnection
- **Last-Event-ID Support**: Clients can reconnect and resume from their last received event
- **Efficient Queries**: Only fetches events newer than the client's last known event

<details>
<summary>Click to view the SSE endpoint implementation</summary>

```typescript
// oxlint-disable no-magic-numbers
// oxlint-disable init-declarations
// oxlint-disable no-ternary
// oxlint-disable max-statements
// oxlint-disable no-console
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createFileRoute } from "@tanstack/react-router";
import { TIMEOUT_IN_SECONDS } from "../../../../lib/constructs/type";

// =============================================================================
// Constants
// =============================================================================

const STREAM_DURATION_MS = (TIMEOUT_IN_SECONDS - 4) * 1000;
const RETRY_MS = 1000;
const POLL_INTERVAL_MS = 500;
const HEARTBEAT_INTERVAL_MS = 15000; // Send heartbeat every 15 seconds to prevent connection timeout
const EVENTS_TABLE = process.env.EVENTS_TABLE ?? "";

// =============================================================================
// DynamoDB Client
// =============================================================================

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// =============================================================================
// Helper Functions
// =============================================================================

/** Query events from the Events table since a given sort key */
const queryEventsSince = async (
  lastEventSk: string | null,
): Promise<Array<Record<string, unknown>>> => {
  if (!EVENTS_TABLE) {
    console.log("Persons SSE: EVENTS_TABLE not configured");
    return [];
  }

  const params = {
    TableName: EVENTS_TABLE,
    KeyConditionExpression: lastEventSk ? "pk = :pk AND sk > :sk" : "pk = :pk",
    ExpressionAttributeValues: lastEventSk
      ? { ":pk": "EVENTS", ":sk": lastEventSk }
      : { ":pk": "EVENTS" },
    ScanIndexForward: true,
    Limit: 100,
  };

  console.log(
    "Persons SSE: Querying events table:",
    EVENTS_TABLE,
    "cursor:",
    lastEventSk,
  );
  const result = await ddbClient.send(new QueryCommand(params));
  console.log(
    "Persons SSE: Query returned",
    result.Items?.length ?? 0,
    "events",
  );
  return (result.Items ?? []) as Array<Record<string, unknown>>;
};

/** Format an event as SSE data */
const formatSseEvent = (event: Record<string, unknown>): string => {
  const data = {
    timestamp: event.createdAt,
    eventType: event.eventType,
    entityType: event.entityType,
    entity: event.entity,
    oldEntity: event.oldEntity,
  };
  return `event: change\nid: ${event.sk}\ndata: ${JSON.stringify(data)}\n\n`;
};

// =============================================================================
// SSE Stream Route for Persons DB
// =============================================================================

/**
 * SSE Stream API Route for Persons Database
 *
 * Streams entity change events (persons, addresses, bank accounts, etc.)
 * to connected clients using Server-Sent Events.
 *
 * Based on the simple /api/events blueprint pattern.
 */
export const Route = createFileRoute("/api/persons-stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Check if Events table is configured
        if (!EVENTS_TABLE) {
          return new Response("SSE not configured - EVENTS_TABLE not set", {
            status: 503,
          });
        }

        // Get last event ID from header for reconnection
        const lastEventId = request.headers.get("Last-Event-ID");
        let lastSk = lastEventId;

        const encoder = new TextEncoder();
        let pollIntervalId: ReturnType<typeof setInterval>;
        let heartbeatIntervalId: ReturnType<typeof setInterval>;
        let timeoutId: ReturnType<typeof setTimeout>;

        const stream = new ReadableStream({
          async start(controller) {
            // Send retry directive so EventSource knows how long to wait before reconnecting
            controller.enqueue(encoder.encode(`retry: ${RETRY_MS}\n\n`));

            // Send initial connected event
            controller.enqueue(
              encoder.encode(
                'event: connected\ndata: {"status":"connected"}\n\n',
              ),
            );
            console.log(
              "Persons SSE: Client connected, EVENTS_TABLE:",
              EVENTS_TABLE,
            );

            // Define the poll function
            const poll = async (): Promise<void> => {
              try {
                // Query for new events
                const events = await queryEventsSince(lastSk);

                // Send each event
                for (const event of events) {
                  controller.enqueue(encoder.encode(formatSseEvent(event)));
                  lastSk = event.sk as string;
                  console.log(
                    "Persons SSE: Sent event:",
                    event.eventType,
                    event.entityType,
                  );
                }
              } catch (error) {
                console.error("Persons SSE: Poll error:", error);
              }
            };

            // Define the heartbeat function
            const sendHeartbeat = (): void => {
              try {
                controller.enqueue(encoder.encode(": heartbeat\n\n"));
                console.log("Persons SSE: Heartbeat sent");
              } catch (error) {
                console.error("Persons SSE: Heartbeat error:", error);
              }
            };

            // Do an immediate first poll
            await poll();

            // Then poll at regular intervals
            pollIntervalId = setInterval(() => {
              poll();
            }, POLL_INTERVAL_MS);

            // Send heartbeats at regular intervals to keep connection alive
            heartbeatIntervalId = setInterval(
              sendHeartbeat,
              HEARTBEAT_INTERVAL_MS,
            );

            // Gracefully close the stream before Lambda timeout
            // EventSource will automatically reconnect
            timeoutId = setTimeout(() => {
              clearInterval(pollIntervalId);
              clearInterval(heartbeatIntervalId);
              // Send a final event to signal graceful close
              controller.enqueue(
                encoder.encode(
                  'event: reconnect\ndata: {"reason":"timeout"}\n\n',
                ),
              );
              controller.close();
              console.log(
                "Persons SSE: Stream closed gracefully before timeout",
              );
            }, STREAM_DURATION_MS);
          },
          cancel() {
            clearInterval(pollIntervalId);
            clearInterval(heartbeatIntervalId);
            clearTimeout(timeoutId);
            console.log("Persons SSE: Client disconnected");
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
```

</details>

### Understanding the SSE Flow

1. **Client Connection**: When a client connects, the endpoint sends a `retry` directive and a `connected` event
2. **Initial Poll**: Immediately queries for any events since the client's `Last-Event-ID`
3. **Continuous Polling**: Sets up an interval to poll for new events every 500ms
4. **Event Streaming**: Each new event is formatted and sent to the client with a unique ID
5. **Heartbeat**: Sends comment lines (`: heartbeat`) to keep the connection alive
6. **Graceful Close**: Before Lambda timeout, sends a `reconnect` event and closes the stream

The client's browser automatically reconnects using the built-in `EventSource` retry mechanism, and the server resumes streaming from the last event ID.

### ElectroDB Integration (Future Enhancement)

ElectroDB, the library used for DynamoDB entity management, has community discussions about built-in change tracking. This could potentially simplify the stream processing in the future. See [ElectroDB issue #74](https://github.com/tywalch/electrodb/issues/74) for more details.

## The SSE Hook

The client-side implementation uses a custom React hook (`useSseSync`) that manages the SSE connection and applies changes to TanStack DB collections. This hook abstracts away the complexity of SSE connection management and provides a clean API for components to use.

### Hook Architecture

The hook is structured into several key sections:

1. **Constants & Configuration**: Defines the SSE endpoint and flag for preventing loops
2. **Type Definitions**: TypeScript interfaces for entity types, event types, and state
3. **Collection Update Functions**: Specialized functions for INSERT, MODIFY, and REMOVE operations
4. **Change Application Logic**: Routes events to the correct collection and operation
5. **Connection Management**: Handles EventSource lifecycle and reconnection

### Key Features

- **Automatic Reconnection**: Uses native `EventSource` which handles reconnections automatically
- **Loop Prevention**: Uses a flag to prevent SSE updates from triggering writes back to DynamoDB
- **Type-Safe Updates**: Strongly typed entity handlers for all five entity types (Person, Address, BankAccount, ContactInfo, Employment)
- **State Management**: Tracks connection status and last sync time
- **Manual Reconnection**: Provides a `reconnect()` function for forced reconnection

<details>
<summary>Click to view the SSE synchronization hook implementation</summary>

```typescript
// oxlint-disable no-ternary
import type {
  Address,
  BankAccount,
  ContactInfo,
  Employment,
  Person,
} from "#src/webapp/types/person";
import {
  addressesCollection,
  bankAccountsCollection,
  contactsCollection,
  employmentsCollection,
  personsCollection,
} from "#src/webapp/db-collections/persons";
import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// Constants
// =============================================================================

const SSE_ENDPOINT = "/api/persons-stream";

// Flag to track when we're applying SSE changes
// This prevents SSE updates from triggering DynamoDB writes
let isApplyingSseChange = false;

/**
 * Check if currently applying an SSE change
 * Collection handlers can use this to skip server writes
 */
export const isFromSse = (): boolean => isApplyingSseChange;

// =============================================================================
// Types
// =============================================================================

type EntityType =
  | "person"
  | "address"
  | "bankAccount"
  | "contactInfo"
  | "employment";
type EventType = "INSERT" | "MODIFY" | "REMOVE";

interface ChangeEventData {
  timestamp?: string;
  eventType?: EventType;
  entityType?: EntityType;
  entity?: object | null;
  oldEntity?: object;
}

interface SseSyncState {
  isConnected: boolean;
  lastSyncTime: Date | null;
}

// =============================================================================
// Collection Update Functions
// =============================================================================

/**
 * Apply an INSERT change to the collection
 */
const applyInsert = (
  entityType: EntityType,
  entity: object | null | undefined,
): void => {
  if (!entity) {
    return;
  }

  // Note: TanStack DB collections handle duplicates gracefully
  // If the entity already exists, this becomes an update operation
  switch (entityType) {
    case "person":
      personsCollection.insert(entity as Person);
      break;
    case "address":
      addressesCollection.insert(entity as Address);
      break;
    case "bankAccount":
      bankAccountsCollection.insert(entity as BankAccount);
      break;
    case "contactInfo":
      contactsCollection.insert(entity as ContactInfo);
      break;
    case "employment":
      employmentsCollection.insert(entity as Employment);
      break;
  }
};

/**
 * Apply a MODIFY change to the collection
 */
const applyModify = (
  entityType: EntityType,
  entity: object | null | undefined,
): void => {
  if (!entity) {
    return;
  }

  const entityWithId = entity as { id: string };

  switch (entityType) {
    case "person":
      personsCollection.update(entityWithId.id, (draft) => {
        Object.assign(draft, entity);
      });
      break;
    case "address":
      addressesCollection.update(entityWithId.id, (draft) => {
        Object.assign(draft, entity);
      });
      break;
    case "bankAccount":
      bankAccountsCollection.update(entityWithId.id, (draft) => {
        Object.assign(draft, entity);
      });
      break;
    case "contactInfo":
      contactsCollection.update(entityWithId.id, (draft) => {
        Object.assign(draft, entity);
      });
      break;
    case "employment":
      employmentsCollection.update(entityWithId.id, (draft) => {
        Object.assign(draft, entity);
      });
      break;
  }
};

/**
 * Apply a REMOVE change to the collection
 */
const applyRemove = (
  entityType: EntityType,
  entity: object | null | undefined,
  oldEntity: object | undefined,
): void => {
  const entityWithId = entity as { id: string } | null | undefined;
  const oldEntityWithId = oldEntity as { id: string } | undefined;
  const removeId = entityWithId?.id ?? oldEntityWithId?.id;

  if (!removeId) {
    return;
  }

  switch (entityType) {
    case "person":
      personsCollection.delete(removeId);
      break;
    case "address":
      addressesCollection.delete(removeId);
      break;
    case "bankAccount":
      bankAccountsCollection.delete(removeId);
      break;
    case "contactInfo":
      contactsCollection.delete(removeId);
      break;
    case "employment":
      employmentsCollection.delete(removeId);
      break;
  }
};

/**
 * Apply a change event to the appropriate TanStack DB collection.
 * Only applies changes if they differ from current collection state.
 */
const applyChangeToCollection = (data: ChangeEventData): void => {
  if (!data.entityType || !data.eventType) {
    return;
  }

  switch (data.eventType) {
    case "INSERT":
      applyInsert(data.entityType, data.entity);
      break;
    case "MODIFY":
      applyModify(data.entityType, data.entity);
      break;
    case "REMOVE":
      applyRemove(data.entityType, data.entity, data.oldEntity);
      break;
  }
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for real-time SSE synchronization with TanStack DB.
 * Uses native EventSource to receive entity changes from the persons-stream endpoint.
 *
 * **IMPORTANT: Preventing Endless Loops**
 * This hook sets a global `isApplyingSseChange` flag when applying SSE changes.
 * Collection mutation handlers (onInsert/onUpdate/onDelete) should check `isFromSse()`
 * and skip DynamoDB writes when true. This breaks the loop:
 *
 * - SSE event -> isApplyingSseChange=true -> collection mutation -> onInsert checks isFromSse()
 *   -> returns true -> ✅ skips DynamoDB write
 * - Local user mutation -> isApplyingSseChange=false -> onInsert checks isFromSse()
 *   -> returns false -> ✅ writes to DynamoDB -> stream -> SSE event (handled above)
 *
 * This approach allows SSE to update local state without triggering server writes,
 * while user-initiated changes still persist to DynamoDB as expected.
 *
 * EventSource automatically handles reconnection using the `retry` directive from
 * the server. The server also sends a `reconnect` event before graceful timeout
 * to signal the client that a reconnection is expected.
 *
 * Based on the simple /api/events blueprint pattern.
 *
 * @returns Object with isConnected, lastSyncTime, and reconnect function
 */
export const useSseSync = (): SseSyncState & { reconnect: () => void } => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [state, setState] = useState<SseSyncState>({
    isConnected: false,
    lastSyncTime: null,
  });

  const connect = useCallback(() => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    const eventSource = new EventSource(SSE_ENDPOINT);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    };

    // Handle connection error - EventSource will automatically reconnect
    // Based on the retry directive from the server
    eventSource.onerror = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    // Handle 'connected' event from server
    eventSource.addEventListener("connected", () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    });

    // Handle 'change' events (entity changes)
    eventSource.addEventListener("change", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as ChangeEventData;

        // Set flag to indicate we're applying SSE changes
        // This prevents mutation handlers from writing back to DynamoDB
        isApplyingSseChange = true;
        try {
          applyChangeToCollection(data);
        } finally {
          // Always reset the flag, even if an error occurs
          isApplyingSseChange = false;
        }

        if (data.timestamp) {
          setState((prev) => ({
            ...prev,
            lastSyncTime: new Date(data.timestamp as string),
          }));
        }
      } catch {
        // Ignore parse errors
      }
    });

    // Handle 'reconnect' event (server signaling graceful close before timeout)
    // EventSource will automatically reconnect using the retry directive
    eventSource.addEventListener("reconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    });
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({ ...prev, isConnected: false }));
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    // Connect on mount
    connect();

    // Disconnect on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    reconnect,
  };
};
```

</details>

## Avoiding Infinite Loops

One of the most critical challenges when implementing real-time synchronization is preventing infinite loops. Without proper safeguards, the following cycle can occur:

1. SSE receives a change event from the server
2. Hook applies the change to the TanStack DB collection
3. Collection's `onUpdate`/`onInsert`/`onDelete` handler triggers
4. Handler writes the change back to DynamoDB
5. DynamoDB Stream captures this "new" change
6. Lambda writes it to the Events table
7. SSE endpoint streams it back to the client
8. **Loop repeats infinitely** ♾️

### The Solution: Global Flag Pattern

The implementation uses a module-level flag (`isApplyingSseChange`) to break this cycle. Here's how it works:

**When SSE Updates Occur:**

```
SSE event received
→ Set isApplyingSseChange = true
→ Apply change to collection
→ Collection handler checks isFromSse()
→ Returns true, so SKIP DynamoDB write ✅
→ Reset isApplyingSseChange = false
```

**When User Makes Changes:**

```
User modifies data
→ isApplyingSseChange = false
→ Apply change to collection
→ Collection handler checks isFromSse()
→ Returns false, so WRITE to DynamoDB ✅
→ DynamoDB Stream → Events table → SSE → Other clients
```

### Implementation in Collection Handlers

Your collection mutation handlers should implement this check:

<details>
<summary>Click to view example collection handler with loop prevention</summary>

```typescript
import { isFromSse } from "./useSseSync";

personsCollection = createCollection({
  // ... other config
  onInsert: async (person) => {
    // Check if this change came from SSE
    if (isFromSse()) {
      console.log("Skipping DynamoDB write - change from SSE");
      return; // Don't write back to DynamoDB
    }

    // This is a user-initiated change, write to DynamoDB
    await writeToDynamoDB(person);
  },
  onUpdate: async (person) => {
    if (isFromSse()) return;
    await updateDynamoDB(person);
  },
  onDelete: async (id) => {
    if (isFromSse()) return;
    await deleteFromDynamoDB(id);
  },
});
```

</details>

This pattern ensures that:

- ✅ SSE updates modify local state without server writes
- ✅ User changes persist to DynamoDB and propagate to other clients
- ✅ No infinite loops or duplicate operations
- ✅ Clean separation between sync and user-initiated changes

## Using the Hook in Components

To use the SSE synchronization in your React components, simply call the `useSseSync` hook:

<details>
<summary>Click to view example component usage</summary>

```typescript
import { useSseSync } from "./useSseSync";

function PersonsList() {
  const { isConnected, lastSyncTime, reconnect } = useSseSync();

  return (
    <div>
      <div className="sync-status">
        {isConnected ? (
          <span className="connected">🟢 Connected</span>
        ) : (
          <span className="disconnected">🔴 Disconnected</span>
        )}
        {lastSyncTime && (
          <span>Last sync: {lastSyncTime.toLocaleTimeString()}</span>
        )}
        <button onClick={reconnect}>Reconnect</button>
      </div>

      {/* Your persons list component */}
    </div>
  );
}
```

</details>

The hook automatically:

- Establishes the SSE connection on mount
- Applies incoming changes to TanStack DB collections
- Handles reconnection on errors or timeouts
- Cleans up the connection on unmount

## Cost Considerations

- **Long-Running Connections**: Each SSE connection keeps a Lambda instance running for up to 14 minutes
- **Concurrent Connections**: Each connected client requires a separate Lambda instance
- **Polling Overhead**: The 500ms polling interval means continuous DynamoDB queries, even when no changes occur

## Other Options

While SSE provides a good balance of simplicity and functionality, other approaches may be better suited for specific use cases:

### 1. WebSocket (Bidirectional)

**When to use:**

- Need bidirectional communication (client can send messages to server)
- High-frequency updates (many changes per second)
- Lower latency requirements
- Building chat or collaborative editing features

**Implementation:**

- AWS API Gateway WebSocket API
- Requires connection state management (connection IDs in DynamoDB)
- More complex than SSE but more flexible

### 2. Short Polling

**When to use:**

- Simple use case with infrequent updates
- Need to support older browsers without SSE
- Want explicit control over refresh timing

**Implementation:**

- Standard HTTP requests on an interval (e.g., every 5-10 seconds)
- Simpler than SSE but less efficient
- Higher latency than push-based approaches

### 3. GraphQL Subscriptions

**When to use:**

- Already using GraphQL (AWS AppSync)
- Need fine-grained subscription filtering
- Want managed infrastructure

**Implementation:**

- AWS AppSync with DynamoDB resolvers
- Built-in authorization and subscription management
- Higher per-request cost than Lambda

### 4. Custom WebSocket Collection (TanStack DB)

TanStack DB supports creating custom collections with bidirectional WebSocket synchronization. This is the most integrated approach but requires the most implementation effort.

**When to use:**

- Need full bidirectional sync (client changes immediately propagate)
- Want conflict resolution at the collection level
- Building offline-first applications

**Resources:**

- [TanStack DB Collection Options Guide](https://tanstack.com/db/latest/docs/guides/collection-options-creator#complete-example-websocket-collection)
- Requires implementing custom WebSocket server and protocol
- Most complex option but provides the richest synchronization features

## Conclusion

This implementation demonstrates how to build real-time data synchronization between AWS DynamoDB and TanStack DB using Server-Sent Events. The key takeaways are:

1. **DynamoDB Streams + Events Table**: Provides a reliable, queryable change log
2. **SSE with TanStack Router**: Simple, standards-based approach to server push
3. **Loop Prevention**: Critical pattern using a global flag to prevent infinite updates
4. **Automatic Reconnection**: Built-in browser support makes SSE resilient
5. **Cost Awareness**: Monitor Lambda and DynamoDB costs, especially with many concurrent connections

The SSE approach works well for:

- ✅ Applications with moderate update frequency (seconds to minutes)
- ✅ Primarily server-to-client updates
- ✅ Standard web browsers
- ✅ Simple implementation requirements

For applications requiring bidirectional real-time communication, lower latency, or offline support, consider WebSocket or TanStack DB's custom collection approach.

## Source Code

The complete implementation is available on GitHub:

- [Repository Tag: 2026-01-08-tanstack-start-aws-db-multiple-entities-sse](https://github.com/JohannesKonings/tanstack-aws/tree/2026-01-08-tanstack-start-aws-db-multiple-entities-sse)
- [Pull Request #13 - Implementation](https://github.com/JohannesKonings/tanstack-aws/pull/13)

## References

- [AWS DynamoDB Streams Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
- [Server-Sent Events (Wikipedia)](https://en.wikipedia.org/wiki/Server-sent_events)
- [MDN: EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [TanStack DB Collection Options](https://tanstack.com/db/latest/docs/guides/collection-options-creator)
- [ElectroDB Issue #74 - Change Tracking](https://github.com/tywalch/electrodb/issues/74)
- [TanStack Router File Routes](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)
