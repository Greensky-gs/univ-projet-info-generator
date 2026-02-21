# Univ projet info generator

A simple script to create an image of a checkers board (I know it is supposed to be 10x10, but the rules are 8x8 ;-;)

## Usage

1. Install : `git clone https://github.com/Greensky-gs/univ-projet-info-generator`
2. Install `nodejs` and `npm` (or `yarn`)
3. Launch the code with `node main.js`
4. Use the cli :
  * clear : clears the screen
  * preview : displays the current state of the cached pawns
  * push : write the pawns into the image
  * save : writes the image out and exits
  * *xyc* : Add a pawn at *x* and *y* (starting at 0) of color *c* (`w` for white and `b` for black)
  * *rxyc* : Same, but removes the pawn if it exists
  * default : add the default configuration of the board
