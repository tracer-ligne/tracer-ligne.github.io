import { roundPathCorners } from "./roundPathCorners.js";
gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);

// setup paper.js
const canvas = document.createElement("canvas");
canvas.style.display='none';
document.body.appendChild(canvas);
paper.setup(canvas);

let NAZ = 26;
let PX = 0;
let PY = 0;
let NN = 60;
let currentStroke = "#1405aa";
let currentWidth  = 1;
let tension = 1;
let din = false;
const NS = 'http://www.w3.org/2000/svg';

export const functionNames= {
  'adoucir': '_soften',
  'aide': 'help',
  'afficherLaGrille': 'showGrid',
  'animation': 'animate',
  'auHasard': 'random',
  'bruit': 'noise',
  'calligrammer': 'calligram',
  'cosinus': 'cosine',
  'courber': 'bend',
  'couleur': 'color',
  'cloner': 'clone',
  'crayon': 'pencil',
  'deplacer': 'move',
  'drapeau': 'flag',
  'epaisseur': 'thickness',
  'formatDin' : 'dinFormat',
  'fusionner': 'merge',
  'grouper': 'group',
  'inverserLeSens': 'reverseDirection',
  'placerSurGrille': 'placeOnGrid',
  'extrude' : '_extrude',
  'parcourir': 'traverse',
  'parcourSup': 'traverseSup',
  'relierLesPoints': 'connectPoints',
  'sinus': 'sine',
  'supprimer': 'remove',
  'tensionDeSpline': 'splineTension',
  'tramer': 'weave',
  'tramerEnPoints': 'stipple',
  'tortue': 'turtle',
  'tracerLeTexte': 'drawText',
  'tracerLeParagraphe': 'drawParagraph',
  'tourner': 'turn',
  'tracerLArc': 'drawArc',
  'tracerLArcDonut' : 'drawArcDonut',
  'tracerLesLignes': 'drawLines',
  'tracerLaSpline': 'drawSpline',
  'tracerLePolygone': 'drawPolygon',
  'tracerLeRectangle': 'drawRectangle',
  'tracerLeCercle': 'drawCircle',
  'tracerLEllipse': 'drawEllipse',
  'tracerLEquation': 'drawEquation',
  'tracerLEtoile': 'drawStar',
  'tracerLEquation': 'drawEquation',
  'tracerLeContour': 'drawOutline',
  'appliquerLesTransformations': 'applyTransformations',
  'png':'_png',
  'mp4':'_mp4',
  'langue':'language',
};


/**
 * inverser le sens du chemin SVG
 * @param {Element} element - Element SVG
 * @returns {Element} element
 * @example inverserLeSens(MonCercle)
 * @example inverserLeSens(tracerLeCercle(1,1,1)) 
 * reverse the direction of the SVG path
 * @param.en {Element} element - SVG Element
 * @returns.en {Element} element
 * @example.en reverseDirection(MyCircle)
 * @example.en reverseDirection(drawCircle(1,1,1))
 */
export const inverserLeSens = (element) => {
  if(element.tagName === "g"){
    let paths = element.querySelectorAll("path");
    paths.forEach(p => {
      let d = p.getAttribute("d");
      p.setAttribute("d", SVGPathEditor.reverse(d));
    });
  }else{
    let d = element.getAttribute("d");
    element.setAttribute("d", SVGPathEditor.reverse(d));
  }
  return element;
}


export const formatDin = (f="A6") => {
  din = true;
  let n = NAZ;

  let w = 50*n+50;
  let h = Math.floor(w * 1.414);
  let cy = (h-w)/2;
 
  $SVG.setAttribute("viewBox", `0 ${-cy} ${w} ${h}`);
  let width;
  if(f==="A6") width = 210/2; 
  if(f==="A5") width = 297/2;
  if(f==="A4") width = 210;
  if(f==="A3") width = 297;

  let height = Math.floor(width * (297/210));
  $SVG.setAttribute("width",width+"mm");
  $SVG.setAttribute("height", height+"mm");
}



/**
 * 
 * @param {Element} element - Element SVG
 * @returns {Element} element
 * @example tracerLeContour(MonRectangle,1)
 * 
 * @param.en {Element} element - SVG Element
 * @returns.en {Element} element
 * @example.en drawOutline(MyRectangle,1)
 */
 
export const tracerLeContour = (element,size=1,cap="round",join="round") => {
    if(element.tagName === "g"){
      let paths = element.querySelectorAll("path");
      paths.forEach(p => {
        let d = p.getAttribute("d");


        let pathObj = new paper.CompoundPath(d);


        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let offsetPathObj = PaperOffset.offsetStroke(pathObj, size, { cap:cap,join: join } );
        let dOffset = offsetPathObj.exportSVG().getAttribute("d");
        path.setAttribute("d", dOffset);
        path.style.fill = "none";
        path.style.stroke = currentStroke;
        path.style.strokeWidth = currentWidth;
        p.parentNode.appendChild(path);
        p.remove();
      });
      return element;
    }else{
      let d = element.getAttribute("d");
      let path1Obj = new paper.CompoundPath(d);
     

      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let offsetPathObj = PaperOffset.offsetStroke(path1Obj, size, { cap:cap,join: join } );
      let dOffset = offsetPathObj.exportSVG().getAttribute("d");
      path1.setAttribute("d", dOffset);
      path1.style.fill = "none";
      path1.style.stroke = currentStroke;
      path1.style.strokeWidth = currentWidth;
      $SVG.appendChild(path1);
      return path1;
    }
  };


function parseSVGTransform(transformString) {
  const transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1],
    origin: [0, 0, 0]
  };
  console.error(transformString);  
  const matches = transformString.match(/\w+\([^)]+\)/g);

  if (matches) {
    matches.forEach(match => {
      const [type, valuesString] = match.split('(');
      const values = valuesString.slice(0, -1).split(/[,\s]+/).map(Number);

      switch (type) {
        case 'translate':
          transform.translate = values.length === 1 ? [values[0], 0, 0] : 
                                values.length === 2 ? [...values, 0] : 
                                values;
          break;
        case 'scale':
          transform.scale = values.length === 1 ? [values[0], values[0], values[0]] : 
                            values.length === 2 ? [...values, 1] : 
                            values;
          break;
        case 'rotate':
          transform.rotate = values.length === 1 ? [0, 0, values[0]] : 
                              values.length === 2 ? [0, 0, ...values] : 
                              values;
          break;
        case 'matrix':
          transform.translate = [values[4], values[5], 0];
          transform.scale = [values[0], values[3], 1];
          transform.rotate = [0, 0, Math.atan2(values[1], values[0]) * (180 / Math.PI)];
          break;
      }
    });
  }
  console.error(transform);
  return transform;
}
  

export const appliquerLesTransformations = (element) => {
  let elements; 
  if(element.tagName === "g" ){
    elements = element.querySelectorAll("path");
  }else{
    elements = [element];
  }

  elements.forEach(element => {
    let transform = element.getAttribute("transform");
    transform = parseSVGTransform(transform);
    console.error(transform);
    let d = element.getAttribute("d");
    d = new SVGPathCommander(d,{round:false}).transform(transform).toString();
    element.setAttribute("d", d);
    element.setAttribute("transform", "");
  });
  if(element.tagName === "g"){
    element.setAttribute("transform","");
  }
  return element;
}

export const iniMain = () => {
  NAZ = 26;
  PX = 0;
  PY = 0;
  NN = 60;
  din = false;
  currentStroke = "#1405aa";
  currentWidth  = 1;
  tension = 1;

}

export const A = "A";
export const B = "B";
export const C = "C";
export const D = "D";
export const E = "E";
export const F = "F";
export const G = "G";
export const H = "H";
export const I = "I";
export const J = "J";
export const K = "K";
export const L = "L";
export const M = "M";
export const N = "N";
export const O = "O";
export const P = "P";
export const Q = "Q";
export const R = "R";
export const S = "S";
export const T = "T";
export const U = "U";
export const V = "V";
export const W = "W";
export const X = "X";
export const Y = "Y";
export const Z = "Z";


export const animation = () => {
  return false;
}

/**
 * fixe le bruit pour les fonctions de dessin
 * @param {number} x - bruit en x
 * @param {number} [y] - bruit en y (optionnel si non défini = x)
 * @param {number} n - lissage 
 */
/**
 * set the noise for drawing functions
 * @param.en {number} x - noise in x
 * @param.en {number} [y] - noise in y (optional if not defined = x)
 * @param.en {number} n - smoothing 
 */

export const bruit = (x=1,y,n=60) => {
  PX = x;
  PY = (y===undefined)?x:y;
  NN = n;
}

const createLetterPath = (d,x,y,s) => {
  if(d === undefined || d===null) return document.createElementNS(NS,'g');
  const path = document.createElementNS(NS,'path');
  const transform = {
    translate: [x, y], 
    scale: [s,-s],
    origin: [0,0]
  };
  // d  =  SVGPathCommander.normalizePath(d);
  // console.error(d);
  d = new SVGPathCommander(d).transform(transform).toString();


  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', currentStroke);
  path.setAttribute('stroke-width', currentWidth+'px');
  // path.setAttribute('stroke-width', currentWidth/s+'px');
  // path.setAttribute('transform', `translate(${x},${y}) scale(${s},${-s})`);

  return path;
}

// loadSVG font 
const loadSVGxml = async (url) => {
 const response = await fetch(url);
 const xml = await response.text();
 return new DOMParser().parseFromString(xml, 'image/svg+xml');
}

const svgfont = await loadSVGxml('ReliefSingleLine-Regular.svg');
const svgObj = {};
svgfont.querySelectorAll('glyph').forEach((glyph,i) => {
 svgObj[glyph.getAttribute('unicode')] = {d: glyph.getAttribute('d'), 'horiz-adv-x': glyph.getAttribute('horiz-adv-x') || 290};
});


const ecrire = (texte,x=1, y=1, scale=0.5,  target = $SVG, center = true, noise = false) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  target.appendChild($G);
  let startX = x;
  //console.log(x);
  if(texte.length===1 && center === true){
    let pathTmp = createLetterPath(svgObj[texte].d, 0, 0, scale*0.025);
    $G.appendChild(pathTmp);
    let bbox = pathTmp.getBBox();
    let _x = bbox.x;
    startX = 25 + x  - ((bbox.width)/2)*scale*0.025 - _x*scale*0.025;
    pathTmp.remove();
  }
  texte.split('').forEach((char,i) => {
    const glyph = svgObj[char];
    if(glyph){
      const noise = perlin.get(startX/NN,y/NN);
      const nx = startX + noise * PX;
      const ny = y + noise * PY;
      const path = createLetterPath(glyph.d, nx, ny, scale * 0.025);
      startX += parseFloat(glyph['horiz-adv-x']) * scale * 0.025;
      $G.appendChild(path);
      }
    });
  return $G;
}

