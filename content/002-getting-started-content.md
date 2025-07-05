+++
title = "Getting Started... with the content"
date = 2020-03-02
+++

Today we're going to set up our toolchain to do some machine learning in C++, with the [PyTorch C++ API](https://pytorch.org/cppdocs/). Why C++? 'Cuz I don't really love Python (sorry Guido), and there are already many, many better tutorials for you to spend time with if you're looking for that.

Getting started with a new framework is an exercise in head-wall-beating, unless the creators have spent an untold amount of time ensuring it isn't, or it's a popular and stable enough project to be invited into the fold of a common linux distro's package manager, or it's popular and sexy enough that one or many 3rd parties have put the time in to make things palatable.

PyTorch ticks these boxes as long as you are on a well-trod path. Too bad we're not, eh? We're running a flavor of Ubuntu 19.10 aka Eoan Ermine. What's bad about that? We like to be on the bleeding edge.

So let's head on down to nvidia and download the latest release of [CUDA](https://developer.nvidia.com/cuda-downloads). They have a helpful button-selector-thing to guide you to the appropriate download.

**Operating System?** *Linux*.

**Architecture?** You better believe it's one of them *x86_64*'s.

**Distribution?** *Ubuntu*. Easy-peasy

**Version?** 18 o' wuh-oh!

Well, dang. Not gonna keep me down, though. 

My flavor of Ubuntu is [Pop!\_OS](https://system76.com/pop), and it packages its [own CUDA toolkit](https://support.system76.com/articles/cuda/). This actually is easy-peasy. We're not quite done yet, though. We can choose between cuda 10.0 and cuda 10.2. I'm a simple man, so I like the new thing. We go with 10.2.

Then we head on down to download [PyTorch](https://pytorch.org/get-started/locally/). They have their own little selector box magic that gives you a command to run. Let's hop to it.

**PyTorch Build?** *Stable(1.4)*. Dangerous as I am, let's go stable with this one.

**Your OS?** *Linux*.

**Language?** *C++/Java*. (Ew, Java)

**Cuda?** *10 point dangit it's not there*

So we can choose between 10.1 or 9.2, and neither of these matches what is available in our nicely-packaged repo. We have two options (assuming we don't downgrade our OS to 18.04 like we probably should).

1.  Use an alternative cuda installation method, like the [runfile approach](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html).

2.  Dig deeper until we find a version of libtorch that matches what we can do.

We go with number 2, and some google-fu leads us to [version 1.3 of libtorch, with cuda 10.0 support](https://download.pytorch.org/libtorch/cu100/libtorch-shared-with-deps-1.3.0.zip).

Some apt-magic and update-alternatives will let us have both 10.2 and our now-necessary 10.0 on our system simultaneously. Neat! Who needs SSD space?

All we need to do is extract that PyTorch zip somewhere reasonable and find us a sample. How about some of that promised MNIST? We can grab it from here: [github.com/pytorch/examples/tree/master/cpp/mnist](https://github.com/pytorch/examples/tree/master/cpp/mnist).

Put that  somewhere, follow the instructions in the readme, and we're off to the ra-

It doesn't work. Huh. We actually have 3 issues to sort out now:

1.  Cuda 10.0 ain't gonna work with the default version of gcc. [Use update-alternatives to allow switching between 7 and 9](https://askubuntu.com/a/26518).

2.  This version of the samples is for PyTorch 1.4, which has changed some syntax. [We just need to trawl through github commits to find the version before the change was made](https://github.com/pytorch/examples/pull/697/files). Tweak two lines, and we're done.

3.  [...except that libtorch 1.3 also has some busted hardcoded paths in a cmake file](https://github.com/pytorch/pytorch/issues/15476#issuecomment-478293447). A little find and replace and it's going to work like magic... right?


*Yes!* It actually does. It finally does. 

That's all for now. The moral of the story is: probably just stick to supported platforms unless you are a masochist or have a good reason to forge your own path.

Next time we'll actually talk about machine learning.