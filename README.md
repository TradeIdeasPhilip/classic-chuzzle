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