const createSVGElement = (width = 400, height = 400, viewBox = "0 0 400 400") => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return svg;
}

const createCircle = (cx, cy, r, fill = "none", stroke = currentStroke) => {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  let noise = perlin.get(cx/NN,cy/NN);
  cx += noise * PX;
  cy += noise * PY;
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", stroke);
  return circle;
}

const createLine = (x1, y1, x2, y2, stroke = currentStroke,strokeWidth = currentWidth) => {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let noise = perlin.get(x1/NN,y1/NN);
  x1 += noise * PX;
  y1 += noise * PY;
  noise = perlin.get(x2/NN,y2/NN);
  x2 += noise * PX;
  y2 += noise * PY;
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke-width", strokeWidth);
  line.setAttribute("stroke", stroke);
  return line;
}

/**
 * couleur des ligne
 * @param {String} stroke couleur de la ligne
 * @param {Element} elements facultatif, accepte un élément ou un tableau d'éléments
 * @example couleur("red",MonCercle)
 * @example couleur("red",[MonCercle,MonRectangle])
 * @example couleur("red")
 * line color
 * @param.en {String} stroke line color
 * @param.en {Element} elements optional, accepts an element or an array of elements
 * @example.en color("red",MyCircle)
 * @example.en color("red",[MyCircle,MyRectangle])
 * @example.en color("red")
 */

export const couleur = (stroke = "#1405aa", elements) => {
  if(elements === undefined){
    currentStroke = stroke;
    return false; 
  }
  if(!Array.isArray(elements)){
    elements = [elements];
  }
  elements.forEach(element => {
    element.setAttribute("stroke", stroke);
    if(element.tagName === "g"){
      let paths = element.querySelectorAll("*");
      paths.forEach(p => p.setAttribute("stroke", stroke));
    }
  });
}

/**
 * épaisseur des lignes 
 * @param {Number} width - épaisseur de la ligne 
 * @param {Element} elements - facultatif, accepte un élément ou un tableau d'éléments
 * @returns 
 * @example epaisseur(2,MonCercle)
 * @example epaisseur(2,[MonCercle,MonRectangle])
 * @example epaisseur(2)
 * line thickness
 * @param.en {Number} width - line thickness
 * @param.en {Element} elements - optional, accepts an element or an array of elements
 * @returns 
 * @example.en thickness(2,MyCircle)
 * @example.en thickness(2,[MyCircle,MyRectangle])
 * @example.en thickness(2)
 */
export const epaisseur = (width = 1, elements) => {
  if(elements === undefined){
    currentWidth = width;
    return false; 
  }
  if(!Array.isArray(elements)){
    elements = [elements];
  }
  elements.forEach(element => {
    element.setAttribute("stroke-width", width);
    if(element.tagName === "g"){
      let paths = element.querySelectorAll("*");
      paths.forEach(p => p.setAttribute("stroke-width", width));
    }
  });
}

export const tensionDeSpline = (t) => {
  tension = t;
}


const rotatePoint = (x, y, centerX, centerY, angle) => {
  const radians = deg2rad(angle);
  const translatedX = x - centerX;
  const translatedY = y - centerY;
  const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
  const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);
  const finalX = rotatedX + centerX;
  const finalY = rotatedY + centerY;
  return { x: finalX, y: finalY };
};

const getTrueBBox = (element) => {
  let group = wrapInGroup(element)
  let bBox = group.getBBox()
  unwrapChild(group) ;
  return bBox
}

const  wrapInGroup= (element)=> {
  let group = document.createElementNS("http://www.w3.org/2000/svg", "g")
  element.parentNode.appendChild(group)
  group.appendChild(element)
  return group
}

const  unwrapChild = (element) => {
  let child = element.children[0]
  element.parentNode.appendChild(child)
  element.remove()
}

/**
 * tramer un élément SVG
 * @param {element} element élément SVG ou groupe d'éléments 
 * @param {number} space espace entre les lignes 
 * @param {number} alpha angle en degrés
 * @param {string} color couleur de la trame currentStroke
 * @param {number} precision précision de la trame entre 0.01 et 1
 * @returns element groupe SVG
 * hatch an SVG element
 * @param.en {element} element SVG element or group of elements
 * @param.en {number} space space between lines
 * @param.en {number} alpha angle in degrees
 * @param.en {string} color color of the grid currentStroke
 * @param.en {number} precision grid precision between 0.01 and 1
 * @returns.en {element} SVG group
 */

export const tramer = (element,space = 15, alpha = 45, color = currentStroke, precision = 0.25) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  alpha = - alpha -90;
  $G.setAttribute("class", "trame");
  $SVG.appendChild($G);
  let dx,dy;
  dx = element.dataset.dx || 0;
  dy = element.dataset.dy || 0;
  
  let elements; 
  if(element.tagName === "g" ){
    elements = element.querySelectorAll("*");
  }else{
    elements = [element];
  }

  elements.forEach(element => {
    // let group = wrapInGroup(element);
    // get element transform

    let z = element.getBBox();
    let x = z.x;
    let y = z.y;
    let w = z.width;
    let h = z.height;

    let spacei = space; //(Math.random()*4)+5;
    let spacej = space; //(Math.random()*4)+5;

    let cx = x + w/2;
    let cy = y + h/2;
    let r = Math.max(w,h)/2;
  
    let sqrt2 = 1.52;
  
    let ax = cx - r*sqrt2;
    let ay = cy - r*sqrt2;
    let step = ~~((r*2*sqrt2)/space);

    /* canvas version */
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let d = element.getAttribute("d");
    // console.log(d);
    ctx.fillStyle = "red";
    let pathCanvas = new Path2D(d);
 
    // prepend to body
    // document.body.prepend(canvas);
    /*  */

    for(let i=0;i<=step;i++){
      let px=ax+i*(spacei);
      let newLine = [];
      for(let j=0;j<=step;j+=precision){
        let py=ay+j*spacej;
        let rp = rotatePoint(px,py,cx,cy,alpha);
        
        // tracerLeCercle(rp.x/50,rp.y/50,0.01);
        // const svgPoint = $SVG.createSVGPoint();
        // svgPoint.x = rp.x;
        // svgPoint.y = rp.y;

        // console.log(ctx.isPointInPath(pathCanvas, rp.x, rp.y))
        // console.log(element.isPointInFill(svgPoint))

        // if(element.isPointInFill(svgPoint)){
        if(ctx.isPointInPath(pathCanvas, rp.x, rp.y)){
          // tracerLeCercle(rp.x/50,rp.y/50,0.1);

          if(newLine.length===0){
            newLine.push(rp);
          }else{
            newLine[1] = rp;
          }
        }else{
          if(newLine.length===2){
            let l = createLine(newLine[0].x,newLine[0].y,newLine[1].x,newLine[1].y,color);
            $G.appendChild(l);
          }
          newLine = [];    
        }
      }
    }
  });
  deplacer($G,dx,dy);
  return $G;

}

/**
 * tramer en points un élément SVG
 * @param {element} element élément SVG ou groupe d'éléments 
 * @param {number} space espace entre les points
 * @param {number} angle angle en degrés 
 * @param {number} sizeMin taille des points 
 * @param {number} sizeMax taille finale des points 
 * @param {string} color couleur des points (fond et contour) 
 * @returns 
 * 
 * @param.en {element} element SVG element or group of elements
 * @param.en {number} space space between points
 * @param.en {number} angle angle in degrees
 * @param.en {number} sizeMin size of the points
 * @param.en {number} sizeMax final size of the points
 * @param.en {string} color color of the points (fill and stroke)
 * @returns.en 
 */
export const tramerEnPoints = (element,space = 15, angle = 45, sizeMin = 1, sizeMax = 1, color = currentStroke) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  $G.setAttribute("class", "trame");
  $SVG.appendChild($G);

  let elements; 
  if(element.tagName === "g" ){
    elements = element.querySelectorAll("*");
  }else{
    elements = [element];
  }

  elements.forEach(element => {
   
    let z = element.getBBox();
    let x = z.x;
    let y = z.y;
    let w = z.width;
    let h = z.height;

    let spacei = space; //(Math.random()*4)+5;
    let spacej = space; //(Math.random()*4)+5;

    let cx = x + w/2;
    let cy = y + h/2;
    let r = Math.max(w,h)/2;
  
    let sqrt2 = 1.52;
  
    let ax = cx - r*sqrt2;
    let ay = cy - r*sqrt2;
    let step = ~~((r*2*sqrt2)/space);

    for(let i=0;i<=step;i++){
      let px=ax+i*(spacei);
      for(let j=0;j<=step;j++){
        let py=ay+j*spacej;
        let rp = rotatePoint(px,py,cx,cy,angle);
        
        // tracerLeCercle(rp.x/50,rp.y/50,0.01);
        const svgPoint = $SVG.createSVGPoint();
        svgPoint.x = rp.x;
        svgPoint.y = rp.y;

        if(element.isPointInFill(svgPoint)){
          let r = sizeMin + ((sizeMax-sizeMin)/step)*j; 
          for(let z=r;z>=0;z-=1){
            let c = createCircle(rp.x,rp.y,z,'none',color);
            $G.appendChild(c);
          }
         
        }
      }
    }
  });
  return $G;

}


const convertCenter = (element,x,y) => {
  const bbox = element.getBBox();
  const cx =  (x - bbox.x)/bbox.width*100;
  const cy =  (y - bbox.y)/bbox.height*100; 
  gsap.set(element,{transformOrigin:`${cx}% ${cy}%`});
  element.dataset.pcx = cx;
  element.dataset.pcy = cy;
  return `${cx}% ${cy}%`;
}

