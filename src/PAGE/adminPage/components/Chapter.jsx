import React from 'react'


export default function Chapter(props) {
  return (
    <div className=''>
        
            <div 
              className='w-90 h-15 bg-green-500 border-gray-200 border-2 flex items-center'
              onClick={()=>{props.handleOpenChapter(props.chapterNo)}}>
                <p className='text-2xl m-2 '>{props.title}: </p> <p>{props.description}</p>
        
            </div>

    </div>
  )
}
