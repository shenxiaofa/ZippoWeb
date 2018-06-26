Game = function () {

    var chooseParts = [];
    var gamePartNames;

    var canvas = document.getElementById("renderGameCanvas");
    var engine = new BABYLON.Engine(canvas, true, { stencil: true }, true);
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    //init light
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0.9, 0.9, 0.9);
    light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    light.intensity = 1;

    var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 100, 50), scene);
    var light1 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, -100, -50), scene);



    //init camera
    var cameraArc = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
    var ratio = engine.getAspectRatio(cameraArc);
    var maxSize = 450;
    var h = maxSize / (Math.tan(cameraArc.fov / 2) * ratio * 2);
    //cam.attachControl(canvas);
    cameraArc.setPosition(new BABYLON.Vector3(0, 0, -300));
    cameraArc.wheelPrecision = 0.01;
    cameraArc.pinchPrecision = 25;
    cameraArc.angularSensibilityX = 45.0;
    cameraArc.angularSensibilityY = 45.0;
    cameraArc.inertia = 0;

    var cameraDeviceOrientaion = new BABYLON.DeviceOrientationCamera("DevOr_camera", new BABYLON.Vector3(0, 0, 0), scene);
    // This targets the camera to scene origin
    cameraDeviceOrientaion.setTarget(new BABYLON.Vector3(0, 0, 10));
    // This attaches the camera to the canvas
    cameraDeviceOrientaion.attachControl(canvas, true);

    scene.activeCamera = cameraDeviceOrientaion;


    var hl = new BABYLON.HighlightLayer("hl1", scene);
    hl.blurHorizontalSize = 3;
    hl.blurVerticalSize = 3;
    var blurAnimation = new TWEEN.Tween(hl)
        .to({ blurHorizontalSize: 0, blurVerticalSize: 0 }, 1200);

    var blurbackAnimation = new TWEEN.Tween(hl)
        .to({ blurHorizontalSize: 3, blurVerticalSize: 3 }, 1200);
    blurAnimation.chain(blurbackAnimation);
    blurbackAnimation.chain(blurAnimation);
    blurAnimation.start();


    // GUI
    //var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");


    // var plane = BABYLON.Mesh.CreatePlane("plane", 1000.0, scene);
    // var planeMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    // planeMaterial.alpha = 0;
    // plane.material = planeMaterial;
    // plane.position.z = 20;

    var gameObject, mode;
    var assetManager = new BABYLON.AssetsManager(scene);
    assetManager.onFinish = function () {
        setTimeout(function () {
            showStart();
            //self.showGame();
            //  showSuccess();
        }, 3000);
    };


    /**
     * ************************************************
     * video
     * *************************************************
     */
    var self = this;
    var constraints = {
        audio: false,
        video: {
            // Prefer the rear camera
            facingMode: "environment"
        }
    };

    this.loadVideo = function() {

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            self.videoPlaying = false;

            // Create the video element to receive the camera stream
            var video = document.createElement('video');

            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            // This is critical for iOS or the video initially goes fullscreen
            video.setAttribute('playsinline', '');
            video.setAttribute('x5-playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.srcObject = stream;

            self.video = video;

            // Only play the video when it's actually ready
            video.addEventListener('canplay', function () {
                if (!self.videoPlaying) {
                    layoutVideo();
                    self.videoPlaying = true;
                }
            });

            // iOS needs a user action to start the video
            window.addEventListener('touchstart', setVideoForIOS);

            $("#game-page").removeClass("page-game");
            $("#game-page").addClass("page-game-no-background");


        }).catch(function (e) {
            $(".page-3").addClass('game-bg');
            $('.page-6').addClass('game-bg');
            $('.page-5').addClass('game-bg');
        });
    }

    function setVideoForIOS(e) { 
        e.preventDefault();
        if (!self.videoPlaying) {
            layoutVideo();
            self.videoPlaying = true;
        }
        window.removeEventListener('touchstart', setVideoForIOS);
    }

    function layoutVideo() {
        // Create a video element that is full tab and centered
        // CCS taken from: https://slicejack.com/fullscreen-html5-video-background-css/
        var style = self.video.style;
        style.position = 'absolute';
        style.top = '50%';
        style.left = '50%';
        style.width = 'auto';
        style.height = 'auto';
        style.minWidth = '100%';
        style.minHeight = '100%';
        style.backgroundSize = 'cover';
        style.overflow = 'hidden';
        style.transform = 'translate(-50%, -50%)';
        style.zIndex = '0';
        document.body.appendChild(self.video);
    }

    function showStart() {
        $("#loading-text").hide();
        $("#startBtn").removeClass('hide');
    }

    function addFire() {
        //var aud2 = document.getElementById("openMusic2");//点火
        //aud2.play();
        // Fire material
        var fireMaterial = new BABYLON.FireMaterial("fire", scene);
        fireMaterial.diffuseTexture = new BABYLON.Texture("images/diffuse.png", scene);
        fireMaterial.distortionTexture = new BABYLON.Texture("images/distortion.png", scene);
        fireMaterial.opacityTexture = new BABYLON.Texture("images/opacity.png", scene);
        fireMaterial.opacityTexture.level = 0.5;
        fireMaterial.speed = 5.0;

        var plane = BABYLON.Mesh.CreatePlane("firePlane", 40, scene);
        plane.scaling.x = 0.3;
        plane.scaling.y = 1.5;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
        plane.material = fireMaterial;
        plane.position = new BABYLON.Vector3(10, 45, 5);
        var dhjObj = scene.getMeshByName("S_ZP85.obj");
        plane.parent = dhjObj;

        setTimeout(function () {
            // if(confirm('恭喜您获得XX礼品一份，请领取'))
            //     location.href = "update.html";
            // else
            //     location.href = "update.html";
            $("#tipText").text("恭喜您获得XX礼品一份，请领取");
            var topsGroup = scene.getMeshByName("topPartGroup");
            topsGroup.setEnabled(false);
            dhjObj.setEnabled(false);
            //弹出锦囊
            $('.page-5').removeClass('hide spc');
            $('.page-5').find('img').removeClass('active');
            $('.page-5').find('img').addClass('active'); 
            $('.page-7').addClass('hide spc');

        }, 5000);

    }

    //打火机动画
    function showDHJAnimation() {
//		var dhjObj = scene.getMeshByName("S_ZP85.obj");
//	    dhjObj.position = new BABYLON.Vector3(10,10, 0);
        $("#tipText").text("点击火石，点燃打火机");
        var aud = document.getElementById("openMusic");//打开打火机
        aud.play();
        // text1.text = " 点击火石，点燃打火机";
        var group = new BABYLON.Mesh("topPartGroup", scene);

        var topParts = scene.getMeshesByTags("S_ZP85.obj && (S_ZP_B || S_ZP_H ||S_ZP_J) ");
		

        var topPart = BABYLON.Mesh.MergeMeshes(topParts, true);
        //hl.addMesh(topPart, BABYLON.Color3.White());
        group.position = new BABYLON.Vector3(-22, 9, 0);
        topPart.position = new BABYLON.Vector3(10, -9, 0);
        topPart.parent = group;
        var rotatePartAnimation = new TWEEN.Tween(group.rotation)
            .easing(TWEEN.Easing.Bounce.Out)
            .to({ z: Math.PI / 90 * 65 }, 1200)
            .onComplete(function () {
            	
                mode = 2;
            })
            .start();


    }

    function hideGameLayer() {
        $(".time, .circle, .hint,#targetHint").hide();
        $("#tipText").text("点击盖子打开打火机");
    }

    function showSuccess() {
        $.clearTimer();

        scene.activeCamera = cameraArc;

        window.removeEventListener('touchstart', setVideoForIOS);
        hideGameLayer();

        var dhjObj = scene.getMeshByName("S_ZP85.obj");

        dhjObj.getChildren().forEach(function (child) {
            child.position = new BABYLON.Vector3(0, 0, 0);
            hl.removeMesh(child);
        })


        dhjObj.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        dhjObj.getChildren().forEach(function (item) {
            item.isVisible = true;
        })

        //stop background music
        var aud = document.getElementById("aud");
        aud.pause();

        var alphaAnimation = new TWEEN.Tween(dhjObj.scaling)
            .to({ x: 1, y: 1, z: 1 }, 2000)
            .start();

        var rotateAllAnimation = new TWEEN.Tween(dhjObj.rotation)
            .easing(TWEEN.Easing.Exponential.Out)
            .to({ x: dhjObj.rotation.x, y: dhjObj.rotation.y + Math.PI, z: dhjObj.rotation.z }, 2000)
            .onComplete(function () { 
                mode = 1;
                // advancedTexture.addControl(label);
                // label.linkWithMesh(dhjObj);
            })
            .start();
        
        cameraArc.radius = 160;
        cameraArc.attachControl(canvas);


    }

    function partFlyAnimation() {
        var mtl = chooseParts[0].material;
        var animation = new TWEEN.Tween(mtl)
            .to({ alpha: 0.3 }, 1200)
            .onComplete(function () {
                gameObject.setEnabled(false);
                cameraArc.radius = 160;
                cameraArc.attachControl(canvas);
            })
            .start();
    }


    function addPart(position) {
        var parts = ["S_ZP_A", "S_ZP_C", "S_ZP_B"];
        var part = scene.getMeshByName(parts[chooseParts.length]);
        part.isVisible = true
        chooseParts.push(part);
        part.position = position;
        var backAnimation = new TWEEN.Tween(part.position)
            .easing(TWEEN.Easing.Circular.Out)
            .to({ x: 0, y: 0, z: 0 }, 1200)
            .onComplete(function () {
                if (chooseParts.length > 2) {
                    //success
                    showSuccess();
                }
            })
            .start();
    }



    //interface 
    this.addToTask = function (parms) {
        if (parms.selectPart) {
            gamePartNames = parms.selectPart;
        }

        var objTask = assetManager.addMeshTask("add asset", "", parms.folder, parms.objName);
        objTask.onSuccess = function (task) {
            var tmpObject = new BABYLON.Mesh(task.sceneFilename, scene);
            task.loadedMeshes.forEach(function (item) {
                if (task.sceneFilename == "S_ZP85.obj" && item.name == "S_ZP_N") {
                    scene.removeMesh(item);
                    return;
                }
                BABYLON.Tags.AddTagsTo(item, tmpObject.name + " " + item.name);
                item.parent = tmpObject;
                //item.isVisible = parms.isVisible;
            });
            tmpObject.position = new BABYLON.Vector3(parms.initPosition[0], parms.initPosition[1], parms.initPosition[2]);
            if (parms.relpaceGameObject) {
                if (gameObject) {
                    scene.removeMesh(gameObject);
                    gameObject.dispose();
                }
                gameObject = tmpObject;
            }

        };
    }

    this.startLoad = function () {
        assetManager.load();
    }

    this.showGame = function () {
        $("#loading-page").hide();
        $("#game-page").show();
        $("#container").show();
        $.countDown(60);
        chooseParts=[];
        var dhjObj = scene.getMeshByName("S_ZP85.obj");
        dhjObj.getChildren().forEach(function (child) {
            hl.removeMesh(child);
        });
        $(".time, .circle, .hint,#targetHint").show();
        addListeners();
        setPartsLocations();
    };

    function setPartsLocations() {
        var dhj = scene.getMeshByName("S_ZP85.obj");
        var children = dhj.getChildren();
        var d = 100;
        var parmsDis = [
            {x:d,z:d},
            {x:d,z:-d},
            {x:-d,z:d},
            {x:-d,z:-d},
        ]
        $.each(children,function (idx,item) {
            var i = idx%4;
            var p = parmsDis[i];
            var offsetx = (Math.random()*2 - 1) * Math.random()*300;
            var offsetz = (Math.random()*2 - 1) * Math.random()*20;
            item.position = new BABYLON.Vector3(p.x + offsetx, (Math.random()*2 - 1) * Math.random()*50, p.z + offsetz) ;
        })


        
    }
    
    
    
    /********events ******/
    var startingPoint;
    var currentMesh;

    var getGroundPosition = function () {
        // Use a predicate to get position on the ground
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == plane; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var onPointerDown = function (evt) {
        currentMesh = null;
        if (evt.button !== 0) {
            return;
        }

        // check if we are under a mesh
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
        if (pickInfo.hit) {

            if (mode == 1) {
                if(pickInfo.pickedMesh.matchesTagsQuery && pickInfo.pickedMesh.matchesTagsQuery("S_ZP85.obj && S_ZP_B"))
                    showDHJAnimation();
                return;
            }
            else if (mode == 2 ) {
                if(pickInfo.pickedMesh.matchesTagsQuery && pickInfo.pickedMesh.matchesTagsQuery("S_ZP85.obj && (S_ZP_C||S_ZP_D)"))
                {
                    removeListeners();
                    addFire();
                }
                return;
            }
            else if (pickInfo.pickedMesh.matchesTagsQuery && pickInfo.pickedMesh.matchesTagsQuery("S_ZP85.obj && (S_ZP_A||S_ZP_C||S_ZP_B)"))
            {
                if(chooseParts.indexOf(pickInfo.pickedMesh)>-1)
                    return;
                else
                    chooseParts.push(pickInfo.pickedMesh)
                hl.addMesh(pickInfo.pickedMesh, BABYLON.Color3.Green());

                if(chooseParts.length>2)
                {
                    setTimeout(function () {
                        showSuccess();
                    }, 1000);

                }
            }
            else
                hl.addMesh(pickInfo.pickedMesh, BABYLON.Color3.Red());

            // startingPoint = getGroundPosition(evt);
            // if (startingPoint) { // we need to disconnect camera from canvas
            //     addPart(startingPoint);
            //     removeListeners();
            //     setTimeout(function () {
            //         addListeners();
            //     }, 2000);
            // }
        }
    }

    var onPointerUp = function (evt) {

        if (currentMesh) {
            var current = getGroundPosition(evt);
            if (current.x > 80 && gamePartNames.indexOf(currentMesh.name) > -1) {
                addPart(currentMesh);
                if (currentMesh.name == "S_ZP_C")
                    hl.removeMesh(currentMesh);
            }
            else {
                //back to old position
                var backAnimation = new TWEEN.Tween(currentMesh.position)
                    .to({ x: 0, y: 0, z: 0 }, 600)
                    .start();
            }
            console.log(current);
            if (chooseParts.length > 2) {
                //success
                setTimeout(showSuccess, 800);
            }
        }

        if (startingPoint) {
            //            camera.attachControl(canvas, true);
            startingPoint = null;
            return;
        }

    }



    function addListeners() {
        canvas.addEventListener("pointerdown", onPointerDown, false);
        canvas.addEventListener("pointerup", onPointerUp, false);
    }

    function removeListeners() {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
    }

    scene.onDispose = function () {
        removeListeners();
    }


    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        engine.resize();
    }



    function MyLoadingScreen( /* variables needed, for example:*/ text) { }
    MyLoadingScreen.prototype.displayLoadingUI = function () { };
    MyLoadingScreen.prototype.hideLoadingUI = function () { };

    var loadingScreen = new MyLoadingScreen("I'm loading!!");
    //Set the loading screen in the engine to replace the default one
    engine.loadingScreen = loadingScreen;

    engine.runRenderLoop(function () {
        scene.render();
        TWEEN.update();
    });


}