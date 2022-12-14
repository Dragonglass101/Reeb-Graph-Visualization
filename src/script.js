// // importing required packages
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import * as dat from "dat.gui";
import { NumberKeyframeTrack } from "three";
// const gui = new dat.GUI()

var mouse, raycaster;

scene = new THREE.Scene();
scene.background = new THREE.Color(0x2e2e2e);
camera = new THREE.PerspectiveCamera(75, 4 / 3, 0.1, 1000.0);
camera.position.z = 80;
// camera.lookAt(new THREE.Vector3(0, 0, 0));
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
controls = new OrbitControls(camera, renderer.domElement);
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2(-1000, -1000);

var scene, camera, renderer;
var controls;
var obj;
var stats;
var scaleLayout = 8
var Scale = 10;

var connectionPairs = []
var mapOfCriticalPoints = new Map();

var vertices = [
    [0, 0, 0]
];
var points = [];
var edges = [null];
var faces = [];
class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

let num_vertices, num_edges, num_triangles;

let markedPointRadii = { radius: 0.5 };

var adj;
var heightFunctionList;
var LinkStruct;

const scaleDict = {
    "double-torus": 10,
    "socket-reduced": 0.2,
}

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);

const shapeDropdown = document.getElementById("shape_name");
shapeDropdown.addEventListener("change", function() {
    console.log("clear canvas");
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    console.log("change shape");
    shapeName = shapeDropdown.value
    Scale = scaleDict[shapeName]

    connectionPairs = []
    mapOfCriticalPoints = new Map();
    vertices = [
        [0, 0, 0]
    ];
    points = [];
    edges = [null];
    faces = [];
    obj = null;
    readRgFile()
})


var mouseClick = false;
window.addEventListener('mousedown', function() {
    mouseClick = true;
    console.log("mouse click...")
}, false)
window.addEventListener('mouseup', function() {
    mouseClick = false;
})


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function hoverPieces() {
    mouseClick
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    const geometry = new THREE.SphereGeometry(markedPointRadii.radius + 0.2, 32, 32); // (radius, widthSegments, heightSegments)
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const sphere = new THREE.Mesh(geometry, material);
    if (intersects.length > 0) {
        let lineIntersected = false;
        for (let i = 0; i < intersects.length; i++) {
            console.log(intersects[i].object);

            // if (intersects[i].object == undefined) continue;

            if (intersects[i].object.type == "Line") {
                if (lineIntersected) break;
                lineIntersected = true;
                const name = intersects[i].object.name;
                const levelSetNumber = name.split('_')[1];

                for (let i = 0; i < connectionPairs.length; i++) {
                    const group = scene.getObjectByName(`levelSet_${i}`)
                    group.visible = false;
                }

                console.log("levelSetNumber", levelSetNumber);
                const group = scene.getObjectByName(`levelSet_${levelSetNumber}`)
                group.visible = true;

            }

            // if (intersects[i].object.type == "Mesh") {
            //     // intersects[i].object.visible = false;
            //     // console.log("name", intersects[i].object.name)
            //     let name = intersects[i].object.name;
            //     let pointNumber = name.split('reebPoint');
            //     if (pointNumber.length == 2) {
            //         // intersects[i].object.material.color.set(0xe6cc00);
            //         const reebObj = scene.getObjectByName(`criticalPoint${pointNumber[1]}`);
            //         // console.log(reebObj);
            //         // reebObj.material.color.set(0xffff00);

            //         sphere.name = `highlightedPoint`;
            //         sphere.position.x = reebObj.position.x;
            //         sphere.position.y = reebObj.position.y;
            //         sphere.position.z = reebObj.position.z;

            //         scene.add(sphere);
            //     }
            // }
        }
    } else {
        // const highlightedPoint = scene.getObjectByName('highlightedPoint');
        // if (highlightedPoint) {
        //     scene.remove(highlightedPoint)
        // }
        for (let i = 0; i < connectionPairs.length; i++) {
            const group = scene.getObjectByName(`levelSet_${i}`)
            if (!group) break;
            group.visible = false;
        }
    }
}

window.addEventListener('mousemove', onMouseMove, false);

