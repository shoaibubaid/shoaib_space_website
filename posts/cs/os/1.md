---
title: OS Unit 1 -  Introduction and OS Structure
subject: OS
unit: 1
id: OS-1
tags: [kernel, system-calls, interrupts, dual-mode, boot]
prerequisites: []
next: OS-2
readTime: 30 min read
excerpt: What is Operating Systems
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/os.png
---

# Unit 1: Introduction and OS Structure

> **How to use this page.** Every section heading carries an ID (for example `OS-1.5`). Practice questions are tagged with these IDs, so if you miss a question on system calls, jump straight to `OS-1.5`. Arrows like **→ OS-6.1** point to where an idea is developed further.

This unit answers three questions: *what* an OS is responsible for, *how* the hardware lets it stay in control while user programs run at full speed, and *how* it is organized internally. Almost every later unit builds on the mechanisms here, especially interrupts, traps, dual-mode operation, and system calls.

---

## OS-1.1 · Role of an Operating System

### Definition

An operating system is the software layer that sits between hardware and application programs. It has two jobs that pull in slightly different directions:

1. **Provide abstractions.** Raw hardware is awkward: disks are arrays of sectors, the CPU is a single instruction stream, memory is one flat array of bytes. The OS turns these into convenient abstractions: *files*, *processes*, and *virtual address spaces*.
2. **Manage and protect resources.** Many programs (and users) share the same CPU, memory, disks and network. The OS decides who gets what, when, and makes sure one program cannot damage another or the OS itself.

### The three big ideas (OSTEP's framing)

OSTEP organizes the entire subject into three pillars. It is a good mental map for this whole course:

| Pillar | What the OS does | Units |
|---|---|---|
| **Virtualization** | Makes one physical resource look like many private ones. Each process believes it has its own CPU and its own memory. | 2, 3, 6, 7 |
| **Concurrency** | Handles many things happening at once correctly: threads sharing data, interrupts arriving mid-operation. | 2, 4, 5 |
| **Persistence** | Stores data reliably across crashes and power loss. | 8, 9, 10 |

**Virtualizing the CPU:** if you run four copies of a program on a one-core machine, all four appear to make progress simultaneously. The OS is rapidly switching between them (time-sharing), creating the illusion of four CPUs.

**Virtualizing memory:** two running copies of the same program may both print that a variable lives at address `0x200000`, yet they hold different values. Each has its own *virtual* address space that the OS and hardware map to different physical memory (→ OS-6.1).

### Goals of an OS

- **Convenience:** make the computer easy to program and use.
- **Efficiency:** keep expensive hardware (CPU, disk) busy and minimize overhead.
- **Protection and isolation:** faults or malice in one program must not affect others.
- **Reliability:** the OS itself must not crash, because everything depends on it.
- **Other goals:** energy efficiency (phones, laptops), security, portability across hardware, and fairness.

These goals conflict. Maximum protection costs performance; maximum throughput may hurt response time. Much of OS design is about choosing trade-offs.

### Kernel vs "the OS"

- The **kernel** is the core that runs in privileged (kernel) mode at all times it is executing: scheduling, memory management, device drivers, file systems, system call handling.
- The broader **operating system** also includes system libraries (like `glibc`), the shell, utilities (`ls`, `cp`), and sometimes the GUI. These run as ordinary user programs.

When textbooks or interviewers say "the OS does X," they almost always mean the kernel.

### Mechanism vs policy

A principle that recurs in every unit:

- **Mechanism** = *how* something is done (for example, the code that saves one process's registers and loads another's: the context switch).
- **Policy** = *which/when* decisions (for example, which process to run next: the scheduling algorithm).

Separating them lets you change policy (swap FCFS for round robin) without rewriting mechanism. Microkernels push this idea furthest (→ OS-1.6).

---

## OS-1.2 · Types of Operating Systems

The types below are best understood historically, since each solved a weakness of the previous one.

### Serial processing and simple batch systems

Early machines ran one job at a time, loaded by an operator. **Batch systems** grouped similar jobs and ran them one after another under a small *resident monitor*. There was no interaction with the user while a job ran.

**Weakness:** when the running job waits for I/O (for example, a tape read), the CPU sits idle. I/O devices are thousands of times slower than the CPU, so utilization is poor.

### Multiprogramming

Keep **several jobs in memory at once**. When the running job blocks for I/O, the OS switches the CPU to another ready job.

- **Goal:** maximize CPU utilization.
- **Degree of multiprogramming** = number of processes in memory.
- Requires: memory management (several programs in memory), CPU scheduling (choose the next job), and protection (jobs must not overwrite each other).

A switch happens only when a job voluntarily gives up the CPU (usually by doing I/O). A job that never does I/O can hog the CPU.

### Time-sharing (multitasking)

A logical extension of multiprogramming: switch between jobs **so frequently** (every few milliseconds, driven by a hardware timer) that each user can interact with their program as if they had the machine to themselves.

- **Goal:** minimize response time for interactive users.
- Requires everything multiprogramming does, plus a timer interrupt to force switches (→ OS-1.4), plus usually virtual memory and a file system.

| | Multiprogramming | Time-sharing |
|---|---|---|
| Primary goal | CPU utilization | Response time |
| When switch happens | Job blocks (voluntary) | Timer expires or job blocks |
| Interactivity | Not required | Essential |

Every time-sharing system is a multiprogramming system, but not the other way round.

### Multiprocessor systems

More than one CPU (or core) sharing memory.

- **Symmetric multiprocessing (SMP):** every processor runs the same OS and can run any task, including kernel code. All modern desktop and server OSes.
- **Asymmetric multiprocessing (AMP):** one master processor runs the OS and assigns work to others. Simpler but the master is a bottleneck.

