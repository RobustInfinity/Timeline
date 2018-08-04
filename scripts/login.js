

//=================Login========================// 

var signInEmailTxt ;
var signInPasswordTxt;
var signInBtn = document.querySelector('#signIn');
var isValid  = document.querySelector('#isValid');
var googleSignInBtn = document.querySelector('#googleSignIn');
var userData;
var signOutBtn = document.querySelector('#signOut')

signInBtn.addEventListener('click', (event)=>{
    var flag = false;
     signInEmailTxt = document.querySelector('#signInEmail').value;
     signInPasswordTxt = document.querySelector('#signInPassword').value;
    firebase.auth().signInWithEmailAndPassword(signInEmailTxt, signInPasswordTxt)
    .then((result) => {
        console.log(result.user.uid);
        getUserData(result.user.uid);
    })
    .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
        if(errorCode){
            console.log("Invalid email or password")
            isValid.classList.add('invalid-feedback');
            isValid.textContent = 'Invalid email or password';
            isValid.style.display = 'block';
        }
      });
});

function getUserData(userId){
    userData = firebase.database().ref('users/' + userId );
    //sync changes listener
    userData.on('value', function(snapshot) {
        console.log(snapshot.val())
        getConsole(snapshot.val());
    },function (error) {
        console.log("Error: " + error.code);
     });
    console.log(userData);
}

function getConsole(user){
        document.getElementById('login').style.display = 'none';
        document.getElementById('console').style.display = 'block';
        document.querySelector('.dp').style.backgroundImage  = "url(" + user.dp_URL + ")";
        document.querySelector('.name').textContent = user.name;
        document.querySelector('.user-name').textContent = user.username;
        console.log(user);

}

googleSignInBtn.addEventListener('click', (event)=>{

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
});

signOutBtn.addEventListener('click',signOut);
document.addEventListener('load',signOut);
function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        console.log('Signed Out');
      }).catch(function(error) {
        // An error happened.
      });
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      console.log('User Signed In')
      // ...
    } else {
      // User is signed out.
      // ...
      console.log('User Signed Out');
    }
  });



//==============================Sign Up=============================//



var NewUser = function(name, email, username, password, image ){

    this.name = name,
    this.email = email,
    this.username = username,
    this.password = password,
    this.image = image
}
var image;
var DisplayImage =function(imageName = '', imageType = '', imageSize = 0, imageUsage = '', file = new File()){
    this.imgName = imageName,
    this.imgType = imageType,
    this.imgSize = imageSize,
    this.imgUsage = imageUsage,
    this.file = file,
    this.isImgValid = function(){
        return this.imgType === 'image/svg+xml' || 'image/jpeg'||'image/png' || '' ? true : false;    
    },
    this.checkImgSize = ()=>{
        return this.imgSize < (1024 * 1024 *5) ? true : false;    
    }
}
var message ;
var signUpImgURL = '';
var signUpNameTxt ;
var signUpEmailTxt ;
var signUpUsernameTxt ;
var signUpPasswordTxt ;
var signUpConfirmPasswordTxt ;
var isChecked ;
var signUpBtn = document.querySelector('#signUp');

signUpBtn.addEventListener('click', (event)=>{


    signUpNameTxt = document.querySelector('#signUpName').value ;
    signUpEmailTxt = document.querySelector('#signUpEmail').value;
    signUpUsernameTxt = document.querySelector('#signUpUsername').value;
    signUpPasswordTxt  = document.querySelector('#signUpPassword').value;
    signUpConfirmPasswordTxt = document.querySelector('#signUpConfirmPassword').value;
    isChecked = document.querySelector('#isChecked').checked;
    
    if(validateForm()){
        console.log(validateForm())
        var newUser = createUser();
        signUpUser(newUser);
    }
    
})

