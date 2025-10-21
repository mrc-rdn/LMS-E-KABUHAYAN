import React, {useState} from 'react'
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import VideoUpload from './VideoUpload';

export default function ChapterModal(props) {
    const exit = false
    const [chapterTitle, setChapterTitle] = useState("");
    const [description, setDescription] = useState("");
    const [order, setOrder] = useState("");
    const [isquiz, setQuiz] = useState(false)
    const [isUploadVideo, setUploadvideo] = useState(false)

    
    async function handleClick(e){
      
        try {
          const response = await axios.post('http://localhost:3000/admin/course/addchapter',
            {course_id: props.course_id, chapter_name: chapterTitle, description: description, chapter_no: props.chapter_no + 1},
            {withCredentials:true}
          )  
          console.log(response.data)
        } catch (err) {
            console.log(err)
        }
        
        
        
    }

  return (
    <div className='w-full h-full bg-gray-500/40 absolute'>
        <button onClick={()=>{props.onExit(exit)}}><CloseIcon /></button>
        <form>
            <input 
            onChange={(e)=>{setChapterTitle(e.target.value) }}
            type="text" 
            placeholder='Chapter title'
            value={chapterTitle} />

            <input 
            onChange={(e)=>{setDescription(e.target.value)}}
            type="text" 
            placeholder='Description' 
            value={description}/>

            <button onClick={handleClick}>Submit</button>
        </form>

        <button onClick={()=>{setQuiz(true) ,setUploadvideo(false)}}>Create Quiz</button>
        <button onClick={()=>{setQuiz(false) ,setUploadvideo(true)}}>Upload Video</button>


        {isquiz? <h1>QUIZ BUILDER</h1>:null}
        {isUploadVideo? <VideoUpload course_id={props.course_id} /> :null}
    </div>
  )
}
