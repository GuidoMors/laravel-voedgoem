import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { loadStyle, loadScript, assignSocket} from '@/utils';

var socket = assignSocket();

type User = {
  id: number;
  name: string;
  email: string;
};

const Index = () => {
  const { user } = usePage<{ user: User }>().props;
  const { post } = useForm();

  const handleLogout: React.FormEventHandler = (e) => {
    e.preventDefault();
    post(route('logout'));
  };

  useEffect(() => {
  
    loadScript('https://cdn.socket.io/4.0.0/socket.io.min.js', () => {
      
      loadScript('http://localhost:2222/static/common/tools.js');
      loadScript('http://localhost:2222/static/common/login.js');

      loadScript('http://localhost:2222/static/Woerdgoem/woerdgoemRenderGame.js');
      loadScript('http://localhost:2222/static/Woerdgoem/woerdgoemGameClient.js');
      loadScript('http://localhost:2222/static/Woerdgoem/woerdgoemWordSender.js');

      loadScript('http://localhost:2222/static/common/renderTabs.js');
      loadScript('http://localhost:2222/static/common/gamestateUtils.js');


      return () => {
        socket.disconnect();
      };
    });

  }, []);

  return (
      <>
        <div id="middle">
          <div id="topbar" className="topbar"></div>
          <div id="middlebar" className="middlebar"></div>
          <div id="bottombar" className="bottombar"></div>
        </div>
    
        <div id="left">
          <div className="menudivider">
            <div id="menubox" className="menubox">
              <div className="leftmenu">
                <input 
                  type="button" 
                  onClick={() => { hurryTime();}} 
                  className="menubutton" 
                  id="hurrybutton" 
                />
                <input 
                  type="button" 
                  onClick={() => { startGame();}} 
                  className="menubutton" 
                  value="Start" 
                  id="startbutton" 
                />
                <input 
                  type="number" 
                  min="10" 
                  value="32" 
                  className="boardSizeSettings" 
                  name="boardSizeSettings" 
                  id="boardSizeSettings" 
                  title="The amount of cards." 
                />
                <select 
                  className="teamSizeSettings" 
                  name="teamSizeSettings" 
                  id="teamSizeSettings" 
                  title="The amount of teams." 
                ></select>
              </div>
              <div className="middlemenu">
                <input 
                  type="button" 
                  onClick={() => { quitGame();}}
                  className="menubutton" 
                  value="Quit" 
                  id="quitbutton" 
                />
                <input 
                  type="button" 
                  onClick={() => { showSettings();}}
                  className="menubutton settingsbutton" 
                  id="settingsbutton" 
                />
                <input 
                  className="timerSettings" 
                  type="number" 
                  name="timerSettings" 
                  id="timerSettings" 
                  value="120" 
                  title="Time in seconds for a team's turn. 0 indicates no timer." 
                />
                <input 
                  className="specialSettings" 
                  type="number" 
                  min="0" 
                  name="specialSettings" 
                  id="specialSettings" 
                  value="3" 
                  title="How many special hints a spymaster can give his team, and how many times an operative can use their special abilities." 
                />
              </div>
              <div className="rightmenu">
                <input 
                  type="button" 
                  onClick={() => { leave(); }}
                  className="menubutton" 
                  value="Leave Team" 
                  id="leavebutton" 
                />
                <input 
                  type="button" 
                  onClick={() => { updateGameSettings();}}
                  className="menubutton okbutton" 
                  value="OK" 
                  id="savesettingsbutton" 
                />
                <input 
                  type="button" 
                  onClick={() => { cancelSettings();}}
                  className="menubutton cancelbutton" 
                  value="Cancel" 
                  id="cancelsettingsbutton" 
                />
                <input 
                  type="button" 
                  onClick={() => { endTurn();}}
                  className="menubutton" 
                  value="Pass" 
                  id="passbutton" 
                />
                <input 
                  type="button" 
                  onClick={() => { blankOut(); }}
                  className="menubutton" 
                  id="blankoutbutton" 
                />
              </div>
            </div>
          </div>
          <div className="reddivider">
            <div id="redbox" className="redbox">
              <div className="spybutton">
                <input 
                  type="button" 
                  onClick={() => joinTeam(1, false)} 
                  value="Operative" 
                  className="teambutton red" 
                  id="redoperativebutton" 
                />
                <div id="redHintText"></div>
              </div>
              <div className="spyplayers red" onClick={() => joinTeam(1, false)} id="redoperatives"></div>
              <div className="spybutton">
                <input 
                  type="button" 
                  onClick={() => joinTeam(1, true)} 
                  value="Spymaster" 
                  className="teambutton darkred" 
                  id="redspymasterbutton" 
                />
              </div>
              <div className="spyplayers darkred" onClick={() => joinTeam(1, true)} id="redspymasters"></div>
              <div className="teamstats">
                <div className="teamtime darkred" id="redteamtime"></div>
                <div className="teamscore red" id="redteamscore"></div>
              </div>
            </div>
          </div>
          <div className="greendivider">
            <div id="greenbox" className="greenbox">
              <div className="spybutton">
                <input 
                  type="button" 
                  onClick={() => joinTeam(3, false)} 
                  value="Operative" 
                  className="teambutton green" 
                  id="greenoperativebutton" 
                />
                <div id="greenHintText"></div>
              </div>
              <div className="spyplayers green" onClick={() => joinTeam(3, false)} id="greenoperatives"></div>
              <div className="spybutton">
                <input 
                  type="button" 
                  onClick={() => joinTeam(3, true)} 
                  value="Spymaster" 
                  className="teambutton darkgreen" 
                  id="greenspymasterbutton" 
                />
              </div>
              <div className="spyplayers darkgreen" onClick={() => joinTeam(3, true)} id="greenspymasters"></div>
              <div className="teamstats">
                <div className="teamtime darkgreen" id="greenteamtime"></div>
                <div className="teamscore green" id="greenteamscore"></div>
              </div>
            </div>
          </div>
          <div className="bluedivider">
            <div id="bluebox" className="bluebox">
              <div className="spybutton">
                <input 
                  type="button" 
                  onClick={() => joinTeam(2, false)} 
                  value="Operative" 
                  className="teambutton blue" 
                  id="blueoperativebutton" 
                />
                <div id="blueHintText"></div>
              </div>
              <div className="spyplayers blue" onClick={() => joinTeam(2, false)} id="blueoperatives"></div>
              <div className="spybutton">
                <input 
                  type="button" 
                  onClick={() => joinTeam(2, true)} 
                  value="Spymaster" 
                  className="teambutton darkblue" 
                  id="bluespymasterbutton" 
                />
              </div>
              <div className="spyplayers darkblue" onClick={() => joinTeam(2, true)} id="bluespymasters"></div>
              <div className="teamstats">
                <div className="teamtime darkblue" id="blueteamtime"></div>
                <div className="teamscore blue" id="blueteamscore"></div>
              </div>
            </div>
          </div>
        </div>
    
        <div id="right">
          <div className="tab">
            <button 
              id="leaveGameButton" 
              className="tablinks" 
              onClick={() => { leavePlayers(); leaveGame(); }}
            >
              Leave Game
            </button>
            <button 
              id="changeNameButton" 
              className="tablinks" 
              onClick={() => { changeName(); }}
            >
              Change Name
            </button>
            <button 
              id="tabChat" 
              className="tablinks" 
              onClick={(e) => openTab(e, 'gameLogTab')}
            />
            <button 
              id="tabStats" 
              className="tablinks" 
              onClick={(e) => openTab(e, 'statsTab')}
            />
            <button 
              id="tabPlayers" 
              className="tablinks" 
              onClick={(e) => openTab(e, 'playerlistLog')}
            >
              ?
            </button>
          </div>
    
          <div id="gameLogTab" name="gameLogTab" className="tabContent">
            <div id="gameLog" name="gameLog" className="gameLog"></div>
            <div id="sideLog" name="sideLog" className="sideLog"></div>
            <div id="typeBox" name="typeBox" className="typeBox">
              <input 
                className="inputMessage" 
                type="text" 
                name="inputMessage" 
                id="inputMessage" 
                value=""
              />
              <input 
                className="inputHint" 
                type="text" 
                name="inputHint" 
                id="inputHint" 
                value=""
              />
              <select className="inputAmount" name="inputAmount" id="inputAmount"></select>
              <input 
                className="HintButton" 
                type="button" 
                onClick={() => { sendWordHint(); }}
                value="Hint" 
                id="HintButton" 
              />
              <input 
                className="MessageButton" 
                type="button" 
                onClick={() => { sendMessage(); }}
                value="Send" 
                id="MessageButton" 
              />
            </div>
          </div>
    
          <div id="playerlistLog" name="playerlistLog" className="playerlistLog tabContent"></div>
    
          <div id="statsTab" name="statsTab" className="tabContent">
            <div id="playerStats" className="playerStats"></div>
          </div>
    
          <div id="qrDiv" className="qrDiv"></div>
        </div>
      </>

  );
};

Index.layout = (page: React.ReactNode) => (
  <>{page}</>
);

export default Index;
