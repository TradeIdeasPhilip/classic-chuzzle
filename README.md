# Classic Chuzzle

## Status

Missing a lot, but playable.

Here's an old video: https://youtu.be/IjQcdktLzLY.

## How to Play

Try it yourself: https://tradeideasphilip.github.io/classic-chuzzle/.

Drag a cell until you have a group of 3 or more cells of the same color touching.
Those will disappear and be replaced with new cells.

If you connect 5 cells, you'll get a free bomb.
If you connect 6 or more cells, _each_ of those cells will give you a bomb.
(Someday soon I hope to _use_ the bombs, but for now at least you can _see_ the bombs.)

## Why?

I like Classic Chuzzle but I want to fix a few things.
I don't have their source code so I have to start from scratch.

## Interesting Tech

This is a nice example of the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).
I wish I'd learned about that much sooner.
It's a way to do animations with only JavaScript.
No CSS.

I'm really starting to like math-to-path.ts.
This is an extension of an [idea I've used before](https://github.com/TradeIdeasPhilip/divide-by-zero/blob/master/src/svg-sine-wave.ts).
This version is much more general.

## Unexpected Problems

The performance is fine on my laptop screen.
But the animations get jerky and glitchy on my android phone.
(Both are old but decent.)

I am surprised by the difference.
I'm doing things similar to what I did in https://tradeideasphilip.github.io/divide-by-zero/.
And that worked _well_ on my phone.

### The Problem

After a lot of trial and error I finally discovered this.

* There was a _conflict_ between my rotation animations and my additional animations that overlapped with the rotations.
* When I create a rotation animation on a `<g>` or a `<rect>`, SVG automatically does some caching.
  * That makes the rotation very smooth and efficient.
  * It works great by itself.
* When I try to change the colors, size or shape of the rotating object, that breaks the cache.
  * _Every frame_ the second animation will invalidate the cache.
  * And _every frame_ the cache will be rebuild.
  * The invalidating often happens when nothing really changed, like changing the fill for a group when all of the group's children have an explicit fill.
  * The cache is rebuilt even if the `<g>` or `<rect>` is completely covered by other objects.
* When I `pause()` the rotation animation, it does _not_ prevent this problem!
  * That caused me a lot of confusion.
  * When I commented out the rotation, everything got better.

### Short Term Plan

For now I'm happy with the current background animation.
It's a little different than what I initially pictured, but it looks nice and it is efficient.

However, I might want to learn more about this problem just for my own info.
Based on my most recent test results, this is what I'd like to try next:

* What if I create the animations in the opposite order?
  * So the rotation animation will know about the other animations.
  * And hopefully plan accordingly.
* What if I put the `rotate()` and `scale()` into the same animation?
  * The the animation code can see both of these at once.
* What if I broke the rotating group into smaller pieces?
  * Maybe it would cache the smaller pieces and do a better job.
  * This would be a perfect place to use CSS motion path animations.
* What if I did the rotation using `getAnimationFrame()`?
  * (So the system wouldn't know that I was planning to do more rotations.)
  * And did the rest of the animations via CSS and the animation API.  

The rest of these solutions are from earlier brainstorming sessions.
They are still interesting, but they are no longer urgent.

### Simpler Background

I'm trying to figure out what makes some flying squares so much worse than completely recreating the springs and sine waves in my previous example.

One obvious difference is the backgrounds.
In the previous example the animations were all drawn on top of a static bitmap image.
This project uses more complicated backgrounds.
There are multiple layers each with partial transparency and animations of their own.

*My initial thoughts:* This seems overblown, but it's the easiest to test.

I had that backwards.
It was complicated to test because so multiple elements were interacting with each other.
And this did lead me to the problem and the workaround.

I'm sure I can make the background do more now that I know what to avoid.
And I bet I will eventually find a way to make the original version more efficient.

### Grouping Moving Objects

This approach has helped me before on other projects.

- Make a `<g>` element for all of the squares that are moving down exactly one grid cell.
- Make another `<g>` element for all the squared that are moving down 2, 3, 4, 5 or 6 cells.
- Attach the squares that need to move to those new `<g>` elements, then only animate the `<g>` elements.
- Simplify some of the other animations so that all of the cells are moving the same way at the same time.

I'm a little surprised that that approach has helped so much in the past.
Especially when my previous example was basically redrawing big chunks of the screen each frame.
It makes me wonder if the CSS system is doing really stupid and inefficient things.
Or if I remember things totally wrong.

This will be an interesting test.
Even if one of the other approaches solves the problem, I still want to see these results.

### Move Fewer Things at Once

Instead of having all of the pieces fly off the screen at once,
make them fly off one or two at a time.
Each individual animation will have to be faster, so the total time stays about the same.

It seems like the phone is good with a few objects moving at a time.
So limit our graphics to what we know the browser can handle.
Eventually it should autodetect what it can do, but for now a radio button will suffice.

This overlaps the previous approach.
Both approaches assume that the number of animations is part of the problem.

### Doing the Animation Completely in JavaScript

In the [calculus and physics demos](https://tradeideasphilip.github.io/divide-by-zero/#Physics_Examples) that I've I've referenced several times, I use SVG for all of the drawings, but I avoided CSS animations.

Instead I captured the animation frame call back.
In that callback I'd update the properties of the SVG objects as needed.
Some objects would slide or rotate.
I'd completely change the path of other objects.

This worked very well, even on my phone.
Which is why I'm surprised that my current approach doesn't work as well.
I definitely want to try this again.
I'm optimistic that this will work again.
And if it doesn't, then I've learned a lot.

This style of animation is always a small but noticeable amount behind the mouse.

See my notes above.
I definitely need to try this when I rotate big things in an animation.

### Moving Things Faster

The animation problems are most obvious when the objects are moving slowly.
When things are racing across the screen it's hard to see enough detail to notice jumpy animation.

This does not solve the problem of glitches.
Sometimes I see the background when it should be hiding behind something else.
Both the jumpiness and the glitches when I improved the rotating problem, described above.

## Open Question

Is there a good way to know when the browser is overloaded?

It might make sense to do more animations when you can get away with it.
But do fewer or simpler animations when there are fewer resources.
So no one sees jumpy or glitchy animations.