Benefits: throughput, and in some designs fault tolerance. Note that N processors never give an N× speedup because of synchronization overhead and serial portions of work (Amdahl's law → OS-2.7).

### Distributed systems

A collection of separate computers (each with its own memory) connected by a network, cooperating to appear as a single system to the user. Loosely coupled, unlike multiprocessors, which are tightly coupled through shared memory.

### Real-time operating systems (RTOS)

Correctness depends not only on the result but on **when** it is produced.

- **Hard real-time:** missing a deadline is a system failure (airbag controller, pacemaker, anti-lock brakes). These systems avoid anything with unpredictable timing, such as demand paging and disk-backed virtual memory.
- **Soft real-time:** missing a deadline degrades quality but is tolerable (video streaming, audio playback). General-purpose OSes like Linux offer soft real-time scheduling classes.

The key property of an RTOS is **predictability (determinism)**, not raw speed.

### Embedded and mobile systems

Embedded OSes run on devices with a fixed purpose and limited resources (routers, washing machines). Mobile OSes (Android, iOS) are full general-purpose OSes tuned for battery life, touch interaction, and strict app sandboxing.

---

## OS-1.3 · Computer System Organization

### Basic structure

A computer consists of one or more CPUs and several **device controllers** connected by a shared bus to main memory.

```
   +-------+   +-------+
   |  CPU  |   |  CPU  |
   +---+---+   +---+---+
       |           |
  =====+===========+============+=================  system bus
       |                        |              |
  +----+-----+          +-------+-----+   +----+--------+
  |  Memory  |          | Disk ctrl   |   |  USB ctrl   |
  +----------+          | (buffer,    |   | (buffer,    |
                        |  registers) |   |  registers) |
                        +------+------+   +------+------+
                               |                 |
                             disks        keyboard, mouse
```

- Each **device controller** is a small piece of hardware in charge of one device type. It has a local buffer and a few registers (status, command, data).
- The OS talks to each controller through a **device driver**, a piece of kernel code that knows that controller's registers and protocol (→ OS-10.5).
- CPUs and devices run **concurrently** and compete for memory access.

The fundamental problem: how does the CPU find out that a slow device has finished its work? It can keep asking (**polling**), or the device can tell it (**interrupts**).

### Interrupts

An **interrupt** is a hardware signal from a device to the CPU saying "I need attention." It is **asynchronous**: it can arrive between any two instructions, unrelated to what the CPU is executing.

What happens when an interrupt arrives:

1. The CPU finishes the current instruction.
2. It saves minimal state (at least the program counter and flags) and switches to kernel mode.
3. It uses the interrupt number to index the **interrupt vector table** (on x86, the *Interrupt Descriptor Table*, IDT), which holds the address of the handler for each interrupt number.
4. It jumps to the **interrupt service routine (ISR)**, which saves any further registers it will use, services the device, and acknowledges the interrupt.
5. The ISR restores state and executes a return-from-interrupt instruction (`iret` on x86), which returns to the interrupted code and restores the previous mode.

The interrupted program never knows anything happened. Important details:

- **The vector table is set up by the kernel at boot** and the instruction to load its address (`lidt` on x86) is privileged. If a user could change it, they could take control of the machine on the next interrupt.
- **Maskable vs non-maskable:** most interrupts can be temporarily disabled (masked) by the kernel during critical code. Non-maskable interrupts (NMI) are reserved for events like hardware failures.
- **Priorities and nesting:** higher-priority interrupts can interrupt lower-priority handlers.
- **Top half / bottom half (Linux):** ISRs must be short because interrupts may be disabled while they run. Linux splits work into a fast "top half" that runs immediately and a deferred "bottom half" (softirqs, tasklets, workqueues) that runs later with interrupts enabled.

### Traps, faults, and aborts (exceptions)

Not every event comes from a device. The CPU itself can raise an event while executing an instruction. These are **synchronous**: caused directly by the current instruction, so they recur if you re-run the same instruction with the same state.

Terminology varies by textbook. The Intel-style classification used by most courses:

| Event | Sync/async | Cause | After handling, execution resumes at... | Example |
|---|---|---|---|---|
| **Interrupt** | Async | External device | Next instruction | Timer tick, key press, disk done |
| **Trap** | Sync, intentional | Instruction meant to enter kernel | Next instruction | `syscall`, `int 0x80` |
| **Fault** | Sync, possibly recoverable | Instruction hit a problem the OS may fix | **Same** instruction (retried) | Page fault |
| **Abort** | Sync, unrecoverable | Serious hardware error | Does not resume; process or system terminated | Machine check |

A very common interview point: a **page fault** is a fault because the kernel may load the missing page and then **re-execute the faulting instruction**, which now succeeds (→ OS-7.1). If the kernel decides the access is illegal, it instead sends the process a signal (`SIGSEGV`), and that is what we call a "segfault."

On x86, vectors 0 to 31 are reserved for CPU exceptions (0 = divide error, 13 = general protection fault, 14 = page fault), and higher vectors are used for device interrupts and software traps. Some books, including OSTEP, loosely use "trap" for all synchronous entries into the kernel. Know both usages.

### Storage hierarchy

Storage systems form a hierarchy trading speed against size, cost, and volatility.

| Level | Typical access time | Typical size | Managed by | Volatile? |
|---|---|---|---|---|
| Registers | < 1 ns | < 1 KB | Compiler | Yes |
| L1 / L2 / L3 cache | ~1 / ~4 / ~15 ns | KB to tens of MB | Hardware | Yes |
| Main memory (DRAM) | ~60 to 100 ns | GBs | OS | Yes |
| SSD (NVMe) | ~10 to 100 µs | 100s of GB to TBs | OS | No |
| Hard disk | ~5 to 10 ms | TBs | OS | No |
| Tape / archival | seconds | PBs | OS / software | No |

Numbers are orders of magnitude, not exact. The key takeaway: from DRAM to HDD is roughly a **100,000× gap**. This single fact motivates caching, buffering, page replacement, and disk scheduling.

**Caching** is the unifying idea: keep a copy of frequently used data in faster storage. It works because of **locality of reference**:

- *Temporal locality:* recently used data is likely to be used again soon.
- *Spatial locality:* data near recently used data is likely to be used soon.

Caching appears at every level: CPU caches over DRAM, the TLB over page tables (→ OS-6.5), the page cache in DRAM over disk (→ OS-10.3). With multiple copies comes the **coherence** problem: if data is modified in one place, other copies must be updated or invalidated. On multiprocessors, hardware keeps CPU caches coherent.

### How devices transfer data: polling, interrupts, DMA

Briefly (full treatment → OS-10.2):

- **Polling (programmed I/O):** CPU repeatedly reads the device status register. Wastes CPU time if the device is slow, but is actually efficient for very fast devices.
- **Interrupt-driven I/O:** CPU starts the operation, does other work, and the device interrupts when done. Costs one interrupt per unit of data transferred.
- **Direct Memory Access (DMA):** for bulk transfers, the controller copies an entire block directly between device and memory and interrupts **once** at the end. The CPU only sets up the transfer.

---

## OS-1.4 · Dual-Mode Operation and Protection

### The core problem: limited direct execution

The fastest way to run a program is to let it execute directly on the CPU. But if a program runs directly with full control, two things can go wrong:

1. **It can do something forbidden:** write to the disk directly, overwrite another program's memory, or reprogram the interrupt table.
2. **It might never give the CPU back:** a program stuck in `while(1);` would freeze the machine. The OS is just code, and while the user program runs, OS code is *not* running.

OSTEP calls the solution **limited direct execution**: run programs directly for speed, but with *hardware-enforced limits* on what they can do and a guaranteed way for the OS to regain control. The hardware provides two features for this: **dual-mode operation** and a **timer interrupt**.

### User mode and kernel mode

The CPU has a **mode bit** (or privilege level) that indicates which mode the current code is running in:

- **Kernel mode** (supervisor, privileged, ring 0): all instructions allowed, all memory accessible.
- **User mode** (ring 3 on x86): only a safe subset of instructions allowed; memory access restricted to the process's own address space.

x86 actually has four rings (0 to 3), but mainstream OSes use only ring 0 (kernel) and ring 3 (user). The current privilege level is stored in the low 2 bits of the `CS` register.

### Privileged instructions

Instructions that could harm the system or other programs are **privileged**: executing them in user mode causes an exception instead. Typical examples:

- Performing I/O directly (`in`/`out` on x86)
- Changing the page table base register (`CR3` on x86), which controls what memory is visible (→ OS-6.4)
- Loading the interrupt descriptor table (`lidt`)
- Enabling or disabling interrupts (`cli`/`sti`)
- Setting the timer
- Halting the CPU (`hlt`)
- Switching into kernel mode directly

Instructions that are **not** privileged: arithmetic, ordinary loads/stores to the process's own memory, jumps, function calls, and the `syscall` instruction itself (which is how user code *asks* to enter the kernel, in a controlled way).

**What happens if user code runs a privileged instruction?** The CPU raises an exception (general protection fault on x86), control transfers to the kernel's handler, and the kernel typically terminates the process with a signal (`SIGSEGV` or `SIGILL` on Linux). The instruction never takes effect.

### Mode transitions

```
             system call (trap), interrupt, or exception
   +-------------+ -----------------------------------> +---------------+
   |  User mode  |                                      |  Kernel mode  |
   |  (mode = 1) | <----------------------------------- |  (mode = 0)   |
   +-------------+   return-from-trap (sysret / iret)   +---------------+
```

- User → kernel happens **only** through a trap, interrupt, or exception, and always lands at an address the kernel configured in advance (the trap/interrupt table). User code cannot choose where in the kernel it enters.
- Kernel → user happens through a special return instruction that restores user registers and lowers privilege at the same time.

### The timer: guaranteeing the OS regains control

Dual mode stops a program from doing forbidden things, but not from running forever. Two historical approaches:

- **Cooperative approach:** trust programs to make system calls or explicitly `yield()` often. The OS gets control only then. A buggy infinite loop hangs the entire machine; the only fix is rebooting. Early Mac OS and Windows 3.x worked like this.
- **Non-cooperative approach:** the kernel programs a hardware **timer** to raise an interrupt every few milliseconds. When it fires, the interrupt handler runs in kernel mode and the OS can decide to switch to another process (→ OS-2.2, OS-3.2). Setting the timer is privileged, so a process cannot disable it.

### Kernel stack

Each process has a **user stack** (in its address space) and a separate **kernel stack** (in kernel memory). On entry to the kernel, the CPU switches to the kernel stack before saving registers. Reasons:

- The user stack pointer might be invalid or malicious; the kernel cannot trust it.
- Another thread of the same process could modify the user stack while the kernel is using it.
- Kernel data on the user stack would be visible to the user program.

On x86, the address of the kernel stack is found in the Task State Segment (TSS), which the kernel sets up.

### Mode switch vs context switch

This distinction is a favourite interview question:

| | Mode switch | Context switch |
|---|---|---|
| What changes | Privilege level (user ↔ kernel) | Which process/thread runs on the CPU |
| Same process? | Yes | No, a different one |
| Cost | Relatively cheap (tens to hundreds of ns) | More expensive: save/restore full state, switch address space, cold caches and TLB |
| Example | `getpid()` enters kernel and returns to the same process | Timer interrupt; scheduler picks another process |

Every context switch involves a mode switch (the scheduler runs in the kernel), but most mode switches do **not** involve a context switch.

### Memory protection preview

The mode bit alone does not stop a user program from reading another program's memory with ordinary load instructions. For that, the hardware checks every memory access: in the simplest scheme against **base and limit** registers, in modern systems through **page tables** with per-page permission bits. Only kernel mode can change these (→ OS-6.1, OS-6.4).

---

## OS-1.5 · System Calls

### What and why

A **system call** is the programmatic interface through which a user program requests a service from the kernel: reading a file, creating a process, allocating memory, sending network data. Because user code cannot execute privileged instructions or access kernel memory, *every* interaction with hardware or shared resources must go through a system call.

### Categories

| Category | Purpose | UNIX / Linux examples | Windows examples |
|---|---|---|---|
| Process control | Create, terminate, wait for processes | `fork`, `execve`, `exit`, `wait`, `kill` | `CreateProcess`, `ExitProcess`, `WaitForSingleObject` |
| File management | Create, open, read, write, close files | `open`, `read`, `write`, `close`, `lseek`, `unlink` | `CreateFile`, `ReadFile`, `WriteFile`, `CloseHandle` |
| Device management | Request/release devices, control them | `ioctl`, `read`, `write` | `DeviceIoControl` |
| Information maintenance | Get/set time, process info, system data | `getpid`, `alarm`, `sleep`, `uname` | `GetCurrentProcessId`, `SetTimer`, `Sleep` |
| Communication | Pipes, shared memory, sockets | `pipe`, `shmget`, `mmap`, `socket`, `send` | `CreatePipe`, `CreateFileMapping` |
| Protection | Set permissions and ownership | `chmod`, `chown`, `umask` | `SetFileSecurity` |

Note how UNIX reuses `read`/`write` for files, devices, pipes and sockets. "Everything is a file" (a file descriptor) is one of UNIX's most important design decisions.

### API vs system call

Programmers rarely invoke system calls directly. They call functions in a library, which on Linux is usually **glibc**. The standard interface for these functions on UNIX-like systems is **POSIX**.

- Some library functions are thin **wrappers** around one system call: `write()`, `read()`, `fork()`.
- Some call system calls only sometimes: `printf()` formats into a user-space buffer and calls `write()` only when the buffer must be flushed; `malloc()` calls `brk()` or `mmap()` only when it needs more memory from the kernel.
- Some never enter the kernel at all: `strlen()`, `memcpy()`, `qsort()`.

Why use an API instead of raw system calls? **Portability** (the same POSIX code compiles on Linux, macOS and BSD even though their system call numbers differ) and **convenience** (buffering, formatting, error handling).

### Anatomy of a system call (x86-64 Linux)

Consider `write(1, "hi\n", 3)`:

```
 USER MODE                                   KERNEL MODE
 ---------                                   -----------
 main() calls write(1, buf, 3)
   |
   v
 glibc wrapper:
   rax <- 1 (syscall number of write)
   rdi <- 1, rsi <- buf, rdx <- 3
   executes `syscall` instruction  ------>  CPU: switch to ring 0, jump to address
                                            the kernel stored in an MSR at boot
                                              |
                                              v
                                            entry code: switch to kernel stack,
                                            save user registers
                                              |
                                              v
                                            look up sys_call_table[rax]
                                            -> ksys_write(1, buf, 3)
                                            validate fd and buffer pointer,
                                            copy data from user memory,
                                            do the work
                                              |
                                              v
                                            put result in rax, restore registers
   <----------------------------------------  `sysret`: back to ring 3
 wrapper checks rax:
   if -4095 <= rax <= -1:
       errno = -rax; return -1
   else return rax (bytes written)
```

Key points:

1. **The system call is identified by a number**, not an address. The kernel keeps a table (`sys_call_table`) indexed by that number. User code cannot jump to arbitrary kernel addresses; it can only ask for service number N, and the kernel validates N.
2. **The entry point is fixed by the kernel** at boot (on x86-64, the address is written to a model-specific register by privileged code). This is the **trap table** idea from OSTEP: the OS tells the hardware, once, where its handlers are.
3. **Arguments pass in registers.** On x86-64 Linux: `rax` = number; arguments in `rdi, rsi, rdx, r10, r8, r9`; return value in `rax`. When there are more arguments than registers, systems pass a pointer to a block in memory, or use the stack.
4. **The kernel must never trust user pointers.** If the user passes a kernel address as the buffer for `read()`, a naive kernel would overwrite its own memory on the user's behalf. Linux uses functions like `copy_from_user()` and `copy_to_user()` that check the address belongs to user space and handle faults safely.
5. **Error convention:** the raw system call returns a negative error code; the glibc wrapper converts it into `-1` with `errno` set (for example `EBADF`, `ENOENT`, `EINTR`). Always check return values: TLPI stresses this throughout.

Older 32-bit Linux used the software interrupt `int 0x80` instead of `syscall`. It works the same way conceptually but is slower.

### The same idea in xv6

IITB's OS course uses the teaching OS **xv6**, where the flow is easier to read:

1. The user library puts the system call number in `eax` and executes `int $64` (`T_SYSCALL`).
2. Hardware switches to the kernel stack and jumps to the handler registered in the IDT for vector 64.
3. Assembly code (`alltraps`) pushes all registers, building a **trap frame** on the kernel stack.
4. `trap()` sees the vector is `T_SYSCALL` and calls `syscall()`, which reads `eax` from the trap frame and calls the matching function from its table.
5. The return value is written into the trap frame's `eax`, so when registers are restored and `iret` executes, the user sees the result.

Reading `trap.c` and `syscall.c` in xv6 is the single best way to make this concrete.

### Seeing system calls: `strace`

On Linux, `strace` shows every system call a program makes:

```c
#include <stdio.h>
int main(void) {
    printf("hello\n");
    return 0;
}
```

```
$ strace ./hello
execve("./hello", ["./hello"], ...) = 0
brk(NULL)                               = 0x55d4c2a1f000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, ...) = 0x7f...
...                                        (loader maps libc)
write(1, "hello\n", 6)                  = 6
exit_group(0)                           = ?
```

There is no `printf` in the trace, because `printf` is a library function. What reaches the kernel is `write`. There is also a lot of activity before `main` even runs: `execve`, then the dynamic loader mapping shared libraries with `mmap`.

### Buffering and system call cost

A system call is much more expensive than a function call: the mode switch itself, saving and restoring registers, security checks, and pollution of caches and the TLB. Mitigations for CPU vulnerabilities (like Meltdown's KPTI, which switches page tables on every kernel entry) made entries more expensive still.

Consequences you should know:

- **User-space buffering:** stdio (`printf`, `fputs`) collects output in a buffer and issues one `write` for many calls. By default, stdout is **line-buffered** when connected to a terminal and **fully buffered** when redirected to a file or pipe; stderr is **unbuffered**. This is why output can appear in a surprising order, and why `printf` before `fork` can print twice (→ OS-2.3).
- **Kernel-side tricks:** some frequently used calls such as `gettimeofday` and `clock_gettime` are served through the **vDSO**, a small piece of kernel-provided code mapped into every process, which reads the time without entering the kernel at all.
- **Batching interfaces:** `readv`/`writev`, `sendfile`, and `io_uring` reduce the number of kernel entries (→ OS-10.4).

---

## OS-1.6 · Kernel Architectures

The question here is: which OS services run in kernel mode, and which run as ordinary user processes? Putting more in the kernel is faster (no mode switches between components) but riskier (a bug anywhere can crash everything).

### Simple / monolithic kernels

The entire OS (scheduler, memory manager, file systems, network stack, device drivers) runs as **one large program in kernel mode**, sharing one address space. Components call each other directly with ordinary function calls.

- **Examples:** original UNIX, Linux, BSD. MS-DOS was an extreme "simple structure" with no protection at all.
- **Pros:** fast, since components communicate via function calls; mature and well understood.
- **Cons:** a bug in any driver can crash or compromise the whole system; large trusted code base; harder to maintain.

### Layered approach

The OS is divided into layers, from hardware (layer 0) to the user interface (layer N). Each layer uses only the services of the layers below it.

- **Pros:** easier to build and debug one layer at a time.
- **Cons:** hard to define layers cleanly (should the memory manager be below the disk driver, or vice versa? Each needs the other). Every request passes through several layers, adding overhead. Pure layered systems are rare today; Dijkstra's THE system is the classic example.

### Microkernels

Move as much as possible **out of the kernel into user-space processes (servers)**. The kernel keeps only the minimum that must be privileged:

- Low-level address space management
- Thread management and basic scheduling
- **Inter-process communication (IPC)**, usually message passing

File systems, device drivers, and network stacks run as user-level servers. An application reading a file sends a message to the file server through the kernel.

```
 Monolithic:                         Microkernel:
 +-----------------------------+     +------+ +-------+ +--------+ +------+
 |  App   |   App   |   App    |     | App  | | File  | | Device | | Net  |   user
 +-----------------------------+     |      | | server| | driver | |server|   mode
 | FS | Net | Drivers | Sched  |     +------+ +-------+ +--------+ +------+
 | Memory mgmt | IPC | ...     |        ^  |   messages   ^  |
 +-----------------------------+     +--|--v--------------|--v------------+
 |          Hardware           |     | Microkernel: IPC, threads, mem     |   kernel
 +-----------------------------+     +------------------------------------+
                                     |             Hardware               |
                                     +------------------------------------+
```

- **Examples:** Mach, MINIX 3, QNX (widely used in cars and embedded systems), L4 family, seL4 (formally verified).
- **Pros:** reliability (a crashed driver can be restarted without rebooting); security (a small trusted kernel is easier to verify); extensibility; clean mechanism/policy separation.
- **Cons:** performance. A single operation may need several messages, each costing mode switches and possibly context switches. Early microkernels like Mach were notably slow; L4 showed that careful IPC design narrows the gap a lot.

### Modular kernels (loadable kernel modules)

A monolithic core that can **load and unload modules at runtime**: device drivers, file systems, network protocols. Modules run in kernel mode, so they are as fast as built-in code, but they need not be compiled into the kernel image.

- **Example:** Linux (`insmod`, `rmmod`, `lsmod`), Solaris.
- This gives much of the flexibility of a microkernel while keeping monolithic performance. It does **not** give microkernel-style fault isolation: a buggy module can still crash the kernel.

### Hybrid kernels

Combine approaches, usually a microkernel-inspired design with many services moved back into kernel space for performance.

- **Windows NT family:** layered, with a small kernel, an executive layer, and drivers; most services still run in kernel mode.
- **macOS / iOS (XNU):** Mach microkernel plus a BSD layer and I/O Kit, all running together in kernel space.

### Exokernels and unikernels (advanced)

- **Exokernel:** the kernel only securely multiplexes raw hardware; all abstractions (files, virtual memory policies) are implemented in application-level **library OSes**. Applications can customize these for performance. Mainly a research idea (MIT).
- **Unikernel:** an application is compiled together with just the OS pieces it needs into a single-purpose image that runs directly on a hypervisor, with one address space (→ OS-12).

### Comparison

| | Monolithic | Layered | Microkernel | Modular | Hybrid |
|---|---|---|---|---|---|
| Services in kernel | All | All, in layers | Minimal | Core + loaded modules | Most |
| Performance | Best | Moderate | Weakest (IPC cost) | Best | Good |
| Fault isolation | Poor | Poor | Best | Poor | Moderate |
| Extensibility | Poor | Moderate | Good | Good | Good |
| Example | Linux, UNIX | THE | QNX, seL4, MINIX 3 | Linux | Windows, macOS |

Linux is best described as **monolithic and modular**. The famous 1992 Tanenbaum–Torvalds debate was over exactly this trade-off, and the argument still resurfaces today.

---

## OS-1.7 · The Boot Process

**Bootstrapping problem:** the OS must be loaded into memory by software, but at power-on there is no software in memory. The solution is a chain of progressively more capable programs, each loading the next.

### Step-by-step (x86 PC)

1. **Power on / reset.** The CPU starts executing at a fixed address (the reset vector), which maps to firmware in non-volatile memory on the motherboard.
2. **Firmware (BIOS or UEFI)** runs:
   - **POST** (power-on self-test): check CPU, memory, and basic devices.
   - Initialize hardware and find a boot device according to the configured boot order.
3. **Load the bootloader.**
   - **Legacy BIOS:** reads the first sector of the boot disk, the **Master Boot Record (MBR)**, which is 512 bytes: 446 bytes of boot code, a 64-byte partition table (4 entries × 16 bytes), and the 2-byte signature `0x55AA`. 446 bytes is too small for a real bootloader, so this code loads a larger second stage.
   - **UEFI:** understands partitions and file systems directly. It reads the **GPT** partition table, finds the **EFI System Partition** (a FAT file system), and runs a bootloader stored there as an ordinary `.efi` file. UEFI can verify signatures (**Secure Boot**).
4. **Bootloader (e.g., GRUB)** lets you choose an OS/kernel, then loads the **kernel image** (on Linux, `vmlinuz`) and an **initial RAM disk** (`initramfs`) into memory, and jumps to the kernel.
5. **Kernel initialization:**
   - On x86, switch the CPU from 16-bit real mode through 32-bit protected mode into 64-bit long mode (on UEFI systems the firmware already did part of this).
   - Set up page tables and enable paging, set up the interrupt descriptor table and system call entry, initialize the scheduler, memory allocator, and drivers.
   - Use the initramfs to load any drivers needed to access the real root file system, then mount the root file system.
6. **Start the first user process**, `init`, with PID 1. On most modern Linux distributions this is **systemd**. It starts system services (daemons) and eventually a login prompt or graphical display manager.
7. From here on, the kernel runs only in response to system calls, interrupts, and exceptions. It is **interrupt-driven**: when nothing needs doing, the CPU runs an idle loop or halts until the next interrupt.

```
Power on -> Firmware (POST) -> Bootloader stage 1 -> Bootloader stage 2 (GRUB)
         -> Kernel (+initramfs) -> mount root FS -> init/systemd (PID 1) -> services, login
```

### MBR vs GPT

| | MBR | GPT |
|---|---|---|
| Used with | Legacy BIOS | UEFI |
| Max partitions | 4 primary (or extended partition tricks) | 128 by default |
| Max disk size | 2 TiB with 512-byte sectors (32-bit sector addresses) | Effectively unlimited (64-bit addresses) |
| Redundancy | Single copy | Backup header at end of disk, with CRC checksums |

---

## Quick Revision Sheet

- OS = abstractions (files, processes, address spaces) + resource management + protection.
- Three pillars: virtualization, concurrency, persistence.
- Mechanism = how; policy = which/when. Keep them separate.
- Multiprogramming targets CPU utilization; time-sharing targets response time and needs a timer.
- Hard real-time: deadline miss is failure; key property is predictability.
- Interrupt = async from device. Trap = intentional sync (system call). Fault = sync, possibly fixable, re-executes instruction (page fault). Abort = unrecoverable.
- Handlers are found via a vector table set up by the kernel at boot; loading it is privileged.
- Dual mode + timer = limited direct execution. User code runs at full speed but cannot run privileged instructions and cannot keep the CPU forever.
- Privileged: I/O, changing page table base, loading IDT, disabling interrupts, setting timer, halt.
- Mode switch ≠ context switch.
- System calls are identified by number; kernel validates the number and all user pointers.
- Library call ≠ system call. `printf` → buffered → `write`. `strlen` never enters the kernel.
- Monolithic = fast, weak isolation. Microkernel = isolation, IPC overhead. Linux = monolithic + modular.
- Boot: firmware → bootloader → kernel → init (PID 1).

---

## Worked Numerical Problems

### N1 · Multiprogramming and CPU utilization (OS-1.2)

A common approximation: if each process spends a fraction `p` of its time waiting for I/O, and there are `n` independent processes in memory, the CPU is idle only when *all* `n` are waiting at once, so

```
CPU utilization ≈ 1 − p^n
```

**Question.** Processes spend 80% of their time waiting for I/O. (a) What is CPU utilization with 1, 4, and 8 processes in memory? (b) What minimum degree of multiprogramming gives at least 90% utilization?

**Answer.**
(a) With `p = 0.8`:
- `n = 1`: 1 − 0.8 = **20%**
- `n = 4`: 1 − 0.8⁴ = 1 − 0.4096 = **59.0%**
- `n = 8`: 1 − 0.8⁸ = 1 − 0.1678 = **83.2%**

(b) Need `0.8^n ≤ 0.1`, so `n ≥ ln(0.1) / ln(0.8) = 2.303 / 0.223 ≈ 10.3`. Minimum **n = 11**.

Note the diminishing returns: going from 1 to 4 processes gains 39 points, from 4 to 8 only 24. The model also ignores that adding processes costs memory, which later leads to paging and thrashing (→ OS-7.6).

### N2 · Interrupt overhead vs DMA (OS-1.3)

**Question.** A device delivers data at 400 KB/s. With interrupt-driven I/O, it interrupts once per 4-byte word, and each interrupt costs 2 µs of CPU time (entry, handler, return). With DMA, it interrupts once per 4 KB block, and each interrupt costs 5 µs. What fraction of CPU time goes to handling this device in each case?

**Answer.**
- Interrupt-driven: 400,000 / 4 = 100,000 interrupts/s × 2 µs = 200,000 µs = 0.2 s per second = **20%** of the CPU.
- DMA: 400,000 / 4,096 ≈ 97.7 interrupts/s × 5 µs ≈ 488 µs per second ≈ **0.05%** of the CPU.

DMA reduces overhead by about 400×, which is why every bulk-transfer device uses it.

### N3 · Buffering and system call cost (OS-1.5)

**Question.** A program writes 1,000,000 bytes to a file. Each `write()` system call has a fixed overhead of 0.5 µs, plus 1 ns per byte to copy data into the kernel. Compare (a) writing one byte per call with (b) using a 4,096-byte user-space buffer, one `write()` per full buffer. Ignore the cost of copying into the user buffer.

**Answer.**
(a) 1,000,000 calls × (0.5 µs + 0.001 µs) = **≈ 0.501 s**.

(b) Number of calls = ⌈1,000,000 / 4,096⌉ = 245.
Fixed cost: 245 × 0.5 µs = 122.5 µs. Copy cost: 1,000,000 bytes × 1 ns = 1,000 µs.
Total ≈ **1.12 ms**.

Speedup ≈ 0.501 / 0.00112 ≈ **445×**. Nearly all the unbuffered time is fixed per-call overhead, not data copying. This is exactly why stdio buffers output.

### N4 · Timer interrupt overhead (OS-1.4)

**Question.** Each timer interrupt, together with the scheduling decision and a context switch, costs 50 µs. What percentage of CPU time is overhead if the timer fires every (a) 10 ms, (b) 1 ms, (c) 100 µs?

**Answer.** In each period, useful work = period − 50 µs. Overhead = 50 / period.
- (a) 50 / 10,000 = **0.5%**
- (b) 50 / 1,000 = **5%**
- (c) 50 / 100 = **50%**

A shorter interval makes the system more responsive but wastes more time switching. This same trade-off returns as the round-robin quantum choice (→ OS-3.3).

### N5 · Time-sharing response time (OS-1.2)

**Question.** A time-sharing system has 20 active users, each always ready to run. The quantum is 50 ms and each switch costs 5 ms. After a user's turn ends, what is the worst-case time before that user runs again? What if the quantum is reduced to 10 ms?

**Answer.** The other 19 users each get a quantum plus a switch before this user is picked again.
- Quantum 50 ms: 19 × (50 + 5) = **1,045 ms ≈ 1.05 s**. Efficiency = 50 / 55 ≈ 91%.
- Quantum 10 ms: 19 × (10 + 5) = **285 ms**. Efficiency = 10 / 15 ≈ 67%.

Smaller quantum: better response time, but a third of CPU time is lost to switching.

### N6 · Effective memory access time with a cache (OS-1.3)

**Question.** A cache access takes 1 ns. On a miss, the data must be fetched from DRAM, which takes an extra 100 ns (so a miss costs 101 ns in total). (a) What is the effective access time at a 95% hit ratio? (b) What hit ratio is needed for an effective access time of 3 ns?

**Answer.**
(a) EAT = 0.95 × 1 + 0.05 × 101 = 0.95 + 5.05 = **6 ns**.
(b) `h × 1 + (1 − h) × 101 = 3` → `101 − 100h = 3` → `h = 0.98` = **98%**.

Going from 95% to 98% hits halves the average access time. Small changes in hit ratio have large effects because the miss penalty is so big. The TLB calculation (→ OS-6.5) uses exactly this pattern.

### N7 · MBR limits (OS-1.7)

**Question.** An MBR partition entry stores the starting sector and sector count as 32-bit numbers. Sectors are 512 bytes. (a) What is the largest disk size MBR can address? (b) How large can the disk be if the drive uses 4 KB logical sectors? (c) How many bytes of the MBR are available for boot code?

**Answer.**
(a) 2³² sectors × 512 B = 2³² × 2⁹ = 2⁴¹ B = **2 TiB**.
(b) 2³² × 4,096 B = 2⁴⁴ B = **16 TiB**.
(c) 512 − 64 (partition table) − 2 (signature) = **446 bytes**, which is why the MBR code only loads a second-stage bootloader.

---

## Scenario Questions (Test Your Understanding)

These are not definition questions. Each describes a situation; reason from the mechanisms above. Try to answer before opening the explanation.

### S1 · The "optimized" loop (OS-1.4)

A student wants their number-crunching loop to run without interruptions, so they add the x86 instruction `cli` (disable interrupts) at the start of `main()`. They compile and run it as a normal user on Linux. What happens, and why is it designed this way?

<details><summary>Answer</summary>

`cli` is privileged. Executing it in user mode raises a general protection fault; the kernel's handler runs and sends the process `SIGSEGV`, which kills it. The instruction never takes effect.

If users could disable interrupts, the timer interrupt would never fire, so the OS would never regain control. One process could freeze the machine, which would break the entire limited-direct-execution guarantee.

</details>

### S2 · Infinite loop, two operating systems (OS-1.4)

The program `int main(){ while(1); }` is run on (a) an old cooperative-multitasking OS with no timer-based preemption, and (b) modern Linux. Describe what the user experiences on each.

<details><summary>Answer</summary>

(a) The loop makes no system calls and never yields, so the OS never regains control. Other programs stop responding; the machine effectively hangs until reboot.

(b) The timer interrupt fires every few milliseconds, the kernel regains control, and the scheduler runs other processes. The looping process uses a large share of one CPU, but the system stays responsive, and the user can kill it with Ctrl+C (the terminal driver sends `SIGINT`) or `kill`.

</details>

### S3 · Where did printf go? (OS-1.5)

Running `strace ./prog` on a program that calls `printf` 1,000 times in a loop (each printing a short line) shows 1,000 `write` calls. Running `strace ./prog > out.txt` shows only 2 or 3 `write` calls. Same program, same output. Explain.

<details><summary>Answer</summary>

`printf` is a library function that writes into a stdio buffer in user space. When stdout is a terminal, stdio uses **line buffering**, flushing at every newline, so each line becomes one `write`. When stdout is redirected to a file, stdio uses **full buffering** (typically 4 KB or more), so the kernel is entered only when the buffer fills or the program exits.

This also means that if the program crashes before exit with output redirected, some output may be lost, because it was still sitting in the user-space buffer.

</details>

### S4 · Classify the event (OS-1.3)

For each, say whether it is an interrupt, trap, fault, or abort, and whether the same instruction is re-executed afterwards:
(a) The user presses a key. (b) A program calls `read()`. (c) A program touches a page of its heap that is currently swapped out to disk. (d) A program executes `x = 5 / 0` in integer arithmetic. (e) A memory module reports an uncorrectable ECC error.

<details><summary>Answer</summary>

(a) **Interrupt**: asynchronous, from a device. Execution resumes with the next instruction of whatever was running.
(b) **Trap**: intentional entry to the kernel via the `syscall` instruction. Resumes at the instruction after it.
(c) **Fault** (page fault): the kernel loads the page and the **same instruction is re-executed**, now succeeding.
(d) **Fault** (divide error): but it cannot be fixed, so on Linux the kernel sends `SIGFPE`, which by default terminates the process. Nothing is re-executed unless a signal handler intervenes.
(e) **Abort** (machine check): unrecoverable; the process or the whole system is terminated.

</details>

### S5 · Does every system call cause a context switch? (OS-1.4, OS-1.5)

Process A calls `getpid()`. Later it calls `read()` on a socket that has no data yet. For each call, is there a mode switch? A context switch?

<details><summary>Answer</summary>

`getpid()`: mode switch into the kernel and back to A. No context switch; A simply continues.

`read()` with no data: mode switch into the kernel. The kernel finds no data and **blocks** A, so the scheduler picks another process to run. That is a context switch. When data arrives (via a network interrupt), A becomes ready again and will run at some later scheduling decision.

</details>

### S6 · The malicious buffer (OS-1.5)

A user program calls `read(fd, buf, 4096)` but sets `buf` to an address inside the kernel's memory. What would happen if the kernel copied the data to `buf` without any checks? What does a real kernel do?

<details><summary>Answer</summary>

Without checks, the kernel, running in kernel mode with full access, would overwrite its own memory with data the attacker controls (the attacker chooses the file contents). This is a classic privilege-escalation route.

Real kernels validate that the entire range `[buf, buf + 4096)` lies in user space and use special copy routines (`copy_to_user` in Linux) that also handle faults if the user page is unmapped. The call fails with `EFAULT` instead of corrupting kernel memory.

</details>

### S7 · Why not just use the user's stack? (OS-1.4)

When a process traps into the kernel, why does the CPU switch to a separate kernel stack rather than continuing on the user's stack?

<details><summary>Answer</summary>

(1) The user stack pointer may be garbage or deliberately point to unmapped or kernel memory; the kernel cannot rely on it. (2) In a multithreaded process, another thread could modify the user stack while the kernel is using it, corrupting kernel state. (3) Saved kernel values left on the user stack would leak kernel information to the program. A per-process (per-thread) kernel stack in kernel memory avoids all three.

</details>

### S8 · Driver crash: monolithic vs microkernel (OS-1.6)

A buggy network card driver dereferences a NULL pointer. Describe the outcome on Linux (monolithic, driver loaded as a module) versus on MINIX 3 (microkernel, driver as a user-level server).

<details><summary>Answer</summary>

On Linux, the module runs in kernel mode in the kernel's address space. A NULL dereference causes a kernel "oops"; depending on context, the kernel may kill the current task and continue in a possibly damaged state, or panic and halt the whole system. Being a *module* does not provide isolation.

On MINIX 3, the driver is an ordinary user process. The fault kills only that process. The system keeps running, and a reincarnation server can restart the driver automatically; network connections may be disrupted briefly. The price is that every packet requires messages between the driver server, the network server, and the kernel.

</details>

### S9 · Counting kernel crossings (OS-1.6)

An application reads a file block that is not cached. In a monolithic kernel, the path is: app → kernel (file system → disk driver) → app. In a microkernel, the file system and disk driver are separate user-level servers, and every message goes through the kernel. Count the minimum number of user→kernel crossings for the request and reply in each design, assuming each message is one crossing.

<details><summary>Answer</summary>

Monolithic: **1** crossing in (the system call); everything else is function calls inside the kernel; one return.

Microkernel: app → FS server (1), FS server → disk driver (2), disk driver → FS server with the data (3), FS server → app with the data (4). That is **4** user→kernel crossings, each also potentially needing a context switch between processes, compared with 1. This is the core source of microkernel overhead, and why optimizing IPC is central to microkernel design.

</details>

### S10 · Real-time with virtual memory (OS-1.2, OS-7.1)

Why would you not run a pacemaker's control loop as a normal process on a desktop OS with demand paging and a general-purpose scheduler, even on a fast CPU?

<details><summary>Answer</summary>

Hard real-time needs a **guaranteed worst-case** response time, not a good average. On a general-purpose OS: a page fault might require a disk or SSD read taking milliseconds; the scheduler may run other processes first; interrupt handling and kernel activity introduce unpredictable delays. A fast CPU improves the average but does not bound the worst case. RTOSes avoid demand paging (or lock memory), use priority-driven preemptive scheduling with bounded latencies, and keep kernel code paths short and predictable.

</details>

### S11 · A clock call that never enters the kernel (OS-1.5)

A benchmark calls `clock_gettime()` 10 million times in a loop and finishes in about 0.2 seconds. When run under `strace`, no `clock_gettime` system calls appear. Is `strace` broken?

<details><summary>Answer</summary>

No. On Linux, `clock_gettime` (and `gettimeofday`) are normally served by the **vDSO**, kernel-provided code mapped into every process's address space. It reads timekeeping data the kernel exposes in a shared read-only page, so it runs entirely in user mode. No trap occurs, so `strace` has nothing to show, and each call costs tens of nanoseconds instead of hundreds.

</details>

### S12 · Life without a mode bit (OS-1.4)

MS-DOS ran on early x86 processors in real mode, which has no privilege levels and no memory protection. List three things a buggy or malicious DOS program could do that a Linux user process cannot.

<details><summary>Answer</summary>

Any three of: overwrite the interrupt vector table to hijack keyboard or timer interrupts (this is how many DOS viruses worked); write directly to disk sectors, bypassing the file system; overwrite the OS's own code or data in memory; disable interrupts and never re-enable them, freezing the machine; access other programs' memory. Without hardware support, the OS cannot enforce protection at all. Protection requires hardware.

</details>

---

## References and Further Reading

- **OSTEP** (Arpaci-Dusseau), free online: Chapter 2 *Introduction to Operating Systems*; Chapter 6 *Mechanism: Limited Direct Execution* (dual mode, traps, the timer, cooperative vs non-cooperative control).
- **The Linux Programming Interface** (Kerrisk): Chapter 2 *Fundamental Concepts*; Chapter 3 *System Programming Concepts* (system calls vs library functions, glibc, error handling with `errno`); Chapter 13 *File I/O Buffering* (stdio vs kernel buffering).
- **Mythili Vutukuru, IIT Bombay OS lectures** (available on YouTube and her course page): introductory lectures on the process abstraction and system calls, and the xv6 lectures on traps, interrupts, and system call handling.
- **xv6 source** (MIT, x86 version): `trapasm.S`, `trap.c`, `syscall.c`, `usys.S` for the full system call path.
- `man 2 syscall`, `man 2 intro`, `man 7 vdso`, and running `strace` on simple programs.

---

**Next:** Unit 2, Processes and Threads (→ OS-2), which builds directly on traps, the kernel stack, and context switching.