
var hint = {
	word : '',
	amount : ''
}

initializeDropDownBoxAmounts();

function initializeDropDownBoxAmounts(){
	var selectElement = document.getElementById('inputAmount');
	if (selectElement){
		selectElement.options.length = 0;
		
		for(var i=0;i<9;i++){
			var option = new Option(''+(i+1), ''+(i+1));
			selectElement.options[i] = option;
		  }
		   var option = new Option('∞', '∞');
		  selectElement.options[i] = option;
	}
}

function sendWordHint(){
	var word = document.getElementById('inputHint').value;
	var amount = document.getElementById('inputAmount').value;
	if(word.trim().length>0){
		hint.word=word;
		hint.amount=amount;
		socket.emit(GAME_NAME+"_newHint"+gameId, hint, getUserId());
		document.getElementById('inputHint').value= "";
	}
}



var chatbox = document.getElementById('inputMessage');
if (chatbox){
	chatbox.addEventListener('keydown', function (e) {
		if(e.keyCode==13) {
		  var word = chatbox.value;
		  socket.emit(GAME_NAME+"_newMessage"+gameId,word);
		  chatbox.value= "";
		}
	  });
}

