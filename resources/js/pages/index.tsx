import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import io from 'socket.io-client';

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
    
    const loadScript = (src: string, callback?: () => void) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = callback ?? null;
      document.body.appendChild(script);
    };

    const loadStyle = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    loadStyle('http://localhost:2222/static/common/css/index.css');
  
    loadScript('https://cdn.socket.io/4.0.0/socket.io.min.js', () => {

      if (window.socket == null){
        const socketUrl = `http://${window.location.hostname}:2222`;
        var socket = io(socketUrl);
        window.socket = socket;
      } else {
        var socket = window.socket;
      }

      loadScript('http://localhost:2222/static/common/tools.js');
      loadScript('http://localhost:2222/static/common/login.js');
      loadScript('http://localhost:2222/static/common/voedgoemMainMenu.js');
      loadScript('http://localhost:2222/static/common/renderTabs.js');

      socket.emit("joinGameRoom", user.id, 0, "" );

      return () => {
        socket.disconnect();
      };
    });

  }, []);

  return (
    <div>
      <div id="left" />
      
      <div id="board" />
      
      <div id="right">
        <div id="chevronContainer" className="chevronContainer" onClick={() => (window as any).toggleMenu?.()}>
          <span id="chevron">&#9664;</span>
        </div>

        <div id="genericMenuDiv" className="genericMenuDiv">
           {/* TO DO */}
          <button onClick={() => (window as any).changeName?.()} id="changeNameButton">Change Name</button> 
          <button onSubmit={handleLogout} id="logoutButton">Logout</button>
          <button onClick={() => (window as any).activatePlayerlistTab?.()} id="playerlistButton">Who's Here?</button>
          <button onClick={() => (window as any).activateChatTab?.()} id="backToChatButton">Back to Chat</button>
        </div>

        <div id="gameLog" className="gameLog" />

        <div id="typeBox" className="typeBox">
          <input className="inputMessage" type="text" id="inputMessage" />
          <button className="messageButton" onClick={() => (window as any).sendMessage?.()} id="messageButton">Send</button>
        </div>

        <div id="playerlistLog" className="playerlistLog" />
      </div>
    </div>
  );
};

Index.layout = (page: React.ReactNode) => (
  <>{page}</>
);

export default Index;
