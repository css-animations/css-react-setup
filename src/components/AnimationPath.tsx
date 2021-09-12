import React, {useState, useEffect} from "react";
import {TimeRuler} from "./TimeRuler";
import {Labels} from './Labels';
import {BezierComponent} from './Canvas'

import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from '@material-ui/icons/Pause';
import LoopIcon from '@material-ui/icons/Loop';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

export function AnimationPath(){
    const [scrubberSelected, setScrubberSellected] = useState(false)

    const useMousePosition = () => {
        const [position, setPosition] = useState({ x: 0, y: 0 });
      
        useEffect(() => {
          const setFromEvent = (e: any) => setPosition({ x: e.clientX, y: e.clientY });
          window.addEventListener("mousemove", setFromEvent);
      
          return () => {
            window.removeEventListener("mousemove", setFromEvent);
          };
        }, []);
        
        return position;
      };
    var mouseX = useMousePosition().x;
    var mouseY = useMousePosition().y;

    const [time, setTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [loop, setLoop] = useState(false);

    const togglePlay = () => {
        setPlaying(!playing);
    }

    const toggleLoop = () => {
        setLoop(!loop);
    }

    const handleSkipForward = () =>{
        setTime(time + .01);
    }

    const handleRewind = () => {
        setTime(time - .01);
    }
    return(
        <div className="APContainer" 
            onMouseUp = {() => {setScrubberSellected(false)}}
            onMouseLeave = {() => {if(scrubberSelected){setScrubberSellected(false)}}}>
            <h2>AnimationPath</h2>

            <div className = "APIconBar">
                <IconButton onClick={togglePlay}>
                    {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={toggleLoop}>
                    <LoopIcon />
                </IconButton>
                <IconButton onClick={handleRewind}>
                    <ArrowBackIcon />
                </IconButton>
                <IconButton onClick={handleSkipForward}>
                    <ArrowForwardIcon />
                </IconButton>
                <div style = {{flex:"1"}}></div>
                <button className = "APAddKey">Add New Key Placeholder</button>
            </div>
            <div className = "APBlackBoard">
                <div className = {"APBlank disable-select"}>.</div>
                <TimeRuler time = {time} setTime = {setTime} mouseX = {mouseX} mouseY = {mouseY} scrubberSelected = {scrubberSelected} setScrubberSelected = {setScrubberSellected}></TimeRuler>
                <Labels className = {"APyLabel"} total={100} numTicks={5} ending={"%"} isRow={false}/>
                <BezierComponent
                    currentIndex={1}
                    width={400}
                    height={300}
                    />
            </div>
        </div>
    )
}