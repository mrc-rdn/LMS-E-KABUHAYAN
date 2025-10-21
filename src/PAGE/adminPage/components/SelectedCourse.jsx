import React, {useState, useEffect} from 'react'
import ChapterModal from './ChapterModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios'
import Chapter from './chapter';

export default function SelectedCourse(props) {
    const exit = false; 
    const [course, setCourse] = useState(props.data)
    const {id, title, description } = course
    const [isModal, setModal] = useState(false);
    const [chapter, setChapter] = useState([]);
    const [chapterLength, setChapterLength] = useState([])
    

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
   console.log(chapterLength)
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
            
            {isModal?<ChapterModal onExit={handleExitModal} course_id={id} chapter_no={chapterLength} />: null}
            
          <div className='ml-auto h-full w-90 bg-white'>
            <div className='h-10 bg-white flex items-center'>
              <h1 className='text-large ml-3 font-bold'>Course content</h1>
            </div>
            {chapter.map((chapter)=>{
              return(<Chapter 
                id={chapter.id}
                key={chapter.id}
                title={chapter.title} 
                description={chapter.description} />)
              })
            }
          </div>
            
            
        </div>
       
       
      
    </div>
    
  )
}
