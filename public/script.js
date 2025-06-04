const scrollContainer = document.getElementsByClassName('custom-scrollbar')[0]
let isAutoScrolling = true;

function scrollToBottom() {
  if (isAutoScrolling) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}


scrollContainer.addEventListener('scroll', function () {
  const isUserAtBottom =
  scrollContainer.scrollHeight - scrollContainer.clientHeight <=
  scrollContainer.scrollTop + 1;
  
  if (isUserAtBottom) {
    isAutoScrolling = true;
  } else {
    isAutoScrolling = false;
  }
});

setInterval(() => {
  if (isAutoScrolling) {
    scrollToBottom();
  }
}, 1);


var username;
var room;
const socket = io("https://cdn.socket.io/4.7.4/socket.io.min.js");

function openCard() {
  var card = document.getElementById('card');
  card.style.display = 'block';
  setTimeout(() => {
    card.classList.add('flipped');
    document.getElementById('blur').style = 'filter: blur(6px);'
    document.getElementById('chat').style = "visibility: hidden;"
  }, 10);
}

function closeCard() {
  var card = document.getElementById('card');
  card.classList.remove('flipped');
  setTimeout(() => {
    card.style.display = 'none';
    document.getElementById('blur').style = 'filter: blur(0px);'
    document.getElementById('chat').style = "visibility: visible;"
  }, 500);
}

function refreshPage() {
  location.reload();
}

function checkInput() {
  var inputValue = document.getElementById("usernameinp").value;
  var myButton = document.getElementById('butt')
  var myButton1 = document.getElementById('butt1')

  if (inputValue.trim().length <= 2) {
    myButton.classList.remove("enabled");
    myButton.classList.add("disabled");
    myButton.disabled = true;
    myButton1.classList.remove("enabled");
    myButton1.classList.add("disabled");
    myButton1.disabled = true;
  } else {
    myButton.classList.remove("disabled");
    myButton.classList.add("enabled");
    myButton.disabled = false;
    myButton1.classList.remove("disabled");
    myButton1.classList.add("enabled");
    myButton1.disabled = false;
  }
}
function checkInput1() {
  var inputValue = document.getElementById("room").value;
  var myButton = document.getElementById('butt2')

  if (inputValue.trim().length == 5) {
    myButton.classList.remove("disabled");
    myButton.classList.add("enabled");
    myButton.disabled = false;
  } else {
    myButton.classList.remove("enabled");
    myButton.classList.add("disabled");
    myButton.disabled = true;
  }
}

function createRoom() {
  document.getElementById('butt').disabled = true;
  var card = document.getElementById('card');
  card.style.transform = 'translate(-50%, -30%) rotateY(180deg)';
  socket.emit('createRoom');
}

function copyText() {
  const textToCopy = document.querySelector('#chatid span')
  const textarea = document.createElement('textarea');
  textarea.value = textToCopy.textContent.slice(-5)
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  document.getElementById('copyButton').classList.add('clicked');
  document.getElementById('copyButton').disabled = true;
  setTimeout(() => {
    document.getElementById('copyButton').classList.remove('clicked');
    document.getElementById('copyButton').disabled = false;
  }, 2000);
}

function joinRoom() {
  var card = document.getElementById('card');
  card.style.transform = 'translate(-50%, -30%) rotateY(180deg)';
}

function enterRoom() {
  room = document.getElementById('room').value.toUpperCase()
  socket.emit('checkRoomExistence', { room }, (roomExists) => {
    if (roomExists) {
      document.getElementsByClassName('msgmain')[0].style.display = 'block';
      document.getElementsByClassName('main')[0].style.display = 'none';
      document.getElementsByClassName('background')[0].style.display = 'none';
      document.querySelector('#chatid span').innerText = "Room Code : " + room
      username = document.getElementById('usernameinp').value;
      emitJoinRoom();
    } else {
      document.getElementById('alert').innerText = (`Room '${room}' does not exist.`);
      document.getElementById('alert').style = 'visiblity: visible; color: red;'
      document.getElementById('alert1').style = 'visiblity: visible; color: red;'
    }
  });
}