/**
 * tracer l'étoile
 * @param {number} x position x
 * @param {number} y position y
 * @param {number} nb nombre de branches
 * @param {number} r1 rayon 1
 * @param {number} r2 rayon 2
 * @returns element chemin SVG
 * @example tracerLEtoile(1,1,5,2,1)
 * @example tracerLEtoile(A,1,5,2,1)
 * @example tracerLEtoile(A,B,5,2,1) 
 * draw the star
 * @param.en {number} x x position
 * @param.en {number} y y position
 * @param.en {number} nb number of branches
 * @param.en {number} r1 radius 1
 * @param.en {number} r2 radius 2
 * @returns.en element SVG path
 * @example.en drawStar(1,1,5,2,1)
 * @example.en drawStar(A,1,5,2,1)
 * @example.en drawStar(A,B,5,2,1)
 */
export const tracerLEtoile = (x,y,nb=5,r1=2,r2=1) => {
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
  y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
  r1 = r1*50;
  r2 = r2*50;
  const points = [];
  for(let i=0; i<nb*2; i++){
    let r = (i%2===0) ? r1 : r2;
    let angle = i * Math.PI / nb - Math.PI/2;
    let px = x + r * Math.cos(angle);
    let py = y + r * Math.sin(angle);
    points.push(px);
    points.push(py);
  }
  points.push(points[0]);
  points.push(points[1]);
  const poly = createPolyline(points);
  poly.setAttribute("stroke-width", currentWidth);
  $SVG.appendChild(poly);
  poly.dataset.center = convertCenter(poly,x,y);
  return poly;

}

/**
 * tracer le polygone
 * @param {number} x position x
 * @param {number} y position y
 * @param {number} nb nombre de côtés
 * @param {number} r rayon 
 * @returns element chemin SVG
 * @example tracerLePolygone(1,1,3,1)
 * @example tracerLePolygone(A,1,3,1) 
 * draw the polygon
 * @param.en {number} x x position
 * @param.en {number} y y position
 * @param.en {number} nb number of sides
 * @param.en {number} r radius
 * @returns.en element SVG path
 * @example.en drawPolygon(1,1,3,1)
 * @example.en drawPolygon(A,1,3,1)
 */
export const tracerLePolygone = (x,y,nb=3,r=1) => {
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
  y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
  r = r*50;
  const points = [];
  for(let i=0; i<nb; i++){
    let angle = i * 2 * Math.PI / nb - Math.PI/2;
    let px = x + r * Math.cos(angle);
    let py = y + r * Math.sin(angle);
    points.push(px);
    points.push(py);
  }
  points.push(points[0]);
  points.push(points[1]);
  
  const poly = createPolyline(points);
  poly.setAttribute("stroke-width", currentWidth);

  // get bbox
  // add data-cx and data-cy
  // poly.dataset.cx = x;
  // poly.dataset.cy = y;
  $SVG.appendChild(poly);
  poly.dataset.center = convertCenter(poly,x,y);
  return poly;
}

const createPolyline = (points, fill = "none", stroke = currentStroke) => {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "path");

  // convert points to Number
  points = points.map(p => parseFloat(p));

  //
  let close = "";
    // add Z if close
  if(points[0] === points[points.length-2] && points[1] === points[points.length-1]){
    close = " Z";
    // remove last point
    points.pop();
    points.pop();
  }
  


  let noise = perlin.get(points[0]/NN,points[1]/NN);
  let d = "M"+(points[0]+noise*PX)+" "+(points[1]+noise*PY);
  let anchors = [{x:points[0]+noise*PX,y:points[1]+noise*PY}];
  for(let i = 2; i < points.length; i+=2){
    let noise = perlin.get(points[i]/NN,points[i+1]/NN);
    d += " L"+(points[i]+noise*PX)+" "+(points[i+1]+noise*PY);
    anchors.push({x:points[i]+noise*PX,y:points[i+1]+noise*PY});
  }

  if(close === " Z"){
    anchors.push(anchors[0]);
  }
  polyline.setAttribute("d", d+ close);

  // polyline.setAttribute("points", points);
  polyline.setAttribute("fill", fill);
  polyline.setAttribute("stroke", stroke);
  polyline.dataset.anchors = JSON.stringify(anchors);
  return polyline;
}

const $result = document.querySelector("#result");

export const $SVG = createSVGElement("1350", "1350", "0 0 1350 1350");
$result.appendChild($SVG);


/**
 * affiche la grille les lettres et les chiffres
 * @param {number} n nombre de lignes, 26 par défaut
 * @param {boolean} numeric 
 * les chiffres (true) ou les lettres (false) 
 * display the grid with letters and numbers
 * @param.en {number} n number of lines, 26 by default
 * @param.en {boolean} numeric display numbers (true) or letters (false)
 */

export const afficherLaGrille = (n=26,numeric = false) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  if(n>26) n = 26;
  NAZ = n;
  $G.setAttribute("id", "grid");
  if(din===false){
    $SVG.setAttribute("width", 50*n+50);
    $SVG.setAttribute("height", 50*n+50);
    $SVG.setAttribute("viewBox", "0 0 "+(50*n+50)+" "+(50*n+50));
  }
  $SVG.appendChild($G);

  let ABC = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
  if(numeric===true){
    ABC = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26"];
  }
  let gridLetter = [];
  for(let i=0; i<26; i++){
    if(i<26-n){
      gridLetter.push(ABC[i]+ABC[i+n]);
    }else{
      gridLetter.push(ABC[i]);
    }
  }

  const LS = 0.75;

  for(let i=1; i<n+1; i++){
    const letter = gridLetter[i-1]
    // const letter = String.fromCharCode(64 + i);
    const lx = createLine(i*50, 50, i*50, 50*n, "red",0.5);
    lx.dataset.i = i;
    $G.appendChild(lx);
    if(numeric===false){

      ecrire(letter[0],i*50-25,50-15, LS,$G).dataset.i = i;
      if(letter[1]){
        ecrire(letter[1],i*50-25,51*n+10, LS,$G).dataset.i = i;
      }
    }else{
      if(ABC[i-1].length>1){
        ecrire(ABC[i-1],i*50-10,50-15, LS,$G).dataset.i = i;

      }else{
      ecrire(ABC[i-1],i*50-25,50-15, LS,$G).dataset.i = i;
      }
    }
  }
  for(let j=1; j<n+1; j++){
    const ly = createLine(50, j*50, 50*n, j*50, "#999",0.5);
    ly.dataset.j = j;
    $G.appendChild(ly);
    let jtxt = (j<10) ? ""+j : ""+j; 
    ecrire(jtxt,(j<10) ? 0 : 12,j*50+8, LS,$G).dataset.j = j;
  }

  $SVG.addEventListener("mouseenter", e => gsap.to($G, {opacity: 0.8}));
  $SVG.addEventListener("mouseleave", e => gsap.to($G, {opacity: 0.0}));
  $SVG.addEventListener("mousemove", e => {
    // $SVG bbox
    const $$sw = $SVG.querySelectorAll(".sw");
    $$sw.forEach(l => l.classList.remove('sw'));
    const point = $SVG.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform($SVG.getScreenCTM().inverse());
    const x = transformedPoint.x;
    const y = transformedPoint.y;
 
    // query data attribute letterNameI
    const letterI = $G.querySelectorAll(`[data-i="${Math.round(x/50)}"]`);
    const letterJ = $G.querySelectorAll(`[data-j="${Math.round(y/50)}"]`);
    if(letterI.length>0){
      letterI.forEach(l => l.classList.add('sw')); 
     }
     if(letterJ.length>0){
      letterJ.forEach(l => l.classList.add('sw')); 
     }
  });

  return $G;

}

const isNum = (n) => !isNaN(parseFloat(n)) && isFinite(n);


/**
 * crayon dessiner avec des coordonnées relatives
 * @param {string} cmd liste de commandes PC X Y poser crayon en X Y et AV X Y avancer de X Y
 * @returns element element SVG
 * @example crayon("PC 10 10 AV 1 1 AV 0 1 AV 0 -8") 
 * pencil draw with relative coordinates
 * @param.en {string} cmd list of commands PC X Y place pencil at X Y and AV X Y move forward by X Y
 * @returns.en element SVG element
 * @example.en pencil("PC 10 10 AV 1 1 AV 0 1 AV 0 -8")
 */
export const crayon = (cmd) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  $G.setAttribute("class", "tortue");
  $SVG.appendChild($G);
  cmd = cmd.replace(/\s+/g, ' ').trim();
  let commands = cmd.split(" ");
  let departX = 1;
  let departY = 1;
  let departAngle = 0;
  // if two folling command are number put in an array
  let newCmd = [];
  for(let i=0;i<commands.length;i++){
    if(isNum(commands[i]) && isNum(commands[i+1])){
      newCmd.push([Number(commands[i]),Number(commands[i+1])]);
      i++;
    }else{
      newCmd.push(isNaN(commands[i]) ? commands[i] : parseFloat(commands[i]));
    }
  }

  let lignes = [[departX,departY]];
  let l = 0;

  newCmd.forEach((c,i) => {
    if(c === "PC"){
      departX = newCmd[i+1][0];
      departY = newCmd[i+1][1];
      l++;
      lignes[l] = [departX,departY];
    }
    if(c === "AV"){
      if(Array.isArray(newCmd[i+1])){
        let x = departX + newCmd[i+1][0];
        let y = departY + newCmd[i+1][1];
        lignes[l].push(x,y);
        departX = x;
        departY = y;
        i+=1;
      }
      if(Number(newCmd[i+1])){

        let x = departX + newCmd[i+1];
        let y = departY + 0;
        lignes[l].push(x,y);
        departX = x;
        departY = y;
      }
    }
  
  });
  lignes.forEach(ligne => {
    if(ligne.length<=2) return;
    let l = relierLesPoints(...ligne);
    $G.appendChild(l);
  });
  return $G;
}

/**
 * tortue - dessiner avec des commandes relatives
 * @param {string} cmd liste de commande 
 * @returns element element SVG 
 * turtle - draw with relative commands
 * @param.en {string} cmd list of commands
 * @returns.en element SVG element
 */