var arr = [];
// horse seashell bunny cube sphere5 sphere20 Tangle Torus space_station x_wing helix2 RzTorus
var shapeName = "double-torus"
var fileName = `gts_files/head.gts`
var layoutFile = `layout_files/${shapeName}.ly`
var rgFile = `rg_files/${shapeName}.rg`
var levelSetFile = `lvlset_files/${shapeName}.part`

//////////////////////////////////////////////////////////////////////////
/* Read Files */
function readRgFile() {
    rgFile = `rg_files/${shapeName}.rg`
    console.log(rgFile)
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", rgFile, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            var allText = rawFile.responseText;
            arr = allText.split("\n");
            fillRgMap(arr);
        }
    };
    rawFile.send();
}

function readLayoutFile() {
    layoutFile = `layout_files/${shapeName}.ly`
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", layoutFile, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            var allText = rawFile.responseText;
            arr = allText.split("\n");
            fillLayoutArr(arr);
        }
    };
    rawFile.send();
}

function readLevelSetFile() {
    levelSetFile = `lvlset_files/${shapeName}.part`
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", levelSetFile, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            var allText = rawFile.responseText;
            arr = allText.split("\n");
            makeLevelSet(arr);
        }
    };
    rawFile.send();
}

function readTextFile() {
    fileName = `gts_files/${shapeName}.gts`
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", fileName, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            var allText = rawFile.responseText;
            arr = allText.split("\n");
            fillArrays(arr);
        }
    };
    rawFile.send();
}
readRgFile()

class CriticalPoint {
    constructor(fv, type) {
        this.x = null;
        this.y = null;
        this.z = null;
        this.functionValue = fv;
        this.nodeType = type;
        this.level = null;
    }
}
var numCriticalPoints;

function fillRgMap(arr) {
    let numConnections;
    [numCriticalPoints, numConnections] = arr[0].split(" ");
    numCriticalPoints = Number(numCriticalPoints)
    numConnections = Number(numConnections)

    for (let i = 1; i <= numCriticalPoints; i++) {
        const nodeIndex = Number(arr[i].split(' ')[0]),
            funValue = Number(arr[i].split(' ')[1]),
            type = arr[i].split(' ')[2];
        const cPoint = new CriticalPoint(funValue, type)

        mapOfCriticalPoints.set(nodeIndex, cPoint);
    }

    for (let i = numCriticalPoints + 1; i <= numCriticalPoints + numConnections; i++) {
        let temp = [Number(arr[i].split(' ')[0]), Number(arr[i].split(' ')[1])];
        connectionPairs.push(temp);
    }

    readLayoutFile()
}

function fillLayoutArr(arr) {
    // init();
    for (let pointDataStr of arr) {
        const pointData = pointDataStr.split(' ')

        if (pointData.length < 3)
            break;

        let pointIndex = Number(pointData[0])
        let pointX = Number(pointData[1])
        let pointY = Number(pointData[2])
        let pointZ = Number(pointData[3])

        const cNode = mapOfCriticalPoints.get(pointIndex)
            // console.log(pointIndex, cNode.functionValue)
        cNode.x = pointX
        cNode.y = pointY
        cNode.z = pointZ
    }
    console.log(mapOfCriticalPoints)
    readTextFile();
}

//////////////////////////////////////////////////////////
// heightFunctionList[0] = null;