function backroom() {
  document.getElementById('butt').disabled = false;
  document.getElementById('butt2').classList.remove("enabled");
  document.getElementById('butt2').classList.add("disabled");
  document.getElementById('butt2').disabled = true;
  document.getElementById("room").readOnly = false;
  document.querySelector(".room label").classList.remove("up")
  document.getElementById('alert').style = 'visibility: hidden; color: red;'
  document.getElementById('alert1').style = 'visibility: hidden; color: red;'
  document.getElementById('room').value = ''
  var card = document.getElementById('card');
  var currentTransform = getComputedStyle(card).transform;
  if (currentTransform === 'none') {
    card.style.transform = 'rotateY(180deg)';
  } else {
    card.style.transform = currentTransform + ' rotateY(180deg)';
  }
  document.getElementById('card').style = ''
  document.getElementById('card').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", function () {
  var roomInput = document.getElementById("room");
  var roomLabel = document.querySelector(".room label");

  roomInput.addEventListener("input", function () {
    updateLabelPosition();
  });
  function updateLabelPosition() {
    if (roomInput.value.trim().length === 0) {
      roomLabel.classList.remove("up");
    } else {
      roomLabel.classList.add("up");
    }
  }
  updateLabelPosition();
});

var n = 0;

socket.on('message', (data) => {
  const messagesList = document.querySelector('.chat');
  document.getElementById('messageInput').value = ''
  const li = document.createElement('li');
  li.classList.add(data.username === username ? 'self' : 'other');
  li.id = 'app' + n
  messagesList.appendChild(li);
  const div = document.createElement('div');
  div.className = 'msg'
  div.id = 'newmsg' + n
  document.getElementById('app' + n).appendChild(div)
  const usern = document.createElement('div');
  usern.className = 'user'
  div.appendChild(usern)
  usern.textContent = `${data.username}`;
  const msg = document.createElement('p');
  const time = document.createElement('time');
  document.getElementById('newmsg' + n).appendChild(msg)
  document.getElementById('newmsg' + n).appendChild(time)
  msg.textContent = `${data.message}`;
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  time.textContent = (hours + ":" + minutes);
  n++

});

socket.on('new', (data) => {
  const p = document.createElement('p');
  p.className = 'notification'
  document.getElementsByClassName('chat')[0].appendChild(p);
  p.textContent = `${data.message}`;
  const time = document.createElement('time');
  p.appendChild(time)
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  time.textContent = (hours + ":" + minutes);

});
socket.on('roomdel', (data) => {
  const p = document.createElement('p');
  p.className = 'notification'
  p.style = 'color: red'
  document.getElementsByClassName('chat')[0].appendChild(p);
  p.textContent = `${data.message}`;

});

socket.on('createdRoom', (createdRoom) => {
  room = createdRoom;
  document.querySelector(".room label").classList.add("up")
  document.getElementById('room').value = room;
  document.getElementById("room").readOnly = true;
  document.getElementById('butt2').classList.remove("disabled");
  document.getElementById('butt2').classList.add("enabled");
  document.getElementById('butt2').disabled = false;
});

socket.on('roomNotExist', (room) => {
  alert(`Room '${room}' does not exist. Please enter a valid room code.`);
});



function emitJoinRoom() {
  if (username && room) {
    socket.emit('joinRoom', { username, room });
  }
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  if (message.trim() !== '') {
    socket.emit('chatMessage', { room, username, message });
  }
}

function showLoader(durationInSeconds) {
  var overlay = document.getElementById('overlay');
  var loader = document.getElementById('loader');

  overlay.style.display = 'flex';
  setTimeout(function () {
    overlay.style.display = 'none';

  }, durationInSeconds * 1000);
}




document.getElementById("messageInput").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage()
  }
});

document.getElementById("room").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    enterRoom()
  }
});
let scheduledMessages = [];
// document.addEventListener("DOMContentLoaded", function () {
//   const list = document.getElementById('messages');
//   const contextMenu = document.getElementById('contextMenu');
//   const addToFavBtn = document.getElementById('addToFav');

//   let selectedListItem = null;

//   list.addEventListener('contextmenu', function (e) {
//       e.preventDefault();