export const tortue = (cmd) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  $G.setAttribute("class", "tortue");
  $SVG.appendChild($G);
  cmd = cmd.replace(/\s+/g, ' ').trim(); // remove extra spaces

  // find each "REPETE 4 [av 10 tg 90 ]" regex and replace
  let reg =  /(.*?)REPETE\s+(\d+)\s+\[(\s*.*?\s*)\]/gi;

  const repete = (match,resultat, nombre, contenu) => {
   
    for (let i = 0; i < parseInt(nombre); i++) {
        resultat += " "+contenu+" ";
    }
    return resultat;
  }

  // Appliquer le remplacement

  cmd = cmd.replace(reg, repete);
  cmd = cmd.replace(/\s+/g, ' ').trim(); // remove extra spaces


  let commands = cmd.split(" ");
  let departX = 1;
  let departY = 1;
  let angle = 0;
  // if two folling command are number put in an array
  let newCmd = [];
  for(let i=0;i<commands.length;i++){
    if(isNum(commands[i]) && isNum(commands[i+1])){
      newCmd.push([Number(commands[i]),Number(commands[i+1])]);
      i++;
    }else{
      newCmd.push(isNaN(commands[i]) ? commands[i] : parseFloat(commands[i]));
    }
  }

  let lignes = [[departX,departY]];
  let l = 0;

  newCmd.forEach((c,i) => {
    if(c === "PC"){
      departX = newCmd[i+1][0];
      departY = newCmd[i+1][1];
      l++;
      lignes[l] = [departX,departY];
    }
    if(c === "AV"){
      if(Number(newCmd[i+1])){
        let x = departX + cosinus(angle)*newCmd[i+1];
        let y = departY + sinus(angle)*newCmd[i+1];
        lignes[l].push(x,y);
        departX = x;
        departY = y;
       
      }
    }
    if(c === "RE"){
      if(Number(newCmd[i+1])){
        let x = departX - cosinus(angle)*newCmd[i+1];
        let y = departY - sinus(angle)*newCmd[i+1];
        lignes[l].push(x,y);
        departX = x;
        departY = y;
       
      }
    }
    if(c === "TG"){
      if(Number(newCmd[i+1])){
        angle-=newCmd[i+1];
      }
    }
    if(c === "TD"){
      if(Number(newCmd[i+1])){
        angle+=newCmd[i+1];
      }
    }

  });
  console.debug(lignes);
  lignes.forEach(ligne => {
    if(ligne.length<=2) return;
    let l = relierLesPoints(...ligne);
    $G.appendChild(l);
  });
  return $G;
}


const formatPoints = (points,close) => {
  // convert array points to array of [x,y]
  points = points.map((p, i) => {
    if (i % 2 === 0) {
      return [p, points[i + 1]];
    }
    return null;
  }).filter(p => p !== null);


  if (close) {
    points.pop();
    const lastPoint = points[points.length - 1];
    const secondToLastPoint = points[points.length - 2];

    const firstPoint = points[0];
    const secondPoint = points[1];

    points.unshift(lastPoint);
    points.unshift(secondToLastPoint);

    points.push(firstPoint);
    points.push(secondPoint);
  }
  return points.flat();
}


/**
 * creer la spline Catmull-Rom
 * @param {points} points x1,y1,x2,y2,x3,y3…
 * @param {tension} tension
 * @returns string attribut d
 * @example spline(A,1,C,9,E,3)
 * @example spline(1,1,3,9,5,3)
 * create the Catmull-Rom spline
 * @param.en {points} points x1,y1,x2,y2,x3,y3…
 * @param.en {tension} tension
 * @returns.en string attribute d
 * @example.en spline(A,1,C,9,E,3)
 * @example.en spline(1,1,3,9,5,3)
 */
const pointsToSpline = (points) => {
    const close = (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]);

    console.warn("close",close);
    if (points.length < 4) return ''; // Il faut au moins 2 points (x, y)
    points = formatPoints(points,close);

    let size = points.length;

    const last = size - 4;
  
    console.warn("points",points);
    const startPointX = close ? points[4] : points[0];
    const startPointY = close ? points[5] : points[1];
  
    let path = "M" + [startPointX, startPointY];
  
  
    const startIteration = close ? 4 : 0;
    const maxIteration = close ? size - 4 : size - 2;
    const inc = 2;
  
    for (let i = startIteration; i < maxIteration; i += inc) {
      const x0 = i ? points[i - 2] : points[0];
      const y0 = i ? points[i - 1] : points[1];
  
      const x1 = points[i + 0];
      const y1 = points[i + 1];
  
      const x2 = points[i + 2];
      const y2 = points[i + 3];
  
      const x3 = i !== last ? points[i + 4] : x2;
      const y3 = i !== last ? points[i + 5] : y2;
  
      const cp1x = x1 + ((x2 - x0) / 6) * tension;
      const cp1y = y1 + ((y2 - y0) / 6) * tension;
  
      const cp2x = x2 - ((x3 - x1) / 6) * tension;
      const cp2y = y2 - ((y3 - y1) / 6) * tension;
  
      path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
  
    }

    return path;

}



/**
 * tracer la spline Catmull-Rom
 * @param {...number} points x1,y1,x2,y2,x3,y3…
 * @returns svgElement path
 * @example tracerLaSpline(A,1,C,9,E,3)
 * @example tracerLaSpline(1,1,3,9,5,3) 
 * draw the Catmull-Rom spline
 * @param.en {...number} points x1,y1,x2,y2,x3,y3…
 * @returns.en svgElement path
 * @example.en drawCatmullRomSpline(A,1,C,9,E,3)
 * @example.en drawCatmullRomSpline(1,1,3,9,5,3)
 */
export const tracerLaSpline = (...points) => {
  
  for(let i=0;i<points.length;i+=2){
    let x = points[i];
    let y = points[i+1];
    x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
    y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
    let noise = perlin.get(x/NN,y/NN);
    x += noise * PX;
    y += noise * PY;
    points[i] = x;
    points[i+1] = y;
  }

  const spline = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  spline.setAttribute("d",pointsToSpline(points));
  spline.setAttribute("stroke-width", currentWidth);
  spline.setAttribute("fill", "none");
  spline.setAttribute("stroke", currentStroke);
  $SVG.appendChild(spline);
  return spline;
}



/**
 * relier les points
 * @param {...number} points x1,y1,x2,y2,x3,y3…
 * @returns svgElement polyline
 * @example relierLesPoints(A,1,C,9,E,3)
 * @example relierLesPoints(1,1,3,9,5,3) 
 * connect the points
 * @param.en {...number} points x1,y1,x2,y2,x3,y3…
 * @returns.en svgElement polyline
 * @example.en connectPoints(A,1,C,9,E,3)
 * @example.en connectPoints(1,1,3,9,5,3)
 */
