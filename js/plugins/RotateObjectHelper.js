/**
 * Created by leo on 2017/5/7.
 */
RotateObjectHelper = function () {
    var scope = this;
    var targetObject = null;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();


    this.active = function (object3d,domElement) {
        targetObject = object3d;
        scope.domElement = domElement;

       domElement.addEventListener( 'touchstart', onTouchStart, false );
       domElement.addEventListener( 'touchend', onTouchEnd, false );
       domElement.addEventListener( 'touchmove', onTouchMove, false );

    };

    this.deactive = function () {
        scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
        scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
        scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );
    };


    function onTouchStart(event) {
        event.preventDefault();
        rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    }


    function onTouchEnd(event) {
        event.preventDefault();
    }

    function onTouchMove(event) {
        event.preventDefault();
        var rotateSpeed = 0.8;
        rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        rotateDelta.subVectors( rotateEnd, rotateStart );
        var element = scope.domElement;

        // rotating across whole screen goes 360 degrees around
        var ry = 2 * Math.PI * rotateDelta.x / element.clientWidth * rotateSpeed;
        targetObject.rotateY(ry);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        // var rx =  2 * Math.PI * rotateDelta.y / element.clientHeight * rotateSpeed;
        // targetObject.rotateX(rx);
        rotateStart.copy( rotateEnd );

    }



};