function fillArrays(arr) {
    [num_vertices, num_edges, num_triangles] = arr[0].split(" ");
    num_vertices = Number(num_vertices);
    num_edges = Number(num_edges);
    num_triangles = Number(num_triangles);

    heightFunctionList = new Array(num_vertices + 1).fill(null);
    adj = new Array(num_vertices + 1).fill(0).map(j => [])

    let i;

    function sphereHeightFunction(x, y) {
        return (((1 * Scale) * (1 * Scale) - (x * x) - (y * y)));
    }
    for (i = 1; i <= num_vertices; i++) {
        let [x, y, z] = arr[i].split(" ");
        let X = Scale * Number(x) + 10;
        let Y = Scale * Number(y);
        let Z = Scale * Number(z);
        let vertex = new Vertex(X, Y, Z);

        vertices.push(vertex);

        // if (Z >= 0)
        //     heightFunctionList[i] = sphereHeightFunction(X, Y);
        // if (Z < 0)
        //     heightFunctionList[i] = -sphereHeightFunction(X, Y);
        heightFunctionList[i] = Y;
        // heightFunctionList[i] = Math.random();
    }

    for (; i <= num_vertices + num_edges; i++) {

        let [e1, e2] = arr[i].split(" ");
        e1 = parseInt(e1);
        e2 = parseInt(e2);

        adj[e1].push(e2);
        adj[e2].push(e1);

        edges.push([e1, e2]);
    }
    console.log("adj: ", adj);


    for (; i <= num_vertices + num_edges + num_triangles; i++) {
        let [e1, e2, e3] = arr[i].split(" ");
        let repeteArr = [...edges[Number(e1)], ...edges[Number(e2)], ...edges[Number(e3)]];
        const set = new Set();
        for (let e of repeteArr)
            set.add(e);

        repeteArr.splice(0, repeteArr.length);
        repeteArr = Array.from(set);


        faces.push(repeteArr);
    }
    console.log(vertices, edges, faces);


    // sorting faces wrt coordinates
    function compare(a, b) {
        if (vertices[a[0]].z < vertices[b[0]].z) {
            return -1;
        }
        if (vertices[a[0]].z > vertices[b[0]].z) {
            return 1;
        }
        return 0;
    }

    faces.sort(compare);

    console.log(vertices);
    makePoints();
    readLevelSetFile();
    makeLink();

    init();
    animate();
}

function makeLink() {
    LinkStruct = new Array(num_vertices + 1).fill(null).map(j => []);

    for (let i = 1; i <= num_vertices; i++) {
        let subTriangles = [];
        for (let f of faces) {
            if (f[0] == i || f[1] == i || f[2] == i) {
                let tempFace = f;
                let index = tempFace.indexOf(i);
                tempFace.splice(index, 1);
                tempFace.unshift(i);
                subTriangles.push(tempFace);
            }
        }

        let visitedTriangles = new Array(subTriangles.length).fill(false);
        let link = [];
        let tempSet = new Set();

        for (let s = 0; s < subTriangles.length; s++) {
            if (visitedTriangles[s]) continue;

            let currTriangle = subTriangles[s];
            if (i == 1) console.log(subTriangles[s][0], subTriangles[s][1], subTriangles[s][2]);
            let currVertex = subTriangles[s][1];
            tempSet.add(currVertex);
            if (i == 1) console.log(currVertex);
            currVertex = subTriangles[s][2];
            if (i == 1) console.log(currVertex);
            tempSet.add(currVertex);
            visitedTriangles[s] = true;

            for (let st = 0; st < subTriangles.length; st++) {
                if (visitedTriangles[st]) continue;

                if (subTriangles[st][1] == currVertex) {
                    currVertex = subTriangles[st][2];
                    tempSet.add(currVertex);
                    visitedTriangles[st] = true;
                    st = 0;
                    continue;
                }
                if (subTriangles[st][2] == currVertex) {
                    currVertex = subTriangles[st][1];
                    tempSet.add(currVertex);
                    visitedTriangles[st] = true;
                    st = 0;
                    continue;
                }
            }
        }
        link = Array.from(tempSet);
        LinkStruct[i] = link;
        if (i == 1) console.log(subTriangles, link);
    }
    console.log(LinkStruct);
}

var criticalPoints = () => {
    let criticalPoints = [];
    for (let i = 1; i <= num_vertices; i++) {
        // findMaximums(i);
        // findSaddles(i);
        let heigthOfi = heightFunctionList[i];
        var mincount = 0;
        var maxcount = 0;
        for (let v of adj[i]) {
            if (heightFunctionList[v] > heigthOfi) {
                mincount++;

            } else if (heightFunctionList[v] < heigthOfi) {
                maxcount++;
            }
        }
        if (mincount == adj[i].length) {
            console.log(" MIN CRITICAL POINT");
            console.log(heigthOfi);
            for (let v of adj[i]) {
                console.log(heightFunctionList[v]);
            }
            criticalPoints.push(i);
        } else if (maxcount == adj[i].length) {
            console.log(" MAX CRITICAL POINT");
            console.log(heigthOfi);
            for (let v of adj[i]) {
                console.log(heightFunctionList[v]);
            }
            criticalPoints.push(i);
        }


    }
    return criticalPoints;
}

