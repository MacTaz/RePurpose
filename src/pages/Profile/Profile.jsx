import { useEffect, useState } from "react";

export default function Profile() {

  //const [session, setSession] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  return (

    <div>
      <div className="flex flex-col items-center justify-center space-y-6 mt-20">
        <h1 className="text-5xl font-extrabold text-slate-900">
          Profile
        </h1>
      
      </div>
      
      {/* Real Time Chat */}
      <div className="w-full flex h-screen justify-center items-center p-4">
        <div className="border max-w-6xl w-full min-h-150 rounded-lg">
          {/* Real Time Chat Header */}
          <div className="flex justify-between h-20 border-b-1[1px] border-gray-700">
            <div className= 'p-4>'>
              {/*Header Content */}
              <p className="text-gray-300"> signed is as NAME</p>
              <p className="text-gray-300 italic text-sm"> RESPONDER is online</p>
            </div>
            <button className= "m-2 sm:mr-4">Sign Out</button>
          </div>
          {/* Main Chat Area */}
          <div className="p-4 flex flex-col overflow-y-auto h-125"> </div>
          {/* Message Input Area */}
          <form className="flex flex-col sm:flex-row p-4 border-t border-gray-700">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              type="text"  
              placeholder="Type a message" 
              className="p-2 w-full bg-[#00000040] rounded-lg"
            />
            <button className="mt-4 sm:mt-0 sm:ml-8 text">Send</button>
          </form>
        </div>
      </div>

      
    </div>
  );
}