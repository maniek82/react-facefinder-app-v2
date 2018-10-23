import React, { Component } from 'react';
import Particles from 'react-particles-js';
import './App.css';
// COMPONENTS
import Navigation from './components/Navigaton/navigation';
import Logo from './components/Logo/logo';
import Rank from './components/Rank/rank';
import Signin from './components/Signin/signin';
import Register from './components/Register/register';
import FaceRecognition from './components/FaceRecognition/faceRecognition';
import ImageLinkForm from './components/ImageLinkForm/imageLinkForm';
import Modal from './components/Modal/Modal'
import Profile from './components/Profile/Profile'


const particlesOptions = 
  {
    particles: {
      "number": {
        "value": 180,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
    //   "move": {
    //     "enable": true,
    //     "speed": 32,
    //     "direction": "none",
    //     "random": false,
    //     "straight": false,
    //     "out_mode": "out",
    //     "bounce": true,
    //     "attract": {
    //       "enable": false,
    //       "rotateX": 600,
    //       "rotateY": 1200
    //     }
      
    // },
    // "interactivity": {
    //   "detect_on": "canvas",
    //   "events": {
    //     "onhover": {
    //       "enable": false,
    //       "mode": "repulse"
    //     },
    //   }
    // },
      
    //   line_linked: {
    //     shadow: {
    //       enable: true,
    //       color: "#3CA9D1",
    //       blur: 5
    //     }
    //   }
    }
      
  }

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [],
  route: 'signin',
  isSignedIn: false,
  isProfileOpen:false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}
  class App extends Component {
    constructor() {
      super();
      this.state = initialState
      
    }
  componentDidMount() {
    const token = window.sessionStorage.getItem('token');
    if(token) {
      fetch(process.env.REACT_APP_DEV_URL_SIGNIN,{
        method: "post",
        headers: {
        "Content-Type": "application/json",
        "Authorization": token
        }
      })
      .then(resp=>resp.json())
      .then(data=> {
        if(data && data.id) {
          fetch(`http://localhost:3000/profile/${data.id}`,{
             method: "get",
              headers: {
              "Content-Type": "application/json",
              "Authorization": token
              }
          }).then(resp=> resp.json()).then(user=> {
            if(user && user.email) {
              this.loadUser(user)
              this.onRouteChange('home')
            }
          })
        }
      }).catch(console.log)
    }
  }
    loadUser = (data) => {
      this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
        age: data.age,
        pet:data.pet
      }})
    }
  
    calculateFaceLocations = (data) => {
      if(data && data.outputs) {
         // const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);

      return data.outputs[0].data.regions.map(face=>{
        const clarifaiFace =  face.region_info.bounding_box;

        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
        }
      
      
      });
      }
      return
      
      
    }
  
    displayFaceBoxes = (boxes) => {
      if(boxes) {
       this.setState({boxes: boxes});
      }
      
    }
  
    onInputChange = (event) => {
      this.setState({input: event.target.value});
    }
  
    onButtonSubmit = () => {
      this.setState({imageUrl: this.state.input});

      fetch(process.env.REACT_APP_DEV_URL_IMAGEURL, {
        method: 'post',
        headers: {'Content-Type': 'application/json',
         "Authorization": window.sessionStorage.getItem('token')
        },
        body: JSON.stringify({
          input: this.state.input
        })
      }).then(response=>response.json()).then(response => {

          if (response) {
            fetch(process.env.REACT_APP_DEV_URL_IMAGE, {
              method: 'put',
              headers: {'Content-Type': 'application/json',
               "Authorization": window.sessionStorage.getItem('token')
              },
              body: JSON.stringify({
                id: this.state.user.id
              })
            }).then(response => response.json()).then(count => {
                this.setState({user: Object.assign(this.state.user, {entries: count})})
              }).catch(console.log)
          }
          this.displayFaceBoxes(this.calculateFaceLocations(response))
        }).catch(err => console.log(err));
    }
  
    onRouteChange = (route) => {
      if (route === 'signout') {
       return this.setState(initialState)
      } else if (route === 'home') {
        this.setState({isSignedIn: true})
      }
      this.setState({route: route});
    }

  toggleModal = () => {
    this.setState(prevState=>({
      ...prevState,
      isProfileOpen: !prevState.isProfileOpen
    }))
  }
    render() {
      const { isSignedIn, imageUrl, route, boxes,isProfileOpen } = this.state;
      return (
        <div className="App">
           <Particles className='particles'
            params={particlesOptions}
          />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} toggleModal={this.toggleModal}/>
          {isProfileOpen &&
            <Modal>
              <Profile 
              isProfileOpen={isProfileOpen} toggleModal={this.toggleModal}
              user={this.state.user}
              loadUser = {this.loadUser}
               />
            </Modal> 
            }
          { route === 'home'
            ? <div>
                <Logo />
                
                <Rank
                  name={this.state.user.name}
                  entries={this.state.user.entries}
                />
                <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
              </div>
            : (
               route === 'signin'
               ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
               : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              )
          }
        </div>
      );
    }
  }
  
  export default App;