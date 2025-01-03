(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[645],{9013:(e,s,r)=>{Promise.resolve().then(r.bind(r,9011))},9011:(e,s,r)=>{"use strict";r.r(s),r.d(s,{default:()=>I});var a=r(5155),c=r(9318),l=r(3551),t=r(2640),i=r(8686),n=r(6889),o=r(9351),d=r(4348),m=r(7655),h=r(5621),x=r(3950),p=r(944),u=r(5440),g=r(6056),v=r(3312),j=r(9749),f=r(2115),N=r(9710),b=r(1567);let _=N.Kq,y=N.bL,w=N.l9,E=f.forwardRef((e,s)=>{let{className:r,sideOffset:c=4,...l}=e;return(0,a.jsx)(N.UC,{ref:s,sideOffset:c,className:(0,b.cn)("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",r),...l})});E.displayName=N.UC.displayName;var R=r(7485),C=r(5534),A=r(2110),S=r(1923),k=r(4277),O=r(5565),M=r(7404);function T(e){var s,r;let x;let{id:p,research:u,tech:g,onStartResearch:v,isAnyResearchInProgress:f}=e,{state:N,currentResources:R}=(0,c.I)(),C=Math.pow(1+u.cost.percent_increase_per_level/100,g.level),k=1+u.time.percent_increase_per_level*g.level/100,T=(0,b._)(N.researchsConfig,N.planetResearchs,"research_speed"),I=u.time.base_seconds*k*T,L=S.F[p],q={metal:u.cost.base_metal*C,deuterium:u.cost.base_deuterium*C,science:u.cost.base_science*C,microchips:u.cost.base_microchips*C},P=R.metal>=q.metal&&R.deuterium>=q.deuterium&&R.science>=q.science&&R.microchips>=q.microchips,U=!u.prerequisites||u.prerequisites.every(e=>{var s,r;return((null===(r=N.planetResearchs)||void 0===r?void 0:null===(s=r.technologies[e.technology_id])||void 0===s?void 0:s.level)||0)>=e.required_level});return(0,a.jsxs)(j.Zp,{className:"bg-card/50 backdrop-blur-sm transition-all duration-300 ".concat(U&&P&&!f?"neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)]":f&&!g.is_researching?"border-amber-500/50 opacity-50":"border-red-500/50"),children:[(0,a.jsxs)(j.aR,{className:"flex flex-row items-start gap-6 pb-2",children:[(0,a.jsx)("div",{className:"w-2/5 aspect-square",children:(0,a.jsx)(O.default,{width:100,height:100,src:(0,M.w)("researchs",p+".webp"),alt:null==L?void 0:L.name,className:"w-full h-full object-cover rounded-lg ".concat((!U||!P||f&&!g.is_researching)&&"opacity-50")})}),(0,a.jsxs)("div",{className:"flex flex-col gap-2 w-3/5",children:[(0,a.jsxs)("div",{className:"flex flex-col gap-2",children:[(0,a.jsx)(j.ZB,{className:"text-xl font-bold neon-text tracking-wide uppercase hover:scale-105 transition-transform",children:null==L?void 0:L.name}),(0,a.jsxs)("div",{className:"flex flex-col gap-1 text-sm",children:[(null===(s=L.unlocks)||void 0===s?void 0:s.ships)&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(l.A,{className:"h-4 w-4 text-blue-400"}),(0,a.jsxs)("span",{children:["Unlocks ships: ",L.unlocks.ships.join(", ")]})]}),(null===(r=L.unlocks)||void 0===r?void 0:r.defense)&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(t.A,{className:"h-4 w-4 text-green-400"}),(0,a.jsxs)("span",{children:["Unlocks defense: ",L.unlocks.defense.join(", ")]})]})]})]}),(0,a.jsxs)("div",{className:"flex items-center space-x-2 text-sm",children:[(0,a.jsx)(_,{children:(0,a.jsxs)(y,{children:[(0,a.jsxs)(w,{className:"text-primary font-medium",children:["Level ",g.level,"/",u.max_level]}),(0,a.jsx)(E,{children:(0,a.jsxs)("p",{children:["Maximum level: ",u.max_level]})})]})}),(0,a.jsx)("span",{className:"text-primary/50",children:"•"}),(0,a.jsx)("div",{className:"text-secondary uppercase",children:null==L?void 0:L.category})]}),(0,a.jsx)("p",{className:"text-sm text-gray-200 text-left",children:(x=null==L?void 0:L.description,u&&u.effects.forEach(e=>{e.per_level&&("resource_boost"===e.type?x+=" Each level increases ".concat(e.resource_type," production by ").concat(e.value,"%."):"construction_speed"===e.type?x+=" Each level increases construction speed by ".concat(e.value,"%."):"research_speed"===e.type&&(x+=" Each level increases research speed by ".concat(e.value,"%.")))}),x)}),!U&&(0,a.jsxs)("div",{className:"flex items-center gap-2 text-red-400 text-sm",children:[(0,a.jsx)(i.A,{className:"h-4 w-4"}),(0,a.jsxs)("div",{children:["Requires:"," ",u.prerequisites.map(e=>"".concat(S.F[e.technology_id].name," ").concat(e.required_level)).join(", ")]})]}),f&&!g.is_researching&&(0,a.jsxs)("div",{className:"flex items-center gap-2 text-amber-400 text-sm",children:[(0,a.jsx)(n.A,{className:"h-4 w-4"}),(0,a.jsx)("div",{children:"Another technology is currently being researched"})]})]})]}),(0,a.jsxs)(j.Wu,{className:"space-y-4 pt-4 border-t border-primary/20",children:[g.is_researching?(0,a.jsx)(A.M,{startTime:g.research_start_time,finishTime:g.research_finish_time,variant:"primary"}):(0,a.jsxs)("div",{className:"p-3 bg-black/30 rounded-lg border border-primary/20",children:[(0,a.jsx)("h4",{className:"font-medium text-primary mb-2",children:"Research Time"}),(0,a.jsx)("div",{className:"text-gray-200 text-sm",children:(e=>{let s=Math.floor(e/86400),r=Math.floor(e%86400/3600),a=Math.floor(e%3600/60),c=Math.floor(e%60);return[s>0&&"".concat(s,"d"),r>0&&"".concat(r,"h"),a>0&&"".concat(a,"m"),c>0&&"".concat(c,"s")].filter(Boolean).join(" ")})(I)})]}),(0,a.jsx)(_,{children:(0,a.jsx)(y,{children:(0,a.jsx)(w,{asChild:!0,children:(0,a.jsxs)("div",{className:"w-full p-3 bg-black/30 rounded-lg border border-primary/20",children:[(0,a.jsx)("h4",{className:"font-medium text-primary mb-2",children:"Resource Cost"}),(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[u.cost.base_metal>0&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(o.A,{className:"h-4 w-4 text-secondary"}),(0,a.jsx)("span",{className:"text-sm truncate ".concat(R.metal<q.metal?"text-red-400":"text-gray-200"),children:Math.floor(q.metal).toLocaleString()})]}),u.cost.base_deuterium>0&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(d.A,{className:"h-4 w-4 text-primary"}),(0,a.jsx)("span",{className:"text-sm truncate ".concat(R.deuterium<q.deuterium?"text-red-400":"text-gray-200"),children:Math.floor(q.deuterium).toLocaleString()})]}),u.cost.base_science>0&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(m.A,{className:"h-4 w-4 text-blue-400"}),(0,a.jsx)("span",{className:"text-sm truncate ".concat(R.science<q.science?"text-red-400":"text-gray-200"),children:Math.floor(q.science).toLocaleString()})]}),u.cost.base_microchips>0&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(h.A,{className:"h-4 w-4 text-accent"}),(0,a.jsx)("span",{className:"text-sm truncate ".concat(R.microchips<q.microchips?"text-red-400":"text-gray-200"),children:Math.floor(q.microchips).toLocaleString()})]})]})]})})})}),(0,a.jsx)("button",{onClick:()=>v(p),disabled:g.is_researching||g.level>=u.max_level||!U||!P||f&&!g.is_researching,className:"w-full px-4 py-2 rounded-lg font-medium transition-colors border ".concat(g.is_researching||g.level>=u.max_level||!U||!P||f&&!g.is_researching?"bg-gray-800/50 text-gray-400 border-gray-600 cursor-not-allowed":"bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border"),children:g.level>=u.max_level?"MAX LEVEL":g.is_researching?"RESEARCHING":f&&!g.is_researching?"RESEARCH IN PROGRESS":U?P?"RESEARCH":"NOT ENOUGH RESOURCES":"PREREQUISITES NOT MET"})]})]})}function I(){var e;let{state:s}=(0,c.I)(),[r,l]=(0,f.useState)(()=>{let e=localStorage.getItem("structuresGridCols");return e?parseInt(e):2}),t=e=>{l(e),localStorage.setItem("structuresGridCols",e.toString())};if(!s.researchsConfig||!s.planetResearchs)return(0,a.jsx)("div",{children:"Loading..."});if(!(null===(e=s.structures)||void 0===e?void 0:e.some(e=>"research_lab"===e.type)))return(0,a.jsxs)("div",{className:"flex flex-col items-center justify-center h-[80vh] space-y-6 text-center",children:[(0,a.jsx)(x.A,{className:"w-16 h-16 text-red-500 animate-pulse"}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-red-500",children:"ACCESS DENIED"}),(0,a.jsxs)("div",{className:"font-mono text-sm text-gray-200 max-w-md",children:[(0,a.jsx)("p",{className:"mb-2",children:"[ERROR CODE: NO_LABORATORY_DETECTED]"}),(0,a.jsx)("p",{children:"Laboratory structure required for research operations."}),(0,a.jsx)("p",{children:"Please construct a laboratory to access research capabilities."})]})]})]});let i=async e=>{var r;if(null===(r=s.selectedPlanet)||void 0===r?void 0:r.id)try{await C.F.researchs.startResearch(e,s.selectedPlanet.id)}catch(e){console.error("Error starting research:",e)}},n=Object.values(s.planetResearchs.technologies).some(e=>e.is_researching);return(0,a.jsx)(k.t,{children:(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{className:"flex justify-between items-center",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("h1",{className:"text-3xl font-bold neon-text mb-2 flex items-center gap-2",children:[(0,a.jsx)(m.A,{className:"h-8 w-8"}),"RESEARCH LABORATORY"]}),(0,a.jsxs)("div",{className:"flex items-center gap-2 text-gray-200",children:[(0,a.jsx)(p.A,{className:"h-5 w-5"}),(0,a.jsx)("p",{children:"Browse and unlock advanced technologies"})]})]}),(0,a.jsxs)(R.rI,{children:[(0,a.jsx)(R.ty,{asChild:!0,children:(0,a.jsx)(v.$,{variant:"outline",size:"icon",children:(0,a.jsx)(u.A,{className:"h-4 w-4"})})}),(0,a.jsxs)(R.SQ,{align:"end",children:[(0,a.jsxs)(R._2,{onClick:()=>t(1),children:[(0,a.jsx)(u.A,{className:"mr-2 h-4 w-4"})," Single Column"]}),(0,a.jsxs)(R._2,{onClick:()=>t(2),children:[(0,a.jsx)(g.A,{className:"mr-2 h-4 w-4"})," Two Columns"]}),(0,a.jsxs)(R._2,{onClick:()=>t(3),children:[(0,a.jsx)(u.A,{className:"mr-2 h-4 w-4"})," Three Columns"]}),(0,a.jsxs)(R._2,{onClick:()=>t(4),children:[(0,a.jsx)(u.A,{className:"mr-2 h-4 w-4"})," Four Columns"]})]})]})]}),(0,a.jsx)("div",{className:"grid ".concat({1:"grid-cols-1",2:"grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2",3:"grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",4:"grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}[r]," gap-6"),children:Object.entries(s.researchsConfig.available_researchs).map(e=>{var r;let[c,l]=e,t=(null===(r=s.planetResearchs)||void 0===r?void 0:r.technologies[c])||{level:0,is_researching:!1,research_start_time:null,research_finish_time:null};return(0,a.jsx)(T,{id:c,research:l,tech:t,onStartResearch:i,isAnyResearchInProgress:n},c)})})]})})}}},e=>{var s=s=>e(e.s=s);e.O(0,[149,345,440,142,728,862,911,318,178,441,517,358],()=>s(9013)),_N_E=e.O()}]);