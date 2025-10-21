import React, {useState, useEffect} from 'react'
import AddChapterModal from './AddChapterModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios'
import Chapter from './chapter';
import VideoUpload from './VideoUpload';

export default function SelectedCourse(props) {
    const exit = false; 
    const [course, setCourse] = useState(props.data)
    const {id, title, description } = course
    const [isModal, setModal] = useState(false);
    const [chapter, setChapter] = useState([]);
    const [chapterLength, setChapterLength] = useState([])
    const [chapterId , setChapterId] = useState("")
    const [isquiz, setQuiz] = useState(false)
    const [isUploadVideo, setUploadvideo] = useState(false)
    

    function handleOpenModal(){
      setModal(true)
    }
    function handleExitModal(exit){
      setModal(exit)
    }

    useEffect(()=>{
      async function fetchData(){
        try {
          const response = await axios.post('http://localhost:3000/admin/course/chapter', {course_Id: course.id}, {withCredentials: true});
          setChapter(response.data.data)
          setChapterLength(response.data.chapterLength)
        } catch (error) {
          console.log(error)
        }
      }
      fetchData()
    }, [])

    async function handleShowChapter(id){
      setChapterId(id)
      
    }
  
  return (
    
    <div className='w-full h-full bg-white absolute '>
      <div className='flex w-full h-full bg-gray-200 flex flex-col'>
        <div className='flex w-full h-15 bg-green-700 items-center text-white'>
          <button 
            onClick={()=>{props.handleBack(exit)}}
            className='ml-5 text-large' >
            <ArrowBackIcon/> Back to Course
          </button>
          <h1 className="text-xl font-medium ml-20">{title}</h1>

          <button
            onClick={handleOpenModal}
            className='ml-auto m-5'>
              + Add Chapter
          </button>
        </div>

        <div className='flex h-full w-full '>
          <div className='h-full w-full grid place-items-center'>
            <h1>{chapterId}</h1>
            <button 
            
              className= {isquiz? 'w-50 h-10 text-2xl bg-green-500' : 'w-50 h-10 text-2xl bg-white'}
              onClick={
                (e)=>{ 
                  e.preventDefault(); 
                  setQuiz(true) ,
                  setUploadvideo(false)}}>
                    Create Quiz
            </button>

            <button 
               className= {isUploadVideo? 'w-50 h-10 text-2xl bg-green-500' : 'w-50 h-10 text-2xl bg-white'}
              onClick={(e)=>{ 
                e.preventDefault(); 
                setQuiz(false) ,
                setUploadvideo(true)}}>
                  Upload Video
            </button>

            {isquiz? <h1>QUIZ BUILDER</h1>:null}
            {isUploadVideo? <VideoUpload course_id={props.course_id} chapter_no={props.chapter_no + 1}/> :null}
          </div>
          
          <div className='ml-auto h-full w-90 bg-white'>
            <div className='h-10 bg-white flex items-center'>
              <h1 className='text-large ml-3 font-bold'>Course content</h1>
            </div>
            {chapter.map((chapter)=>{
              return(<Chapter 
                id={chapter.id}
                key={chapter.id}
                title={chapter.title} 
                chapterNo={chapter.order_index}
                description={chapter.description} 
                handleOpenChapter={handleShowChapter} />)
              })
            }
          </div>
        </div>
            {isModal?<AddChapterModal onExit={handleExitModal} course_id={id} chapter_no={chapterLength} />: null}
            
          
            
            
        </div>
       
       
      
    </div>
    
  )
}
