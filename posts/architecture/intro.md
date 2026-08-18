---
title: Pipelining, from scratch
era: fundamentals
readTime: 9 min read
excerpt: Why modern CPUs don't run one instruction at a time, and what that costs you.
floats: monitor.svg, monitor_cute.svg, mouse.svg, keyboard.svg, lantern.svg, star.svg 
background: monitor_cute.png
---

## The assembly-line idea

A single instruction moves through several stages to execute — fetch, decode, execute, memory access, writeback. Without pipelining, the CPU finishes every stage of one instruction before starting the next. Pipelining overlaps these stages instead, the same way an assembly line overlaps work on multiple cars at once.

## Throughput vs. latency

A pipeline doesn't make any single instruction finish faster — it still passes through five stages. What improves is throughput: once the pipeline is full, a new instruction can complete every cycle instead of every five cycles, because five different instructions are mid-flight at once.

```text
cycle:     1    2    3    4    5    6
instr 1:  IF   ID   EX   MEM  WB
instr 2:       IF   ID   EX   MEM  WB
instr 3:            IF   ID   EX   MEM
```

## Hazards break the illusion

The overlap only works cleanly when instructions don't depend on each other. When they do — one instruction needs a result the previous one hasn't produced yet, or a branch changes which instruction should even be fetched next — the pipeline has to stall, forward data early, or discard work it already started. Most of the complexity in a modern pipeline exists to handle exactly these cases.

Further reading: [the Wikipedia overview of instruction pipelining](https://en.wikipedia.org/wiki/Instruction_pipelining) is a good next stop.