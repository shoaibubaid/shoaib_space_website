---
title: OS Unit 2 - Processes and Threads
subject: OS
unit: 2
id: OS-2
tags: [process, pcb, context-switch, fork, exec, zombie, ipc, pipes, signals, threads, pthreads]
prerequisites: [OS-1.3, OS-1.4, OS-1.5]
readTime: 30 min read
excerpt: Explaining what processes and threads are
next: OS-3
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/os.png
---

# Unit 2: Processes and Threads

> **How to use this page.** Section IDs (`OS-2.3`) match the tags on practice questions. Arrows like **→ OS-4.5** point to where an idea is developed further; **← OS-1.4** points back to something this section depends on.

Unit 1 showed how the OS keeps control of the machine while user code runs directly on the CPU. This unit is about **what** it is running. The answer is the *process*: the OS's abstraction of a running program. We will see what a process is made of, how the OS switches between processes, how processes are created and destroyed, how they talk to each other, and how *threads* let one process do several things at once.

---

## OS-2.1 · The Process Concept

### Program vs process

- A **program** is a passive file on disk: an executable containing instructions and initial data (on Linux, an ELF file).
- A **process** is a program **in execution**: an active entity with a current position in the code, register values, memory contents, and open files.

One program can give rise to many processes (three terminals each running `bash` are three processes of one program). One process can also switch programs during its life via `exec` (→ OS-2.3).

### What makes up a process: machine state

OSTEP describes a process by the parts of the machine it can read or change while running:

1. **Memory (address space):** the instructions and data the program uses.
2. **Registers:** the program counter (PC, which instruction runs next), the stack pointer, the frame pointer, and all general-purpose registers.
3. **I/O state:** the list of files, pipes, and sockets it has open.

To stop a process and resume it later exactly where it left off, the OS must save all of this. The address space stays in memory; the registers get saved in kernel data structures during a context switch (→ OS-2.2).

### Process address space layout

A typical layout for a process on Linux x86-64 (addresses grow upward):

```
   High addresses
  +---------------------------+
  |    Kernel space           |  not accessible from user mode
  +---------------------------+  <- ~0x00007fffffffffff (top of user space)
  |    Stack                  |  local variables, return addresses, arguments
  |      | grows down         |  (one stack per thread)
  |      v                    |
  |                           |
  |    Memory-mapped region   |  shared libraries (libc.so), mmap() files,
  |                           |  anonymous mmap, other thread stacks
  |                           |
  |      ^                    |
  |      | grows up           |
  |    Heap                   |  malloc()/new; grown with brk() or mmap()
  +---------------------------+
  |    BSS                    |  uninitialized globals/statics (zero-filled)
  +---------------------------+
  |    Data                   |  initialized globals/statics
  +---------------------------+
  |    Text (code)            |  machine instructions; read-only, shareable
  +---------------------------+
   Low addresses
```

Where things live, for a C program:

```c
int counter = 5;        // Data (initialized global)
int table[1000];        // BSS  (uninitialized global, zero-filled at load)
const char *s = "hi";   // s in Data, the string "hi" in read-only data (near text)

void f(void) {
    int x;              // Stack
    static int calls;   // BSS  (static storage, not on the stack)
    int *p = malloc(64);// p on Stack, the 64 bytes on Heap
}
```

Key points:

- BSS takes **no space in the executable file**; the loader just records its size and gives zero-filled memory. That is why a huge uninitialized global array does not make the binary huge.
- The gap between heap and stack is **not physical memory**. It is unused virtual address space; physical memory is allocated only for pages actually touched (→ OS-7.1).
- You can see a real process's layout with `cat /proc/<pid>/maps`.

### The Process Control Block (PCB)

The kernel keeps one data structure per process, the **Process Control Block** (also called a task control block). It holds everything the OS needs to manage the process:

| Field group | Contents |
|---|---|
| Identification | Process ID (PID), parent PID, user and group IDs |
| State | Running, ready, blocked, zombie, etc. (→ OS-2.2) |
| CPU context | Saved PC, stack pointer, general registers, flags, FPU state (valid only while not running) |
| Scheduling | Priority, time used, scheduling-queue pointers (→ OS-3) |
| Memory management | Pointer to page tables, memory limits/regions (→ OS-6.4) |
| Files and I/O | Open file descriptor table, current working directory |
| Signals | Pending signals, blocked mask, handlers (→ OS-2.4) |
| Accounting | CPU time used, start time, resource limits |
| Relationships | Pointers to parent, children, siblings |

Real examples:

- **Linux:** `struct task_struct` (in `include/linux/sched.h`), a very large structure. Linux uses the same structure for processes and threads (→ OS-2.5).
- **xv6:** `struct proc` in `proc.h` is small enough to read in a minute: `sz` (memory size), `pgdir` (page table), `kstack` (kernel stack), `state`, `pid`, `parent`, `tf` (trap frame), `context`, `chan` (what it is sleeping on), `killed`, `ofile[]` (open files), `cwd`, `name`.

The kernel keeps all PCBs in a **process table** (xv6: a fixed array `ptable.proc[NPROC]`; Linux: linked lists and hash tables of `task_struct`).

---

## OS-2.2 · Process States, Scheduling Queues, and Context Switching

### The basic state model

```
 +-------+  admitted  +---------+  dispatch   +-----------+   exit   +------------+
 |  New  | ---------> |  Ready  | ----------> |  Running  | -------> | Terminated |
 +-------+            +---------+ <---------- +-----------+          +------------+
                           ^       preempted        |
                           |     (timer, yield)     | I/O request, wait(), sleep()
                           |                        v
                           |   event occurs    +-----------+
                           +------------------ |  Blocked  |
                                               +-----------+
```

| State | Meaning |
|---|---|
| **New** | Being created; PCB allocated, not yet eligible to run |
| **Ready** | Could run, waiting for a CPU |
| **Running** | Instructions executing on a CPU. At most one process per CPU core. |
| **Blocked (waiting)** | Cannot run until some event: I/O completion, a lock, a child exiting, a timer |
| **Terminated** | Finished; waiting for cleanup (on UNIX, this is the zombie state → OS-2.3) |

Transitions and their causes:

- **Ready → Running:** the scheduler picks this process (dispatch).
- **Running → Ready:** preemption, usually a timer interrupt (← OS-1.4), or the process calls `yield()`.
- **Running → Blocked:** the process makes a request that cannot be satisfied immediately (`read()` with no data yet, `wait()` for a child, `sleep()`, acquiring a held lock).
- **Blocked → Ready:** the event happens (usually signalled by an interrupt handler). Note it goes to **Ready, not Running**; it must wait for the scheduler.
- **Running → Terminated:** the process calls `exit()` or is killed.

Transitions that **cannot** happen directly: Blocked → Running (must go through Ready) and Ready → Blocked (a process can only block by doing something, which requires running).

### Suspended states and the medium-term scheduler

When memory is overcommitted, the OS may swap an entire process out to disk. This adds two states:

- **Ready-suspended:** would be ready, but its memory is on disk.
- **Blocked-suspended:** waiting for an event *and* swapped out. If the event happens, it moves to ready-suspended.

This gives a 7-state model. Modern OSes mostly page out individual pages rather than whole processes (→ OS-7), but the model still appears in exams.

### The three schedulers

| Scheduler | Also called | Decides | Runs how often |
|---|---|---|---|
| **Long-term** | Job scheduler | Which jobs are admitted into memory; controls **degree of multiprogramming** | Rarely (seconds/minutes) |
| **Short-term** | CPU scheduler | Which ready process runs next on the CPU | Very often (every few ms) |
| **Medium-term** | Swapper | Which processes to swap out/in to reduce memory pressure | Occasionally |

The long-term scheduler should admit a good **mix** of:

- **I/O-bound** processes: short CPU bursts, lots of I/O (editors, shells, servers).
- **CPU-bound** processes: long CPU bursts, little I/O (compilers, simulations).

All I/O-bound means the CPU idles; all CPU-bound means devices idle. Modern desktop OSes essentially have no long-term scheduler: every started program is admitted, and users themselves act as the admission control.

### Scheduling queues

The OS organizes PCBs into queues:

- **Ready queue:** processes in the Ready state (usually a linked list or tree of PCBs; Linux CFS uses a red-black tree → OS-3.7).
- **Wait queues / device queues:** one per event or device; processes blocked on that event.

A process migrates between these queues throughout its life. Queueing diagrams in textbooks are just pictures of these moves.

### Linux process states

What you see in `ps` or `top` (the `STAT` column):

| Code | State | Notes |
|---|---|---|
| `R` | Running or runnable | Linux does not distinguish "ready" and "running" in this display |
| `S` | Interruptible sleep | Blocked; a signal can wake it up (most blocking waits) |
| `D` | Uninterruptible sleep | Blocked in a way signals cannot interrupt, usually waiting on disk or NFS I/O. Even `kill -9` has no immediate effect. |
| `T` | Stopped | Suspended by `SIGSTOP`/`SIGTSTP` (Ctrl+Z) or a debugger |
| `Z` | Zombie | Terminated, not yet reaped by parent |

xv6 uses `UNUSED, EMBRYO, SLEEPING, RUNNABLE, RUNNING, ZOMBIE`, which map to free slot, New, Blocked, Ready, Running, Terminated.

### Context switch

A **context switch** is the act of saving the state of the currently running process and restoring the saved state of another, so that the CPU continues executing the second process.

**What must be saved and restored:**

- Program counter, stack pointer, general-purpose registers, flags register
- Floating-point and SIMD (SSE/AVX) registers (may be saved lazily)
- The **address space**: switching the page table base register (`CR3` on x86), which changes which physical memory the virtual addresses refer to (→ OS-6.4)
- The kernel stack pointer for the new process

**When it happens:** only in kernel mode, after a trap, interrupt, or exception. Typical triggers: timer interrupt (preemption), the running process blocks, the running process exits, or a higher-priority process becomes ready.

**OSTEP's view** (limited direct execution with a timer):

```
 Process A (user)        Hardware                     OS (kernel)
 ----------------        --------                     -----------
 running...
                         timer interrupt:
                         save A's user regs to
                         A's kernel stack,
                         switch to kernel mode,
                         jump to trap handler  ---->  handle trap
                                                      decide to switch
                                                      call switch():
                                                        save A's kernel regs into A's PCB
                                                        restore B's kernel regs from B's PCB
                                                        switch to B's kernel stack
                                                      return-from-trap (into B)
                         restore B's user regs from
                         B's kernel stack,
                         switch to user mode,
                         jump to B's PC
 Process B (user)
 running...
```

Notice there are **two different register saves**:

1. **User registers** are saved by the hardware and the trap entry code onto the process's **kernel stack** when the trap happens. (In xv6, this is the *trap frame*.)
2. **Kernel registers** are saved by the OS's switch routine into the PCB when it decides to switch. (In xv6, this is the *context*: only callee-saved registers, because `swtch` is called like an ordinary C function.)

