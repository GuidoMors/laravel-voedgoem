import io from 'socket.io-client';

export const loadScript = (src: string, callback?: () => void): void => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback ?? null;
    document.body.appendChild(script);
  };
  
export const loadStyle = (href: string): void => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
};

export const assignSocket = (): any => {
    if (!window.socket){
        var socketUrl = `http://${window.location.hostname}:2222`;
        var socket = io(socketUrl);
        window.socket = socket;
    } else {
        var socket = window.socket;
    }

    return socket;
}
  