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

There are a few different approaches I want to try.
I don't know the exact problem, so I'm exploring.

### Simpler Background

I'm trying to figure out what makes some flying squares so much worse than completely recreating the springs and sine waves in my previous example.

One obvious difference is the backgrounds.
In the previous example the animations were all drawn on top of a static bitmap image.
This project uses more complicated backgrounds.
There are multiple layers each with partial transparency and animations of their own.

This seems overblown, but it's the easiest to test.

**Result:**

I disabled the background and everything got a lot faster.
My phone didn't didn't have any problems with the remaining animations.
My browser was not having problems, but when I checked the task manager, the version with an animated background was using a lot more resources.

This should not have been a complete surprise.
The squares don't always line up perfectly.
Sometimes you can see the background moving between two adjacent squares.

I tried fixing this problem by making the squares 1% bigger than they need to be.
(Ideally I'd add just one pixel, but that's hard in SVG.)
I didn't notice any changes in my browser or on my phone.
I could see the extra pixels, and I couldn't see as much of the background.
But the performance was still bad on my phone.

I tried adding a rectangle completely hiding the background, but leaving the animation on.
That also had bad performance.

I tried leaving the background but disabling all the background animations.  
That seems to be working better.
Tests are still in progress.

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
