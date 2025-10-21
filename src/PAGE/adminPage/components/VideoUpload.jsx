import React, {useState} from 'react'
import axios, { formToJSON } from 'axios'

export default function VideoUploadTest(props) {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");

  async function uploadVideo(e){
    e.preventDefault();
    const formData = new FormData();
    formData.append("video", video);
    formData.append("title", title);
    formData.append("courseId", props.course_id)

    try {
      const response = await axios.post('http://localhost:3000/admin/chapter/upload', formData ,
        {withCredentials: true, headers: {"Content-Type": "multipart/form-data"}
      })
      console.log(response)
    } catch (error) {
      console.log(error)
    }

  }
  console.log(props.course_id)
  return (
    <div>
      <div>
        <form onSubmit={uploadVideo}>
          <input
            type="text"
            onChange={(e)=>{setTitle(e.target.value)}} 
            required/>

          <input 
            type="file"
            acccept="video/*"
            onChange={(e)=>{setVideo(e.target.files[0]) }} />

          <button type='submit'>upload</button>

        </form>
          
      </div>
    </div>
  )
}