function signUpUser(newUser){
    console.log(newUser);
    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((result) => {
        if(result){
            newUser.userId = result.user.uid;
            if(newUser.image.imgName != '' && newUser.image.imgUsage != ''){
                uploadImg(newUser, function(newUser){
                    writeUserData(newUser);
                });
            }
        }
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === 'auth/email-already-in-use'){
            document.querySelector('#isRegistered').classList.add('invalid-feedback');
           document.querySelector('#title').textContent = 'User already exists !!! ';
           document.querySelector('#isRegistered').style.display = 'block';
           document.querySelector('#wrong').style.display = 'inline-block';
        }
        console.log(error);
        console.log(errorCode);
        console.log(errorMessage);
      });
}


    function writeUserData(newUser) {
        console.log(JSON.parse(JSON.stringify(newUser)));
        console.log(newUser);
        firebase.database().ref('users/' + newUser.userId).set({
          name: newUser.name,
          email: newUser.email,
          username : newUser.username,
          profile_picture : newUser.image.imgName,
          dp_URL : newUser.dpURL
        });
        document.querySelector('#isRegistered').classList.add('valid-feedback');
        document.querySelector('#title').textContent = ' Registered Successfully';
        document.querySelector('#isRegistered').style.display = 'block';
        document.querySelector('#right').style.display = 'inline-block';
      }

    function uploadImg(user,callback){
        var image = user.image;
        var metadata = {
            imageType : image.imgType,
            imageSize : image.imgSize,
            imageUsage : image.imgUsage,
            imageName : image.imgName
        }

        //If image is a profile picture
        if(image.imgUsage === 'dp'){
            var uploadTask = firebase.storage().ref().child('images/'+ image.imgUsage + '/' + image.imgName).put(image.file, metadata);
            uploadTask.on('state_changed',
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
                }
            }, function(error) {
                console.log(error.code);
                switch (error.code) {
                    case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;

                    case 'storage/canceled':
                    // User canceled the upload
                    break;

                    case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                }
            }, function() {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log('File available at', downloadURL);
                    user.dpURL = downloadURL;
                    console.log(typeof user.dpURL);
                    callback(user);
                });
            });
        }

        //If image is a post
        // if(image.imgUsage === ''){

        // }
    }

function validateForm(){
    console.log(validateName())
    console.log(validateEmail())
    console.log(validateUsername())
    console.log(validatePassword())
    console.log(confirmPassword())
    console.log(checkTerms())
    return validateName() && validateEmail() && validateUsername() && validatePassword() && confirmPassword() 
            && checkTerms();

}

function validateName(){
    
    if(signUpNameTxt === ''){
        document.querySelector('#checkName').textContent = 'Name cannot be empty';
        document.querySelector('#checkName').classList.add('invalid-feedback');
        document.querySelector('#checkName').style.display = 'block';
        return false;
    }else{
        document.querySelector('#checkName').style.display = 'none';
        return true;
    }
    
}

function validateEmail(){
    var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!reg.test(signUpEmailTxt)){
        document.querySelector('#checkEmail').textContent = 'Invalid email address e.g.: "abc@email.com"';
        document.querySelector('#checkEmail').classList.add('invalid-feedback');
        document.querySelector('#checkEmail').style.display = 'block';
        return false;
    }else{
        document.querySelector('#checkEmail').style.display = 'none';
        return true;
    }
}

function validateUsername(){
    if(signUpUsernameTxt === ''){
        document.querySelector('#checkUsername').textContent = 'Username cannot be empty';
        document.querySelector('#checkUsername').classList.add('invalid-feedback');
        document.querySelector('#checkUsername').style.display = 'block';
        return false;
    }
    if( signUpUsernameTxt.length <3){
        document.querySelector('#checkUsername').textContent = 'Username must contain minimum 4 characters';
        document.querySelector('#checkUsername').classList.add('invalid-feedback');
        document.querySelector('#checkUsername').style.display = 'block';
        return false;
    }else if(signUpUsernameTxt[0] != '@'){
        document.querySelector('#checkUsername').textContent = 'Username must start with "@"';
        document.querySelector('#checkUsername').classList.add('invalid-feedback');
        document.querySelector('#checkUsername').style.display = 'block';
        return false;
    }else if(signUpUsernameTxt.length > 9){
        document.querySelector('#checkUsername').textContent = 'Username must contain maximum 10 characters';
        document.querySelector('#checkUsername').classList.add('invalid-feedback');
        document.querySelector('#checkUsername').style.display = 'block';
        return false;
    }else{
        document.querySelector('#checkUsername').style.display = 'none';
        return true;
    }
}

