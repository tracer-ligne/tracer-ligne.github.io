export const makeScript = (script,functionNames,code,DURATION,STAGGER) => {
  let fr = Object.keys(functionNames).join(', ');
  let eng = Object.entries(functionNames).map(([key, value]) => `${key} as ${value}`).join(', ');
  script.textContent = `import {$SVG,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} from './main.js';`;
  script.textContent += `import{ ${fr}, ${eng} } from './main.js';`
  script.textContent += `${code}`;
  script.textContent += ` ; `;
  script.textContent += `if(document.querySelector('#result #grid')!==null) gsap.from('#result #grid line', {duration:${DURATION}, drawSVG: '0%', stagger:${STAGGER} });gsap.from('#result svg>*,g.draw>*', {duration: ${DURATION}, drawSVG: '0%', stagger: ${STAGGER}});if(document.querySelector('#result g.trame')!==null) gsap.from('#result svg g.trame>*', {duration:${DURATION/2}, drawSVG: '0%', stagger: ${STAGGER}})`;
}