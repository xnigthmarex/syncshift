"use client"
import React,{ useState,useEffect ,useRef, use} from "react";
import {signOut} from "next-auth/react";
import { useSession } from "next-auth/react";
import {createTask, getTaskHistory, updateTaskHistory} from "./serverActions";
import { get } from "http";
export default  function Home() {
  
const {data:session} = useSession();
const [time,setTime] = useState<string>("");
const [timer,setTimer] = useState<string>("00:00:00");
const [isActive,setIsActive] = useState<boolean>(false);
const [taskId,setTaskId] = useState<number|null>(null);
const [taskHistoryArray , setTaskHistoryArray] = useState<any[]>([]);
const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Store the interval ID


const stopTask = () => {
  setIsActive(false);
  if (intervalId) {
    clearInterval(intervalId);
  }
  const now = new Date();
  const dateEnded = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
  
  //when stopped the taskId should be set to null before that the taskId should be used to update the task history 
  if (taskId) {
    updateTaskHistory(taskId, dateEnded, timer);
  }
  gettignTaskHistory();
};

const handleSignOut = async (e:any) => {
  e.preventDefault();
  const result = await signOut({
    redirect: true,
    callbackUrl: "/",
  });
}
const startTask = async () => {

  setTimer("00:00:00");
  // Clear any existing interval
  const userid = session?.user?.id;
  const taskname = document.querySelector('input')?.value;
  const now = new Date();
  const dateStarted = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();


  if (!taskname || !userid) {
    window.alert("Please enter a task name");
    return;
  }
  const taskId = await createTask(taskname,dateStarted, userid);
  if (taskId === 0) {
    window.alert("An error occurred while creating the task.");
    return;
  }
  setTaskId(taskId);
  
  setIsActive(true);

  if (intervalId) {
    clearInterval(intervalId);

  }

  const id = setInterval(() => {
    
      setTimer((prevTimer) => {
        const [hours, minutes, seconds] = prevTimer.split(":").map(Number);
        let newSeconds = seconds + 1;
        let newMinutes = minutes;
        let newHours = hours;

        if (newSeconds === 60) {
          newSeconds = 0;
          newMinutes++;
        }

        if (newMinutes === 60) {
          newMinutes = 0;
          newHours++;
        }

        if (newHours === 24) {
          newHours = 0;
        }

        return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;
      });
    
  }, 1000);

  setIntervalId(id);
};
useEffect(() => {
  gettignTaskHistory();
}, [session]);

const gettignTaskHistory  = async() => {
  const userid = session?.user?.id;
  console.log("User ID from session:", userid);

  if (userid) {
    setTimeout(async () => {  // Delay of 2 seconds
      console.log("Fetching task history for user ID:", userid);
      try {
        const taskHistory = await getTaskHistory(userid);
        console.log("Received task history:", taskHistory);
        setTaskHistoryArray(taskHistory);
      } catch (error) {
        console.error("An error occurred while fetching task history:", error);
      }
    }, 2000);  // 2000 milliseconds = 2 seconds
  } else {
    console.log("User ID is not available.");
  }

  console.log("Current task history array:", taskHistoryArray);
};
useEffect(() => {
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [intervalId]);

//remove seconds from the time displayed
useEffect(() => {
  const interval = setInterval(() => {
    const date = new Date();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTime(time);
  }, 1000);
  return () => clearInterval(interval);
}
,[]);

  //useffect to set the height of the mainview div to the height of the screen- the height of the header
  useEffect(() => {

    const header = document.getElementById("header") as HTMLElement;
  const mainview = document.getElementById("mainview") as HTMLElement;
  const clock = document.getElementById("clock") as HTMLElement;
  const rightside = document.getElementById("rightside") as HTMLElement;

  if (header && mainview && clock && rightside) {
    // Scaling factors
    const clockRadiusFactor = 0.40; // Adjust this to change the clock radius
    const rightsideHeightFactor = 0.95; // Adjust this to change the rightside height
    const rightsideWidthFactor = 0.5; // Adjust this to change the rightside width
    const rightsideMarginFactor = 0.6; // Adjust this to change the rightside margin

    const height = window.innerHeight - header.offsetHeight;
    const radius = (window.innerHeight - header.offsetHeight) * clockRadiusFactor;

    mainview.style.height = `${height}px`;

    clock.style.width = `${radius * 2}px`;
    clock.style.height = `${radius * 2}px`;

    rightside.style.height = `${radius * 2 * rightsideHeightFactor}px`;
    rightside.style.width = `${window.innerWidth * rightsideWidthFactor}px`;
    rightside.style.marginLeft = `-${radius * rightsideMarginFactor + 50}px`;
  }
  }, []);

  return (
    <div className=" mx-auto max-w-screen-xl">
  <header className="pt-3 border-b-4 border-black" id="header">
  <div className="grid grid-cols-3 items-center">
    <h1 className="text-4xl col-start-1 flex items-center justify-start">
      <img className="w-12 h-10 mr-2" src="/testlogo.jpg" alt="logo" />
      SyncShift
    </h1>
    <h1 className="text-3xl text-white col-start-2 col-end-3 text-center">
      {time}
    </h1>
    <div className=" text-white col-start-3 text-center flex items-center">
      <span className = "text-3xl">Welcome {session?.user?.name}</span>
      <button className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick = {handleSignOut}>
        SignOut
      </button>
    </div>
  </div>
</header>

       <div className="flex items-center justify-center h-screen" id = "mainview">
      <div className="flex items-center">
        

      
      <div className="grid grid-rows-3 grid-flow-col bg-black rounded-full h-32 w-32 z-10 justify-center items-center border-white border-4  text-center" id="clock">
  <div className="flex items-center justify-center md:text-3xl ">Task Timer</div>
  <div className="flex items-center justify-center md:text-6xl pb-12">{timer}</div>
  
  <div className="flex items-center justify-center pb-20">
  {!isActive ? (
    <>
      <input className="w-full p-2 rounded shadow-sm border-white border-2 focus:shadow-md text-white mr-2 bg-gray-800" placeholder="Enter Task Name"  />
      <button className="p-2 rounded bg-green-600 text-black" onClick={startTask}>Start</button>
    </>
  ) : (
    <button className="p-2 rounded bg-red-600  px-10 text-white" onClick = {stopTask}>Stop</button>
  )}
</div>


</div>


        {/* right side rectangle */}
        <div className="bg-[#0d0d0d] h-16 pl-40 w-32 grid grid-rows-8 justify-center rounded-r-3xl border-white border-4" id="rightside">
        <div className = " flex  justify-center pt-6 text-2xl w-full">Task History</div>
        <div className="task-history-list w-full">
        {taskHistoryArray.map((task, index) => (
          <div key={index} className={`task-history-item flex flex-col justify-between border rounded-lg py-1 px-4 m-2 ${task.wasStopped ? 'border-green-500' : 'border-red-500'}`}>
          {/* Replace `task.name`, `task.dateStarted`, etc. with the actual properties of your task object */}
          <div className="flex justify-between task-details">
            <span className="task-name text-white text-xl">{task.task}</span>
            <h1 className="task-time text-white text-lg">{task.timeSpent}</h1>
          </div>
          <div className="task-date-details">
            <h3 className="task-date text-white text-sm">{new Date(task.dateStarted).toLocaleString()} - {new Date(task.dateEnded).toLocaleString()}</h3>
          </div>
          {/* Add more details here */}
        </div>
        
        
        ))}
      </div>
    </div>

      </div>
    </div>
    </div>
  );
}