//       if (e.target.tagName === 'P') {
//           selectedListItem = e.target;
//           contextMenu.style.left = `${e.pageX}px`;
//           contextMenu.style.top = `${e.pageY}px`;
//           contextMenu.style.display = 'block';
//       } else {
//           contextMenu.style.display = 'none';
//       }
//   });

//   document.addEventListener('mousedown', function (e) {
//       if (!contextMenu.contains(e.target) && e.button !== 2) {
//           contextMenu.style.display = 'none';
//       }
//   });

// addToFavBtn.addEventListener('click', function () {
//   const list1 = document.getElementById('list1');
//   const list2 = document.getElementById('list');
//   const listItem = selectedListItem.closest('li');
//   const test = listItem.innerHTML;
  
//   const clonedListItem = listItem.cloneNode(true);
//   clonedListItem.className = 'list-item';

//         const message = clonedListItem;
//         const date = document.getElementById('para').value;

//         if (message && date) {
//             scheduledMessages.push({ message, date });
//             if (selectedListItem) {
              
              
//               void clonedListItem.offsetWidth;
//               clonedListItem.style.opacity = '1';
//               clonedListItem.style.transform = 'translateY(0)';
//               listItem.style.opacity = '0';
//               listItem.style.transform = 'translateY(-20px)';
              
//               setTimeout(() => {
//                   listItem.remove();
//               }, 500);
            
//             list2.innerHTML = '';

//             scheduledMessages.forEach((item, index) => {
//                 const li = document.createElement('li');
//                 const currentDate = new Date();
//                 const scheduledDate = new Date(item.date);

//                 li.innerHTML = `${item.message.innerHTML}`
                
//                 if (currentDate >= scheduledDate) {
//                     li.classList.add('heart');
//                 }

//                 list2.appendChild(li);

//                 setInterval(() => {
//                     const now = new Date();
//                     if (now >= scheduledDate && !li.classList.contains('heart')) {
//                         li.classList.add('heart');
//                     }
//                 }, 1000);
//             });
//         }
//     }else{
//       alert("Date is Required")
//     }
//     contextMenu.style.display = 'none';
// });
// });

// function removeMessage(index) {
//   scheduledMessages.splice(index, 1);
// }



// function down(){
//   var inn = document.getElementById('messages').outerHTML
//   console.log(inn)
//   const blob = new Blob([`<style> .chat {
//     list-style: none;
//     background: none;
//     margin: 0;
//     padding: 0 0 50px 0;
//     margin-top: 60px;
//     margin-bottom: 15px;
//     overflow-y: auto;
//   }
  
//   .chat li {
//     padding: 0.5rem;
//     overflow: hidden;
//     display: flex;
//   }
//   .chat .day {
//     position: relative;
//     display: block;
//     text-align: center;
//     color: rgba(255, 255, 255, 0.3);
//     height: 20px;
//     text-shadow: 7px 0px 0px #252C33, 6px 0px 0px #252C33, 5px 0px 0px #252C33, 4px 0px 0px #252C33, 3px 0px 0px #252C33, 2px 0px 0px #252C33, 1px 0px 0px #252C33, 1px 0px 0px #252C33, 0px 0px 0px #252C33, -1px 0px 0px #252C33, -2px 0px 0px #252C33, -3px 0px 0px #252C33, -4px 0px 0px #252C33, -5px 0px 0px #252C33, -6px 0px 0px #252C33, -7px 0px 0px #252C33;
//     box-shadow: inset 20px 0px 0px #252C33, inset -20px 0px 0px #252C33, inset 0px -2px 0px rgba(255, 255, 255, 0.1);
//     line-height: 38px;
//     margin-top: 5px;
//     margin-bottom: 20px;
//     cursor: default;
//     -webkit-touch-callout: none;
//   }
  
//   .chat .notification {
//     position: relative;
//     display: inherit;
//     text-align: center;
//     font-size: 13px;
//     color: rgba(255, 255, 255, 0.15);
//     background: rgba(234, 247, 255, 0.035);
//     line-height: 30px;
//     border-radius: 100px;
//     margin: 7px 35%;
//     height: 30px;
//     width: 30%;
//     box-shadow: 0px 1px 0px rgba(0, 0, 0, .05), 0px -1px 0px rgba(0, 0, 0, .05), inset 0px 1px 0px rgba(255, 255, 255, .02), inset 0px -1px 0px rgba(255, 255, 255, .02);
//     text-shadow: 0px -1px 0px rgba(0, 0, 0, .1), 0px 1px 0px rgba(255, 255, 255, .05);
//     cursor: default;
//     -webkit-touch-callout: none;
//     transition: all .2s cubic-bezier(0.565, -0.260, 0.255, 1.410);
//   }
  