**xv6 in detail** (as covered in Mythili Vutukuru's lectures): xv6 never switches directly from process A to process B. It goes through a per-CPU **scheduler thread**:

```
A in user mode --timer interrupt--> trap() --> yield() --> sched()
    --> swtch(&A->context, cpu->scheduler)      [now running scheduler loop]
scheduler() picks B --> switchuvm(B) [load B's page table]
    --> swtch(&cpu->scheduler, B->context)      [now running on B's kernel stack]
B returns from its own earlier sched() call --> ... --> trapret --> iret --> B in user mode
```

Every process that is not running is "stuck" inside a call to `sched()` on its own kernel stack. Switching back to it simply makes that call return.

**Cost of a context switch:**

- **Direct cost:** saving/restoring registers, running scheduler code, switching page tables. Typically on the order of a microsecond or a few microseconds.
- **Indirect cost (usually larger):** the new process finds CPU caches, the TLB, and branch predictors full of the *old* process's data. It suffers many cache and TLB misses until they warm up. Switching address spaces may flush the TLB unless the hardware supports tagging entries (PCID on x86 → OS-6.5).

Context switch time is **pure overhead**: no useful work is done. This is why the scheduling quantum cannot be made arbitrarily small (← OS-1 N4, → OS-3.3). Switching between **threads of the same process** is cheaper because the address space does not change (→ OS-2.5).

---

## OS-2.3 · Process Creation and Termination

### The process tree

Every process (except the very first) is created by another process, its **parent**. This forms a tree rooted at PID 1 (`init`/`systemd`, started by the kernel at boot ← OS-1.7). You can see it with `pstree`.

UNIX splits "run a new program" into **two separate system calls**: `fork()` creates a new process, and `exec()` replaces the program a process is running. A third, `wait()`, lets the parent wait for a child to finish. Understanding these three is essential for interviews.

### `fork()`

`fork()` creates a new process (the **child**) that is an almost exact copy of the calling process (the **parent**).

```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    int x = 100;
    pid_t pid = fork();

    if (pid < 0) {                 // fork failed (e.g., process limit reached)
        perror("fork");
        return 1;
    } else if (pid == 0) {         // child
        x += 1;
        printf("child:  pid=%d x=%d\n", getpid(), x);
    } else {                       // parent
        x -= 1;
        printf("parent: pid=%d child=%d x=%d\n", getpid(), pid, x);
    }
    return 0;
}
```

Possible output:

```
parent: pid=4120 child=4121 x=99
child:  pid=4121 x=101
```

The rules to internalize:

1. **Called once, returns twice.** It returns in both processes: `0` in the child, the child's PID (> 0) in the parent, and `-1` on failure (only in the parent, since no child exists).
2. **Both continue from the same point**: the instruction right after `fork()`. The child does *not* start at `main()`.
3. **Separate copies of memory.** The child gets a copy of the parent's address space (stack, heap, data). After fork, changes in one are **not** visible in the other: above, `x` becomes 99 in one and 101 in the other.
4. **Order is not guaranteed.** Which process runs first is up to the scheduler. Never write code that depends on it without synchronization (such as `wait()`).

**What the child inherits vs does not:**

| Inherited (copied) | Not inherited / different |
|---|---|
| Copy of memory: code, data, heap, stack | PID (new), parent PID (the parent's PID) |
| Open file descriptors (share the same open file descriptions!) | Pending signals (cleared) |
| Current working directory, root directory, `umask` | File locks held via `fcntl` (not inherited) |
| Environment variables | Timers and alarms (reset) |
| Signal handlers and signal mask | Resource usage counters (reset to zero) |
| User/group IDs, resource limits | Other threads (only the calling thread is copied) |
| Unflushed **stdio buffers** (they are just user memory) | Return value of `fork()` itself |

**Shared file offsets.** File descriptors in parent and child point to the *same* kernel **open file description**, which contains the current file offset (TLPI explains the three-level structure: per-process descriptor table → system-wide open file table → inode table, → OS-8.1). So if both write to an inherited descriptor, they share one offset and their writes do not overwrite each other. If each process opens the file separately *after* fork, each gets its own offset and they can overwrite each other's data.

**Copy-on-write (COW).** Copying the entire address space on every fork would be slow, especially since the child often calls `exec()` immediately and throws the copy away. Modern kernels instead let parent and child **share the physical pages, marked read-only**. Only when either process writes to a page does the kernel copy that single page (→ OS-7.2). So fork cost is mostly copying page tables, not memory.

### `exec()`

The `exec` family **replaces the current process's program** with a new one: the code, data, heap, and stack are discarded and rebuilt from the new executable. The underlying Linux system call is `execve()`; `execl`, `execlp`, `execv`, `execvp`, `execle` are library wrappers differing in how arguments are passed (`l` = list, `v` = vector/array, `p` = search `PATH`, `e` = pass environment).

Key properties:

- **Same process, new program.** PID, parent, open file descriptors (unless marked close-on-exec with `O_CLOEXEC`/`FD_CLOEXEC`), current directory, and ignored signals are kept.
- Caught signal handlers are reset to default (the handler code no longer exists in the new program).
- **exec does not return on success.** There is nothing to return to; the old code is gone. If the line after `exec()` executes, exec failed.

### `wait()` and `waitpid()`

A parent calls `wait()` to block until one of its children terminates, and to collect the child's **exit status**.

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        execlp("ls", "ls", "-l", (char *)NULL);
        perror("execlp");          // reached only if exec failed
        _exit(127);                // use _exit in a forked child (see below)
    }
    int status;
    waitpid(pid, &status, 0);      // wait for this specific child
    if (WIFEXITED(status))
        printf("child exited with %d\n", WEXITSTATUS(status));
    else if (WIFSIGNALED(status))
        printf("child killed by signal %d\n", WTERMSIG(status));
    return 0;
}
```

- `wait(&status)` waits for **any** child; `waitpid(pid, &status, options)` waits for a specific one. `waitpid(-1, &status, WNOHANG)` checks without blocking.
- The status is an encoded integer; use the macros `WIFEXITED`, `WEXITSTATUS`, `WIFSIGNALED`, `WTERMSIG`.
- `wait()` returns `-1` with `errno = ECHILD` if there are no children.

### Why separate fork and exec?

At first it seems wasteful: why copy a process only to replace it? OSTEP's answer: the gap between `fork()` and `exec()` is where the child can **set up its own environment** before the new program starts, without the new program knowing anything about it. This is exactly how a shell implements redirection and pipes:

```c
// How a shell runs:  wc -l < input.txt > output.txt
pid_t pid = fork();
if (pid == 0) {
    int in  = open("input.txt", O_RDONLY);
    int out = open("output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    dup2(in, STDIN_FILENO);    // fd 0 now refers to input.txt
    dup2(out, STDOUT_FILENO);  // fd 1 now refers to output.txt
    close(in); close(out);
    execlp("wc", "wc", "-l", (char *)NULL);
    _exit(127);
}
waitpid(pid, NULL, 0);
```

`wc` simply reads fd 0 and writes fd 1. It has no idea they are files rather than the terminal. File descriptors survive `exec`, and that is what makes this work.

Alternatives: `vfork()` (child borrows the parent's memory until it execs; historical optimization, largely made unnecessary by COW), `posix_spawn()` (fork+exec in one call, used where fork is expensive), and Linux's `clone()` (fine-grained control over what is shared, → OS-2.5). Windows has no fork; `CreateProcess()` creates a process and loads a program in one step.

### Process termination

A process terminates when:

- It returns from `main()` or calls `exit()` (normal termination).
- It receives a signal whose default action is to terminate (`SIGKILL`, `SIGSEGV`, `SIGINT`...).
- In some systems, its parent terminates it (`kill()`), or the OS terminates it for exceeding resources.

**`exit()` vs `_exit()`:**

- `exit(status)` is a library function: it runs `atexit` handlers, **flushes stdio buffers**, then calls `_exit`.
- `_exit(status)` is the system call: terminates immediately without flushing user-space buffers.

In a child after `fork()` (especially if `exec` fails), call `_exit()`. Otherwise the child flushes a *copy* of the parent's unflushed stdio buffer and output appears twice (TLPI, Chapter 25).

On termination the kernel closes all file descriptors, releases memory, sends **`SIGCHLD`** to the parent, and keeps a small record (PID, exit status, resource usage) until the parent collects it.

### Zombies and orphans

- A **zombie** is a process that has terminated but whose parent has **not yet called `wait()`**. Its memory and resources are freed, but its PCB entry (with PID and exit status) remains so the parent can retrieve the status later. Shown as `Z` / `<defunct>` in `ps`.
- An **orphan** is a process whose parent terminated first. Orphans are **re-parented to `init`** (PID 1), or to a designated "subreaper" process on modern Linux. `init` periodically calls `wait()`, so orphans that exit are reaped.

Why zombies matter: each one occupies a PID and a process-table entry. A long-running server that forks children and never waits for them eventually fills the process table, and `fork()` starts failing.

Zombies **cannot be killed** with `kill -9`: they are already dead and there is nothing to run the signal. To remove zombies: fix the parent to wait (for example, a `SIGCHLD` handler that loops on `waitpid(-1, &s, WNOHANG)`), explicitly set `SIGCHLD` to `SIG_IGN` (on Linux, children are then reaped automatically), or kill the parent so that `init` adopts and reaps them.

### fork in xv6

xv6's `fork()` in `proc.c` shows the steps plainly: `allocproc()` finds an `UNUSED` slot and sets up a kernel stack and trap frame; `copyuvm()` copies the parent's memory (xv6 does **not** use copy-on-write); the child's trap frame is copied from the parent's with `eax` set to 0 (so fork returns 0 in the child); open files are duplicated with `filedup()`; the child is marked `RUNNABLE`; the parent returns the child's PID. xv6's `exit()` makes the process a `ZOMBIE` and passes its children to `initproc`; `wait()` scans for a `ZOMBIE` child, frees its memory and kernel stack, and marks the slot `UNUSED`.

---

## OS-2.4 · Inter-Process Communication (IPC)

Processes are isolated by design: separate address spaces. But cooperating processes need to exchange data. Reasons: information sharing, computation speedup (split work), modularity (a pipeline of small tools), and convenience.

### Two fundamental models

```
      Shared memory                         Message passing
 +-----------+   +-----------+        +-----------+   +-----------+
 | Process A |   | Process B |        | Process A |   | Process B |
 +-----+-----+   +-----+-----+        +-----+-----+   +-----^-----+
       |               |                  send(m)       receive(m)
       v               v                    |               |
 +---------------------------+        +-----v---------------+-----+
 |   shared memory region    |        |   Kernel: message queue    |
 +---------------------------+        +---------------------------+
 |          Kernel           |
 +---------------------------+
```

| | Shared memory | Message passing |
|---|---|---|
| How | Processes map the same physical memory into their address spaces | Kernel copies data from sender to receiver |
| Kernel involvement | Only at setup; then ordinary loads/stores | Every send and receive is a system call |
| Speed | Fastest for large data | Slower (copies + system calls) |
| Synchronization | **Programmer's responsibility** (race conditions → OS-4) | Built in: receive waits for send |
| Works across machines | No | Yes (sockets) |
| Examples | `shm_open` + `mmap`, System V `shmget` | Pipes, message queues, sockets |

### Shared memory and the producer-consumer problem

With shared memory, the classic pattern is a **bounded buffer**: a producer writes items, a consumer reads them, through a circular array in shared memory.

```c
#define BUFFER_SIZE 8
item buffer[BUFFER_SIZE];
int in = 0;    // next free slot (producer writes here)
int out = 0;   // next full slot (consumer reads here)

// Producer
while (true) {
    item next = produce();
    while (((in + 1) % BUFFER_SIZE) == out)
        ;                          // buffer full: busy wait
    buffer[in] = next;
    in = (in + 1) % BUFFER_SIZE;
}

// Consumer
while (true) {
    while (in == out)
        ;                          // buffer empty: busy wait
    item next = buffer[out];
    out = (out + 1) % BUFFER_SIZE;
    consume(next);
}
```

- `in == out` means **empty**; `(in + 1) % N == out` means **full**. To distinguish full from empty without a counter, one slot is always left unused, so the buffer holds at most **N − 1** items.
- This version is correct only with exactly one producer and one consumer, and it wastes CPU busy-waiting. Adding a shared `count` variable to use all N slots introduces a **race condition**. Fixing that properly is the subject of Unit 4 (→ OS-4.1, OS-4.7).

### Message passing design choices

- **Naming:** *direct* (`send(P, msg)` names the receiving process) or *indirect* (send to a **mailbox**/port that any process may read from).
- **Synchronization:**
  - *Blocking send:* sender waits until the message is received.
  - *Non-blocking send:* sender continues immediately.
  - *Blocking receive:* receiver waits until a message is available.
  - *Non-blocking receive:* receiver gets a message or "nothing."
  - Blocking send + blocking receive = **rendezvous**.
- **Buffering (queue capacity):** zero capacity (sender must block until receiver takes it: rendezvous), bounded capacity (sender blocks when full), unbounded (sender never blocks, theoretical).

### Pipes

The oldest and most common UNIX IPC mechanism.

**Anonymous (ordinary) pipes:**

```c
int fd[2];
pipe(fd);      // fd[0] = read end, fd[1] = write end
```

- **Unidirectional** byte stream: data written to `fd[1]` is read from `fd[0]`, in FIFO order.
- No name in the file system; usable only by **related processes** that inherit the descriptors through `fork()`.
- No message boundaries: two writes of 10 bytes may be read as one read of 20.

Rules that matter (and cause most pipe bugs):

1. **Close unused ends.** After forking, the reader should close the write end and the writer should close the read end.
2. **EOF:** `read()` returns 0 (end of file) only when **all** write-end descriptors, in all processes, are closed. If the reader itself still holds a write end open, it will never see EOF and will block forever.
3. **Broken pipe:** writing when all read ends are closed delivers `SIGPIPE` to the writer (default: terminate); if that signal is ignored, `write()` fails with `EPIPE`.
4. **Capacity:** a pipe has a limited kernel buffer (64 KB by default on Linux). A writer blocks when it is full; a reader blocks when it is empty. This provides flow control automatically.
5. **Atomicity:** writes of at most `PIPE_BUF` bytes (4,096 on Linux; POSIX requires at least 512) are atomic: they are never interleaved with other writers' data. Larger writes may be split and interleaved.

How a shell builds `ls | wc -l`:

```c
int fd[2];
pipe(fd);

if (fork() == 0) {                 // first child: ls
    dup2(fd[1], STDOUT_FILENO);    // stdout -> pipe write end
    close(fd[0]); close(fd[1]);
    execlp("ls", "ls", (char *)NULL);
    _exit(127);
}
if (fork() == 0) {                 // second child: wc -l
    dup2(fd[0], STDIN_FILENO);     // stdin <- pipe read end
    close(fd[0]); close(fd[1]);
    execlp("wc", "wc", "-l", (char *)NULL);
    _exit(127);
}
close(fd[0]); close(fd[1]);        // parent must close both, or wc never sees EOF
wait(NULL); wait(NULL);
```

**Named pipes (FIFOs):** created with `mkfifo()` and visible as a special file in the file system. Unrelated processes can open it by name. Otherwise they behave like anonymous pipes. `open()` for reading blocks until a writer opens it, and vice versa.

### Other IPC mechanisms

- **Message queues** (POSIX `mq_open`/`mq_send`/`mq_receive`, System V `msgget`): preserve message boundaries; POSIX queues support priorities.
- **Sockets:** bidirectional endpoints. *UNIX domain sockets* for processes on the same machine (fast, can pass file descriptors); *Internet sockets* (TCP/UDP) across machines (→ CN).
- **Memory-mapped files:** multiple processes `mmap` the same file with `MAP_SHARED` (→ OS-7.2).
- **Windows:** ALPC (advanced local procedure call), named pipes, shared memory sections.
- **RPC (remote procedure call):** makes a call to a function on another machine look like a local call; built on message passing.

### Signals

A **signal** is a small asynchronous notification sent to a process: a software analogue of a hardware interrupt. It carries only a number (the signal type), not data.

Common signals:

| Signal | Default action | Typical cause |
|---|---|---|
| `SIGINT` | Terminate | Ctrl+C at the terminal |
| `SIGTERM` | Terminate | `kill <pid>` (polite request to exit) |
| `SIGKILL` | Terminate | `kill -9 <pid>`; **cannot be caught, blocked, or ignored** |
| `SIGSTOP` | Stop | Cannot be caught, blocked, or ignored |
| `SIGTSTP` | Stop | Ctrl+Z |
| `SIGCONT` | Continue if stopped | `fg`, `bg`, `kill -CONT` |
| `SIGCHLD` | Ignore | A child stopped or terminated |
| `SIGSEGV` | Terminate + core dump | Invalid memory access |
| `SIGFPE` | Terminate + core dump | Arithmetic error such as integer divide by zero |
| `SIGPIPE` | Terminate | Write to a pipe with no reader |
| `SIGALRM` | Terminate | Timer set by `alarm()` expired |

**Lifecycle:**

1. **Generated:** by the kernel (a fault, a child exiting, terminal input) or by another process (`kill()`).
2. **Pending:** recorded in the target process's PCB.
3. **Delivered:** the kernel checks for pending, unblocked signals when the process is about to **return to user mode** (after a system call or interrupt). It then performs the action: default, ignore, or run a user-defined **handler**.

Important properties:

- A process can **block** (mask) signals temporarily with `sigprocmask()`; they remain pending until unblocked.
- **Standard signals are not queued**: if the same signal is generated five times while pending, it is delivered once. This is why a `SIGCHLD` handler must reap in a loop: `while (waitpid(-1, &s, WNOHANG) > 0);`
- A handler can run at any point in the program, so it may only call **async-signal-safe** functions (`write`, `_exit`...). Calling `printf` or `malloc` in a handler can deadlock or corrupt state if the main code was inside the same function when interrupted.
- Install handlers with `sigaction()` (preferred) rather than the older `signal()`, whose behaviour varies between systems.
- A blocking system call interrupted by a handled signal may fail with `EINTR`, unless the handler was installed with `SA_RESTART`.

---

## OS-2.5 · Threads

### Why threads?

Consider a web server. With one process handling one request at a time, a request waiting for disk blocks every other request. Creating a whole new process per request works but is expensive, and processes cannot easily share data such as a cache.

A **thread** is a single sequential flow of execution **within a process**. A process can have many threads, all running in the **same address space**. OSTEP describes a multithreaded program as having more than one point of execution, that is, several program counters, each fetching and executing from the same memory.

### What threads share and what they do not

```
 +----------------------- Process -----------------------+
 |   Code (text)     Data/BSS     Heap     Open files     |   shared by all threads
 |   Signal handlers   Working directory   User/group IDs |
 |                                                        |
 |   +-----------+    +-----------+    +-----------+      |
 |   | Thread 1  |    | Thread 2  |    | Thread 3  |      |   private to each thread
 |   | TID       |    | TID       |    | TID       |      |
 |   | PC, regs  |    | PC, regs  |    | PC, regs  |      |
 |   | Stack     |    | Stack     |    | Stack     |      |
 |   | Sig. mask |    | Sig. mask |    | Sig. mask |      |
 |   | errno,TLS |    | errno,TLS |    | errno,TLS |      |
 |   +-----------+    +-----------+    +-----------+      |
 +--------------------------------------------------------+
```

| Shared (per process) | Private (per thread) |
|---|---|
| Address space: code, globals, heap | Thread ID |
| Open file descriptors | Program counter and registers |
| Signal **handlers** (dispositions) | **Stack** (local variables, call frames) |
| Current working directory | Signal **mask** (which signals are blocked) |
| PID, user and group IDs | `errno` (each thread has its own) |
| Memory mappings | Thread-local storage |

Per-thread state is kept in a **Thread Control Block (TCB)**, similar to a PCB but much smaller.

Consequences:

- A global variable or a heap object is visible to all threads; a local variable is private **unless** its address is passed to another thread. Since stacks are in the shared address space, one thread *can* access another's stack through a pointer; nothing prevents it.
- Threads share data easily, which is their purpose, but **concurrent access to shared data causes race conditions** (→ OS-4.1).
- A crash in one thread (for example, a segfault) kills the **entire process**, since the signal's default action applies to the process.

### Benefits of threads

1. **Responsiveness:** a GUI thread stays responsive while a worker thread does a long computation.
2. **Resource sharing:** threads share memory and files automatically, without explicit IPC.
3. **Economy:** creating a thread and switching between threads is much cheaper than for processes; no new address space, no page-table switch, and the TLB and caches stay warm.
4. **Scalability:** threads of one process can run truly in parallel on multiple cores.

### Process vs thread

| | Process | Thread |
|---|---|---|
| Address space | Own | Shared with other threads in the process |
| Creation cost | High (new PCB, page tables, COW setup) | Low (TCB and a stack) |
| Context switch | Expensive (address space change, TLB effects) | Cheaper (same address space) |
| Communication | IPC via kernel (pipes, shared memory setup) | Directly through shared variables |
| Isolation | A crash does not affect other processes | A crash kills all threads in the process |
| Synchronization need | Only on explicitly shared resources | Constant, for all shared data |

### User-level threads vs kernel-level threads

**User-level threads (ULTs)** are managed entirely by a library in user space. The kernel knows nothing about them and sees only one process.

- **Pros:** thread creation and switching need no system call (just saving registers in user space), so they are extremely fast; scheduling can be customized per application; works even on an OS without thread support.
- **Cons:** if any thread makes a **blocking system call, the whole process blocks**, because the kernel only sees one schedulable entity. There is **no true parallelism**: the kernel gives the process one CPU. A thread that never yields can starve the others, since there is no timer preemption between user threads.

**Kernel-level threads (KLTs)** are known to and scheduled by the kernel.

- **Pros:** one thread blocking does not block the others; threads can run on different cores in parallel.
- **Cons:** every thread operation (create, switch, synchronize in contended cases) involves the kernel, so it is slower than ULTs.

### Threads in Linux

Linux does not have a separate "thread" object. Both processes and threads are **tasks** (`task_struct`), created by the **`clone()`** system call. Flags passed to `clone()` choose what the new task shares with its creator:

- `CLONE_VM` (address space), `CLONE_FILES` (file descriptor table), `CLONE_FS` (cwd, root), `CLONE_SIGHAND` (signal handlers), `CLONE_THREAD` (same thread group)...

`fork()` is essentially `clone()` sharing nothing; `pthread_create()` is `clone()` sharing almost everything. Each task has its own ID (the **TID**). Threads of one process form a **thread group** whose ID (TGID) is the TID of the first thread. `getpid()` actually returns the TGID, which is why all threads report the same PID, while `gettid()` returns each thread's own ID.

---

## OS-2.6 · Multithreading Models and Thread Programming

### Mapping user threads to kernel threads

```
 Many-to-one            One-to-one             Many-to-many (M:N)
 U  U  U  U             U   U   U              U  U  U  U  U
  \ |  | /              |   |   |               \ | \/ | /
     K                  K   K   K                 K   K   K
```

| Model | Description | Pros | Cons | Examples |
|---|---|---|---|---|
| **Many-to-one** | All user threads on one kernel thread | Fast user-space switching | One blocking call blocks all; no parallelism | Early Java "green threads", GNU Portable Threads |
| **One-to-one** | Each user thread is a kernel thread | True parallelism; blocking is per-thread | Kernel overhead per thread; limits on thread count | Linux (NPTL), Windows |
| **Many-to-many** | M user threads multiplexed on N ≤ M kernel threads | Many cheap threads plus parallelism | Complex to implement correctly | Go goroutines, Erlang processes, older Solaris |
| **Two-level** | M:N, plus ability to bind a user thread to a kernel thread | Flexibility | Complexity | Older Solaris, IRIX |

Linux and Windows chose one-to-one because kernel thread operations became cheap enough, and M:N is hard to get right (for example, it needs the kernel to tell the library when a thread blocks; *scheduler activations* was a research design for this). Language runtimes like Go implement M:N themselves on top of kernel threads.

### POSIX threads (pthreads)

The standard thread API on UNIX-like systems (compile with `-pthread`):

| Call | Purpose |
|---|---|
| `pthread_create(&tid, attr, func, arg)` | Start a new thread running `func(arg)` |
| `pthread_join(tid, &ret)` | Wait for a thread to finish and get its return value (like `waitpid` for threads) |
| `pthread_exit(ret)` | Terminate the calling thread |
| `pthread_detach(tid)` | Thread's resources are freed automatically when it ends; cannot be joined |
| `pthread_self()` | ID of the calling thread |
| `pthread_mutex_lock/unlock` | Mutual exclusion (→ OS-4.4) |
| `pthread_cond_wait/signal` | Condition variables (→ OS-4.6) |

Example: sum an array with several threads, each writing to its own slot so no locking is needed.

```c
#include <pthread.h>
#include <stdio.h>

#define N 1000000
#define T 4

long data[N];
long partial[T];

void *worker(void *arg) {
    long id = (long)arg;                    // thread index passed by value
    long start = id * (N / T), end = start + N / T;
    long sum = 0;
    for (long i = start; i < end; i++)
        sum += data[i];
    partial[id] = sum;                      // each thread writes only its own slot
    return NULL;
}

int main(void) {
    for (long i = 0; i < N; i++) data[i] = 1;

    pthread_t tid[T];
    for (long i = 0; i < T; i++)
        pthread_create(&tid[i], NULL, worker, (void *)i);
    for (int i = 0; i < T; i++)
        pthread_join(tid[i], NULL);         // wait for all workers

    long total = 0;
    for (int i = 0; i < T; i++) total += partial[i];
    printf("total = %ld\n", total);         // 1000000
    return 0;
}
```

Notes:

- The thread index is passed **by value** (cast to `void *`). Passing `&i`, the address of the loop variable, is a classic bug: by the time the thread reads it, `i` may already have changed (see S8).
- Returning a pointer to a thread's **local** variable from the thread function is also a bug; that stack is gone after the thread ends.
- A thread that is neither joined nor detached leaves behind resources, similar to a zombie process.
- Returning from `main()` (or calling `exit()`) terminates **all** threads, even ones still working. Use `pthread_join`, or end `main` with `pthread_exit()`.

### Threading issues

**`fork()` in a multithreaded process.** POSIX says the child contains **only a copy of the thread that called fork()**. If another thread held a mutex at that moment (for instance, the lock inside `malloc`), the child's copy of that mutex stays locked forever, with no thread to unlock it, so the child can deadlock. Safe practice: in a multithreaded program, the child should call only async-signal-safe functions and then `exec()` immediately.

**`exec()` in a multithreaded process** replaces the entire process: all threads are gone and the new program starts with one thread.

**Signals and threads.** Signal *handlers* are process-wide, but each thread has its own signal *mask*. A signal generated for a specific thread (like `SIGSEGV` from its own faulting instruction) is delivered to that thread. A signal sent to the process (like `kill`) is delivered to **one arbitrary thread** that does not block it. A common design blocks signals in all threads and dedicates one thread to receiving them with `sigwait()`.

**Thread cancellation** (terminating a thread before it finishes):

- *Asynchronous cancellation:* terminate immediately. Dangerous: the thread may be holding a lock or be halfway through updating shared data.
- *Deferred cancellation* (pthreads default): the thread checks for cancellation only at **cancellation points** (such as `read()`, `pthread_testcancel()`), where it can clean up safely.

**Thread pools.** Creating a thread per request has a cost and allows unbounded thread counts under load. A **thread pool** creates a fixed number of threads at startup that take tasks from a queue. Benefits: no creation cost per request, and a bound on concurrency. Java's `ExecutorService` and most web servers use this pattern.

**Thread-local storage (TLS).** Sometimes each thread needs its own copy of a "global" variable: `errno` is the standard example. C11 provides `_Thread_local` (GCC: `__thread`), and pthreads provides `pthread_key_create`/`pthread_getspecific`.

**Thread safety and reentrancy.** A function is *thread-safe* if multiple threads can call it at the same time correctly. Functions that use static internal state, such as `strtok()` or old `gethostbyname()`, are not; use the reentrant versions (`strtok_r()`). TLPI Chapter 31 covers this.

---

## OS-2.7 · Concurrency, Parallelism, and Amdahl's Law

### Concurrency vs parallelism

- **Concurrency:** multiple tasks **make progress** during overlapping time periods. On a single core this happens by interleaving (time-sharing).
- **Parallelism:** multiple tasks **execute at the same instant** on different cores.

```
 Concurrency on 1 core:   | A | B | A | C | B | A | C |     (interleaved)
 Parallelism on 3 cores:  core 0: | A A A A |
                          core 1: | B B B B |
                          core 2: | C C C C |
```

Parallelism implies concurrency, but not the other way round. A useful summary: concurrency is about *structure* (dealing with many things at once), parallelism is about *execution* (doing many things at once).

### Kinds of parallelism

- **Data parallelism:** the same operation on different pieces of data, in parallel (each thread sums a quarter of an array, as above).
- **Task parallelism:** different operations in parallel (one thread decodes video while another decodes audio).

### Amdahl's law

If a fraction `S` of a program is inherently **serial** (cannot be parallelized) and `1 − S` is perfectly parallelizable, the best possible speedup on `N` cores is:

```
                     1
 Speedup(N) ≤ -----------------
               S + (1 − S) / N
```

As `N → ∞`, speedup approaches `1 / S`. A program that is 10% serial can never run more than 10× faster, however many cores you add. The serial part dominates.

In practice speedup is lower still, because of synchronization overhead, contention for locks and memory bandwidth, and load imbalance between threads.

**Gustafson's law** offers a more optimistic view for large problems: with more cores we usually solve **bigger** problems in the same time, and for many workloads the parallel part grows with problem size while the serial part stays fixed.

### Challenges of multicore programming

Dividing work into tasks, balancing the load, splitting data, managing dependencies between tasks, and testing and debugging code whose behaviour depends on timing. The last two lead directly into Unit 4.

---

## Quick Revision Sheet

- Process = program in execution: address space + registers + OS state (open files, etc.).
- Layout: text, data, BSS, heap (up), mmap region, stack (down), kernel space on top.
- PCB holds PID, state, saved registers, scheduling info, page table pointer, file table, signals.
- States: New → Ready ⇄ Running → Terminated; Running → Blocked → Ready. Blocked never goes straight to Running.
- Long-term (admission), short-term (CPU), medium-term (swapping) schedulers.
- Context switch: save/restore registers, switch page table and kernel stack. Pure overhead; indirect cache/TLB cost is often larger than the direct cost.
- `fork()`: returns 0 to child, child PID to parent, −1 on failure. Copies memory (COW), shares open file descriptions.
- `exec()`: replaces the program, keeps PID and file descriptors; never returns on success.
- `wait()`: collects exit status; without it, the dead child is a zombie. Orphans are adopted by init.
- Use `_exit()` in a forked child to avoid flushing duplicated stdio buffers.
- Shared memory: fast but needs synchronization. Message passing: kernel-mediated, synchronized.
- Pipes: unidirectional, close unused ends, EOF only when all write ends are closed, writes ≤ PIPE_BUF are atomic.
- `SIGKILL` and `SIGSTOP` cannot be caught or ignored. Standard signals are not queued.
- Threads share address space, files, and handlers; each has its own stack, registers, and signal mask.
- ULTs: fast, but blocking call blocks all, no parallelism. KLTs: parallelism, higher overhead.
- Linux: everything is a task created by `clone()`; `getpid()` returns the thread group ID.
- Amdahl: speedup ≤ 1 / (S + (1 − S)/N); upper bound 1/S.

---

## Worked Numerical Problems

### N1 · Counting processes created by fork (OS-2.3)

**Question.** How many processes exist in total (including the original) after each fragment runs? Assume every `fork()` succeeds.

(a)
```c
for (int i = 0; i < 3; i++)
    fork();
```
(b)
```c
fork();
fork();
printf("x\n");      // how many x's are printed?
```
(c)
```c
fork() && fork() || fork();
```

**Answer.**

(a) Every existing process forks in each iteration, so the count doubles three times: 2³ = **8 processes** (7 new).

(b) After two forks there are 4 processes, each printing once: **4 x's**.

(c) Trace the short-circuit evaluation. `A && B || C` is `(A && B) || C`.
- Original process P executes `fork()` (A). In P, A ≠ 0 (true), so P evaluates B. In the new child C1, A = 0 (false), so `A && B` is false without evaluating B, and C1 evaluates C.
- P executes B = `fork()`. In P, B ≠ 0, so `A && B` is true and `|| C` is skipped. In the new child C2, B = 0, so `A && B` is false and C2 evaluates C: one more fork, creating C3.
- C1 evaluates C = `fork()`, creating C4.
- Processes: P, C1, C2, C3, C4 = **5 processes**.

### N2 · fork and stdio buffering (OS-2.3, OS-1.5)

**Question.** How many `-` characters does this print?

```c
int main(void) {
    for (int i = 0; i < 2; i++) {
        fork();
        printf("-");
    }
    return 0;
}
```

**Answer.** It depends on buffering, which is the whole point of the question.

- If output were written immediately: iteration 0 gives 2 processes, each printing once (2); iteration 1 gives 4 processes, each printing once (4). Total **6**.
- In reality `printf("-")` has no newline, so the `-` stays in the stdio buffer. At iteration 1, each `fork()` **copies the buffer**, including the `-` already in it. Each of the 4 final processes ends up with `--` in its buffer and flushes it at exit. Total **8**.

Adding `fflush(stdout)` after `printf`, or using `write(1, "-", 1)`, gives 6.

### N3 · Amdahl's law (OS-2.7)

**Question.** (a) A program is 80% parallelizable. What is the maximum speedup on 4 cores, 16 cores, and infinitely many cores? (b) How many cores are needed for a speedup of 4? (c) A different program shows a speedup of 3 on 4 cores. Assuming Amdahl's model holds exactly, what is its serial fraction, and what is its maximum possible speedup?

**Answer.** S = 0.2.

(a)
- N = 4: 1 / (0.2 + 0.8/4) = 1 / 0.4 = **2.5×**
- N = 16: 1 / (0.2 + 0.05) = 1 / 0.25 = **4×**
- N → ∞: 1 / 0.2 = **5×**

(b) 1 / (0.2 + 0.8/N) = 4 → 0.2 + 0.8/N = 0.25 → 0.8/N = 0.05 → **N = 16**.

(c) 1 / (S + (1 − S)/4) = 3 → S + (1 − S)/4 = 1/3 → 4S + 1 − S = 4/3 → 3S = 1/3 → **S = 1/9 ≈ 11.1%**. Maximum speedup = 1/S = **9×**.

Going from 4 to 16 cores (4× the hardware) only takes speedup from 2.5 to 4.

### N4 · Circular buffer state (OS-2.4)

**Question.** A producer and consumer share the circular buffer from OS-2.4 with `BUFFER_SIZE = 8`, starting with `in = out = 0`. (a) What is the maximum number of items the buffer can hold? (b) After the producer has produced 20 items and the consumer has consumed 15, what are `in`, `out`, and the number of items in the buffer? (c) If the producer now tries to add 3 more items (and the consumer does nothing), what happens?

**Answer.**
(a) **7** (N − 1), since one slot stays empty to distinguish full from empty.
(b) `in = 20 mod 8 = 4`, `out = 15 mod 8 = 7`. Items = `(in − out + N) mod N = (4 − 7 + 8) mod 8 =` **5** (which matches 20 − 15).
(c) The first 2 items fit (count reaches 7, `in = 6`). For the third, `(in + 1) % 8 = 7 = out`, so the buffer is full and the producer **busy-waits** until the consumer removes an item.

### N5 · Blocking I/O with different threading models (OS-2.5, OS-2.6)

**Question.** A process has 4 threads, each doing: 10 ms of computation, then a blocking I/O call that takes 40 ms, then 10 ms of computation. Assume a single CPU core, that I/O operations of different threads can proceed at the same time, and that thread switching costs are negligible. Threads start in order T1, T2, T3, T4. How long until all threads finish under (a) a many-to-one model, (b) a one-to-one model? (c) What is CPU utilization in each case? (d) What about one-to-one on 2 cores?

**Answer.**

(a) Many-to-one: when a thread makes the blocking call, the kernel blocks the **only** kernel thread, so no other user thread can run. Each thread effectively runs 10 + 40 + 10 = 60 ms with nothing overlapping: 4 × 60 = **240 ms**.

(b) One-to-one: while one thread waits for I/O, another computes.

```
 CPU:  T1 0-10 | T2 10-20 | T3 20-30 | T4 30-40 | idle 40-50 | T1 50-60 | T2 60-70 | T3 70-80 | T4 80-90
 I/O:  T1 10-50, T2 20-60, T3 30-70, T4 40-80
```

All done at **90 ms**.

(c) Total CPU work = 4 × 20 = 80 ms. Many-to-one: 80 / 240 = **33%**. One-to-one: 80 / 90 = **89%**.

(d) Two cores: T1 and T2 compute 0 to 10, T3 and T4 compute 10 to 20. I/O finishes at 50, 50, 60, 60. Final computation: T1 and T2 50 to 60, T3 and T4 60 to 70. Done at **70 ms**. The 40 ms I/O wait now dominates; more cores cannot shorten it.

### N6 · Zombie accumulation (OS-2.3)

**Question.** A server forks a child for every request, receiving 50 requests per second. Each child finishes its work in 1 second and exits, but the server never calls `wait()`. The system can have at most 32,768 PIDs, and about 800 are used by other processes. How long until `fork()` starts failing? How many processes are *actually running* at any time?

**Answer.** Each child becomes a zombie after 1 second and keeps its PID forever. PIDs available ≈ 32,768 − 800 ≈ 31,968. At 50 per second: 31,968 / 50 ≈ **639 seconds, about 10.7 minutes**. After that, `fork()` fails with `EAGAIN`.

Only about **50** children are actually running at any instant (those started within the last second). All the others are zombies consuming no CPU and almost no memory, yet they exhaust the PID space. Also note that in practice a per-user process limit (`ulimit -u`) is often hit first.

### N7 · Direct and indirect context switch cost (OS-2.2)

**Question.** Direct context switch cost is 3 µs. After each switch, the incoming process incurs 500 extra cache misses to warm the cache, each costing 100 ns. Two CPU-bound processes alternate every 4 ms time slice. (a) What fraction of CPU time is overhead? (b) What fraction of the overhead is indirect? (c) If the two were threads of the same process instead, which cost would shrink?

**Answer.**
(a) Indirect = 500 × 100 ns = 50 µs. Total per switch = 53 µs. Overhead = 53 / (4,000 + 53) ≈ **1.3%**.
(b) 50 / 53 ≈ **94%** of the overhead is indirect.
(c) With threads, no page-table switch is needed, so there is no TLB flush and the direct cost shrinks a little. Threads also share code and data, so more of the cache may still be useful to the incoming thread, which reduces the indirect cost. It does not vanish entirely, because each thread has its own stack and working data.

### N8 · Process vs thread creation cost (OS-2.5)

**Question.** Creating a process takes 100 µs; creating a thread takes 10 µs. A server handles 5,000 requests per second on one core. What fraction of the core goes to creation alone if it creates (a) a process per request, (b) a thread per request, (c) uses a pool of 16 threads created at startup?

**Answer.**
(a) 5,000 × 100 µs = 0.5 s per second = **50%**.
(b) 5,000 × 10 µs = 0.05 s per second = **5%**.
(c) 16 × 10 µs = 160 µs **once** at startup; essentially **0%** per second afterwards. This is the main motivation for thread pools.

---

## Scenario Questions (Test Your Understanding)

Each describes a situation. Reason from the mechanisms above before opening the answer.

### S1 · Output appears twice only in a file (OS-2.3)

```c
printf("starting\n");
if (fork() == 0) { printf("child\n"); return 0; }
wait(NULL);
printf("parent\n");
```

Run in a terminal, `starting` appears once. Run as `./prog > log.txt`, the file contains `starting` twice. Why, and how do you fix it?

<details><summary>Answer</summary>

With a terminal, stdout is line-buffered, so `starting\n` is flushed by `printf` before `fork()`. With a file, stdout is fully buffered: `starting\n` is still in the user-space buffer at `fork()`, the child gets a copy of that buffer, and **both** processes flush it when they exit.

Fixes: call `fflush(stdout)` before `fork()`; or have the child exit with `_exit()` instead of returning from `main` (so it does not flush the inherited buffer, though then its own output needs explicit flushing); or disable buffering with `setvbuf`.

</details>

### S2 · Two processes writing to one file (OS-2.3)

Program A opens `log.txt` for writing, then forks, and parent and child each write 100 lines. Program B forks first, then parent and child each open `log.txt` separately and write 100 lines. In one case the file has 200 lines; in the other, many lines are lost. Which is which?

<details><summary>Answer</summary>

In **A**, both processes share one open file description (inherited through fork), which has a **single file offset**. Each write advances the shared offset, so writes go one after another: **200 lines** (possibly interleaved in order, but none lost).

In **B**, each `open()` creates a separate open file description with its **own offset starting at 0**. Both processes write at offsets 0, 1 line, 2 lines... and overwrite each other: **lines lost**. Opening with `O_APPEND` fixes this, because each write then atomically moves to the end of the file first.

</details>

### S3 · Zombies that will not die (OS-2.3)

`ps` on a server shows hundreds of processes marked `<defunct>`. An admin runs `kill -9` on each; they remain. Why does `kill -9` not work, and what are two ways to clean them up?

<details><summary>Answer</summary>

They are **zombies**: already terminated. There is no running code to receive the signal; only a process-table entry holding the exit status for the parent. A signal cannot make a dead process "more dead."

Clean-up options: (1) Fix the parent to reap children (call `waitpid`, typically from a `SIGCHLD` handler, or set `SIGCHLD` to `SIG_IGN`). (2) Terminate the **parent**; the zombies become orphans, are adopted by init (PID 1), and init reaps them.

</details>

### S4 · Some children never get reaped (OS-2.4)

A parent forks 10 children that all exit at almost the same moment. Its `SIGCHLD` handler is:

```c
void handler(int sig) { wait(NULL); }
```

Afterwards, `ps` shows several zombie children. Why?

<details><summary>Answer</summary>

Standard signals are **not queued**. While `SIGCHLD` is pending (or the handler is running with `SIGCHLD` blocked), further `SIGCHLD`s for other exiting children merge into that single pending signal. The handler runs fewer than 10 times, and each call reaps only one child.

Fix: reap every child that has exited, each time the handler runs:
```c
void handler(int sig) {
    int saved = errno;
    while (waitpid(-1, NULL, WNOHANG) > 0)
        ;
    errno = saved;
}
```
(Saving and restoring `errno` prevents the handler from clobbering the main program's `errno`.)

</details>

### S5 · The pipeline that never finishes (OS-2.4)

A parent creates a pipe and forks. The child reads from the pipe until `read()` returns 0 and then prints a total. The parent writes some data, closes its write end, and calls `wait()`. The child forgot to close **its own** copy of the write end. What happens?

<details><summary>Answer</summary>

`read()` returns 0 (EOF) only when **every** descriptor for the write end is closed. The child still holds one, so after it reads all the data, its next `read()` blocks forever waiting for more input that it could, in principle, write itself. The parent blocks forever in `wait()`. Both hang: a deadlock caused by a leaked file descriptor.

Rule: after `fork()`, every process closes the pipe ends it does not use.

</details>

### S6 · The frozen user-level thread library (OS-2.5)

A chat application uses a user-level (many-to-one) thread library. One thread handles the GUI; another waits for network messages with a blocking `recv()`. Whenever no message arrives, the GUI freezes. With the same code built against Linux pthreads, it works fine. Explain.

<details><summary>Answer</summary>

With many-to-one threads, the kernel sees one process with one kernel thread. When the network thread calls `recv()`, the **kernel blocks that single kernel thread**, and the user-level library never gets a chance to switch to the GUI thread. The whole process sleeps until data arrives.

Linux pthreads are one-to-one: each thread is a kernel task, so only the network thread blocks and the GUI thread keeps running. User-level libraries work around this with non-blocking I/O plus `select`/`poll`, or a jacket wrapper around blocking calls.

</details>

### S7 · Deadlock in a freshly forked child (OS-2.6)

A multithreaded server occasionally hangs right after `fork()`: the child calls `printf()` (or `malloc()`) and never returns. The parent is fine. What is happening?

<details><summary>Answer</summary>

The child contains only a copy of the thread that called `fork()`. If, at that instant, **another** parent thread held an internal lock (for example, the stdio lock or the `malloc` arena lock), the child's copy of memory contains that lock in the locked state. The thread that would unlock it does not exist in the child. When the child calls `printf`/`malloc`, it waits forever for the lock.

Rule: after `fork()` in a multithreaded program, the child should call only async-signal-safe functions and then `exec()` promptly (or use `posix_spawn()`).

</details>

### S8 · Threads print the wrong IDs (OS-2.6)

```c
int i;
for (i = 0; i < 4; i++)
    pthread_create(&t[i], NULL, worker, &i);   // worker prints *(int *)arg
```

Expected output `0 1 2 3` (in some order). Actual runs print things like `1 2 4 4` or `4 4 4 4`. Explain both the duplicates and the `4`.

<details><summary>Answer</summary>

Every thread receives the **same pointer**, `&i`, to a single variable in main's stack, which the loop keeps modifying. A thread reads `*arg` whenever it happens to be scheduled, which may be after `i` has already been incremented one or more times. So several threads can read the same value, and some values are never seen. After the loop ends, `i` is 4, so threads that run late print `4`, which is not even a valid index.

Fix: pass the value itself (`(void *)(long)i`) or give each thread its own storage (an array `ids[i] = i; ... &ids[i]`).

</details>

### S9 · Same address, different values (OS-2.3, OS-1.1)

After `fork()`, the parent and child both print `&x` and `x`. Both show the same address, `0x7ffd1c2a`, but the parent prints `x = 99` and the child `x = 101`. How can one address hold two values?

<details><summary>Answer</summary>

The printed address is a **virtual address**. Each process has its own page table mapping its virtual pages to physical frames. After fork (with COW), both initially map that page to the same physical frame, read-only. When one writes `x`, the kernel copies the page, and from then on the same virtual address in the two processes maps to **different physical frames**. This is memory virtualization (← OS-1.1, → OS-6.4, OS-7.2).

</details>

### S10 · A process that ignores kill -9 (OS-2.2)

A process accessing a file on an unresponsive network (NFS) server shows state `D` in `ps`. `kill -9` has no effect for minutes. It is not a zombie. Why?

<details><summary>Answer</summary>

`D` is **uninterruptible sleep**. The process is blocked inside the kernel in a code path that has chosen not to be woken by signals, typically because abandoning the I/O midway could leave kernel or file system state inconsistent. `SIGKILL` stays pending and is acted on only when the process wakes up and is about to return to user mode. Until the I/O completes or times out, nothing happens. (Linux added a `TASK_KILLABLE` state so many such waits can at least be woken by fatal signals.)

</details>

### S11 · "This should never print" (OS-2.3)

```c
execvp(argv[1], &argv[1]);
printf("Done running %s\n", argv[1]);
```

A user reports that the program sometimes prints `Done running ...`. The developer claims this is impossible because the line comes after `exec`. Who is right, and when does it print?

<details><summary>Answer</summary>

The user is right. `exec` never returns **on success**, but it returns −1 on **failure**: the command does not exist (`ENOENT`), is not executable (`EACCES`), is not a valid executable format (`ENOEXEC`), and so on. The line runs exactly in those cases, and the message is misleading. The correct code is `perror("execvp"); _exit(127);` after the call. (127 is the conventional shell exit code for "command not found.")

</details>

### S12 · Design decision: tabs as processes or threads? (OS-2.5)

A browser team debates whether each tab should be a thread in one process, or a separate process. Give the main argument on each side and say what Chrome and Firefox chose.

<details><summary>Answer</summary>

**Threads:** cheaper to create, lower memory use, and tabs can share caches and data directly without IPC.

**Processes:** isolation. A crash or memory-corruption bug in one tab kills only that tab's process. Each renderer process can be sandboxed with reduced privileges, so a compromised page cannot read other tabs' memory (important for security, especially after Spectre-style attacks). The costs are higher memory use and IPC for coordination.

Chrome chose multiple processes from the start (browser process, renderer processes, GPU process); Firefox moved to a multi-process design as well. Both cap or share processes when there are many tabs to limit memory use. This is the process-vs-thread trade-off from OS-2.5 in a real product.

</details>

---

## References and Further Reading

- **OSTEP:** Chapter 4 *The Abstraction: The Process* (machine state, process states, the xv6 proc structure); Chapter 5 *Interlude: Process API* (fork, exec, wait, and why they are separate); Chapter 26 *Concurrency: An Introduction*; Chapter 27 *Interlude: Thread API*.
- **The Linux Programming Interface:** Chapter 6 *Processes* (memory layout, environment); Chapter 5 *File I/O: Further Details* (file descriptors vs open file descriptions); Chapters 24 to 28 (process creation, termination, monitoring children, program execution); Chapters 20 to 22 (signals); Chapters 29 to 33 (threads); Chapter 44 *Pipes and FIFOs*.
- **Mythili Vutukuru, IIT Bombay OS lectures:** the process abstraction and process API lectures, and the xv6 lectures on process creation, context switching through the scheduler, and the `sched()`/`swtch()` mechanism.
- **xv6 source:** `proc.h` (struct proc, struct context), `proc.c` (`fork`, `exit`, `wait`, `scheduler`, `sched`, `yield`), `swtch.S`.
- `man 2 fork`, `man 2 execve`, `man 2 waitpid`, `man 7 pipe`, `man 7 signal`, `man 7 pthreads`, `man 2 clone`; experiment with `ps -eLf`, `pstree`, and `/proc/<pid>/`.

---

**Next:** Unit 3, CPU Scheduling (→ OS-3). Now that we know processes move between Ready and Running, the next question is *which* ready process should run, and for how long.