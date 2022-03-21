import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../examples/jsm/loaders/FBXLoader.js';

// class 내부의 '_' 로 시작하는 멤버는 개발자들간에 관용적으로 약속한 Private 멤버를 표현할때 사용한다.
// javascript 는 private 의 개념이 없어서, 대신 멤버변수명에 '_' 를 추가함으로서, 다른 클래스에서는 부르지 않도록 약속한다.


class App{
    constructor() {
        const divContainer = document.querySelector('#webgl-container');
        this._divContainer = divContainer; // App클래스의 새로운 멤버, _divContainer, 다른 메서드에서 참조하도록 하기위함

        // 렌더러 생성
        const renderer = new THREE.WebGLRenderer({antialias:true}); //생성시 다양한 옵션을 줄 수 있다. antialias 는 3차원 렌더링을 할때 계단현상을 없애준다.
        this._renderer = renderer; // 다른 메서드에서 참조할 수 있도록 렌더러 멤버 추가
        
        renderer.setPixelRatio(window.devicePixelRatio); // PC 바탕화면에서 디스플레이 설정에서 '텍스트, 앱 및 기타 항목의 크기변경' 항목의 배율, 권장 150% -> 1.5 배율 을 의미

        divContainer.appendChild(renderer.domElement); // divContainer 에 renderer 의 domElement(캔버스 타입의 돔 객체) 를 추가, 환경인거 같다.

        // scene 객체 생성
        const scene = new THREE.Scene();
        this._scene = scene; // 다른 메서드에서 참조 할 수 잇또록 _Scene 멤버 추가

        // 아직 정의하지 않았지만, 아래와 같은 멤버함수를 호출할 것이다.
        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();
        this._loadFBXModel();
        /*창크기가 변경될때 발생하는 onresize 함수
            렌더러나 카메라는 창 크기가 변경될때마다, 그 크기에 맞게 속성값을 재 설정 해줘야 하는데
            그래서 resize 이벤트가 필요하다

            bind 는
            resize 메서드 안에서
            this 가 가리키는 이벤트 객체가
            이벤트객체가 아닌, App 클래스의 객체가 되도록 하기 위함
            
            다시말해 
            여기서 이벤트 객체는 window.onresize 를 말하는거고
            this.resize 는 window 의 멤버가 아니라,
            App 클래스의 멤버임을 설정하기 위해서 bind 를 쓴것같다.
        */ 
        window.onresize = this.resize.bind(this);
        this.resize(); // 일단 onresize 가 호출되지 않더라도 생성자 생성시 한번은 호출해준다. 렌더러나 카메라를 창크기에 맞게 설정해줍니다.

        /**
         * App 클래스의 render 메서드는 실제 3차원 그래픽 장면을 만들어주는 메서드
         * 
         * requestAnimationFrame 에 App.render 넘겨준다.
         * requestAnimationFrame 은 적당한 시점에, 또한 최대한 빠르게
         * render 메서드를 호출해 주게 됩니다.
         * 
         * 또한 render 메서드를 bind 를 통해서 넘겨주고 있는데,
         * render메서드 코드안에서 쓰이는
         * this 가 App 클래스 객체를 가리키도록 하기 위함.
         * 
         * 먼가, 다른곳에서 불리더라도 this(소속) 은 App 클래스인것을 잊지마라! 하는 느낌. 
         */
        requestAnimationFrame(this.render.bind(this));
    }//생성자 끝

    _setupControls(){
        new OrbitControls(this._camera,this._divContainer);
    }
    _loadFBXModel(){
        const loader = new FBXLoader();
        loader.load('./resource/Mushroom.fbx',(obj)=>{         
            this._scene.add(obj);
            this._mushroom = obj;
        })
    }

    _setupCamera(){
        // three.js 가 3차원 그래픽을 출력할 영역에 대한 가로와 세로의 크기를 얻어온다
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        
        // 카메라 객체 생성
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            100
        );
        
        camera.position.z = 2;
        this._camera = camera;
    }

    _setupLight(){
        const color = 0xffffff;             // 광원의 색상
        const intensity = 1;                // 광원의 세기
        
        // 광원 생성
        const light = new THREE.DirectionalLight(color,intensity);
        
        light.position.set(-1,2,4);
        this._scene.add(light);
    }

    _setupModel(){
        const geometry = new THREE.BoxGeometry(1,1,1,2,2,2);
        const fillMaterial = new THREE.MeshPhongMaterial({color:0x3d85c6});

        const cube = new THREE.Mesh(geometry,fillMaterial) // StaticMesh 느낌

        const lineMaterial = new THREE.LineBasicMaterial({color: 0xa9e5ec});
        const line = new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry),lineMaterial
        );

        const group = new THREE.Group();
        group.add(cube);
        group.add(line);

        this._scene.add(group);
        this._cube = group;
    }

    // 창크기 변경될때 호출되는 resize 메서드
    resize(){
        const width = this._divContainer.clientWidth;                           // Element 의 가로길이를 얻어오고 있다
        const height = this._divContainer.clientHeight;                         // Element 의 세로길이를 얻어오고 있다

        // _divContainer 의 가로,세로 에 따라 카메라 속성 설정
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        // _divContainer 의 가로,세로 에 따라 렌더러의 속성 설정
        this._renderer.setSize(width,height);
    }

    /** 렌더 함수
     * @param {*} time requestAnimationFrame 함수가 render 함수에 전달해주는 값. 렌더링이 처음시작된 이후의 값으로 단위가 ms(밀리초) 이다. time 인자를 통해 장면의 애니메이션 에 이용할수 있다. 
     */
    render(time){
        this._renderer.render(this._scene,this._camera); // 렌더러가 인자로 주어진 Scene 공간 과, Camera의 시점을 이용하여 렌더링 하라 라는 명령어
        this.update(time); // time 인자로, 어떤 속성을 변경하고, 변경함으로서 애니메이션 효과를 발생시킨다.
        requestAnimationFrame(this.render.bind(this)); // requestAnimation 코드를 통해서 이 render 메소드가 계속해서 무한 반복해서 호출되게 됩니다. (적당한 시점에 빠르게 호출)
    }

    /**
     * @param {number} time requestAnimationFrame 함수가 render 함수에 전달해주는 값, 또 그것을 받아 update 함수에도 전달해주며, 큐브 객체를 회전시키는값
     */
    update(time){
        time *= 0.001; // ms -> s , 밀리세컨드 단위를 세컨드 단위로 바꿔줍니다. unit change
        //this._cube.rotation.x = time;
        //this._cube.rotation.y = time;
    }
    
}


window.onload = function(){
    new App();
}