function findCricticalPoints() {
    let minimaPoints = [];
    let maximaPoints = [];
    let saddlePoints = [];
    for (let i = 1; i <= num_vertices; i++) {
        // findMaximums(i);
        // findSaddles(i);
        let heigthOfi = heightFunctionList[i];
        let i_link = LinkStruct[i];
        let currSign;
        let numberOfChangeOfSign = 0;

        if (heightFunctionList[i_link[0]] > heigthOfi)
            currSign = 1;
        if (heightFunctionList[i_link[0]] < heigthOfi)
            currSign = -1;

        // 1 represents positive and -1 represents negative
        for (let node of i_link) {
            if (heightFunctionList[node] > heigthOfi && currSign == -1) {
                currSign = 1;
                numberOfChangeOfSign++;
            }
            if (heightFunctionList[node] < heigthOfi && currSign == 1) {
                currSign = -1;
                numberOfChangeOfSign++;
            }
            if (heightFunctionList[node] === heigthOfi)
                numberOfChangeOfSign += 0
        }
        if (numberOfChangeOfSign === 0) {
            if (currSign === 1) {
                betti0++;
                minimaPoints.push(i);
            }
            if (currSign === -1) {
                betti2++;
                maximaPoints.push(i);
            }
            // console.log("Maxima or Minima", i);
            // console.log(LinkStruct[i], heigthOfi);
            // for (let node of i_link) {
            //     console.log(heightFunctionList[node], node);
            // }

        }
        if (numberOfChangeOfSign === 3 || numberOfChangeOfSign === 4) {
            betti1++;
            // console.log("Saddle", i);
            // console.log(LinkStruct[i], heigthOfi);
            // for (let node of i_link) {
            //     console.log(heightFunctionList[node], node);
            // }
            saddlePoints.push(i);
        }
        if (numberOfChangeOfSign != 0 && numberOfChangeOfSign != 3 && numberOfChangeOfSign != 1 && numberOfChangeOfSign != 2 && numberOfChangeOfSign != 4)
            console.log("number of sign changes: ", numberOfChangeOfSign);
    }
    return [minimaPoints, maximaPoints, saddlePoints];
}


function makePoints() {
    points[0] = null;
    for (let i = 1; i <= num_vertices; i++) {
        points.push(new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z));
    }
}


var triangulateKFacesWithShapes = (function() {
    var _ctr = new THREE.Vector3();
    var _plane = new THREE.Plane();
    var _q = new THREE.Quaternion();
    var _y = new THREE.Vector3();
    var _x = new THREE.Vector3();
    var X = new THREE.Vector3(1.0, 0.0, 0.0);
    var Y = new THREE.Vector3(0.0, 1.0, 0.0);
    var Z = new THREE.Vector3(0.0, 0.0, 1.0);
    var _tmp = new THREE.Vector3();
    var _basis = new THREE.Matrix4();
    return function(points, faces) {
        var object = new THREE.Object3D();
        var material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xffffff),
            side: THREE.DoubleSide,
            wireframe: true,
        });
        for (var f = 0, len = faces.length; f < len; f++) {
            var face = faces[f];
            // compute centroid
            _ctr.setScalar(0.0);
            for (var i = 0, l = face.length; i < l; i++) {
                _ctr.add(points[face[i]]);
            }
            _ctr.multiplyScalar(1.0 / l);
            // compute face normal
            _plane.setFromCoplanarPoints(_ctr, points[face[0]], points[face[1]]);
            var _z = _plane.normal;
            // compute basis
            _q.setFromUnitVectors(Z, _z);
            _x.copy(X).applyQuaternion(_q);
            _y.crossVectors(_x, _z);
            _y.normalize();
            _basis.makeBasis(_x, _y, _z);
            _basis.setPosition(_ctr);
            // project the 3D points on the 2D plane
            var projPoints = [];
            for (i = 0, l = face.length; i < l; i++) {
                _tmp.subVectors(points[face[i]], _ctr);
                projPoints.push(new THREE.Vector2(_tmp.dot(_x), _tmp.dot(_y)));
            }
            // create the geometry (Three.js triangulation with ShapeBufferGeometry)
            var shape = new THREE.Shape(projPoints);
            var geometry = new THREE.ShapeBufferGeometry(shape);
            // transform geometry back to the initial coordinate system
            geometry.applyMatrix(_basis);
            // add the face to the object
            var temp_face = new THREE.Mesh(geometry, material);
            object.add(temp_face);
            // EdgeGeometrys.push(temp_face);
        }
        return object;
    };
})();