export const relierLesPoints = (...points) => {
  // convert coord points
  const pointsString = points.map(p => isNaN(p) ? (p.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  p*50);
  //const pointsString = points; //.map(p => p.x + "," + p.y).join(" ");
  if(pointsString.length===4){
    // add a point in the middle
    let x = (pointsString[0]+pointsString[2])/2;
    let y = (pointsString[1]+pointsString[3])/2;
    pointsString.splice(2,0,x);
    pointsString.splice(3,0,y);
  }
  const polyline = createPolyline(pointsString, "none", currentStroke);
  // 
  polyline.setAttribute("stroke-width", currentWidth);
  $SVG.appendChild(polyline);
  return polyline;
}

/**
 * relier les points
 * @param {...any} points x1,y1,x2,y2,x3,y3…
 * @returns svgElement polyline
 * @example relierLesPoints(A,1,C,9,E,3)
 * @example relierLesPoints(1,1,3,9,5,3) 
 * connect the points
 * @param.en {...any} points x1,y1,x2,y2,x3,y3…
 * @returns.en svgElement polyline
 * @example.en connectPoints(A,1,C,9,E,3)
 * @example.en connectPoints(1,1,3,9,5,3)
 */
export const tracerLesLignes = relierLesPoints;

/**
 * tracer le cercle
 * @param {number} x position du centre x
 * @param {number} y position du centre y
 * @param {number} r rayon
 * @returns element chemin SVG 
 * draw the circle
 * @param.en {number} x center x position
 * @param.en {number} y center y position
 * @param.en {number} r radius
 * @returns.en element SVG path
 */
export const tracerLeCercle = (x=1,y=1,r=1) => {
  // convert coord points
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
  y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
  r = r*50;

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // circle.setAttribute("d", `M${x} ${y} m-${r} 0 a${r} ${r} 0 1 0 ${r*2} 0 a${r} ${r} 0 1 0 -${r*2} 0`);
  const k = 0.552284749831; // Approximation de la distance pour les courbes cubiques
  const cpOffset = r * k;
  const moveTo = `M ${x} ${y - r}`;
  const cubic1 = `C ${x + cpOffset} ${y - r}  ${x + r} ${y - cpOffset}  ${x + r} ${y}`;
  const cubic2 = `C ${x + r} ${y + cpOffset}  ${x + cpOffset} ${y + r}  ${x} ${y + r}`;
  const cubic3 = `C ${x - cpOffset} ${y + r}  ${x - r} ${y + cpOffset}  ${x - r} ${y}`;
  const cubic4 = `C ${x - r} ${y - cpOffset}  ${x - cpOffset} ${y - r}  ${x} ${y - r}`;
  const d =  `${moveTo} ${cubic1} ${cubic2} ${cubic3} ${cubic4} Z`;
  circle.setAttribute("d", d);
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke-width", currentWidth);
  circle.setAttribute("stroke", currentStroke); 
  $SVG.appendChild(circle);
  return circle;
}


/**
 * tracer l'ellipse
 * @param {number} x position du centre x
 * @param {number} y position du centre y
 * @param {number} rx rayon horizontal
 * @param {number} ry rayon vertical
 * @returns element chemin SVG
 * draw the ellipse
 * @param.en {number} x center x position
 * @param.en {number} y center y position
 * @param.en {number} rx radius
 * @param.en {number} ry radius
 * @returns.en element SVG path
 */

export const tracerLEllipse = (x=1,y=1,rx=2, ry=1) => {
  // convert coord points
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
  y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
  rx = rx*50;
  ry = ry*50;

  const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // circle.setAttribute("d", `M${x} ${y} m-${r} 0 a${r} ${r} 0 1 0 ${r*2} 0 a${r} ${r} 0 1 0 -${r*2} 0`);
  const k = 0.552284749831; // Approximation pour les courbes cubiques
  const cpOffsetX = rx * k; // Contrôle pour l'axe horizontal
  const cpOffsetY = ry * k; // Contrôle pour l'axe vertical

  const moveTo = `M ${x} ${y - ry}`;
  const cubic1 = `C ${x + cpOffsetX} ${y - ry} ${x + rx} ${y - cpOffsetY} ${x + rx} ${y}`;
  const cubic2 = `C ${x + rx} ${y + cpOffsetY} ${x + cpOffsetX} ${y + ry} ${x} ${y + ry}`;
  const cubic3 = `C ${x - cpOffsetX} ${y + ry} ${x - rx} ${y + cpOffsetY} ${x - rx} ${y}`;
  const cubic4 = `C ${x - rx} ${y - cpOffsetY} ${x - cpOffsetX} ${y - ry} ${x} ${y - ry}`;
  const d = `${moveTo} ${cubic1} ${cubic2} ${cubic3} ${cubic4} Z`;


  ellipse.setAttribute("d", d);
  ellipse.setAttribute("fill", "none");
  ellipse.setAttribute("stroke-width", currentWidth);
  ellipse.setAttribute("stroke", currentStroke); 
  $SVG.appendChild(ellipse);
  return ellipse;
}



/**
 * tracer le rectangle
 * @param {number} x position x du coin supérieur gauche
 * @param {number} y position y du coin supérieur gauche 
 * @param {number} w largeur 
 * @param {number} h hauteur 
 * @returns {element} chemin SVG
 * draw the rectangle
 * @param.en {number} x top-left corner x position
 * @param.en {number} y top-left corner y position
 * @param.en {number} w width
 * @param.en {number} h height
 * @returns.en {element} SVG path
 */

export const tracerLeRectangle = (x=1,y=1,w=1,h=1) => {
  // convert coord points
  
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
  y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
  let noise = perlin.get(x/NN,y/NN);
  x += noise * PX;
  y += noise * PY;

  w = w*50;
  h = h*50;
  const path = createPolyline([
    x,y,
    x,y+h,
    x+w,y+h,
    x+w,y,
    x,y], "none", currentStroke);
  path.setAttribute("stroke-width", currentWidth);
  path.setAttribute("d",path.getAttribute("d"));
  $SVG.appendChild(path);
  return path;
}

const deg2rad = (deg) => deg * Math.PI / 180;

const pathPts = (path, step = 0.01) => {
  let newPath = path.cloneNode(true);
  if(newPath.tagName !== "path") {
    newPath = (MotionPathPlugin.convertToPath(newPath))[0];
    // console.log(newPath);
  }
  let rawPath = MotionPathPlugin.getRawPath(newPath),
    point = [];

  MotionPathPlugin.cacheRawPathMeasurements(rawPath);

  for(let t=0;t<1.0;t+=step){
    let p = MotionPathPlugin.getPositionOnPath(rawPath, t, true);
    let noise = perlin.get(p.x/NN,p.y/NN);
    let nx = Math.cos(deg2rad(p.angle+90))*noise;
    let ny = Math.sin(deg2rad(p.angle+90))*noise;
    point.push({x:p.x+nx*PX,y:p.y+ny*PY,angle:p.angle});
  }
  return point;
}

const shapeIsClosed = (path,tolerance = 0.01) => {
  const firstPoint = path.getPointAtLength(0);
  const pathLength = path.getTotalLength();
  const lastPoint = path.getPointAtLength(pathLength);
  const distance = Math.sqrt((firstPoint.x - lastPoint.x) ** 2 + (firstPoint.y - lastPoint.y) ** 2);
  if(distance < tolerance){
    return true;
  }
  return false;

}


/**
 * parcourir un chemin avec un élément
 * @param {element} line le chemin à suivre
 * @param {element} brush l'élément à cloner le long du chemin 
 * @param {number} step le nombre de clone 
 * @param {number} scale la taille du clone 
 * @param {string} ease l'effet de taille 
 * @param {number} repeat nombre de répétition de l'effet
 * @returns {element} groupe SVG 
 * traverse a path with an element
 * @param.en {element} line the path to follow
 * @param.en {element} brush the element to clone along the path
 * @param.en {number} step the number of clones
 * @param.en {number} scale the size of the clone
 * @param.en {string} ease the size effect
 * @param.en {number} repeat number of repetitions of the effect
 * @returns.en {element} SVG group
 */
/**
 * Fonction utilitaire pour manipuler un chemin avec un élément
 * @param {element} line Le chemin à suivre
 * @param {element} brush L'élément à cloner le long du chemin
 * @param {number} step Le nombre de clones
 * @param {number} scale La taille du clone
 * @param {string} ease L'effet de taille
 * @param {number} repeat Nombre de répétitions de l'effet
 * @param {boolean} rotate Indique si les clones doivent être tournés en fonction du chemin
 * @returns {element} Groupe SVG
 */

const manipulatePath = (line, brush, step = 100, scale = 1 / 2, ease, repeat = 4, rotate = false) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  $G.setAttribute("class", "draw");
  $SVG.appendChild($G);
  
  let plus = 0;
  if (ease) {
    const [easeName, plusValue] = ease.split("+");
    ease = easeName;
    plus = parseFloat(plusValue) || 0;
  }

  ease = {
    "sinus": "sine.inOut",
    "elastic": "elastic.inOut",
    "cercle": "circ.in"
  }[ease] || ease;

  const easeFn = ease ? gsap.parseEase(ease) : x => 1;

  const brushCenter = brush.getBBox();
  if (brush.dataset.center) {
    brushCenter.x += brushCenter.width * (brush.dataset.pcx / 100);
    brushCenter.y += brushCenter.height * (brush.dataset.pcy / 100);
  } else {
    brushCenter.x += brushCenter.width / 2;
    brushCenter.y += brushCenter.height / 2;
  }

  let isClosed = shapeIsClosed(line, 0.01);
  if (!isClosed) step--;

  const points = pathPts(line, 1 / step, rotate);
  if (points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y) {
    points.pop();
  }

  points.forEach((point, index) => {
    let pos = (index * (1 / step) * 2 * repeat) % 2;
    pos = pos > 1 ? 2 - pos : pos;

    const b = brush.cloneNode(true);
    b.setAttribute("stroke-width", currentWidth / (scale * easeFn(pos)));
    const transformOptions = {
      x: point.x - brushCenter.x,
      y: point.y - brushCenter.y,
      scale: scale * easeFn(pos) + plus,
    };
    if (rotate) {
      transformOptions.rotate = point.angle + 90;
    }
    gsap.set(b, { ...transformOptions, transformOrigin: "50% 50%" });

    $G.appendChild(b);
  });

  $G.appendChild(line);
  return $G;
};


/**
 * extrude un élément sur un chemin
 * @param {element} line le chemin à suivre
 * @param {element} brush l'élément à cloner le long du chemin 
 * @param {number} step le nombre de clone 
 * @param {number} scale la taille du clone 
 * @param {string} ease l'effet de taille 
 * @param {number} repeat nombre de répétition de l'effet
 * @returns {element} groupe SVG
 * extrude an element on a path
 * @param.en {element} line the path to follow
 * @param.en {element} brush the element to clone along the path
 * @param.en {number} step the number of clones
 * @param.en {number} scale the size of the clone
 * @param.en {string} ease the size effect
 * @param.en {number} repeat number of repetitions of the effect
 * @returns.en {element} SVG group
 */

export const extrude = (line,brush,step = 100,scale = 1/2,ease,repeat = 4) => {
  return manipulatePath(line, brush, step, scale, ease, repeat, false);
}


/**
 * parcourir un chemin avec un élément
 * @param {element} line le chemin à suivre
 * @param {element} brush l'élément à cloner le long du chemin 
 * @param {number} step le nombre de clone 
 * @param {number} scale la taille du clone 
 * @param {string} ease l'effet de taille 
 * @param {number} repeat nombre de répétition de l'effet
 * @returns {element} groupe SVG
 * traverse a path with an element
 * @param.en {element} line the path to follow
 * @param.en {element} brush the element to clone along the path
 * @param.en {number} step the number of clones
 * @param.en {number} scale the size of the clone
 * @param.en {string} ease the size effect
 * @param.en {number} repeat number of repetitions of the effect
 * @returns.en {element} SVG group
 */
export const parcourir = (line,brush,step = 100,scale = 1/2,ease,repeat = 4) => {
  return manipulatePath(line, brush, step, scale, ease, repeat, true);
}

/**
 * parcourir un chemin avec un élément et un angle nul 
 * @param {element} line le chemin à suivre
 * @param {element} brush l'élément à cloner le long du chemin
 * @param {number} step le nombre de clone
 * @param {number} scale la taille du clone
 * @param {string} ease l'effet de taille
 * @param {number} repeat nombre de répétition de l'effet
 * @returns {element} groupe SVG 
 * traverse a path with an element and zero angle
 * @param.en {element} line the path to follow
 * @param.en {element} brush the element to clone along the path
 * @param.en {number} step the number of clones
 * @param.en {number} scale the size of the clone
 * @param.en {string} ease the size effect
 * @param.en {number} repeat number of repetitions of the effect
 * @returns.en {element} SVG group
 */
export const drapeau = (line,brush,step = 100,scale = 1/2,ease,repeat = 4) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  $G.setAttribute("class", "draw");
  $SVG.appendChild($G);
  let plus = 0;
  if(ease !== undefined){
    // split at +
    let split = ease.split("+");
    ease = split[0];
    plus = parseFloat(split[1]) || 0;
  }


  // ease
  if(ease === "sinus"){
    ease = "sine.inOut";
  }
  if(ease === "elastic"){
    ease = "elastic.inOut";
  }
  if(ease === "cercle"){
    ease = "circ.in";
  }

  const easeFn = (ease!==undefined) ? gsap.parseEase(ease) : x => 1;

  // find the center of brush path
 

 
  const points = pathPts(line, 1/step, true);
  points.forEach((point, index) => {
    let pos = (index * (1/step)*2*repeat)%2;
    pos = (pos>1)?2-pos:pos;
  
    let b = brush.cloneNode(true);
    b.setAttribute("stroke-width", currentWidth/(scale * easeFn(pos)));
    gsap.set(b,{x:point.x,
      y:point.y,
      scale:scale * easeFn(pos) + plus,
      transformOrigin:"0% 50%"});
 
    $G.appendChild(b);

  });
  $G.appendChild(line);

  return $G;
}