function validatePassword(){
    
     if(signUpPasswordTxt === ''){
        document.querySelector('#checkPassword').textContent  = 'Password  cannot be empty';
        document.querySelector('#checkPassword').classList.add('invalid-feedback');
        document.querySelector('#checkPassword').style.display = 'block';
        return false;
    }else if(signUpPasswordTxt.length <5){
        document.querySelector('#checkPassword').textContent = 'Password must contain minimum 6 characters';
        document.querySelector('#checkPassword').classList.add('invalid-feedback');
        document.querySelector('#checkPassword').style.display = 'block';
        return false;
    }else{
        document.querySelector('#checkPassword').style.display = 'none';
        return true;
    }
}

function confirmPassword(){
    if(signUpConfirmPasswordTxt === ''){
        document.querySelector('#checkConfPassword').textContent = "Feild cannot be empty"
        document.querySelector('#checkConfPassword').classList.add('invalid-feedback');
        document.querySelector('#checkConfPassword').style.display = 'block';
        return false;
    }else if(signUpPasswordTxt != signUpConfirmPasswordTxt){
        document.querySelector('#checkConfPassword').textContent = "Password didn't match"
        document.querySelector('#checkConfPassword').classList.add('invalid-feedback');
        document.querySelector('#checkConfPassword').style.display = 'block';
        return false;
    }else{
        document.querySelector('#checkConfPassword').style.display = 'none';
        return true;
    }
}

function validateImg(image){
    if(!image.isImgValid()){
        document.querySelector('#checkDp').textContent = 'Image format must be jpg, png or svg';
        document.querySelector('#checkDp').classList.add('invalid-feedback');
        document.querySelector('#checkDp').style.display = 'none';
        return false;
    }else if(!image.checkImgSize()){
        document.querySelector('#checkDp').textContent = 'Size must be less than 5MB';
        document.querySelector('#checkDp').classList.add('invalid-feedback');
        document.querySelector('#checkDp').style.display = 'block';
    }else{
        document.querySelector('#checkDp').style.display = 'none';
        return true;
    }
}

function checkTerms(){
    console.log(isChecked)
    if(!isChecked){
        document.querySelector('#checkTerms').textContent = "You must agree before submitting.";
        document.querySelector('#checkTerms').classList.add('invalid-feedback');
        // document.querySelector('#checkTerms').textContent = message;
        document.querySelector('#checkTerms').style.display = 'block';
        return false;
    }else{
        document.querySelector('#checkTerms').style.display = 'none';
        return true;
    }
}
function createUser(){
    
    console.log(image instanceof DisplayImage);
    if(image instanceof DisplayImage){
        var newUser = new NewUser(signUpNameTxt, signUpEmailTxt, signUpUsernameTxt, signUpPasswordTxt, image);
        console.log(newUser)
     } else{
        var newUser = new NewUser(signUpNameTxt, signUpEmailTxt, signUpUsernameTxt, signUpPasswordTxt)
        console.log(newUser)
     }
    console.log(typeof newUser);
    console.log(newUser.name + "-----" + newUser.email);
    return newUser;
}


document.querySelector('#uploadImg').addEventListener('click',getImageURL)




function getImageURL(){
    
    var file = document.getElementById('file');
   
    file.addEventListener('change',
    (event)=>{
    var path = URL.createObjectURL(file.files[0]);
    console.log(event.target.files[0])
        // imgName = file.files[0].name
        // imgType = file.files[0].type;
        // imgSize = file.files[0].size/1024;
        image = new DisplayImage(file.files[0].name, file.files[0].type, file.files[0].size/1024, "dp", file.files[0] )
        console.log(file.files[0].name);
        console.log(file.files[0].type);
        console.log(file.files[0]);
        console.log(file.files[0].size/1024);
        if(validateImg(image)){
            document.getElementById('dp').src = URL.createObjectURL(file.files[0]);
        }
    })

}