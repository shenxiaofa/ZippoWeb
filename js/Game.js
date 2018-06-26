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

    //init camera
    var cam = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
    var ratio = engine.getAspectRatio(cam);
    var maxSize = 450;
    var h = maxSize / (Math.tan(cam.fov / 2) * ratio * 2);
    //cam.attachControl(canvas);
    cam.setPosition(new BABYLON.Vector3(0, 0, -300));
    cam.wheelPrecision = 0.01;
    cam.pinchPrecision = 25;
    cam.angularSensibilityX = 45.0;
    cam.angularSensibilityY = 45.0;
    cam.inertia = 0;

    // GUI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");
    // var label = new BABYLON.GUI.Rectangle("label");
    // label.background = "black"
    // label.height = "30px";
    // label.alpha = 0.5;
    // label.width = "200px";
    // label.cornerRadius = 20;
    // label.thickness = 1;
    // label.linkOffsetX = 180;
    // label.linkOffsetY = -180;
    //
    // var text1 = new BABYLON.GUI.TextBlock();
    // text1.text = "请点击盖子，打开打火机";
    // text1.color = "white";
    // text1.fontSize="16px";
    // label.addControl(text1);




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


    var plane = BABYLON.Mesh.CreatePlane("plane", 1000.0, scene);
    var planeMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    planeMaterial.alpha = 0;
    plane.material = planeMaterial;
    plane.position.z = 20;

    var planeModelTip = BABYLON.Mesh.CreatePlane("planeModelTip", 250.0, scene);
    var planeModelTipMaterial = new BABYLON.StandardMaterial("planeModelTipMaterial", scene);
    var tipDiff = new BABYLON.Texture('images/model.png', scene);
    tipDiff.hasAlpha = true;
    tipDiff.getAlphaFromRGB = false;
    planeModelTipMaterial.diffuseTexture = tipDiff;
    //planeModelTipMaterial.opacityTexture = tipDiff;
    planeModelTipMaterial.emissiveColor = new BABYLON.Color3(1.00, 1.00, 1.00);
    planeModelTipMaterial.backFaceCulling = true;
    //planeModelTipMaterial.alpha=0.7;
    planeModelTip.material = planeModelTipMaterial;
    planeModelTip.position = new BABYLON.Vector3(-80, -10, 0);
    planeModelTip.scaling.y = 0.5;

    var planeCircle = BABYLON.Mesh.CreatePlane("planeCircle", 140.0, scene);
    var planeCircleMaterial = new BABYLON.StandardMaterial("planeCircleMaterial", scene);
    var planeCircleDiff = new BABYLON.Texture('images/halo.png', scene);
    planeCircleDiff.hasAlpha = true;
    planeCircleDiff.getAlphaFromRGB = false;
    planeCircleMaterial.diffuseTexture = planeCircleDiff;
    planeCircleMaterial.opacityTexture = planeCircleDiff;
    planeCircleMaterial.emissiveColor = new BABYLON.Color3(1.00, 1.00, 1.00);
    planeCircleMaterial.backFaceCulling = true;
    planeCircleMaterial.alpha = 0.7;
    planeCircle.material = planeCircleMaterial;
    planeCircle.position = new BABYLON.Vector3(132, -60, 0);
    planeCircle.scaling.y = 0.3;






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
    this.constraints = {
        audio: false,
        video: {
            // Prefer the rear camera
            facingMode: "environment"
        }
    };

    // function loadVideo() {

    //     navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    //         self.videoPlaying = false;

    //         // Create the video element to receive the camera stream
    //         var video = document.createElement('video');

    //         video.setAttribute('autoplay', '');
    //         video.setAttribute('muted', '');
    //         // This is critical for iOS or the video initially goes fullscreen
    //         video.setAttribute('playsinline', '');
    //         video.setAttribute('x5-playsinline', '');
    //         video.setAttribute('webkit-playsinline', '');
    //         video.srcObject = stream;

    //         self.video = video;

    //         // Only play the video when it's actually ready
    //         video.addEventListener('canplay', function () {
    //             if (!self.videoPlaying) {
    //                 layoutVideo();
    //                 self.videoPlaying = true;
    //             }
    //         });

    //         // iOS needs a user action to start the video
    //         window.addEventListener('touchstart', setVideoForIOS);

    //         $("#game-page").removeClass("page-game");
    //         $("#game-page").addClass("page-game-no-background");


    //     }).catch(function (e) {
    //         if (error) error("ERROR: Unable to acquire camera stream");
    //     });
    // }

    self.setVideoForIOS = function (e) {
        e.preventDefault();
        if (!self.videoPlaying) {
            layoutVideo();
            self.videoPlaying = true;
        }
    }

    // function layoutVideo() {
    //     // Create a video element that is full tab and centered
    //     // CCS taken from: https://slicejack.com/fullscreen-html5-video-background-css/
    //     var style = self.video.style;
    //     style.position = 'absolute';
    //     style.top = '50%';
    //     style.left = '50%';
    //     style.width = 'auto';
    //     style.height = 'auto';
    //     style.minWidth = '100%';
    //     style.minHeight = '100%';
    //     style.backgroundSize = 'cover';
    //     style.overflow = 'hidden';
    //     style.transform = 'translate(-50%, -50%)';
    //     style.zIndex = '0';
    //     document.body.appendChild(self.video);
    // }

    function showStart() {
        $("#loading-text").hide();
        $("#startBtn").removeClass('hide');
    }

    function addFire() {
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

        // var button = BABYLON.GUI.Button.CreateSimpleButton("but", "点击领取好礼！");
        // button.width = "200px";
        // button.height = "40px";
        // button.lineHegiht = "40px";
        // button.color = "white";
        // button.background = "black" ;
        // button.alpha = 0.5;
        // button.cornerRadius = 10;
        // button.thickness = 1;
        // button.linkOffsetX = 180;
        // button.linkOffsetY = -250;
        // button.onPointerDownObservable.add(function () {
        //     location.href = "update.html"
        // })
        // advancedTexture.removeControl(label);
        // advancedTexture.addControl(button);
        // button.linkWithMesh(dhjObj);

        setTimeout(function () {
            // if(confirm('恭喜您获得XX礼品一份，请领取'))
            //     location.href = "update.html";
            // else
            //     location.href = "update.html";
            // $("#tipText").text("恭喜您获得XX礼品一份，请领取");
            var topsGroup = scene.getMeshByName("topPartGroup");
            topsGroup.setEnabled(false);
            dhjObj.setEnabled(false);
            $('.page-5').removeClass('hide spc');
            $('.page-5').find('img').removeClass('active');
            $('.page-5').find('img').addClass('active');
            $('.page-7').addClass('hide spc');
            $('#renderGameCanvas').addClass('hide');
            //弹出锦囊
            // $('.page-gift').removeClass('hide');

        }, 100);

    }

    //打火机动画
    function showDHJAnimation() {
        $("#tipText").text("点击火石，点燃打火机");
        var aud = document.getElementById("openMusic");
        aud.play();
        // text1.text = " 点击火石，点燃打火机";
        var group = new BABYLON.Mesh("topPartGroup", scene);

        var topParts = scene.getMeshesByTags("S_ZP85.obj && (S_ZP_B || S_ZP_H ||S_ZP_J) ");


        var topPart = BABYLON.Mesh.MergeMeshes(topParts, true);
        //hl.addMesh(topPart, BABYLON.Color3.White());
        group.position = new BABYLON.Vector3(-22, 9, 0);
        topPart.position = new BABYLON.Vector3(22, -9, 0);
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
        $(".time, .circle, .hint").hide();
        $("#tipText").text("点击盖子打开打火机");
    }

    function showSuccess() {
        $.clearTimer();
        window.removeEventListener('touchstart', self.setVideoForIOS);
        hideGameLayer();
        planeModelTip.setEnabled(false);
        planeCircle.setEnabled(false);
        var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 100, 50), scene);
        var light1 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, -100, -50), scene);




        var dhjObj = scene.getMeshByName("S_ZP85.obj");
        dhjObj.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        dhjObj.setEnabled(true);

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

        gameObject.setEnabled(false);
        cam.radius = 160;
        cam.attachControl(canvas);

        //partFlyAnimation();


        // dhjObj.getChildren().forEach(function (child) {
        //     hl.addMesh(child, BABYLON.Color3.White());
        // })


    }

    function partFlyAnimation() {
        var mtl = chooseParts[0].material;
        var animation = new TWEEN.Tween(mtl)
            .to({ alpha: 0.3 }, 1200)
            .onComplete(function () {
                gameObject.setEnabled(false);
                cam.radius = 160;
                cam.attachControl(canvas);
            })
            .start();
    }


    function addPart(part) {
        if (chooseParts.indexOf(part) > -1) return;
        chooseParts.push(part);
        if (part.name == "S_ZP_A") {
            //top
            part.rotation.z = Math.PI / 180 * 150;
            part.position = new BABYLON.Vector3(450, 35, 1.1);
            part.scaling = new BABYLON.Vector3(2, 2, 1);

        }
        else if (part.name == "S_ZP_B") {
            //bottom
            part.rotation.z = -Math.PI / 180 * 40;
            part.position = new BABYLON.Vector3(-41, 170, -2);
            part.scaling = new BABYLON.Vector3(3.4, 3.4, 1);
        }
        else if (part.name == "S_ZP_C") {
            //inner
            part.position = new BABYLON.Vector3(282, -70, 1.1);
            part.scaling = new BABYLON.Vector3(2.8, 2.8, 1);
        }
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
            });
            tmpObject.position = new BABYLON.Vector3(parms.initPosition[0], parms.initPosition[1], parms.initPosition[2]);
            if (parms.relpaceGameObject) {
                if (gameObject) {
                    scene.removeMesh(gameObject);
                    gameObject.dispose();
                }
                gameObject = tmpObject;
            }
            tmpObject.setEnabled(parms.isVisible);

        };
    }

    this.startLoad = function () {
        assetManager.load();
    }

    this.showGame = function () {
        $("#loading-page").hide();
        $("#game-page").show();
        $("#container").show();
        $.countDown(5);
        $.canvCountDown();
        // this.loadVideo();

        // tip hightlight
        var part = scene.getMeshesByTags("yd.obj && S_ZP_C")[0];
        hl.addMesh(part, BABYLON.Color3.White());



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
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== plane; });
        if (pickInfo.hit) {
            //console.log("clicked" + pickInfo.pickedMesh.parent.name + " name:" + pickInfo.pickedMesh.name)
            if (mode == 1 && pickInfo.pickedMesh.matchesTagsQuery && pickInfo.pickedMesh.matchesTagsQuery("S_ZP85.obj && S_ZP_B")) {
                showDHJAnimation();
                return;
            }
            else if (mode == 2 && pickInfo.pickedMesh.matchesTagsQuery && pickInfo.pickedMesh.matchesTagsQuery("S_ZP85.obj && (S_ZP_C||S_ZP_D)")) {
                removeListeners();
                addFire();
                return;
            }
            else if (pickInfo.pickedMesh.parent != gameObject) return;
            currentMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition(evt);

            //            if (startingPoint) { // we need to disconnect camera from canvas
            //                setTimeout(function () {
            //                    camera.detachControl(canvas);
            //                }, 0);
            //            }
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

    var onPointerMove = function (evt) {
        if (!startingPoint) {
            return;
        }

        var current = getGroundPosition(evt);

        if (!current) {
            return;
        }
        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;

    }

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);

    function removeListeners() {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
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

Game.prototype.loadVideo = function loadVideo() {

    var self = this;
    navigator.mediaDevices.getUserMedia(this.constraints).then(function (stream) {
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
                self.layoutVideo();
                self.videoPlaying = true;
            }
        });

        // iOS needs a user action to start the video
        window.addEventListener('touchstart', self.setVideoForIOS);

        // $("#game-page").removeClass("page-game");
        $(".use-camera").addClass("page-game-no-background");


    }).catch(function (e) {
        if (error) error("ERROR: Unable to acquire camera stream");
    });
}

Game.prototype.layoutVideo = function () {
    // Create a video element that is full tab and centered
    // CCS taken from: https://slicejack.com/fullscreen-html5-video-background-css/
    var style = this.video.style;
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
    document.body.appendChild(this.video);
}