/**
 * calligrammer du texte en suivant un chemin
 * @param {element} line le chemin à suivre 
 * @param {string} text le texte à écrire 
 * @param {number} step le nombre de répetition du texte 
 * @param {number} scale la taille du texte 
 * @param {number} angle l'angle ajouté 
 * @param {string} ease l'effet de taille 
 * @param {number} repeat nombre de répétition de l'effet 
 * @returns {element} groupe SVG 
 * calligram text along a path
 * @param.en {element} line the path to follow
 * @param.en {string} text the text to write
 * @param.en {number} step the number of text repetitions
 * @param.en {number} scale the size of the text
 * @param.en {number} angle the added angle
 * @param.en {string} ease the size effect
 * @param.en {number} repeat number of repetitions of the effect
 * @returns.en {element} SVG group
 */
export const calligrammer = (line, text,step = 1,scale = 1,angle = 0, ease,repeat = 4) => {
  // convert text to array of letter
  let brush = [];
  step = ~~(text.length*step);
  const letters = text.split("");
  // console.log(step);
  letters.forEach((letter, index) => {
    brush.push(tracerLeTexte(letter, -50, -50));
  });
  return parcourSup(line,{brosses:brush,angle:angle,remove:true},step,scale,ease,repeat);

}
/**
 * parcourir un chemin avec une liste d'éléments SVG
 * @param {element} line le chemin à suivre
 * @param {object} obj liste d'éléments à cloner le long du chemin
 * @param {number} step le nombre de clone
 * @param {number} scale la taille du clone
 * @param {string} ease l'effet de taille
 * @param {number} repeat nombre de répétition de l'effet
 * @returns {element} groupe SVG
 * @example parcourSup(line,{brosses:[brush1,brush2],angle:90,remove:true},100,1/2,"sinus+0",4) 
 * traverse a path with a list of SVG elements
 * @param.en {element} line the path to follow
 * @param.en {object} obj list of elements to clone along the path
 * @param.en {number} step the number of clones
 * @param.en {number} scale the size of the clone
 * @param.en {string} ease the size effect
 * @param.en {number} repeat number of repetitions of the effect
 * @returns.en {element} SVG group
 * @example.en traversePath(line,{brushes:[brush1,brush2],angle:90,remove:true},100,1/2,"sine+0",4)
 */

export const parcourSup = (line,obj,step = 100,scale = 1/2,ease,repeat = 4) => {
  // create a group
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  $G.setAttribute("class", "draw");
  $SVG.appendChild($G);
  // ease
  let plus = 0;
  if(ease !== undefined){
    // split at +
    let split = ease.split("+");
    ease = split[0];
    plus = parseFloat(split[1]) || 0;
  }

  if(ease === "sinus"){
    ease = "sine.inOut";
  }
  if(ease === "elastic"){
    ease = "elastic.inOut";
  }
  if(ease === "cercle"){
    ease = "circ.in";
  }

  const easeFn = (ease!==undefined) ? gsap.parseEase(ease) : x => 1;

  // convert one element element in array
  let brush = obj.brosses;
  if(!Array.isArray(brush)){
    brush = [brush];
  }

  brush.forEach((el) => {
    // find the center of brush path
    const brushCenter = el.getBBox();
    el.cx = brushCenter.x + brushCenter.width/2;
    el.cy = brushCenter.y + brushCenter.height/2;   
  });
  
  if(line.tagName === "g"){
    let lines = line.querySelectorAll("path");
    let d = "";
    lines.forEach(l => {
      d += l.getAttribute("d")+ "";
    });
    line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", d);

  }

  obj.angle = (obj.angle === undefined) ? 90 : obj.angle;
  // get the first and last point in path
 
  let newPath = line.cloneNode(true);
  if(newPath.tagName !== "path") {
    newPath = (MotionPathPlugin.convertToPath(newPath))[0];
    // console.log(newPath);
  }
  let rawPath = MotionPathPlugin.getRawPath(newPath);

  MotionPathPlugin.cacheRawPathMeasurements(rawPath);
  let first = MotionPathPlugin.getPositionOnPath(rawPath, 0, true);
  let last = MotionPathPlugin.getPositionOnPath(rawPath, 1, true);
  // calc distance between first and last point
  let dist = Math.sqrt(Math.pow(last.x-first.x,2) + Math.pow(last.y-first.y,2));
  // console.log(dist)
  let close = (dist<0.1) ? 0 : 1
  
  const points = pathPts(line, 1/(step - close), true);
  points.forEach((point, index) => {
    if(index === points.length-1 && close === 0) return;

    let pos = (index * (1/step)*2*repeat)%2;
    pos = (pos>1)?2-pos:pos;
    let b = brush[index%brush.length].cloneNode(true);
    b.cx = brush[index%brush.length].cx;
    b.cy = brush[index%brush.length].cy;
    b.setAttribute("stroke-width", currentWidth/(scale * easeFn(pos)));
    // scale 1/10
    gsap.set(b,{x:point.x-b.cx,
      y:point.y-b.cy,
      rotate:point.angle+obj.angle,scale:scale * easeFn(pos) + plus,transformOrigin:"50% 50%"});
    $G.appendChild(b);

  });
  $G.appendChild(line);

  if(obj.remove!==undefined && obj.remove === true){
    line.remove();
    brush.forEach(b => b.remove());
  }
  return $G;
}

/**
 * tracer l'arc
 * @param {number} x position x du centre
 * @param {number} y position y du centre
 * @param {number} r rayon
 * @param {number} angle1 angle de départ en degrés
 * @param {number} angle2 angle de fin en degrés
 * @returns {element} chemin SVG
 * @example tracerLArc(1,1,1,0,90) 
 * draw the arc
 * @param.en {number} x center x position
 * @param.en {number} y center y position
 * @param.en {number} r radius
 * @param.en {number} angle1 start angle in degrees
 * @param.en {number} angle2 end angle in degrees
 * @returns.en {element} SVG path
 * @example.en drawArc(1,1,1,0,90)
 */