// Event Listener
document.addEventListener('keydown', (e) => {
    console.log(e.code);
    switch (e.code) {
        case 'KeyA':
            camera.position.x--;
            break;
        case 'KeyD':
            camera.position.x++;
            break;
        case 'KeyW':
            camera.position.y++;
            break;
        case 'KeyS':
            camera.position.y--;
            break;
        case 'KeyZ':
            camera.position.z--;
            break;
        case 'KeyX':
            camera.position.z++;
            break;

        default:
            break;
    }
});

function displayCriticalPoints() {
    // displaying critical points
    let [minimaPoints, maximaPoints, saddlePoints] = findCricticalPoints();

    console.log("points", minimaPoints, saddlePoints, maximaPoints);
    console.log(maximaPoints.length, saddlePoints.length)
    for (let p of maximaPoints) {
        const geometry = new THREE.SphereGeometry(markedPointRadii.radius, 32, 32); // (radius, widthSegments, heightSegments)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = `maxPoint${p}`;
        sphere.position.x = vertices[p].x;
        sphere.position.y = vertices[p].y;
        sphere.position.z = vertices[p].z;

        scene.add(sphere);
    }
    for (let p of saddlePoints) {
        const geometry = new THREE.SphereGeometry(markedPointRadii.radius, 32, 32); // (radius, widthSegments, heightSegments)
        const material = new THREE.MeshBasicMaterial({ color: 0xff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = `saddlePoint${p}`
        sphere.position.x = vertices[p].x;
        sphere.position.y = vertices[p].y;
        sphere.position.z = vertices[p].z;

        scene.add(sphere);
    }
    for (let p of minimaPoints) {
        const geometry = new THREE.SphereGeometry(markedPointRadii.radius, 32, 32); // (radius, widthSegments, heightSegments)
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = `saddlePoint${p}`
        sphere.position.x = vertices[p].x;
        sphere.position.y = vertices[p].y;
        sphere.position.z = vertices[p].z;

        scene.add(sphere);
    }
}

function displayCriticalPts() {
    const criticalPointArray = Array.from(mapOfCriticalPoints.keys())
    console.log()
    if (vertices.length < 2)
        return;

    for (let p of criticalPointArray) {
        const geometry = new THREE.SphereGeometry(markedPointRadii.radius, 32, 32); // (radius, widthSegments, heightSegments)
        let material = new THREE.MeshBasicMaterial({ color: 0xffffff, shininess: 400, });

        if ((mapOfCriticalPoints.get(p)).nodeType == "MINIMA")
            material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        if ((mapOfCriticalPoints.get(p)).nodeType == "SADDLE")
            material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        if ((mapOfCriticalPoints.get(p)).nodeType == "MAXIMA")
            material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = `criticalPoint${p}`;
        sphere.position.x = vertices[p + 1].x;
        sphere.position.y = vertices[p + 1].y;
        sphere.position.z = vertices[p + 1].z;
        // console.log(sphere)

        scene.add(sphere);
    }
}

const mapOfConnections = new Map();

function checkIfPathExists(node1, node2) {
    for (let pathPoint of mapOfConnections.get(node1)) {
        if (pathPoint == node2) {
            return true;
        } else {
            return checkIfPathExists(pathPoint, node2);
        }
    }
    return false;
}

function makeLevelSet(arr) {
    let noVertices = Number(arr[0]);
    const levelSetColors = []
    for (let i = 0; i < connectionPairs.length; i++) {
        levelSetColors.push(0xfffff0 * Math.random())

        const group = new THREE.Group();
        group.name = `levelSet_${i}`
        group.visible = false
        scene.add(group)
    }

    for (let i = 1; i <= noVertices; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: levelSetColors[Number(arr[i])] });
        const sphere = new THREE.Mesh(geometry, material);
        // sphere.name = `levelSet${Number(arr[i])}`
        sphere.position.x = points[i].x;
        sphere.position.y = points[i].y;
        sphere.position.z = points[i].z;

        const group = scene.getObjectByName(`levelSet_${Number(arr[i])}`)
        group.add(sphere);
    }
}

