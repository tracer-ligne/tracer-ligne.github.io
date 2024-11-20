const loadJSON = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const fonts = await loadJSON('futural.json');

/**
 * Render a string of text in a Hershey engraving font to a given SVG element
 *
 * @param {string} s
 *   Text string to be rendered
 * @param {object} options
 *   Object of named options:
 *    font {obj}: [Required] Font object containing path elements for font
 *    id {string}: [Required] ID to give the final g(roup) SVG DOM object
 *    pos {object}: [Required] {X, Y} object of where to place the final object within the SVG
 *    charWidth {int}: [Optional] Base width given to each character
 *    charHeight {int}: [Optional] Base height given to each character (when wrapping)
 *    scale {int}: [Optional] Scale to multiply size of everything by
 *    wrapWidth {int}: [Optional] Max line size at which to wrap to the next line
 *    centerWidth {int}: [Optional] Width to center multiline text inside of
 *    centerHeight {int}: [Optional] Height to center text inside of vertically
 *
 * @returns {boolean}
 *   Operates directly on the given target given in options, returns false if
 *   required option missing or other failure.
 */

 function renderText(s, options) {
  try {
    // const font = options.font.chars;
    const font = fonts[options.font].chars;
    options.charWidth = options.charWidth ? options.charWidth : 10;
    options.charHeight = options.charHeight ? options.charHeight : 28;

    const offset = { left: 0, top: 0 };
    options.scale = options.scale ? options.scale : 1;


    // Create central group
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", options.id);
    group.setAttribute("style", "stroke:#000000; fill:none;");
    group.setAttribute(
      "transform",
      "scale(" +
        options.scale +
        ") translate(" +
        options.pos.x +
        "," +
        options.pos.y +
        ")"
    );
    options.target.prepend(group);

    // Initial Line container
    let lineCount = 0;
    let groupLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    groupLine.setAttribute("id", options.id + "-line-" + lineCount);
    group.prepend(groupLine);

    // Move through each word
    const words = s.split(" ");
    words.forEach((word) => {
      // Move through each letter
      for (let i = 0; i < word.length; i++) {
        const index = word.charCodeAt(i) - 33;

        // Only print in range chars
        let charOffset = options.charWidth;
        if (font[index]) {
          charOffset = font[index].o;

          // Add the char to the DOM
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("d", font[index].d);
          path.setAttribute("style", "stroke:#000000; fill:none;");
          path.setAttribute(
            "transform",
            "translate(" + offset.left + ", " + offset.top + ")"
          );
          groupLine.prepend(path);
        }

        // Add space between
        offset.left += charOffset + options.charWidth;
      }

      // Wrap words to width
      if (options.wrapWidth) {
        if (offset.left > options.wrapWidth) {
          if (options.centerWidth) {
            const c =
              options.centerWidth / 2 - offset.left / 2;
            groupLine.setAttribute(
              "transform",
              "translate(" + c + ",0)"
            );
          }

          offset.left = 0;
          offset.top += options.charHeight;

          // New Line container
          lineCount++;
          groupLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
          );
          groupLine.setAttribute(
            "id",
            options.id + "-line-" + lineCount
          );
          group.prepend(groupLine);
        } else {
          offset.left += options.charWidth * 2; // Add regular space
        }
      } else {
        offset.left += options.charWidth * 2; // Add regular space
      }
    });

    if (options.centerWidth) {
      const c = options.centerWidth / 2 - offset.left / 2;
      groupLine.setAttribute("transform", "translate(" + c + ",0)");
    }

    if (options.centerHeight) {
      const c =
        options.centerHeight / 2 -
        (options.charHeight * (lineCount + 1)) / 2 +
        options.pos.y;
      group.setAttribute(
        "transform",
        "scale(" +
          options.scale +
          ") translate(" +
          options.pos.x +
          "," +
          c +
          ")"
      );
    }
  } catch (e) {
    console.error(e);
    return false; // Error!
  }

  return true; // We should be all good!
}


export { renderText };