export const tracerLArc = (x,y,r=1,angle1=0,angle2=90) => {
  // convert coord points
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  x*50;
  y = isNaN(y) ? (y.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 :  y*50;
  r = r*50;
  angle1 = angle1 * Math.PI / 180;
  angle2 = angle2 * Math.PI / 180;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let x1 = x + r * Math.cos(angle1);
  let y1 = y - r * Math.sin(angle1);
  let x2 = x + r * Math.cos(angle2);
  let y2 = y - r * Math.sin(angle2);
  let largeArc = (angle2 - angle1 <= Math.PI) ? 0 : 1;
  path.setAttribute("d", `M${x1},${y1} A${r},${r} 1 ${largeArc} 0 ${x2},${y2}`);
  path.setAttribute("stroke-width", currentWidth);
  path.setAttribute("stroke", currentStroke);
  path.setAttribute("fill", "none");
  
  $SVG.appendChild(path);
  return path;
}

/**
 * tracer l'arc donut 
 * @param {number} x position x du centre
 * @param {number} y position y du centre
 * @param {number} r1 rayon interne
 * @param {number} r2 rayon externe
 * @param {number} angle1 angle de départ en degrés
 * @param {number} angle2 angle de fin en degrés
 * @returns {element} chemin SVG
 * @example tracerLArcDonu(1,1,1,2,0,90) 
 * draw the arc
 * @param.en {number} x center x position
 * @param.en {number} y center y position
 * @param.en {number} r1 radius
 * @param.en {number} r2 radius
 * @param.en {number} angle1 start angle in degrees
 * @param.en {number} angle2 end angle in degrees
 * @returns.en {element} SVG path
 * @example.en drawArcDonut(1,1,1,2,0,90)
*/

export const tracerLArcDonut = (cx, cy, r1 = 1, r2 = 2, angle1 = 0, angle2 = 90) => {
  // convert coord points
  cx = isNaN(cx) ? (cx.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 : cx*50;
  cy = isNaN(cy) ? (cy.toUpperCase().charCodeAt(0)-65)%NAZ * 50 + 50 : cy*50;
  r1 = r1*50;
  r2 = r2*50;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  let normalizedA1 = angle1 % 360;
  let normalizedA2 = angle2 % 360;

  // Vérifier si l'arc fait un cercle complet
  const isFullCircle = Math.abs(normalizedA2 - normalizedA1) === 0 || 
                      Math.abs(normalizedA2 - normalizedA1) === 360;

  if (isFullCircle) {
      // Pour un cercle complet, on utilise deux arcs de 180 degrés
      const midAngle = (normalizedA1 + 180) * Math.PI / 180;
      
      const x1 = cx + r1 * Math.cos(normalizedA1 * Math.PI / 180);
      const y1 = cy + r1 * Math.sin(normalizedA1 * Math.PI / 180);
      const x2 = cx + r2 * Math.cos(normalizedA1 * Math.PI / 180);
      const y2 = cy + r2 * Math.sin(normalizedA1 * Math.PI / 180);
      
      const xMid1 = cx + r1 * Math.cos(midAngle);
      const yMid1 = cy + r1 * Math.sin(midAngle);
      const xMid2 = cx + r2 * Math.cos(midAngle);
      const yMid2 = cy + r2 * Math.sin(midAngle);

      let d = `
          M${x2},${y2}
          A${r2},${r2} 0 1 1 ${xMid2},${yMid2}
          A${r2},${r2} 0 1 1 ${x2},${y2}
          M${x1},${y1}
          A${r1},${r1} 0 1 0 ${xMid1},${yMid1}
          A${r1},${r1} 0 1 0 ${x1},${y1}
          Z
      `.replace(/\s+/g, ' ').trim();
      
      path.setAttribute("d", d);
  } else {
      // Code existant pour les arcs partiels
      if (normalizedA1 > normalizedA2) {
          normalizedA2 += 360;
      }

      const startAngle = normalizedA1 * Math.PI / 180;
      const endAngle = normalizedA2 * Math.PI / 180;

      const x1 = cx + r1 * Math.cos(startAngle);
      const y1 = cy + r1 * Math.sin(startAngle);
      const x2 = cx + r2 * Math.cos(startAngle);
      const y2 = cy + r2 * Math.sin(startAngle);
      const x3 = cx + r1 * Math.cos(endAngle);
      const y3 = cy + r1 * Math.sin(endAngle);
      const x4 = cx + r2 * Math.cos(endAngle);
      const y4 = cy + r2 * Math.sin(endAngle);

      const largeArcFlag = Math.abs(normalizedA2 - normalizedA1) > 180 ? 1 : 0;

      let d = `
          M${x1},${y1}
          L${x2},${y2}
          A${r2},${r2} 0 ${largeArcFlag} 1 ${x4},${y4}
          L${x3},${y3}
          A${r1},${r1} 0 ${largeArcFlag} 0 ${x1},${y1}
          Z
      `.replace(/\s+/g, ' ').trim();
      
      path.setAttribute("d", d);
  }

  path.setAttribute("stroke-width", currentWidth);
  path.setAttribute("stroke", currentStroke);
  path.setAttribute("fill", "none");
  $SVG.appendChild(path);
  return path;
};


/**
 * placer sur une grille
 * @param {element} brush  éléments à cloner
 * @param {number} nx nombre de colonnes
 * @param {number} ny nombre de lignes
 * @param {number} mx marges en x
 * @param {number} my marges en y
 * @param {number} scale échelle
 * @param {string} ease effet de taille
 * @param {number} repeat nombre de répétition de l'effet 
 * place on a grid
 * @param.en {element} brush elements to clone
 * @param.en {number} nx number of columns
 * @param.en {number} ny number of rows
 * @param.en {number} mx margins in x
 * @param.en {number} my margins in y
 * @param.en {number} scale scale
 * @param.en {string} ease size effect
 * @param.en {number} repeat number of repetitions of the effect
 */
export const placerSurGrille = (brush,nx,ny,mx=1,my=1,scale=1, ease,repeat = 1) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");

  $G.setAttribute("class", "grille");
  $SVG.appendChild($G);
  // ease
  let plus = 0;
  if(ease !== undefined){
    // split at +
    let split = ease.split("+");
    ease = split[0];
    plus = parseFloat(split[1]) || 0;
  }

  if(ease === "sinus"){
    ease = "sine.inOut";
  }
  if(ease === "elastic"){
    ease = "elastic.inOut";
  }
  if(ease === "cercle"){
    ease = "circ.in";
  }

  const easeFn = (ease!==undefined) ? gsap.parseEase(ease) : x => 1;


  if(!Array.isArray(brush)){
    brush = [brush];
  }

  brush.forEach((el) => {
    // find the center of brush path
    const brushCenter = el.getBBox();
    el.cx = brushCenter.x + brushCenter.width/2;
    el.cy = brushCenter.y + brushCenter.height/2;   
  });
  let stepx = ((NAZ-2*mx+1)/(nx-1));
  let stepy = ((NAZ-2*my+1)/(ny-1));
  let decalage = 4;
  let points = [];
  for(let j=0;j<ny;j++){
    for(let i=0;i<nx;i++){
      points.push({x:mx*50+i*50*stepx,y:my*50+j*50*stepy});
    }
  }

  points.forEach((point, index) => {
    let pos = (index * (1/points.length)*2*repeat)%2;
    pos = (pos>1)?2-pos:pos;
    let b = brush[index%brush.length].cloneNode(true);
    b.cx = brush[index%brush.length].cx;
    b.cy = brush[index%brush.length].cy;
    b.setAttribute("stroke-width", currentWidth/(scale * easeFn(pos)));
    // scale 1/10
    gsap.set(b,{x:point.x-b.cx,
      y:point.y-b.cy,
      scale:scale * easeFn(pos) + plus,
      transformOrigin:"50% 50%"
    });
    $G.appendChild(b);

  });

} 

/**
 * au hasard entre 1 et n inclus
 * @returns {number} un nombre aléatoire entre 1 et 26 (ou moins si grille plus petite)
 * random between 1 and n inclusive
 * @returns.en {number} a random number between 1 and 26 (or less if the grid is smaller)
 */

export const auHasard = (x=NAZ) => gsap.utils.random(1, x, 1);

/**
 *  suppression d'un ou plusieurs éléments
 * @param  {...any} elements
 * @returns void
 * @example supprimer(element1,element2);
 * @example supprimer(element1);
 * @example supprimer(element1,element2,element3); 
 *  delete one or more elements
 * @param.en  {...any} elements
 * @returns.en void
 * @example.en delete(element1,element2);
 * @example.en delete(element1);
 * @example.en delete(element1,element2,element3);
 */
export const supprimer = (...elements) => {
  // element to array
  if(!Array.isArray(elements)){
    elements = [elements];
  }
      
  elements.forEach(element => {
    element.classList.add("remove");
    gsap.to(element, {delay:0.5,opacity: 0, duration: 1, onComplete: () => element.remove()});
  });
};

/**
 * tracer le paragraphe
 * @param {string} text texte à tracer avec \` pour les retours à la ligne 
 * @param {number} x position x 
 * @param {number} y position y 
 * @param {number} scale échelle 
 * @returns {element} groupe SVG
 * @example tracerLeParagraphe(`Hello World`,1,1,0.8) 
 * draw the paragraph
 * @param.en {string} text text to draw with \` for line breaks 
 * @param.en {number} x x position 
 * @param.en {number} y y position 
 * @param.en {number} scale scale 
 * @returns.en {element} SVG group
 * @example.en drawParagraph(`Hello World`,1,1,0.8)
 */
export const tracerLeParagraphe = (text,x=1,y=1,scale = 0.8) => {
  let lines = text.split("\n");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  lines.forEach((line, index) => {
    let l = (tracerLeTexte(line,x,y+(index+1)*scale,scale, true));
    g.appendChild(l);
  });
  $SVG.appendChild(g);
  return g;
}

/**
 * tracer le texte sur une ligne
 * @param {string} text texte à tracer 
 * @param {number} x position x 
 * @param {number} y position y 
 * @param {number} scale échelle 
 * @returns {element} groupe SVG
 * @example tracerLeTexte("Hello World",1,1,0.8) 
 * draw the text on a line
 * @param.en {string} text text to draw * @param.en {number} x x position 
 * @param.en {number} y y position 
 * @param.en {number} scale scale 
 * @returns.en {element} SVG group
 * @example.en drawText("Hello World",1,1,0.8)
 */

export const tracerLeTexte = (text,x=1,y=1,scale = 0.8, noise = false) => {
  y+=0.3;
  // convert A, B to 1, 2
  x = isNaN(x) ? (x.toUpperCase().charCodeAt(0)-65)%NAZ +1 :  x;

  let now = new Date().getTime();
  let id = now.toString(36);
  let txt = ecrire(text, x*50, y*50+14, scale, $SVG, true, noise);
  return txt; //document.querySelector("t"+cleanText+id);
}

/**
 * courber un chemin
 * @param {element} line chemin à courber 
 * @param {number} curviness courbure (1 par défaut) 
 * curve a path
 * @param.en {element} line path to curve
 * @param.en {number} curviness curvature (default is 1)
 */
export const courber = (line,curviness = 1) => {
  // convert path to anchors {x,y}
  // const rawPath = MotionPathPlugin.getRawPath(line);
  // console.log(rawPath);
  let anchors = line.dataset.anchors ? JSON.parse(line.dataset.anchors) : []; 
  // for(let i = 0; i < rawPath[0].length; i+=2){
  //   anchors.push({x:rawPath[0][i],y:rawPath[0][i+1]});
  // }
  const path = MotionPathPlugin.arrayToRawPath(anchors, {curviness: curviness});
  line.setAttribute("d", MotionPathPlugin.rawPathToString(path));
}

/**
 * adoucir un chemin
 * @param {element} line chemin à adoucir
 * @param {number} curviness courbure (1 par défaut)
 * @returns {element} chemin SVG
 * @example adoucir(path,1) 
 * smooth a path
 * @param.en {element} line path to smooth
 * @param.en {number} curviness curvature (default is 1)
 * @returns.en {element} SVG path
 * @example.en smooth(path,1)
 */
export const adoucir = (line,curviness = 1) => {
  if(line.tagName !== "path"){
    line = line.querySelectorAll("path");
  }else{
    line = [line];
  }
 
  line.forEach(l => {l.setAttribute("d", roundPathCorners(l.getAttribute("d"), curviness)); });
}

/**
 * tracer une équation mathématique
 * @param {string} fx équation mathématique
 * @param {number} ox origine x
 * @param {number} oy origine y
 * @param {number} debut début de la courbe
 * @param {number} fin fin de la courbe
 * @param {number} precision précision
 * @param {boolean} flip inverser x et y
 * @returns {element} chemin SVG
 * @example tracerLEquation("x^2",1,1,1,10,1,false)
 * @example tracerLEquation("sinus(x*50)",1,10) 
 * draw a mathematical equation
 * @param.en {string} fx mathematical equation
 * @param.en {number} ox x origin
 * @param.en {number} oy y origin
 * @param.en {number} start start of the curve
 * @param.en {number} end end of the curve
 * @param.en {number} precision precision
 * @param.en {boolean} flip flip x and y
 * @returns.en {element} SVG path
 * @example.en drawEquation("x^2",1,1,1,10,1,false)
 * @example.en drawEquation("sin(x*50)",1,10)
 */
export const tracerLEquation = (fx,ox=1,oy=1,debut=1,fin=NAZ,precision = 1,flip=false) => {
  let points = [];
  // const cosinus = (angle) => Math.cos(deg2rad(angle*50));
  // const sinus = (angle) => Math.sin(deg2rad(angle*50));

  const evaluate = (x) => {
    const expression = fx.replace(/x/g, `(${x})`);
    return eval(expression);
  };
  for(let x = debut-ox; x < (fin-ox); x+=precision/50){
    const y = evaluate(x)*50;
    let a = ox*50+x*50;
    let b = oy*50-y;
    let noise = perlin.get(a/NN,b/NN);
    a+=noise*PX;
    b+=noise*PY;
    points.push({x:a,y:b});
  }
  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let d = !flip ? `M${points[0].x},${points[0].y}` : `M${points[0].y},${points[0].x}`;
  points.forEach((point, index) => {
    d += !flip ? ` L${point.x},${point.y}` : ` L${point.y},${point.x}`;
  });
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", currentStroke);
  path.setAttribute("stroke-width", currentWidth);
  $SVG.appendChild(path);
  return path;  

}

export const aide = () => {
  //ouvrir une fenêtre d'aide /doc dans un nouvel onglet
  window.open("/doc","_blank");
  

//   console.log(""
//   +"<b>afficherLaGrille()</b> : affiche la grille avec les lettres et les chiffres<hr>"
//   +'<b>relierLesPoints(A,1,B,8,E,5)</b> : relie les points A1-B8-E5<hr>'+'<b>tracerLeCercle(E,10,2)</b> : trace un cercle de centre E10 et de rayon 2<hr>'
//   +'<b>tracerLeRectangle(D,10,2,3)</b> : trace un rectangle de coin D10 et de dimension 2 cases sur 3 cases<hr>'
//   +'<b>tracerLePolygone(D,10,5,3)</b> : trace un polygone de centre D10 et de 5 côtés dans un cercle de rayon 3<hr>'
//   +'<b>tracerLeTexte("Hello",A,1,1)</b> : trace le texte Hello à la position A1, échelle 1<hr>'
//   +'<b>tracerLEtoile(A,1,5,10,6)</b> : trace une étoile de centre A1 avec 5 branches avec rayons 10 et 6<hr>'
//   +'<b>parcourir(élément-à-suivre, élément-Motif,nombre de motif,échelle du motif, déformation du motif, nombre de vague)</b> : parcourt un chemin<hr>'
//   +'<b>calligrammer(élément-à-suivre, texte,nombre de répétition du texte, échelle du motif,angle du motif,déformation du motif, nombre de vague)</b> : parcourt un chemin avec un texte<hr>'
//   + '<i>déformation du motif</i> : "sinus", "elastic", "cercle","steps(12)","sinus+0.25"<hr>'
//   + '<b>tortue("PC 1 1 AV 10 TD 90 AV 10 TD 90 AV 10 TD 90 AV 10")</b> : trace un chemin avec une tortue (relatif)<hr>'
//   + '<b>crayon("PC 1 1 AV 10 PC 1 1 AV 10")</b> : trace un chemin avec un crayon (absolue)<hr>'
//   +'<b>parcourSup(el,{brosses:[el,],angle:0},nb,échelle)</b> : parcourt un chemin avec plusieurs éléments<hr>'
//   +'<b>auHasard()</b> : retourne un nombre au hasard entre 1 et N<hr>'
//   +'<b>supprimer(élément ou tableau )</b> : supprime élement(s)<hr>'
//   +'<b>cloner(élément,x,y)</b> : clone un élément à la position x,y<hr>'
//   +'<b>envoyer("nom",t)</b> : envoie le dessin au serveur avec un délai de t secondes<hr>'
//   +'<b>tourner(élément,angle)</b> : tourne un élément de l\'angle donné<hr>'
//   +'<b>deplacer(élément,x,y)</b> : déplace un élément à la position x,y<hr>'
//   +'<b>grouper(élément1,élément2,élément3)</b> : groupe les éléments<hr>'
//   +'<b>courber(élément,1)</b> : courbe un élément<hr>'
//   +'<b>adoucir(élément,1)</b> : adoucit un élément<hr>'
//   +'<b>couleur("red")</b> : change et sauvegarde la couleur du trait<hr>'
//   +'<b>largeur(2)</b> : change et sauvegarde la largeur du trait<hr>'
//   +'<b>tramerEnPoints(élément,espacement,angle,taille départ, taille fin)</b> : trame un élément<hr>'
//   +'<b>tramer(élément,espacement,angle, couleur)</b> : trame en ligne un élément<hr>'
//   +'<b>cosinus(angle)</b> : retourne le cosinus de l\'angle<hr>'
//   +'<b>sinus(angle)</b> : retourne le sinus de l\'angle<hr>'
//   +'<b>boucler(tracerLeCercle("N",13,i),10)</b> : boucle 10 fois le tracé du cercle en augmentant i<hr>'
//   +'<b>bruit(force x,force y,lissage)</b> : ajoute du bruit aux éléments suivants<hr>'
// )
};

/**
 * fusionner deux éléments path
 * @param {element} element1
 * @param {element} element2
 * @returns {element} chemin SVG
 * @example fusionner(path1,path2) 
 * merge two path elements
 * @param.en {element} element1
 * @param.en {element} element2
 * @returns.en {element} SVG path
 * @example.en merge(path1,path2)
 */

export const fusionner = (element1,element2) => {
  if(element1.tagName === "path" && element2.tagName === "path"){
    let d1 = element1.getAttribute("d");
    let d2 = element2.getAttribute("d");
    element1.setAttribute("d",d1+" "+d2);
    element2.remove();
    return element1;
  }
}

/**
 * tourner un élément
 * @param {element} element 
 * @param {number} angle angle de rotation en degrés
 * @example tourner(element,90)  
 * rotate an element
 * @param.en {element} element 
 * @param.en {number} angle rotation angle in degrees
 * @example.en rotate(element,90) 
 */
export const tourner = (element,angle,duration=0) => {
  if(element.dataset.center){
    gsap.to(element, {rotate:angle, duration: duration});
  }else{
    gsap.to(element, {rotate:angle, duration: duration, transformOrigin:"50% 50%"});
  }
}

/**
 * déplacer un élément
 * @param {element} element 
 * @param {number} x 
 * @param {number} y  
 * move an element
 * @param.en {element} element 
 * @param.en {number} x 
 * @param.en {number} y 
 */
export const deplacer = (element,x,y) => {
  element.dataset.dx = x;
  element.dataset.dy = y;
  gsap.set(element, {x:x*50, y:y*50});
}

/**
 * cloner un élément et le déplacer
 * @param {element} element
 * @param {number} [x] 0 par défaut
 * @param {number} [y] 0 par défaut
 * @returns {element} élément cloné
 * @example cloner(element,1,1) 
 * clone an element and move it
 * @param.en {element} element
 * @param.en {number} [x] 0 by default
 * @param.en {number} [y] 0 by default
 * @returns.en {element} cloned element
 * @example.en clone(element,1,1)
 */
export const cloner = (element,x=0,y=0) => {
  let clone = element.cloneNode(true);
  deplacer(clone,x,y);
  $SVG.appendChild(clone);
  return clone;
}

/**
 * groupe les éléments
 * @param  {...any} elements
 * @returns {element} groupe SVG
 * @example grouper(element1,element2,element3) 
 * group the elements
 * @param.en  {...any} elements
 * @returns.en {element} SVG group
 * @example.en groupElements(element1,element2,element3)
 */
export const grouper = (...elements) => {
  const $G = document.createElementNS("http://www.w3.org/2000/svg", "g");
  // if(!Array.isArray(elements)){
  //   elements = [...[elements]];
  // }
  elements.forEach(e => $G.appendChild(e));
  $SVG.appendChild($G);
  return $G;


}

/**
 * cosinus
 * @param {number} angle en degrés
 * @returns {number} cosinus de l'angle
 * @example cosinus(90)
 * cosine
 * @param.en {number} angle in degrees
 * @returns.en {number} cosine of the angle
 * @example.en cosine(90)
 */

export const cosinus = (angle) => Math.cos(deg2rad(angle));

/**
 * sinus
 * @param {number} angle en degrés
 * @returns {number} sinus de l'angle
 * @example sinus(90)
 * sine
 * @param.en {number} angle in degrees
 * @returns.en {number} sine of the angle
 * @example.en sine(90)
 */
export const sinus = (angle) => Math.sin(deg2rad(angle));

/**
 * sauvegarde en png
 * @param {string} name le nom du fichier  
 * save as png
 * @param.en {string} name the file name
 */
export const png = async (name="dessin") =>{
  // waiting 1s
  // const timer = await new Promise(resolve => setTimeout(resolve, 1000));
  gsap.killTweensOf("*");
  const svg = $SVG.outerHTML;
  const blob = new Blob([svg], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = '#ffffff'; // Set the background color to white
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background with white
    ctx.drawImage(img, 0, 0);
    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = png;
    a.download = name+'.png';
    a.click();
  };
}

/**
 * pour changer la langue (english, français)
 * @param {string} text 
 * to change the language (english, french)
 * @param.en {string} text 
 */

export const langue = (text) => {
  if(text.slice(0,2) === "fr") trace('veuillez rafrachir la page pour changer la langue');
  if(text.slice(0,2) === "en") trace('please refresh the page to change the language');
  localStorage.setItem('language', text.slice(0,2));
}



/**
 * signer le dessin
 * @param {string} signature
 * @example signer("Lucie - 01")
 * sign the drawing
 * @param.en {string} signature
 * @example.en signer("Lucie - 01")
 */

export const signer = (text) => {
  const H = (($SVG.viewBox.baseVal.height+$SVG.viewBox.baseVal.y)/50);
  tracerLeTexte(text,1,H-1.55,1.2);
}

/**
 * export en mp4
 * @param {function} drawFunction 
 * @param {number} frames nombre d'images 
 * @param {object} options 
 * @example mp4(draw,2,{W:1080,H:1080,FPS:25})
 * export as mp4
 * @param.en {function} drawFunction
 * @param.en {number} frames
 * @param.en {object} options
 */

export const mp4 = (drawFunction,frames=2,options) => {

  const loadImage =   async () => {
    const svg = $SVG;
    const image = new Image();
    let clonedSvgElement = svg.cloneNode(true);
    let outerHTML = clonedSvgElement.outerHTML,  blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
    let URL = window.URL || window.webkitURL || window;
    let blobURL = URL.createObjectURL(blob);
    image.src = blobURL;
    await image.decode();
    return image;
  }
  
  const download = (url, filename) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename || "download";
    anchor.click();
  };


  const W = options.W || 1080;
  const H = options.H || 1080;
  const FPS = options.fps || 25;
  
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  $SVG.setAttribute('width',W);
  $SVG.setAttribute('height',H);

  HME.createH264MP4Encoder().then(async encoder => {
    encoder.width  = W;
    encoder.height = H;
    encoder.frameRate = FPS;
    encoder.kbps = 19200*2;
    encoder.quantizationParameter = 10; // 
    encoder.initialize();

  

    for (let i = 0; i < frames; ++i) {
      
      // draw(i);
      drawFunction(i);


      const svgImage = await loadImage();
      // clear the ctx with white color
      ctx.fillStyle = options.color || "white";
      ctx.fillRect(0, 0, W, H);

      ctx.drawImage(svgImage, 0, 0);
      encoder.addFrameRgba(ctx.getImageData(0, 0, W , H).data);
      await new Promise(resolve => window.requestAnimationFrame(resolve));
      // draws.push($SVG.innerHTML);
      // $SVG.innerHTML = '';
    }

    encoder.finalize();
    const uint8Array = encoder.FS.readFile(encoder.outputFilename);
    download(URL.createObjectURL(new Blob([uint8Array], { type: "video/mp4" })))
    encoder.delete();
  })
}