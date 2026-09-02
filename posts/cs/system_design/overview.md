---
title: System Design overview
era: Topics and Subtopics
readTime: 10 min read
excerpt: Listing out 13 Topics along with their subtopics
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/system_design.png
---
## [1. Fundamentals](./1_fundamentals.md)
1. What is System Design?
2. Functional vs. Non-Functional Requirements
3. Horizontal vs. Vertical Scaling
4. Capacity Estimation
5. Latency, Throughput & Availability
6. Threads & Processes
7. What is Thrashing?
8. Basic System Design Concepts

## [2. Networking & Communication](./2_Networking.md)
1. Internet & TCP/IP Stack
2. DNS
3. HTTP / HTTPS
4. TCP vs. UDP
5. REST APIs
6. API Design
7. Synchronous vs. Asynchronous Communication
8. Pull vs. Push
9. WebSockets
10. Server-Sent Events
11. What Happens When You Enter google.com?

## [3. Scalability & Performance](./3_scalability.md)
1. Horizontal Scaling
2. Vertical Scaling
3. Capacity Estimation
4. Load Balancing
    1. Load Balancing Algorithms
    2. Health Checks
5. Rate Limiting
6. Distributed Rate Limiting
7. Performance Optimization
8. Memory vs. Latency
9. Throughput vs. Latency

## [4. Distributed Systems](./4_distributed_systems.md)
1. Introduction to Distributed Systems
2. Consistent Hashing
3. Partitioning
    1. Sharding
4. Data Replication
5. Data Consistency
    1. Consistency Models
    2. Consistency Levels
6. Transaction Isolation Levels
7. CAP Theorem
8. Service Discovery
9. Heartbeats
10. Distributed Coordination
11. Distributed Caching
12. Anomaly Detection

## [5. Databases & Data Storage](./5_databases.md)
1. Relational Databases
    1. SQL
    2. Tables
    3. Joins
    4. ACID Transactions
2. Database Indexes
3. NoSQL Databases
    1. Key-Value Databases
    2. Document Databases
    3. Wide-Column Databases
    4. Graph Databases
4. SQL vs. NoSQL
5. Database Replication
6. Database Partitioning
    1. Sharding
7. Database Optimization
8. Database Migrations
9. Geospatial / Location-Based Databases
10. Bloom Filters
11. Data Modeling

## [6. Caching & Content Delivery](./6_caching.md)
1. What is Caching?
2. Cache Architecture
3. Cache-Aside
4. Read-Through Cache
5. Write Policies
    1. Write-Through
    2. Write-Behind
    3. Write-Around
6. Replacement Policies
    1. LRU
    2. LFU
    3. FIFO
7. Cache Invalidation
8. Distributed Caching
9. Content Delivery Networks (CDN)

## [7. System Architecture](./7_system_architecture.md)
1. Monolith Architecture
2. Microservices Architecture
3. Monolith vs. Microservices
4. Migrating Monoliths to Microservices
5. API Gateway
6. Message Queues
7. Publisher-Subscriber Model
8. Event-Driven Architecture
9. Asynchronous APIs
10. Database as a Message Queue

## [8. Reliability & Resilience](./8_reliability.md)
1. Availability
2. Single Point of Failure
3. Redundancy
4. Replication
5. Failover
6. Cascading Failures
7. Circuit Breakers
8. Retries
9. Timeouts
10. Idempotency
11. Disaster Recovery
12. Fault Tolerance

## [9. Security & Authentication](./9_security.md)
1. Authentication
2. Authorization
3. OAuth
4. Token-Based Authentication
    1. JWT
    2. Refresh Tokens
5. Session-Based Authentication
6. Access Control
    1. ACL
    2. RBAC
    3. Rule Engines
7. API Security

## [10. Infrastructure & DevOps](./10_devops.md)
1. Servers & Deployment
2. Containers
    1. Docker
3. Container Orchestration
    1. Kubernetes
4. Service Discovery
5. Load Balancers
6. Cloud Infrastructure
7. Infrastructure as Code
8. CI/CD
9. Monitoring
10. Logging
11. Alerting

## [11. Design Trade-offs](./11_tradeoffs.md)
1. Pull vs. Push
2. Memory vs. Latency
3. Throughput vs. Latency
4. Consistency vs. Availability
5. Latency vs. Accuracy
6. SQL vs. NoSQL
7. Cost vs. Performance
8. Consistency vs. Performance
9. Simplicity vs. Scalability
10. Reliability vs. Cost

## [12. High-Level Design (HLD)](./12_hld.md)
1. Requirements Gathering
    1. Functional Requirements
    2. Non-Functional Requirements
2. Back-of-the-Envelope Estimation
    1. Traffic Estimation
    2. Storage Estimation
    3. Bandwidth Estimation
    4. Server Estimation
3. API Design
4. Data Model Design
5. Component Identification
6. Data Flow
7. System Architecture
8. Database Selection
9. Scaling Strategy
10. Caching Strategy
11. Reliability & Failure Handling
12. Security Considerations
13. Bottleneck Analysis
14. HLD Practice Problems
    1. Live Streaming App
    2. Instagram
    3. Tinder
    4. WhatsApp
    5. TikTok
    6. Online Coding Judge
    7. UPI Payments
    8. IRCTC
    9. Netflix
    10. DoorDash
    11. Amazon
    12. Google Maps
    13. Gmail
    14. Chess Website
    15. Uber
    16. Google Docs

## [13. Low-Level Design (LLD)](./13_lld.md)
1. Object-Oriented Programming
    1. Classes & Objects
    2. Encapsulation
    3. Abstraction
    4. Inheritance
    5. Polymorphism

2. Object-Oriented Design
    1. Identifying Classes
    2. Identifying Relationships
    3. Object Responsibilities

3. SOLID Principles
    1. Single Responsibility Principle
    2. Open-Closed Principle
    3. Liskov Substitution Principle
    4. Interface Segregation Principle
    5. Dependency Inversion Principle

4. UML
    1. Class Diagrams
    2. Sequence Diagrams
    3. Use Case Diagrams
    4. State Diagrams
    5. Activity Diagrams

5. Design Patterns
    1. Creational Patterns
    2. Structural Patterns
    3. Behavioral Patterns

6. Class Design
    1. Interfaces
    2. Abstract Classes
    3. Composition
    4. Dependency Management

7. Concurrency in LLD
    1. Thread Safety
    2. Locks
    3. Concurrent Objects

8. LLD Practice Problems
    1. Parking Lot
    2. Elevator
    3. Splitwise
    4. Vending Machine
    5. Coffee Machine
    6. Chess
    7. BookMyShow
    8. Hotel Management System