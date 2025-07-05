+++
title = "Introducing blobs, which will one day be a programming game."
date = 2025-06-29
+++

![Blob simulation](/images/simulation_slow.avif)

Being unemployed is busier than I thought it would be, and projects are hard to finish when you have a toddler or a teen. Or in my case, both! This project is not at all finished, but nearing a place where I want to cajole acquaintances to participate in it.

The idea for this projects dates all the way back to my undergrad physics days, where I developed a persistent fascination with [cellular automata](https://en.wikipedia.org/wiki/Cellular_automaton), specifically Conway's Game of Life. The complexity you can achieve with a simple set of rules is astounding, and it's full of easy-to-describe problems that are actually very difficult to figure out. For example, are there any [Gardens of Eden](https://conwaylife.com/wiki/Garden_of_Eden) patterns (i.e. those with no parents) that fix within a 7x7 square? [Nope](https://www.complex-systems.com/abstracts/v32_i01_a01/)! Interesting new patterns are discovered all the time, like the first elementary "knightship" [Sir Robin](https://conwaylife.com/wiki/Sir_Robin), which was discovered in 2018 after a concerted search effort. 

This project has nothing to do with cellular automata, really, but it called to the same curiosity when I saw the blog post that started it all. It's been too long for me to remember exactly how I came across it, but the post in question is still on blogspot [here](https://phonons.wordpress.com/2010/06/01/cells-a-massively-multi-agent-python-programming-game/), and that project is on [github](https://github.com/phreeza/cells), too. Just go ahead and read it for the deets, but it outlines the concepts of a programming game in which participants put together a program that controls a swarm of agents exploring a 2D grid-based world. 

So what is my project then? It's the same thing (mostly), but written in rust! I don't know that I ever made a "mind" program for the original, but the idea lived in my head rent-free for years anyways. So I decided to take a crack at it. One of the things that bothered me about the original was that there was a global message queue that the agents could use to coordinate. That sort of coordination is interesting in its own way, but I wanted something closer to a cellular automaton where all decisions have to be made on local information. I also wanted some way to accept submissions from the internet, which means I have to worry about arbitrary code execution. I haven't gone too far down that rabbit hole yet, but in my initial sketch I kept that idea in mind and made sandboxing the mind functions a priority for the initial version. 

I looked at various rust-based embeddable scripting languages ([rhai](https://rhai.rs/), [rune](https://rune-rs.github.io/)) before setting on using WebAssembly via [Extism](https://extism.org/). WebAssembly can be quite performant, and it opens up the door to running everything in the browser eventually. It also allows participants to use other languages besides rust if they want.

Since WASM will run in a VM, it is very sandbox-able. This is important from the perspective of running some rando's code, but also because it allows me to ensure no minds are cheating by storing extra state. Each invocation of the mind function will only have its input to operate on. I think that's interesting for its own sake, but it has the added benefit of making the execution of each agent's decision-making embarrassingly parallel. So someday maybe I'll make a truly large simulation with billions of agents and run it across multiple nodes.

As far as other notable design considerations go, I want to eventually produce minds using reinforcement learning, and make the meta-game about whether a human-produced agent mind can beat a learned one. Another break in my version from the original is that each blob (called cells in the original) doesn't have complete information about other blobs it encounters. Instead, it only receives an id value that blob has stored. I don't currently have any functionality to change that id for an existing blob, but new blobs can be created with arbitrary ids. This allows for deceptive behaviors and subterfuge. I'm very interested to see if a learned policy would be able to exploit that quirk. One day!

One thing I'm not currently happy with is that message-passing can only happen between neighbor blobs, and requires an action. This is probably a bit too costly to see much use in an emergent setting. I'm considering making a larger region of visibility for each blob and a correspondingly larger radius for sending messages. That seems like a reasonable balance to encourage message-passing for reactive behaviors without allowing one blob to trivially assume a sort of central control and dispatch orders to all the other units. 

There are still a lot of things to do, some of which will get knocked out within the week, and others which will take a while and depend on any of my acquaintances taking an interest:

1) Make a win condition. Should be either destroying the opposing teams' blobs, or a score based on total energy of living blobs and percentage of the map explored.
2) Take a crack at creating a reasonable mind function myself. The existing ones are vibe-coded messes that don't do anything.
3) Add a bunch of tests and squash a lot of bugs.
4) Add more plots/introspection. You can currently use the GUI to see info about all the blobs in the field, but it's pretty dumb and basic. I want charts and plots, etc.
5) Parallelize execution for simulation speedup
6) Create an ML/RL based mind program to rule over all the rest.


That's all for now. Thanks for reading along. 