"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model"
import User from "../models/user.model";
import { connectToDB } from "./mongoose"

interface Params{
 text:string,
 author:string ,
 path:string ,
 communityId:string | null

}

export async function createThread({text,
     author,
      path,
      communityId,
    }:Params){
        try {
           connectToDB();
           const createdThread = await Thread.create({
             text,author,community:null
           })

           await User.findByIdAndUpdate(author,{
            $push:{threads:createdThread._id}
           })
           revalidatePath(path)
        } catch (error) {
            console.log(error)
        }

}


export async function fetchPosts(pageNumber=1,pageSize=20){

   connectToDB();
   const skip= (pageNumber-1)*pageSize;
   const postQuery= Thread.find({parentId:{$in:[null,undefined]}})
   .sort({createdAt:'desc'})
   .skip(skip)
   .limit(pageSize)
   .populate({path:'author',model:User})
   .populate({path:'children',
    populate:{
      path:'author',
      model:User,
      select:"_id name parentId image"
    }
  })

  const totalPostsCount = await Thread.countDocuments({parentId:{$in:[null,undefined]}})
  const posts = await postQuery.exec()
  const isNext = totalPostsCount>skip+posts.length;
  return {posts,isNext}
} 


export async function fetchThreadById(id:string){
  connectToDB();

  try{
    const post = await Thread.findById(id)
    .populate({
      path:"author",
      model:User,
      select:"_id id name image"
    })
    .populate({path:'children',
     populate:{
      path:'author',
      model:User,
      select :"_id id name image"

     }
  })
  .populate({
    path:'children',
    populate:[
      {
        path:'author',
        model:User,
        select :"_id id name parentId image"
      },

      {
        path:'children',
        model :'Thread',
        populate:{
          path:'author',
          model:User,
          select :"_id id name parentId image"
        }

      }
    ]
  }).exec();
  return post;
  }catch(error:any){
   console.log(error)
  }
}

export async function addCommentToThread(threadId:string,
  commentText:string , userId:string, path:string){
     connectToDB();
     try {
      // find original thread by id 
      const originalThread= await Thread.findById(threadId);
      if(!originalThread) {console.log("no thread found")}

      // create new thread and turn into comment 

      const commentThread = new Thread({
        text:commentText,
        author:userId,
        parentId:threadId
      })

      // save new thread into db

      const saveComment = await commentThread.save();

      // update the orginal thread include comment

      originalThread.children.push(saveComment._id);

      // save orginal thread 

      await originalThread.save();

      revalidatePath(path);
     } catch (error) {
      
     }

  }