function init() {
    obj = triangulateKFacesWithShapes(points, faces);
    obj.name = "object_mesh"
    scene.add(obj);

    window.addEventListener("resize", onWindowResize, false);
    onWindowResize();
    document.body.appendChild(renderer.domElement);

    const size = 1000;
    const divisions = 100;
    const gridHelper = new THREE.GridHelper(size, divisions);
    // scene.add(gridHelper);

    // displayCriticalPoints();

    displayCriticalPts()

    const cps = mapOfCriticalPoints.entries();
    console.log("cps", cps);

    for (const cp of cps) {
        // console.log("pointss", cp[1], cp[1].x)
        const g1 = new THREE.SphereGeometry(0.5, 32, 32); // (radius, widthSegments, heightSegments)
        let m1;
        if (cp[1].nodeType == "MINIMA")
            m1 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        if (cp[1].nodeType == "SADDLE")
            m1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        if (cp[1].nodeType == "MAXIMA")
            m1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const s1 = new THREE.Mesh(g1, m1);
        s1.name = `reebPoint${cp[0]}`
        s1.position.x = scaleLayout * cp[1].x;
        s1.position.y = scaleLayout * cp[1].y;
        s1.position.z = scaleLayout * cp[1].z;

        scene.add(s1);
    }

    const cpKeys = Array.from(mapOfCriticalPoints.keys())

    // initialize an adj map of connections
    for (let cpKey of cpKeys) {
        mapOfConnections.set(cpKey, []);
    }

    for (let i = 0; i < connectionPairs.length; i++) {
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff
        });
        const pair = connectionPairs[i];
        let cp1, cp2, cpIndex1, cpIndex2;
        [cpIndex1, cpIndex2] = pair;
        cp1 = mapOfCriticalPoints.get(cpIndex1)
        cp2 = mapOfCriticalPoints.get(cpIndex2)


        // traverse map to check for path from cp1 to cp2 in current adj list
        let pathExists = checkIfPathExists(cpIndex1, cpIndex2)
            // console.log("path exists", pathExists);

        const pt = [];
        let arcWidthX = (Math.random() * 0.21);
        let arcWidthZ = (Math.sqrt(0.3 * 0.3 - arcWidthX * arcWidthX));

        if (cp1.x != 0)
            arcWidthX = (cp1.x / Math.abs(cp1.x)) * arcWidthX;
        if (cp1.z != 0)
            arcWidthZ = (cp1.z / Math.abs(cp1.z)) * arcWidthZ;

        // if no : make straight line
        if (!pathExists) {
            pt.push(new THREE.Vector3(cp1.x * scaleLayout, cp1.y * scaleLayout, cp1.z * scaleLayout));
            pt.push(new THREE.Vector3(cp2.x * scaleLayout, cp2.y * scaleLayout, cp2.z * scaleLayout));
        }
        // if yes: make arc
        else {
            pt.push(new THREE.Vector3(cp1.x * scaleLayout, cp1.y * scaleLayout, cp1.z * scaleLayout));
            pt.push(new THREE.Vector3((cp1.x + arcWidthX) * scaleLayout, cp1.y * scaleLayout, (cp1.z + arcWidthZ) * scaleLayout));
            pt.push(new THREE.Vector3((cp1.x + arcWidthX) * scaleLayout, cp2.y * scaleLayout, (cp1.z + arcWidthZ) * scaleLayout));
            pt.push(new THREE.Vector3(cp2.x * scaleLayout, cp2.y * scaleLayout, cp2.z * scaleLayout));
        }

        const geo = new THREE.BufferGeometry().setFromPoints(pt);
        const line = new THREE.Line(geo, mat);
        line.name = `edgeLevelSet_${i}`
        scene.add(line);

        let tempArr = mapOfConnections.get(cpIndex1);
        tempArr.push(cpIndex2);
        mapOfConnections.set(cpIndex1, tempArr);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    controls.update();

    hoverPieces()

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}