//   .chat .notification time {
//     position: absolute;
//     top: 7px;
//     right: 7px;
//     font-size: 11px;
//     padding: 8px;
//     border-radius: 100px;
//     background: #252C33;
//     box-shadow: 0px 0px 2px rgba(255, 255, 255, .02), inset 0px 0px 1px rgba(27, 35, 42, 0.1);
//     height: 1px;
//     line-height: 0px;
//     color: rgba(255, 255, 255, 0.1);
//     -webkit-touch-callout: none;
//     transition: all .2s cubic-bezier(0.565, -0.260, 0.255, 1.410);
//   }
  
//   .other .msg {
//     border-top-left-radius: 0px;
//     box-shadow: -1px 2px 0px #c1cbcd;
//   }
  
//   .other:before {
//     content: "";
//     position: relative;
//     top: 0px;
//     right: 0px;
//     left: 0px;
//     width: 0px;
//     height: 0px;
//     border: 5px solid #eef8ff;
//     border-left-color: transparent;
//     border-bottom-color: transparent;
//   }
  
//   .self {
//     justify-content: flex-end;
//     align-items: flex-end;
//   }
  
//   .self .msg {
//     border-bottom-right-radius: 0px;
//     box-shadow: 1px 2px 0px #c1cbcd;
//   }

//   .send {
//     position: fixed;
//     display: block;
//     bottom: 0px;
//     right: 0px;
//     width: 8%;
//     height: 50px;
//     border: none;
//     outline: none;
//     z-index: 300;
//     cursor: pointer;
//     background-image: url(https://i.imgur.com/VSQxJKL.png);
//     background-repeat: no-repeat;
//     background-size: 34px 34px;
//     background-position: 45% 9px;
//     background-color: rgba(255, 255, 255, 0);
//   }
  
//   .self:after {
//     content: "";
//     position: relative;
//     display: inline-block;
//     bottom: 0px;
//     right: 0px;
//     width: 0px;
//     height: 0px;
//     border: 5px solid #eef8ff;
//     border-right-color: transparent;
//     border-top-color: transparent;
//     box-shadow: 0px 2px 0px #c1cbcd;
//   }
  
//   .msg {
//     background: #eef8ff;
//     min-width: 50px;
//     padding: 10px;
//     border-radius: 2px;
//     word-break: break-all;
//   }
  
//   .msg .user {
//     font-size: 14px;
//     margin: 0 0 2px 0;
//     color: #666;
//     font-weight: 700;
//     margin-top: -2px;
//     margin-bottom: 5px;
//     transition: all .2s ease;
//     -webkit-touch-callout: none;
//   }
  
//   .msg p {
//     font-size: 13px;
//     margin: 0 0 2px 0;
//     color: #777;
//     transition: all .2s ease;
//   }
  
//   .msg img {
//     position: relative;
//     display: block;
//     width: 600px;
//     border-radius: 5px;
//     box-shadow: 0px 0px 3px #eee;
//     transition: all .8s cubic-bezier(0.565, -0.260, 0.255, 1.410);
//     cursor: default;
//     -webkit-touch-callout: none;
//   }
  
//   .msg time {
//     font-size: 0.7rem;
//     color: rgba(0, 0, 0, .35);
//     margin-top: 3px;
//     float: right;
//     cursor: default;
//     -webkit-touch-callout: none;
//   }
  
//   .msg time:before {
//     content: '\x1F550';
//     color: #ddd;
//     font-family: FontAwesome;
//     display: inline-block;
//     margin-right: 4px;
//   } </style>`+inn+ `<button onclick="removeMessage(${index})">Remove</button>`], { type: 'text/plain' });
//         const a = document.createElement('a');
//         a.href = URL.createObjectURL(blob);
//         a.download = 'chat.html';
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
// }



