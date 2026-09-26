document
.
addEventListener
(
'DOMContentLoaded'
,
 
(
)
 
=>
 
{

  
const
 loadingIndicator 
=
 
document
.
getElementById
(
'loadingIndicator'
)
;

  
const
 errorIndicator 
=
 
document
.
getElementById
(
'errorIndicator'
)
;

  
const
 togglePanel 
=
 
document
.
getElementById
(
'togglePanel'
)
;

  
const
 legendPanel 
=
 
document
.
getElementById
(
'legendPanel'
)
;

  
fetch
(
'data/buildings.geojson'
)

    
.
then
(
response
 
=>
 
{

      
if
 
(
!
response
.
ok
)
 
{

        
throw
 
new
 
Error
(
`
Failed to fetch data/buildings.geojson (HTTP 
${
response
.
status
}
)
`
)
;

      
}

      
return
 response
.
json
(
)
;

    
}
)

    
.
then
(
geojson
 
=>
 
{

      loadingIndicator
.
hidden
 
=
 
true
;

      togglePanel
.
hidden
 
=
 
false
;

      legendPanel
.
hidden
 
=
 
false
;

      
initMap
(
geojson
)
;

    
}
)

    
.
catch
(
err
 
=>
 
{

      loadingIndicator
.
hidden
 
=
 
true
;

      errorIndicator
.
hidden
 
=
 
false
;

      errorIndicator
.
textContent
 
=

        
`
Could not load building data: 
${
err
.
message
}
. 
`
 
+

        
`
Make sure data/buildings.geojson exists and you are viewing this page via a local 
`
 
+

        
`
web server (fetch() of local files requires http://, not file://).
`
;

      
console
.
error
(
err
)
;

    
}
)
;

  
function
 
initMap
(
BUILDINGS_GEOJSON
)
 
{

  
const
 
USE_COLORS
 
=
 
{

    
'Residential Accommodation'
:
 
'#4a6fa5'
,

    
'Commercial Activity'
:
 
'#e8a838'
,

    
'Mixed Use'
:
 
'#7a9e7e'
,

    
'Other'
:
 
'#9b8fb0'

  
}
;

  
const
 
DEFAULT_USE_COLOR
 
=
 
'#95a5b3'
;

  
function
 
normalizeUseCategory
(
props
)
 
{

    
const
 tier 
=
 
(
props
.
buildinguse_oslandusetiera
 
||
 
''
)
.
trim
(
)
;

    
if
 
(
USE_COLORS
[
tier
]
)
 
return
 tier
;

    
return
 
'Other'
;

  
}

  
// ---- Compute height range generically from data ----

  
const
 heights 
=
 
BUILDINGS_GEOJSON
.
features

    
.
map
(
f
 
=>
 f
.
properties
.
height_absolutemax_m
)

    
.
filter
(
v
 
=>
 
typeof
 v 
===
 
'number'
 
&&
 
!
isNaN
(
v
)
)
;

  
const
 minHeight 
=
 heights
.
length
 
?
 
Math
.
min
(
...
heights
)
 
:
 
0
;

  
const
 maxHeight 
=
 heights
.
length
 
?
 
Math
.
max
(
...
heights
)
 
:
 
1
;

  
// Cool -> warm gradient stops

  
const
 
HEIGHT_STOPS
 
=
 
[

    
{
 
t
:
 
0.0
,
 
color
:
 
[
49
,
 
104
,
 
142
]
 
}
,
   
// cool blue

    
{
 
t
:
 
0.25
,
 
color
:
 
[
67
,
 
162
,
 
148
]
 
}
,
  
// teal

    
{
 
t
:
 
0.5
,
 
color
:
 
[
153
,
 
199
,
 
96
]
 
}
,
   
// green-yellow

    
{
 
t
:
 
0.75
,
 
color
:
 
[
240
,
 
180
,
 
41
]
 
}
,
  
// amber

    
{
 
t
:
 
1.0
,
 
color
:
 
[
196
,
 
60
,
 
47
]
 
}
     
// warm red

  
]
;

  
function
 
lerp
(
a
,
 b
,
 t
)
 
{
 
return
 a 
+
 
(
b 
-
 a
)
 
*
 t
;
 
}

  
function
 
heightToColor
(
h
)
 
{

    
if
 
(
maxHeight 
===
 minHeight
)
 
return
 
rgbStr
(
HEIGHT_STOPS
[
0
]
.
color
)
;

    
let
 t 
=
 
(
h 
-
 minHeight
)
 
/
 
(
maxHeight 
-
 minHeight
)
;

    t 
=
 
Math
.
max
(
0
,
 
Math
.
min
(
1
,
 t
)
)
;

    
for
 
(
let
 i 
=
 
0
;
 i 
<
 
HEIGHT_STOPS
.
length
 
-
 
1
;
 i
++
)
 
{

      
const
 s0 
=
 
HEIGHT_STOPS
[
i
]
,
 s1 
=
 
HEIGHT_STOPS
[
i 
+
 
1
]
;

      
if
 
(
t 
>=
 s0
.
t
 
&&
 t 
<=
 s1
.
t
)
 
{

        
const
 localT 
=
 
(
t 
-
 s0
.
t
)
 
/
 
(
s1
.
t
 
-
 s0
.
t
 
||
 
1
)
;

        
const
 c 
=
 
[

          
Math
.
round
(
lerp
(
s0
.
color
[
0
]
,
 s1
.
color
[
0
]
,
 localT
)
)
,

          
Math
.
round
(
lerp
(
s0
.
color
[
1
]
,
 s1
.
color
[
1
]
,
 localT
)
)
,

          
Math
.
round
(
lerp
(
s0
.
color
[
2
]
,
 s1
.
color
[
2
]
,
 localT
)
)

        
]
;

        
return
 
rgbStr
(
c
)
;

      
}

    
}

    
return
 
rgbStr
(
HEIGHT_STOPS
[
HEIGHT_STOPS
.
length
 
-
 
1
]
.
color
)
;

  
}

  
function
 
rgbStr
(
c
)
 
{
 
return
 
`
rgb(
${
c
[
0
]
}
, 
${
c
[
1
]
}
, 
${
c
[
2
]
}
)
`
;
 
}

  
let
 mode 
=
 
'use'
;

  
function
 
colorForFeature
(
feature
)
 
{

    
if
 
(
mode 
===
 
'use'
)
 
{

      
const
 cat 
=
 
normalizeUseCategory
(
feature
.
properties
)
;

      
return
 
USE_COLORS
[
cat
]
 
||
 
DEFAULT_USE_COLOR
;

    
}
 
else
 
{

      
const
 h 
=
 feature
.
properties
.
height_absolutemax_m
;

      
if
 
(
typeof
 h 
!==
 
'number'
 
||
 
isNaN
(
h
)
)
 
return
 
'#b0b8c0'
;

      
return
 
heightToColor
(
h
)
;

    
}

  
}

  
function
 
styleFor
(
feature
)
 
{

    
return
 
{

      
color
:
 
'#2d3748'
,

      
weight
:
 
1
,

      
fillColor
:
 
colorForFeature
(
feature
)
,

      
fillOpacity
:
 
0.72
,

      
opacity
:
 
0.6

    
}
;

  
}

  
// ---- Compute bounds ----

  
const
 bounds 
=
 
L
.
geoJSON
(
BUILDINGS_GEOJSON
)
.
getBounds
(
)
;

  
const
 map 
=
 
L
.
map
(
'map'
,
 
{

    
scrollWheelZoom
:
 
true
,

    
zoomSnap
:
 
0.25
,

    
zoomDelta
:
 
0.5
,

    
wheelPxPerZoomLevel
:
 
120
,

    
zoomAnimation
:
 
true
,

    
markerZoomAnimation
:
 
true

  
}
)
;

  
if
 
(
bounds
.
isValid
(
)
)
 
{

    map
.
fitBounds
(
bounds
,
 
{
 
padding
:
 
[
40
,
 
40
]
,
 
maxZoom
:
 
18
 
}
)
;

  
}
 
else
 
{

    map
.
setView
(
[
51.5074
,
 
-
0.1278
]
,
 
14
)
;

  
}

  
L
.
tileLayer
(
'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=cb1_2vg3_1_e3722aa6bb7a6d6e4e78d956'
,
 
{

    
attribution
:
 
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
,

    
subdomains
:
 
'abcd'
,

    
maxZoom
:
 
20

  
}
)
.
addTo
(
map
)
;

  
function
 
fmt
(
v
,
 unit
)
 
{

    
if
 
(
v 
===
 
undefined
 
||
 v 
===
 
null
 
||
 v 
===
 
''
)
 
return
 
'N/A'
;

    
return
 
`
${
v
}
${
unit 
?
 
' '
 
+
 unit 
:
 
''
}
`
;

  
}

  
function
 
popupHtml
(
props
)
 
{

    
return
 
`

      <div class="popup-title">
${
props
.
buildinguse
 
||
 
'Unknown use'
}
</div>
      <div class="popup-row"><strong>Land use tier:</strong> 
${
fmt
(
props
.
buildinguse_oslandusetiera
)
}
</div>
      <div class="popup-row"><strong>Floors:</strong> 
${
fmt
(
props
.
numberoffloors
)
}
</div>
      <div class="popup-row"><strong>Footprint area:</strong> 
${
fmt
(
props
.
geometry_area_m2
,
 
'm²'
)
}
</div>
      <div class="popup-row"><strong>Max height:</strong> 
${
fmt
(
props
.
height_absolutemax_m
,
 
'm'
)
}
</div>
      <div class="popup-row"><strong>Connectivity:</strong> 
${
fmt
(
props
.
connectivity
)
}
</div>
    
`
;

  
}

  
const
 geoLayer 
=
 
L
.
geoJSON
(
BUILDINGS_GEOJSON
,
 
{

    
style
:
 styleFor
,

    
onEachFeature
:
 
(
feature
,
 layer
)
 
=>
 
{

      layer
.
bindPopup
(
popupHtml
(
feature
.
properties
)
)
;

      layer
.
on
(
'mouseover'
,
 
(
)
 
=>
 
{

        layer
.
setStyle
(
{
 
weight
:
 
2.5
,
 
opacity
:
 
1
,
 
fillOpacity
:
 
0.9
 
}
)
;

        layer
.
bringToFront
(
)
;

      
}
)
;

      layer
.
on
(
'mouseout'
,
 
(
)
 
=>
 
{

        layer
.
setStyle
(
styleFor
(
feature
)
)
;

      
}
)
;

    
}

  
}
)
.
addTo
(
map
)
;

  
function
 
repaint
(
)
 
{

    geoLayer
.
eachLayer
(
layer
 
=>
 
{

      layer
.
setStyle
(
styleFor
(
layer
.
feature
)
)
;

    
}
)
;

  
}

  
// ---- Legend ----

  
const
 legendTitle 
=
 
document
.
getElementById
(
'legendTitle'
)
;

  
const
 legendBody 
=
 
document
.
getElementById
(
'legendBody'
)
;

  
function
 
renderLegend
(
)
 
{

    
if
 
(
mode 
===
 
'use'
)
 
{

      legendTitle
.
textContent
 
=
 
'Legend — Building Use'
;

      
// Only show categories present in data (plus keep order stable)

      
const
 present 
=
 
new
 
Set
(
BUILDINGS_GEOJSON
.
features
.
map
(
f
 
=>
 
normalizeUseCategory
(
f
.
properties
)
)
)
;

      
let
 html 
=
 
''
;

      
Object
.
keys
(
USE_COLORS
)
.
forEach
(
cat
 
=>
 
{

        
if
 
(
present
.
has
(
cat
)
)
 
{

          html 
+=
 
`
<div class="legend-row"><span class="swatch" style="background:
${
USE_COLORS
[
cat
]
}
"></span>
${
cat
}
</div>
`
;

        
}

      
}
)
;

      legendBody
.
innerHTML
 
=
 html 
||
 
'<div class="legend-row">No data</div>'
;

    
}
 
else
 
{

      legendTitle
.
textContent
 
=
 
'Legend — Max Height (m)'
;

      
const
 gradientCss 
=
 
`
linear-gradient(to right, 
${
HEIGHT_STOPS
.
map
(
s
 
=>
 
rgbStr
(
s
.
color
)
)
.
join
(
', '
)
}
)
`
;

      legendBody
.
innerHTML
 
=
 
`

        
<
div
 
class
=
"
legend-gradient
"
 
style
=
"
background
:
${
gradientCss
}
"
>
</
div
>

        
<
div
 
class
=
"
legend-scale-labels
"
>

          
<
span
>
${
minHeight
.
toFixed
(
1
)
}
 m
</
span
>

          
<
span
>
${
maxHeight
.
toFixed
(
1
)
}
 m
</
span
>

        
</
div
>

      
`
;

    
}

  
}

  
renderLegend
(
)
;

  
// ---- Toggle control ----

  
const
 btnByUse 
=
 
document
.
getElementById
(
'btnByUse'
)
;

  
const
 btnByHeight 
=
 
document
.
getElementById
(
'btnByHeight'
)
;

  
function
 
setMode
(
newMode
)
 
{

    mode 
=
 newMode
;

    btnByUse
.
classList
.
toggle
(
'active'
,
 mode 
===
 
'use'
)
;

    btnByHeight
.
classList
.
toggle
(
'active'
,
 mode 
===
 
'height'
)
;

    
repaint
(
)
;

    
renderLegend
(
)
;

  
}

  btnByUse
.
addEventListener
(
'click'
,
 
(
)
 
=>
 
setMode
(
'use'
)
)
;

  btnByHeight
.
addEventListener
(
'click'
,
 
(
)
 
=>
 
setMode
(
'height'
)
)
;

  
}

}
)
;

